// ACT Lab — Soğuk Mail Gönderici
//
// Kullanım:
//   node scripts/send_mails.js                       → dry-run, BATCH 1
//   node scripts/send_mails.js --batch "BATCH 1"     → dry-run, belirli batch
//   node scripts/send_mails.js --batch "BATCH 1" --send  → GERÇEK gönderim
//   node scripts/send_mails.js --tier "Tier 1" --send    → tier bazlı
//   node scripts/send_mails.js --limit 5 --send          → ilk 5 mail
//   node scripts/send_mails.js --start 50 --limit 50 --send  → 50.den başlayıp 50 mail
//   node scripts/send_mails.js --to ornek@kurum.com --send    → tek mail test
//
// Throttle: --delay 30 (saniye, default 30) — spam filtre için
// Log: scripts/sent_log.csv (tekrar göndermez)

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import nodemailer from 'nodemailer';
import { renderTemplate } from './mail_templates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CSV_PATH = path.join(ROOT, 'MAILING_LIST.csv');
const LOG_PATH = path.join(__dirname, 'sent_log.csv');

// --- CLI args ---
const args = process.argv.slice(2);
function getFlag(name, defaultVal = null) {
  const i = args.indexOf(name);
  if (i === -1) return defaultVal;
  return args[i + 1] ?? true;
}
const opts = {
  send: args.includes('--send'),
  batch: getFlag('--batch', 'BATCH 1'),
  tier: getFlag('--tier', null),
  limit: parseInt(getFlag('--limit', '999'), 10),
  start: parseInt(getFlag('--start', '0'), 10),
  delay: parseInt(getFlag('--delay', '30'), 10),
  to: getFlag('--to', null),
};

console.log(`\n📧 ACT Lab Mail Gönderici`);
console.log(`────────────────────────`);
console.log(`Mod: ${opts.send ? '🔴 GERÇEK GÖNDERİM' : '🟡 DRY-RUN (mail atılmıyor)'}`);
if (opts.to) console.log(`Tek hedef: ${opts.to}`);
else {
  console.log(`Batch: ${opts.batch}`);
  if (opts.tier) console.log(`Tier filter: ${opts.tier}`);
  console.log(`Start: ${opts.start}, Limit: ${opts.limit}, Delay: ${opts.delay}s`);
}
console.log();

// --- Load CSV ---
const csvText = fs.readFileSync(CSV_PATH, 'utf8');
const allRows = parse(csvText, { columns: true, skip_empty_lines: true });
console.log(`Toplam liste: ${allRows.length} satır`);

// --- Load sent log ---
let sentSet = new Set();
if (fs.existsSync(LOG_PATH)) {
  const logText = fs.readFileSync(LOG_PATH, 'utf8');
  const logRows = parse(logText, { columns: true, skip_empty_lines: true });
  for (const r of logRows) {
    if (r.status === 'SENT') sentSet.add(r.email.toLowerCase());
  }
  console.log(`Daha önce gönderilmiş: ${sentSet.size}`);
} else {
  fs.writeFileSync(LOG_PATH, 'timestamp,email,kurum,status,subject,error\n');
}

// --- Filter rows ---
let queue;
if (opts.to) {
  queue = allRows.filter(r => r['Email'].toLowerCase() === opts.to.toLowerCase());
  if (queue.length === 0) {
    console.error(`❌ Hedef bulunamadı: ${opts.to}`);
    process.exit(1);
  }
} else {
  queue = allRows
    .filter(r => r['Batch'] === opts.batch)
    .filter(r => !opts.tier || r['Tier'] === opts.tier)
    .filter(r => !sentSet.has(r['Email'].toLowerCase()))
    .slice(opts.start, opts.start + opts.limit);
}

console.log(`Gönderim sırasında: ${queue.length} mail\n`);

if (queue.length === 0) {
  console.log('✓ Gönderilecek mail yok (filtre veya tümü gönderilmiş).');
  process.exit(0);
}

// --- SMTP setup (only if --send) ---
let transporter = null;
if (opts.send) {
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;

  if (!SMTP_USER || !SMTP_PASS) {
    console.error('❌ .env içinde SMTP_USER ve SMTP_PASS gerekli');
    console.error('   Gmail için: app password oluştur (https://myaccount.google.com/apppasswords)');
    process.exit(1);
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.verify();
    console.log(`✓ SMTP bağlantı doğrulandı: ${SMTP_USER}@${SMTP_HOST}\n`);
  } catch (e) {
    console.error(`❌ SMTP bağlantı hatası: ${e.message}`);
    process.exit(1);
  }
}

// --- Send loop ---
const FROM = process.env.MAIL_FROM || process.env.SMTP_USER;
const REPLY_TO = process.env.MAIL_REPLY_TO || FROM;
let sent = 0, failed = 0, skipped = 0;

function logLine(email, kurum, status, subject, error = '') {
  const line = [
    new Date().toISOString(),
    email,
    `"${kurum.replace(/"/g, '""')}"`,
    status,
    `"${(subject || '').replace(/"/g, '""')}"`,
    `"${(error || '').replace(/"/g, '""')}"`,
  ].join(',') + '\n';
  fs.appendFileSync(LOG_PATH, line);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

for (let i = 0; i < queue.length; i++) {
  const row = queue[i];
  const email = row['Email'];
  const kurum = row['Kurum'];
  const tier = row['Tier'];
  const sira = row['Sıra'];

  try {
    const { subject, body } = renderTemplate(row['Şablon#'], row);

    if (!opts.send) {
      console.log(`[${i+1}/${queue.length}] [DRY] #${sira} [${tier}] ${kurum} → ${email}`);
      console.log(`     Konu: ${subject}`);
      console.log(`     Önizleme: ${body.substring(0, 120).replace(/\n/g, ' ')}…\n`);
      skipped++;
      continue;
    }

    console.log(`[${i+1}/${queue.length}] #${sira} [${tier}] ${kurum} → ${email}`);
    await transporter.sendMail({
      from: FROM,
      to: email,
      replyTo: REPLY_TO,
      subject,
      text: body,
    });
    logLine(email, kurum, 'SENT', subject);
    console.log(`     ✓ Gönderildi`);
    sent++;

    if (i < queue.length - 1) {
      console.log(`     ⏳ ${opts.delay}s bekliyor...\n`);
      await sleep(opts.delay * 1000);
    }
  } catch (e) {
    console.error(`     ❌ Hata: ${e.message}`);
    logLine(email, kurum, 'FAILED', '', e.message);
    failed++;
  }
}

console.log(`\n────────────────────────`);
console.log(`Özet: ${sent} gönderildi · ${failed} başarısız · ${skipped} dry-run`);
console.log(`Log: scripts/sent_log.csv`);
