# ACT Lab — Deploy

## Environment variables

Production'da `.env` dosyası kullanılmaz, platform secret manager ile set edilir.

| Variable | Required | Açıklama |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq API key, Llama çağrıları için |
| `SUPABASE_URL` | ✅ | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role JWT, **gizli** |
| `ALLOWED_ORIGIN` | ⚠️ | Custom domain bağlandığında set et (örn: `https://actlab.app`). Default `*`. |
| `PORT` | ⚠️ | Platform genelde otomatik set eder, default 3001 |

## Railway

1. https://railway.app → New Project → Deploy from GitHub repo
2. Variables sekmesi → yukarıdaki tüm env'leri ekle
3. Settings → Networking → Generate Domain (geçici subdomain)
4. Custom domain için: Settings → Networking → Custom Domain ekle, DNS CNAME yapılandır
5. `Procfile` otomatik algılanır; alternatif olarak Nixpacks kullanılır

## Fly.io

1. `flyctl launch` (Dockerfile otomatik algılanır)
2. `flyctl secrets set GROQ_API_KEY=... SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_KEY=...`
3. `flyctl deploy`
4. Region: `fra` (Frankfurt) — Supabase Frankfurt projesine yakınlık

## Custom domain

1. Domain provider'da CNAME → platformun verdiği subdomain
2. Platform tarafında SSL sertifikası otomatik
3. `ALLOWED_ORIGIN` env'i custom domain'e güncelle

## Önce launch checklist

- [ ] Service role key + DB password rotate edildi (sprint başında transcript'te paylaşılmıştı)
- [ ] `ALLOWED_ORIGIN` `*` değil, custom domain
- [ ] Supabase Auth → Email Provider → SMTP konfigüre edildi (production'da kullanıcı şifremi unuttum akışı için)
- [ ] Groq billing limit set edildi
- [ ] Health check endpoint test edildi (basit `curl https://domain/api/profiles`)
