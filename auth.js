import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.warn("⚠️  Supabase env vars missing — auth endpoints will fail until configured");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Giriş yapman gerek" });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: "Geçersiz oturum" });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan, name, sim_count")
    .eq("user_id", data.user.id)
    .single();

  req.user = {
    id: data.user.id,
    email: data.user.email,
    name: profile?.name || data.user.email,
    plan: profile?.plan || "free",
    simCount: profile?.sim_count || 0,
  };
  next();
}

export function requirePremium(req, res, next) {
  if (req.user?.plan !== "premium") {
    return res.status(403).json({ error: "Bu özellik premium üyelik gerektirir", upgrade: true });
  }
  next();
}
