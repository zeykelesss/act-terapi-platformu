#!/usr/bin/env python3
"""ACT LAB — 2 Haftalik Sprint Plani PDF"""

from fpdf import FPDF

class PlanPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("arial", "", "/System/Library/Fonts/Supplemental/Arial.ttf")
        self.add_font("arial", "B", "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_font("arial", "", 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 6, "ACT LAB — Sprint Planı", align="L")
            self.cell(0, 6, f"Sayfa {self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
            self.line(10, self.get_y(), 200, self.get_y())
            self.ln(4)

    def section_title(self, text, r=13, g=13, b=13):
        self.set_font("arial", "B", 16)
        self.set_text_color(r, g, b)
        self.cell(0, 10, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def sub_title(self, text):
        self.set_font("arial", "B", 12)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text):
        self.set_font("arial", "", 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text, indent=10):
        x = self.get_x()
        self.set_font("arial", "", 10)
        self.set_text_color(60, 60, 60)
        self.cell(indent)
        self.cell(5, 5.5, "•")
        self.multi_cell(0, 5.5, text)
        self.ln(0.5)

    def task_row(self, who, task, detail):
        # Who badge
        self.set_font("arial", "B", 9)
        if who == "SEN":
            self.set_fill_color(13, 13, 13)
            self.set_text_color(255, 255, 255)
        elif who == "O":
            self.set_fill_color(200, 80, 80)
            self.set_text_color(255, 255, 255)
        else:
            self.set_fill_color(80, 130, 200)
            self.set_text_color(255, 255, 255)

        self.cell(18, 6, who, align="C", fill=True)
        self.set_text_color(13, 13, 13)
        self.cell(3)
        self.set_font("arial", "B", 10)
        self.cell(0, 6, task, new_x="LMARGIN", new_y="NEXT")

        # Detail
        self.cell(21)
        self.set_font("arial", "", 9)
        self.set_text_color(100, 100, 100)
        self.multi_cell(165, 5, detail)
        self.ln(3)

    def day_header(self, text):
        self.set_font("arial", "B", 11)
        self.set_text_color(255, 255, 255)
        self.set_fill_color(50, 50, 50)
        self.cell(0, 8, f"  {text}", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(3)

    def divider(self):
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def checkbox(self, text):
        self.set_font("arial", "", 10)
        self.set_text_color(60, 60, 60)
        self.cell(10)
        self.cell(6, 5.5, "[ ]")
        self.multi_cell(0, 5.5, text)
        self.ln(0.5)


pdf = PlanPDF()

# ═══════════════════════════════════════════════════════════════
# KAPAK
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.ln(40)
pdf.set_font("arial", "B", 36)
pdf.set_text_color(13, 13, 13)
pdf.cell(0, 15, "ACT LAB", align="C", new_x="LMARGIN", new_y="NEXT")

pdf.set_font("arial", "", 14)
pdf.set_text_color(100, 100, 100)
pdf.cell(0, 8, "2 Haftalık Launch Sprint Planı", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(6)

pdf.set_draw_color(200, 80, 80)
pdf.set_line_width(0.8)
pdf.line(70, pdf.get_y(), 140, pdf.get_y())
pdf.ln(8)

pdf.set_font("arial", "", 11)
pdf.set_text_color(120, 120, 120)
pdf.cell(0, 7, "Tarih: 17 Nisan — 30 Nisan 2026", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "Ekip: 2 kişi (Backend + Frontend/Branding)", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "Hedef: Pazarlanabilir, güvenli, markalı ürün", align="C", new_x="LMARGIN", new_y="NEXT")

pdf.ln(30)

pdf.set_font("arial", "B", 10)
pdf.set_text_color(13, 13, 13)
pdf.cell(0, 7, "Renk Kodları:", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(4)

# Legend
pdf.set_font("arial", "B", 9)
cx = 50
pdf.set_xy(cx, pdf.get_y())
pdf.set_fill_color(13, 13, 13)
pdf.set_text_color(255, 255, 255)
pdf.cell(18, 6, "SEN", align="C", fill=True)
pdf.set_text_color(80, 80, 80)
pdf.set_font("arial", "", 9)
pdf.cell(35, 6, "  = Backend / Infra")

pdf.set_font("arial", "B", 9)
pdf.set_fill_color(200, 80, 80)
pdf.set_text_color(255, 255, 255)
pdf.cell(18, 6, "O", align="C", fill=True)
pdf.set_text_color(80, 80, 80)
pdf.set_font("arial", "", 9)
pdf.cell(40, 6, "  = Frontend / Branding", new_x="LMARGIN", new_y="NEXT")

pdf.ln(2)
pdf.set_xy(cx + 27, pdf.get_y())
pdf.set_font("arial", "B", 9)
pdf.set_fill_color(80, 130, 200)
pdf.set_text_color(255, 255, 255)
pdf.cell(28, 6, "BİRLİKTE", align="C", fill=True)
pdf.set_text_color(80, 80, 80)
pdf.set_font("arial", "", 9)
pdf.cell(40, 6, "  = İkisi beraber", new_x="LMARGIN", new_y="NEXT")

# ═══════════════════════════════════════════════════════════════
# PROJE DURUMU
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("Mevcut Durum: Neredeyiz?")

pdf.body_text("ACT LAB şu an çalışan bir prototip. 6 modülü var, AI destekli terapi simülasyonu yapabiliyor. Ama pazara çıkmadan önce çözülmesi gereken ciddi sorunlar var:")

pdf.sub_title("Kritik Sorunlar")
pdf.bullet("GÜVENLİK: Kullanıcı şifreleri düz metin olarak localStorage'da. Herkes DevTools ile premium'a geçebilir. API key korumasız — biri sınırsız istek atabilir.")
pdf.bullet("XSS AÇIĞI: Kullanıcı mesajları innerHTML ile basılıyor. Kötü niyetli input ile kod çalıştırılabilir.")
pdf.bullet("VERİ TEKRARI: 12 danışan profili, 8 senaryo, 12 metafor hem server (prompts.js) hem client (index.html) tarafında ayrı ayrı tanımlı. Birini güncellersen diğeri eski kalır.")
pdf.bullet("MOBİL ÇALIŞMIYOR: Hexaflex 580px sabit, padding'ler sabit px. Telefondan kullanılamaz.")
pdf.bullet("VERİ KAYBOLUR: Sayfa yenilenince seans geçmişi sıfırlanır. Kullanıcı ilerlemesi yok.")

pdf.ln(2)
pdf.sub_title("Güçlü Yanlar")
pdf.bullet("ACT spesifik + Türkçe = rakipsiz niş. Bu kombinasyonda piyasada ciddi bir ürün yok.")
pdf.bullet("Klinik içerik çok iyi: Russ Harris bazlı, gerçekçi danışan profilleri, detaylı prompt sistemi.")
pdf.bullet("6 modül zaten çalışıyor: Simülasyon, Süpervizör, Akademi, Zor Anlar, Metafor, Vaka Formülasyonu.")
pdf.bullet("Groq + Llama 3.3 70B = hızlı ve ucuz AI inference.")

# ═══════════════════════════════════════════════════════════════
# HAFTA 1
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("HAFTA 1 — Temel & Branding", 200, 80, 80)
pdf.body_text("Bu hafta iki paralel iş kolu var: Sen altyapıyı güvenli hale getirirken, o brand kimliğini oluşturuyor. Hafta sonunda güvenli, markalı, responsive bir ürün olacak.")

# GÜN 1
pdf.day_header("GÜN 1-2  •  Perşembe-Cuma  (17-18 Nisan)")

pdf.task_row("BİRLİKTE", "Git yapısını kur + branding karar toplantısı",
    "İlk iş: main branch'i korumaya al, dev branch aç, feat/ branch'lerle çalışmaya başla. "
    "Sonra oturup şu kararları al:\n"
    "• Platform adı kesinleşsin: ACT LAB mı kalıyor, başka bir isim mi?\n"
    "• Ana renk (accent color) ne olacak? Şu anki siyah-bej iyi ama marka rengi lazım.\n"
    "• Logo fikri: Hexaflex şeklinden türetilebilir.\n"
    "• Tipografi: Şu anki font stack (Syne + Inter + IBM Plex Mono) kalacak mı?")

pdf.task_row("SEN", "XSS güvenlik açıklarını kapat",
    "index.html'deki tüm innerHTML kullanımlarını bul (yaklaşık 15+ yer). "
    "Kullanıcı inputu içeren yerlerde textContent kullan veya DOMPurify kütüphanesi ekle. "
    "Özellikle: mesaj baloncukları (satır 1869), süpervizör paneli, akademi içeriği. "
    "Test: Mesaj kutusuna <script>alert(1)</script> yaz, çalışmamalı.")

pdf.task_row("SEN", "API güvenlik katmanı ekle",
    "server.js'e express-rate-limit ekle: IP başına dakikada max 20 istek. "
    "CORS'u sadece kendi domain'ine kısıtla (şimdilik localhost + production URL). "
    "Helmet middleware ekle (güvenlik header'ları). npm install express-rate-limit helmet")

pdf.task_row("O", "Brand identity çalışması başlat",
    "Logo tasarımı: Hexaflex (altıgen) şeklinden yola çıkarak minimal bir logo. "
    "Renk paleti: Ana renk + 2 destekleyici renk. Referans: Calm, Headspace gibi wellness app'leri ama daha profesyonel/klinik. "
    "Moodboard oluştur (Figma, Pinterest veya kağıt üstünde).")

# GÜN 3-4
pdf.day_header("GÜN 3-4  •  Cumartesi-Pazar  (19-20 Nisan)")

pdf.task_row("SEN", "Gerçek auth sistemi kur",
    "Seçenek 1 (Hızlı): Supabase Auth — email/şifre ile signup/login, JWT otomatik. 2-3 saatte biter.\n"
    "Seçenek 2 (Manuel): bcrypt + JWT + SQLite. Daha fazla kontrol ama daha uzun sürer.\n"
    "Yapılacaklar:\n"
    "• POST /api/auth/register — şifreyi hash'le, DB'ye kaydet\n"
    "• POST /api/auth/login — JWT token dön\n"
    "• Auth middleware — token doğrulama\n"
    "• Frontend'deki localStorage auth'u gerçek JWT'ye çevir\n"
    "• Premium/free plan bilgisi DB'de tutulsun, client'ta değil")

pdf.task_row("O", "Landing page (hero section) yeniden tasarla",
    "Şu anki hero iyi ama branding'e göre güncellenmeli:\n"
    "• Yeni logo ve renklerle hero section\n"
    "• Value proposition net olsun: 'AI ile ACT terapi pratiği yap'\n"
    "• Social proof alanı: '12 gerçekçi danışan profili', '6 eğitim modülü'\n"
    "• CTA butonları net: 'Ücretsiz Başla' + 'Premium Keşfet'")

pdf.task_row("O", "Responsive CSS: Mobil uyumluluk",
    "Kritik kırılma noktaları: 768px (tablet), 480px (mobil).\n"
    "Öncelikli alanlar:\n"
    "• Navbar: Hamburger menü ekle (mobilde nav-links gizlensin)\n"
    "• Hexaflex: 580px sabit boyutu kaldır, viewBox ile scale et veya mobilde liste görünümü\n"
    "• Chat alanı: Mobilde tam ekran, padding'leri küçült\n"
    "• Profil kartları: Tek sütun grid\n"
    "• Metafor carousel: Touch/swipe desteği")

# GÜN 5
pdf.add_page()
pdf.day_header("GÜN 5  •  Pazartesi  (21 Nisan)")

pdf.task_row("SEN", "Veritabanı + Seans kayıt sistemi",
    "Supabase kullanıyorsak tablolar:\n"
    "• users (id, email, name, plan, created_at)\n"
    "• sessions (id, user_id, profile_id, messages_json, supervisor_feedback, score, created_at)\n"
    "• progress (user_id, module, total_sessions, avg_scores_json)\n\n"
    "Endpoint'ler:\n"
    "• POST /api/sessions/save — seans bitince transkripti kaydet\n"
    "• GET /api/sessions — kullanıcının seans geçmişi\n"
    "• GET /api/progress — yetkinlik puanları")

pdf.task_row("O", "Branding asset'leri üret",
    "• Favicon (32x32, 16x16)\n"
    "• Apple touch icon (180x180)\n"
    "• OG image (1200x630) — sosyal medya paylaşımı için\n"
    "• App manifest.json (PWA hazırlığı)\n"
    "• Font loading optimize et (preload)")

# GÜN 6-7
pdf.day_header("GÜN 6-7  •  Salı-Çarşamba  (22-23 Nisan)")

pdf.task_row("SEN", "Veri duplikasyonunu temizle",
    "Şu an profiller, senaryolar ve metaforlar HEM server (prompts.js) HEM client (index.html) tarafında tanımlı. "
    "Bu tehlikeli — birini güncellersen diğeri eski kalır.\n\n"
    "Çözüm: Verileri sadece server'da tut, client API ile çeksin.\n"
    "• GET /api/profiles — danışan profilleri\n"
    "• GET /api/scenarios — zor an senaryoları\n"
    "• GET /api/metaphors — metafor verileri\n"
    "• Client'taki PROFILES, SCENARIOS, METAPHOR_DATA const'larını kaldır, fetch ile değiştir")

pdf.task_row("SEN", "Deploy altyapısını hazırla",
    "Railway.app veya Fly.io (ücretsiz tier):\n"
    "• Dockerfile veya Procfile oluştur\n"
    "• Environment variables ayarla (GROQ_API_KEY, DB_URL, JWT_SECRET)\n"
    "• Custom domain bağlantısı hazırlığı\n"
    "• SSL otomatik (her iki platform da sağlıyor)")

pdf.task_row("O", "Tüm sayfaları mobil test et + polish",
    "Her sayfayı iPhone SE ve iPad boyutunda test et:\n"
    "• Hero section: Orb animasyonu mobilde gizlenebilir\n"
    "• Modül kartları: Tek sütun\n"
    "• Chat: Klavye açıldığında input kaybolmamalı\n"
    "• Süpervizör paneli: Mobilde full-screen overlay\n"
    "• Vaka formülasyonu: Textarea'lar mobilde rahat kullanılmalı")

# ═══════════════════════════════════════════════════════════════
# HAFTA 2
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("HAFTA 2 — Killer Feature & Launch", 80, 130, 200)
pdf.body_text("Bu hafta ürünü rakiplerden ayıracak özellikler ekleniyor: kişisel gelişim takibi, seans geçmişi ve ödeme. Hafta sonunda launch.")

# GÜN 8-9
pdf.day_header("GÜN 8-9  •  Perşembe-Cuma  (24-25 Nisan)")

pdf.task_row("SEN", "Yetkinlik haritası API'si",
    "Her süpervizör geri bildiriminden 6 ACT süreci puanını kaydet:\n"
    "kabul, bilişsel ayrışma, anda olma, bağlam olarak benlik, değerler, kararlı eylem\n\n"
    "• POST /api/progress/update — seans sonrası puanları kaydet\n"
    "• GET /api/progress/hexaflex — ortalama puanlar + zaman serisi\n"
    "• GET /api/progress/summary — toplam seans, en güçlü/zayıf alan, streak")

pdf.task_row("O", "Dashboard UI: Kişisel gelişim sayfası",
    "Yeni bir 'Dashboard' view ekle:\n"
    "• Hexaflex üzerinde kişisel puanlar (renk yoğunluğu ile göster)\n"
    "• Son 5 seans listesi (danışan adı, tarih, genel puan)\n"
    "• Streak sayacı: 'Bu hafta 3 seans yaptın'\n"
    "• En güçlü ve en zayıf alan vurgusu\n"
    "• 'Önerilen sonraki adım': zayıf alana göre otomatik öneri")

# GÜN 10-11
pdf.day_header("GÜN 10-11  •  Cumartesi-Pazar  (26-27 Nisan)")

pdf.task_row("SEN", "Seans geçmişi: replay ve detay",
    "• GET /api/sessions/:id — tekil seans detayı (transkript + feedback)\n"
    "• Transkripti güzel formatlı gösterme (terapist/danışan ayrımı)\n"
    "• Süpervizör geri bildirimini tekrar görüntüleme\n"
    "• Seans silme: DELETE /api/sessions/:id")

pdf.task_row("O", "Seans geçmişi UI + Transkript görüntüleme",
    "• Dashboard'a 'Geçmiş Seanslar' tab'ı ekle\n"
    "• Her seans kartında: danışan adı, tarih, süre, puan\n"
    "• Tıklayınca transkript açılsın (chat görünümünde)\n"
    "• Süpervizör paneli tekrar görüntülenebilsin\n"
    "• Boş state: 'Henüz seans yapmadın, hemen başla!'")

# GÜN 12
pdf.day_header("GÜN 12  •  Pazartesi  (28 Nisan)")

pdf.task_row("SEN", "Ödeme sistemi VEYA waitlist",
    "SEÇENEK A — iyzico entegrasyonu (Türkiye için):\n"
    "• npm install iyzipay\n"
    "• Checkout flow: plan seç → ödeme → premium aktif\n"
    "• Webhook: ödeme başarılı → DB'de plan güncelle\n\n"
    "SEÇENEK B — Waitlist (daha hızlı, ödemeyi sonraya bırak):\n"
    "• Ücretsiz kullanım (limitli)\n"
    "• 'Premium çok yakında' banner\n"
    "• Email toplama formu (Supabase'e kaydet)")

pdf.task_row("O", "Pricing section + CTA polish",
    "• Landing page'e pricing kartları ekle (Free vs Premium)\n"
    "• Feature comparison tablosu\n"
    "• Premium modal'ı güncelle: yeni branding ile\n"
    "• Upgrade flow: smooth, korkutucu değil")

# GÜN 13-14
pdf.add_page()
pdf.day_header("GÜN 13-14  •  Salı-Çarşamba  (29-30 Nisan)")

pdf.task_row("BİRLİKTE", "Production deploy + Son testler",
    "• Railway/Fly.io'ya deploy et\n"
    "• Custom domain bağla (actlab.app, actlab.co.tr, vs.)\n"
    "• SSL çalışıyor mu kontrol et\n"
    "• Tüm modülleri production'da test et\n"
    "• Mobil test (gerçek telefonda)\n"
    "• Signup → login → seans → süpervizör → dashboard akışını uçtan uca test et")

pdf.task_row("O", "Launch hazırlığı: Sosyal medya + içerik",
    "• Instagram/Twitter/LinkedIn post tasarımları\n"
    "• 3-4 adet tanıtım görseli (özellik showcase)\n"
    "• Kısa tanıtım metni: 'ACT Lab nedir, kimin için?'\n"
    "• Hedef kitle: Psikoloji öğrencileri, yeni terapistler, ACT meraklıları\n"
    "• Launch günü paylaşım planı")

pdf.task_row("SEN", "Monitoring + Analytics",
    "• Basit analytics: sayfa görüntüleme, seans sayısı (Plausible veya Umami — privacy-friendly)\n"
    "• Error tracking: Sentry free tier\n"
    "• Uptime monitoring: Upptime veya BetterUptime free\n"
    "• Groq API kullanım takibi (maliyeti kontrol altında tut)")

# ═══════════════════════════════════════════════════════════════
# GIT WORKFLOW
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("Git Çalışma Düzeni")

pdf.body_text("İkiniz aynı repo'da çalışırken birbirinizin kodunu bozmamak için bu yapıyı kullanın:")

pdf.sub_title("Branch Yapısı")
pdf.bullet("main — Production branch. Direkt push YOK. Sadece dev'den merge.")
pdf.bullet("dev — İkinizin merge noktası. Her feature bittikçe buraya PR açılır.")
pdf.bullet("feat/auth — Senin branch'in (auth sistemi)")
pdf.bullet("feat/security — Senin branch'in (güvenlik fix'leri)")
pdf.bullet("feat/db — Senin branch'in (veritabanı)")
pdf.bullet("feat/branding — Onun branch'i (logo, renkler, responsive)")
pdf.bullet("feat/dashboard — Birlikte (yetkinlik haritası)")

pdf.ln(3)
pdf.sub_title("Günlük Rutin")
pdf.bullet("Sabah: git pull origin dev ile güncel kodu çek.")
pdf.bullet("Kendi branch'inde çalış: git checkout feat/xxx")
pdf.bullet("Sık commit at. Küçük, anlamlı commit'ler.")
pdf.bullet("Feature bitince: dev'e PR aç, diğer kişi gözden geçirip merge etsin.")
pdf.bullet("Akşam: İkisi de dev'den pull alıp son durumu görsün.")

pdf.ln(3)
pdf.sub_title("Çakışma Olursa")
pdf.body_text("En çok çakışacak dosya: public/index.html (2144 satır, tek dosya). "
    "İlk fırsatta bu dosyayı bölün — CSS ayrı dosyaya, JS ayrı dosyaya. "
    "Böylece sen JS tarafında, o CSS tarafında çalışırken çakışma olmaz.")

# ═══════════════════════════════════════════════════════════════
# BRANDING REHBERİ
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("Branding Rehberi")

pdf.body_text("Gün 1'de oturup bu kararları alın. Karar alınca hemen uygulamaya geçilsin, tartışmaya boğulmayın.")

pdf.sub_title("1. Platform Adı")
pdf.body_text("Mevcut: ACT LAB. Alternatifler:")
pdf.bullet("ACT LAB — kısa, net, lab = pratik/deneysel vurgusu. EN İYİ SEÇİM olabilir.")
pdf.bullet("Hexaflex — ACT'in 6 sürecine referans. Terapistler anlar ama dar kitle.")
pdf.bullet("Seans Lab — daha geniş ama ACT spesifikliği kaybolur.")
pdf.bullet("Praxis — Latince 'pratik'. Sofistike ama zor telaffuz.")

pdf.sub_title("2. Renk Paleti Önerileri")
pdf.body_text("Şu anki bej/nötr zemin çok iyi. Üstüne marka rengi lazım:")
pdf.bullet("Seçenek A: Koyu yeşil (#2e7d5b) — büyüme, terapi, doğallık. Calm/Headspace hissi.")
pdf.bullet("Seçenek B: Koyu mavi (#2050c0) — güven, profesyonellik, klinik ciddiyet.")
pdf.bullet("Seçenek C: Sıcak turuncu (#d46830) — enerji, sıcaklık. Hexaflex'teki renklerle uyumlu.")
pdf.bullet("Tavsiye: TEK bir accent color seçin. Çok renk = dağınık görünüm.")

pdf.sub_title("3. Logo Yaklaşımı")
pdf.body_text("Hexaflex (altıgen) şeklinden türetilmiş minimal bir logomark + wordmark kombinasyonu. "
    "Canva, Figma veya bir tasarımcıdan alınabilir. İlk launch için mükemmel olması şart değil — "
    "temiz ve profesyonel olması yeterli.")

pdf.sub_title("4. Tone of Voice")
pdf.bullet("Klinik ama samimi: 'Biz profesyonel bir araçız ama seni korkutmayız.'")
pdf.bullet("Türkçe doğallık: Jargon'u açıkla, akademik dil kullanma.")
pdf.bullet("Empowering: 'Öğren, pratik yap, geliş' — kullanıcı güçlensin.")

# ═══════════════════════════════════════════════════════════════
# CHECKLIST
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("Launch Checklist")
pdf.body_text("Launch günü bu listeyi kontrol edin. Hepsi tamam olmadan launch yok:")

pdf.sub_title("Güvenlik")
pdf.checkbox("XSS açıkları kapatıldı (innerHTML temizlendi)")
pdf.checkbox("API rate limiting aktif")
pdf.checkbox("Şifreler hash'leniyor (bcrypt)")
pdf.checkbox("JWT auth çalışıyor")
pdf.checkbox("CORS sadece kendi domain'e açık")
pdf.checkbox("GROQ_API_KEY environment variable'da, kodda değil")
pdf.checkbox("Helmet middleware aktif")

pdf.ln(3)
pdf.sub_title("Ürün")
pdf.checkbox("Signup → Login → Seans → Süpervizör akışı çalışıyor")
pdf.checkbox("Tüm 6 modül çalışıyor (simülasyon, akademi, zor anlar, metafor, vaka, dashboard)")
pdf.checkbox("Seans geçmişi kaydediliyor ve görüntülenebiliyor")
pdf.checkbox("Free/Premium ayrımı düzgün çalışıyor")
pdf.checkbox("Hata durumlarında kullanıcıya anlamlı mesaj gösteriliyor")
pdf.checkbox("LLM JSON parse hataları yakalanıyor")

pdf.ln(3)
pdf.sub_title("Branding & Tasarım")
pdf.checkbox("Logo yerleştirildi (navbar, favicon, OG image)")
pdf.checkbox("Renk paleti uygulandı")
pdf.checkbox("Responsive: iPhone SE'de düzgün görünüyor")
pdf.checkbox("Responsive: iPad'de düzgün görünüyor")
pdf.checkbox("Meta taglar: title, description, OG tags")
pdf.checkbox("Favicon + Apple touch icon")

pdf.ln(3)
pdf.sub_title("Deploy & İzleme")
pdf.checkbox("Production deploy çalışıyor")
pdf.checkbox("Custom domain + SSL aktif")
pdf.checkbox("Analytics kuruldu")
pdf.checkbox("Error tracking kuruldu")
pdf.checkbox("Sosyal medya görselleri hazır")
pdf.checkbox("Launch metni hazır")

# ═══════════════════════════════════════════════════════════════
# TEKNİK NOTLAR
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.section_title("Teknik Notlar")

pdf.sub_title("Önerilen Tech Stack Değişiklikleri")
pdf.body_text("Mevcut stack'i tamamen değiştirmiyoruz — zaman yok. Sadece eksikleri tamamlıyoruz:")

pdf.bullet("Supabase (DB + Auth): Ücretsiz, hızlı kurulum, Postgres tabanlı. Email auth hazır.")
pdf.bullet("express-rate-limit: API koruması için. 5 dakikada kurulur.")
pdf.bullet("helmet: HTTP güvenlik header'ları. 2 satır kod.")
pdf.bullet("bcrypt (eğer Supabase kullanmıyorsanız): Şifre hash'leme.")
pdf.bullet("DOMPurify: Client-side HTML sanitization. XSS koruması.")
pdf.bullet("Plausible/Umami: Privacy-friendly analytics. GDPR uyumlu.")

pdf.ln(3)
pdf.sub_title("İlk Gün Yapılacak Refactor: HTML'i Böl")
pdf.body_text("public/index.html 2144 satır — CSS, JS ve HTML tek dosyada. "
    "İkiniz aynı anda bu dosyada çalışırsanız sürekli git conflict olur.\n\n"
    "İlk iş olarak şunu yapın:\n"
    "• public/style.css → Tüm CSS'i taşı\n"
    "• public/app.js → Tüm JavaScript'i taşı\n"
    "• public/index.html → Sadece HTML yapısı kalsın\n"
    "• index.html'de: <link rel='stylesheet' href='style.css'> ve <script src='app.js'></script>\n\n"
    "Bu 30 dakikalık bir iş ama 2 hafta boyunca conflict'ten kurtarır.")

pdf.ln(3)
pdf.sub_title("Maliyet Tahmini")
pdf.bullet("Supabase Free Tier: 500MB DB, 50K auth users, 2GB bandwidth — yeterli.")
pdf.bullet("Railway/Fly.io Free Tier: $5 kredi/ay veya 3 shared CPU — yeterli.")
pdf.bullet("Groq Free Tier: 14,400 istek/gün — başlangıç için yeterli.")
pdf.bullet("Domain: ~$10-15/yıl")
pdf.bullet("Toplam aylık maliyet (launch): $0-5 (free tier'larla)")

# ═══════════════════════════════════════════════════════════════
# SON SAYFA
# ═══════════════════════════════════════════════════════════════
pdf.add_page()
pdf.ln(50)
pdf.set_font("arial", "B", 24)
pdf.set_text_color(13, 13, 13)
pdf.cell(0, 12, "Hadi baslayalim.", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.ln(8)
pdf.set_font("arial", "", 12)
pdf.set_text_color(120, 120, 120)
pdf.cell(0, 7, "İlk adım: Git branch yapısını kur + HTML'i 3 dosyaya böl.", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "İkinci adım: Branding kararlarını al.", align="C", new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 7, "Üçüncü adım: Bu PDF'teki Gün 1'den başla.", align="C", new_x="LMARGIN", new_y="NEXT")

pdf.ln(30)
pdf.set_draw_color(200, 200, 200)
pdf.line(60, pdf.get_y(), 150, pdf.get_y())
pdf.ln(8)
pdf.set_font("arial", "", 9)
pdf.set_text_color(170, 170, 170)
pdf.cell(0, 5, "Bu plan Claude ile birlikte hazırlandı — 16 Nisan 2026", align="C", new_x="LMARGIN", new_y="NEXT")

# KAYDET
output_path = "/Users/koz/Documents/ACT/ACT_LAB_Sprint_Plani.pdf"
pdf.output(output_path)
print(f"PDF olusturuldu: {output_path}")
