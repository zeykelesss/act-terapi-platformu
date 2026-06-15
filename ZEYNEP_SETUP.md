# Zeynep — Mail Gönderim Kurulumu

Merhaba Zeynep! Egemen mailing list'i hazırlattı, sen kurulumu yapacaksın. ~10 dakikalık iş. Adımlar aşağıda.

---

## 1. Önce repo'yu güncelle

```bash
cd ~/Documents/ACT     # veya repo neredeyse
git pull
npm install            # nodemailer + csv-parse paketleri eklendi
```

## 2. Gmail App Password oluştur

ACT Lab'in hangi Gmail hesabını kullanacağı önemli — şu an `.env`'de `mc133540@gmail.com` yazılı. Eğer farklı hesap kullanacaksanız (`actlab@gmail.com` gibi), önce o hesabı aç.

Hangi hesabı kullanacaksan **o hesapla giriş yapıp**:

1. **2FA (iki adımlı doğrulama)** açık olmalı — değilse: https://myaccount.google.com/signinoptions/twosv
2. App password sayfasına git: **https://myaccount.google.com/apppasswords**
3. "Uygulama adı" alanına `ACT Lab` yaz → **Oluştur**
4. 16 haneli kodu kopyala (örn: `abcd efgh ijkl mnop`)

## 3. `.env` dosyasını doldur

Repo kökündeki `.env` dosyasını aç. Şu satırları bul ve doldur:

```bash
# Zorunlu
SMTP_USER=kullanilan-gmail@gmail.com       # hangi gmail'i kullanıyorsanız
SMTP_PASS=abcdefghijklmnop                  # 2. adımdaki 16 haneli kod (boşlukları sil)
MAIL_FROM=kullanilan-gmail@gmail.com        # aynı gmail
MAIL_REPLY_TO=kullanilan-gmail@gmail.com    # cevap nereye gitsin

# Opsiyonel (boş bırakırsan default kullanılır)
MAIL_SIGNATURE_NAME=Egemen                  # imzada görünecek isim
MAIL_SIGNATURE_PHONE=+90 5XX XXX XX XX      # Egemen'in telefonu
MAIL_SIGNATURE_EMAIL=mc133540@gmail.com     # imzada cevap maili
MAIL_SIGNATURE_WEB=https://act-terapi-platformu.vercel.app
MAIL_SIGNATURE_DEMO=                         # Calendly linki varsa (yoksa boş)
```

**Önemli**: `.env` dosyası git'e gitmez (`.gitignore`'da), o yüzden direkt yazabilirsin.

## 4. Önce kendine test maili at

```bash
node scripts/send_mails.js --to KENDI_MAIL@gmail.com --send
```

(`KENDI_MAIL@gmail.com` yerine kendi Gmail'ini yaz.)

Inbox'ına bak — mail geldi mi, spam'a düşmedi mi, formatı düzgün mü kontrol et.

**Hata alıyorsan** (en yaygın 2 sorun):
- `Invalid login: 535-5.7.8 Username and Password not accepted` → app password yanlış. Boşlukları sildiğinden emin ol, gerekirse yeni password oluştur.
- `Greeting never received` → 2FA açık değil. Adım 2.1'e dön.

## 5. Dry-run önizleme (mail atmaz, sadece gösterir)

```bash
node scripts/send_mails.js --batch "BATCH 1" --limit 5
```

İlk 5 mailin konu + önizlemesini gösterir. İçerik doğru görünüyor mu kontrol et.

## 6. BATCH 1 ilk 5 mail gönder (gerçek)

```bash
node scripts/send_mails.js --batch "BATCH 1" --limit 5 --send
```

Bu 5 mail gerçek hedeflere gider (TÜRBAD, BDT Derneği, Sarı Psikoloji vb. — Tier 1). Her mail arası 30 saniye bekler, toplam ~2.5 dk sürer.

## 7. Egemen'e haber ver

5 mail gittiğinde Egemen'e haber ver. Spam dönüşü/bounce olmazsa BATCH 1 kalan 95 mail için:

```bash
node scripts/send_mails.js --batch "BATCH 1" --start 5 --send
```

(~48 dakika sürer, ama arka planda çalışır — başka iş yapabilirsin.)

---

## Sonraki günler (Egemen veya sen)

```bash
node scripts/send_mails.js --batch "BATCH 2" --send    # gün 2
node scripts/send_mails.js --batch "BATCH 3" --send    # gün 3
node scripts/send_mails.js --batch "BATCH 4" --send    # gün 4
node scripts/send_mails.js --batch "BATCH 5" --send    # gün 5 (sadece 7 mail)
```

Gmail SMTP günlük 500 mail limiti var, biz 100/gün gönderiyoruz — güvenli aralıkta.

---

## Eğer bir şey takılırsa

- Tüm gönderilenler `scripts/sent_log.csv`'de — tekrar çalıştırırsan göndereni tekrar atmaz, kaldığı yerden devam eder
- Spam'a düşmemek için `--delay 60` ile aralığı 60 saniyeye çıkarabilirsin (yavaş ama güvenli)
- Bounce gelirse normaldir — bazı mailler eski/yanlış olabilir, listeyi sonra temizleriz
- "ÇIKAR" cevabı gelirse o mail adresini `sent_log.csv`'ye manuel `OPTOUT` olarak ekle (script onları atlar)

Sorular için Egemen'e veya doğrudan terminalden Claude Code'a sor.
