import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";
import { PROMPTS } from "./prompts.js";
import { supabaseAdmin, supabasePublic, requireAuth, requirePremium } from "./auth.js";
import { PROFILES } from "./data/profiles.js";
import { SCENARIOS } from "./data/scenarios.js";
import { METAPHORS } from "./data/metaphors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── SECURITY ───────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla istek. Lütfen biraz bekle." },
});
app.use("/api/", apiLimiter);

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",
}));
app.use(express.json({ limit: "16kb" }));

// Frontend'i serve et
app.use(express.static(path.join(__dirname, "public")));

// Anthropic client (lazy)
let _anthropic;
function ai() {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY tanımlı değil");
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

// Ortak Anthropic çağrısı — OpenAI formatındaki messages'ı Claude formatına çevirir
async function chat({ system, messages, model = "claude-haiku-4-5-20251001", max_tokens = 1024, temperature = 0.8 }) {
  const claudeMessages = messages.map(m => ({ role: m.role, content: m.content }));
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await ai().messages.create({ model, max_tokens, temperature, system, messages: claudeMessages });
      return res.content[0].text;
    } catch (e) {
      const overloaded = e?.status === 529 || e?.error?.type === "overloaded_error";
      if (overloaded && attempt < 2) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
        continue;
      }
      throw e;
    }
  }
}

// ── STATIC DATA (public, cache'lenir) ───────────────────────────────────────

function staticDataHandler(payload) {
  return (req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json(payload);
  };
}

app.get("/api/profiles", staticDataHandler({ profiles: PROFILES }));
app.get("/api/scenarios", staticDataHandler({ scenarios: SCENARIOS }));
app.get("/api/metaphors", staticDataHandler({ metaphors: METAPHORS }));

// ── AUTH ROUTES ─────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Çok fazla deneme. 15 dakika sonra tekrar dene." },
});

// POST /api/auth/register
app.post("/api/auth/register", authLimiter, async (req, res) => {
  const { email, password, name, plan } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, şifre ve isim zorunlu" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Şifre en az 8 karakter olmalı" });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) return res.status(400).json({ error: error.message });

  const userPlan = plan === "premium" ? "premium" : "free";
  const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
    user_id: data.user.id,
    name,
    plan: userPlan,
  });
  if (profileErr) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return res.status(500).json({ error: "Profil oluşturulamadı: " + profileErr.message });
  }

  const { data: session, error: signInErr } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) return res.status(500).json({ error: signInErr.message });

  res.json({
    token: session.session.access_token,
    user: { id: data.user.id, email, name, plan: userPlan },
  });
});

// POST /api/auth/login
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email ve şifre zorunlu" });

  const { data, error } = await supabasePublic.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: "Email veya şifre hatalı" });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("name, plan")
    .eq("user_id", data.user.id)
    .single();

  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.email,
      plan: profile?.plan || "free",
    },
  });
});

// GET /api/auth/me
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ── API ROUTES ──────────────────────────────────────────────────────────────

// POST /api/session — Danışan yanıtı
app.post("/api/session", requireAuth, async (req, res) => {
  const { messages, clientProfile } = req.body;
  try {
    const reply = await chat({
      model: "claude-sonnet-4-6",
      system: PROMPTS.simulatedSession(clientProfile),
      messages,
      temperature: 0.9,
      max_tokens: 350,
    });
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/supervisor — Süpervizör geri bildirimi
app.post("/api/supervisor", requireAuth, async (req, res) => {
  const { messages, clientProfile } = req.body;
  const transcript = messages
    .map((m) => `${m.role === "user" ? "TERAPİST" : "DANIŞAN"}: ${m.content}`)
    .join("\n");
  try {
    const feedback = await chat({
      model: "claude-sonnet-4-6",
      system: PROMPTS.supervisor(clientProfile),
      messages: [{ role: "user", content: `Seans transkripti:\n\n${transcript}` }],
      temperature: 0.4,
      max_tokens: 1024,
    });
    res.json({ feedback });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── SESSIONS / PROGRESS ─────────────────────────────────────────────────────

const VALID_MODULES = ["simulation", "difficult_moment", "case_formulation", "metaphor_lab"];

// POST /api/sessions/save — seans bitince transkript + feedback'i kaydet
app.post("/api/sessions/save", requireAuth, async (req, res) => {
  const { module, profile_id, messages, supervisor_feedback, score } = req.body || {};
  if (!VALID_MODULES.includes(module)) {
    return res.status(400).json({ error: "Geçersiz module" });
  }
  if (score != null && (typeof score !== "number" || score < 0 || score > 100)) {
    return res.status(400).json({ error: "Score 0-100 arası olmalı" });
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("sessions")
    .insert({
      user_id: req.user.id,
      module,
      profile_id: profile_id || null,
      messages_json: messages || null,
      supervisor_feedback: supervisor_feedback || null,
      score: score ?? null,
    })
    .select("id, created_at")
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // Progress upsert (incremental avg)
  const { data: existing } = await supabaseAdmin
    .from("progress")
    .select("total_sessions, avg_score")
    .eq("user_id", req.user.id)
    .eq("module", module)
    .maybeSingle();

  const prevTotal = existing?.total_sessions || 0;
  const prevAvg = existing?.avg_score ? parseFloat(existing.avg_score) : null;
  const newTotal = prevTotal + 1;
  let newAvg = prevAvg;
  if (score != null) {
    newAvg = prevAvg == null ? score : (prevAvg * prevTotal + score) / newTotal;
  }

  await supabaseAdmin.from("progress").upsert({
    user_id: req.user.id,
    module,
    total_sessions: newTotal,
    avg_score: newAvg != null ? Number(newAvg.toFixed(2)) : null,
    last_session_at: new Date().toISOString(),
  }, { onConflict: "user_id,module" });

  res.json({ id: inserted.id, created_at: inserted.created_at });
});

// GET /api/sessions — kullanıcının seans geçmişi
app.get("/api/sessions", requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("id, module, profile_id, supervisor_feedback, score, created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ sessions: data });
});

// GET /api/sessions/:id — tek seansın detayı (transcript dahil)
app.get("/api/sessions/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Seans bulunamadı" });
  res.json({ session: data });
});

// DELETE /api/sessions/:id — seans sil
app.delete("/api/sessions/:id", requireAuth, async (req, res) => {
  const { error } = await supabaseAdmin
    .from("sessions")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET /api/progress — modül bazlı yetkinlik puanları
app.get("/api/progress", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("progress")
    .select("module, total_sessions, avg_score, last_session_at")
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ progress: data });
});

// POST /api/academy — ACT Akademi içeriği (free)
app.post("/api/academy", requireAuth, async (req, res) => {
  const { topic } = req.body;
  try {
    const content = await chat({
      model: "claude-haiku-4-5-20251001",
      system: PROMPTS.academy(topic),
      messages: [{ role: "user", content: `${topic} konusunda eğitim içeriği oluştur.` }],
      temperature: 0.4,
      max_tokens: 1500,
    });
    res.json({ content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/difficult — Zor An değerlendirmesi (premium)
app.post("/api/difficult", requireAuth, requirePremium, async (req, res) => {
  const { scenario, therapistResponse } = req.body;
  try {
    const evaluation = await chat({
      model: "claude-sonnet-4-6",
      system: PROMPTS.difficultMoment(scenario),
      messages: [{ role: "user", content: `Terapistin müdahalesi: "${therapistResponse}"` }],
      temperature: 0.5,
      max_tokens: 800,
    });
    res.json({ evaluation });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/case-formulation — Vaka formülasyonu (premium)
app.post("/api/case-formulation", requireAuth, requirePremium, async (req, res) => {
  const { formulation } = req.body;
  try {
    const feedback = await chat({
      model: "claude-sonnet-4-6",
      system: PROMPTS.caseFormulation(),
      messages: [{ role: "user", content: `Problem: ${formulation.problem}\nFusion: ${formulation.fusion}\nAvoidance: ${formulation.avoidance}\nValues: ${formulation.values}\nAction: ${formulation.action}` }],
      temperature: 0.4,
      max_tokens: 1200,
    });
    res.json({ feedback });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/metaphor — Metafor Laboratuvarı (free)
app.post("/api/metaphor", requireAuth, async (req, res) => {
  const { metaphorName, userScenario } = req.body;
  try {
    const guidance = await chat({
      model: "claude-haiku-4-5-20251001",
      system: PROMPTS.metaphorLab(),
      messages: [{ role: "user", content: `Metafor: "${metaphorName}"\nKullanıcının senaryosu: "${userScenario}"` }],
      temperature: 0.5,
      max_tokens: 900,
    });
    res.json({ guidance });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/growth-profile — AI destekli terapötik esneklik profili
app.get("/api/growth-profile", requireAuth, async (req, res) => {
  const { data: sessions, error } = await supabaseAdmin
    .from("sessions")
    .select("module, supervisor_feedback, created_at")
    .eq("user_id", req.user.id)
    .not("supervisor_feedback", "is", null)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) return res.status(500).json({ error: error.message });
  if (!sessions || sessions.length === 0) {
    return res.json({ profile: null });
  }

  const sessionsText = sessions.map((s, i) => {
    const date = new Date(s.created_at).toLocaleDateString("tr-TR");
    return `--- Seans ${i + 1} (${s.module}, ${date}) ---\n${s.supervisor_feedback}`;
  }).join("\n\n");

  try {
    const raw = await chat({
      model: "claude-sonnet-4-6",
      system: PROMPTS.growthProfile(sessionsText),
      messages: [{ role: "user", content: "Profili oluştur." }],
      temperature: 0.3,
      max_tokens: 1500,
    });
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const profile = JSON.parse(cleaned);
    res.json({ profile });
  } catch (e) {
    console.error("growth-profile hatası:", e);
    res.status(500).json({ error: e.message });
  }
});

// SPA fallback — tüm diğer route'lar index.html'e gitsin
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ ACT Platform çalışıyor → http://localhost:${PORT}`);
});
