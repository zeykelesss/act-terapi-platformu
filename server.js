import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import { PROMPTS } from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── SECURITY ───────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
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

// Groq client (lazy — sunucu API key olmadan da ayağa kalksın)
let _groq;
function groq() {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY tanımlı değil");
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

// ── API ROUTES ──────────────────────────────────────────────────────────────

// POST /api/session — Danışan yanıtı
app.post("/api/session", async (req, res) => {
  const { messages, clientProfile } = req.body;
  try {
    const completion = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPTS.simulatedSession(clientProfile) },
        ...messages,
      ],
      temperature: 0.88,
      max_tokens: 300,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/supervisor — Süpervizör geri bildirimi
app.post("/api/supervisor", async (req, res) => {
  const { messages, clientProfile } = req.body;
  const transcript = messages
    .map((m) => `${m.role === "user" ? "TERAPİST" : "DANIŞAN"}: ${m.content}`)
    .join("\n");
  try {
    const completion = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPTS.supervisor(clientProfile) },
        { role: "user", content: `Seans transkripti:\n\n${transcript}` },
      ],
      temperature: 0.5,
      max_tokens: 900,
    });
    res.json({ feedback: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/academy — ACT Akademi içeriği
app.post("/api/academy", async (req, res) => {
  const { topic } = req.body;
  try {
    const completion = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPTS.academy(topic) },
        { role: "user", content: `${topic} konusunda eğitim içeriği oluştur.` },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });
    res.json({ content: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/difficult — Zor An değerlendirmesi
app.post("/api/difficult", async (req, res) => {
  const { scenario, therapistResponse } = req.body;
  try {
    const completion = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPTS.difficultMoment(scenario) },
        {
          role: "user",
          content: `Terapistin müdahalesi: "${therapistResponse}"`,
        },
      ],
      temperature: 0.6,
      max_tokens: 700,
    });
    res.json({ evaluation: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/case-formulation — Vaka formülasyonu
app.post("/api/case-formulation", async (req, res) => {
  const { formulation } = req.body;
  try {
    const completion = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPTS.caseFormulation() },
        {
          role: "user",
          content: `Problem: ${formulation.problem}\nFusion: ${formulation.fusion}\nAvoidance: ${formulation.avoidance}\nValues: ${formulation.values}\nAction: ${formulation.action}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });
    res.json({ feedback: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/metaphor — Metafor Laboratuvarı
app.post("/api/metaphor", async (req, res) => {
  const { metaphorName, userScenario } = req.body;
  try {
    const completion = await groq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: PROMPTS.metaphorLab() },
        {
          role: "user",
          content: `Metafor: "${metaphorName}"\nKullanıcının senaryosu: "${userScenario}"`,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });
    res.json({ guidance: completion.choices[0].message.content });
  } catch (e) {
    console.error(e);
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
