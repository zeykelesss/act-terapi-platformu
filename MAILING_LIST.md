# ACT Lab — Mailing List Kullanım Kılavuzu

> 407 hedef e-mail, tier ve şablon ile etiketlenmiş, 100/gün ücretsiz SMTP limitine göre 5 batch'e bölünmüş.
> Dosya: [MAILING_LIST.csv](MAILING_LIST.csv) — CSV-uyumlu, doğrudan mail aracına yüklenebilir.

## Toplam Hedef Dağılımı

**Toplam: 407 doğrulanmış/yüksek olasılıklı e-mail**

| Tier | Sayı | İçerik |
|------|------|--------|
| Tier 1 | 74 | Top 10 kurum + ACT alanında bilinen akademisyenler |
| Tier 2 | 235 | Klinik psk bölümleri tüm akademik kadro + dernekler + SEM'ler + büyük platformlar |
| Tier 3 | 70 | Özel enstitüler + terapi zincirleri + hastane grupları + EAP firmaları |
| Tier 4 | 28 | Diaspora + öğrenci toplulukları + devlet üniv. ek kadro |

**Kategori dağılımı:**
- Akademisyen (kişisel kurumsal): 295
- Üniversite YL/SEM (genel): 33
- Dernek: 19
- Terapi merkezi zinciri: 20
- Online platform: 11
- Enstitü/eğitim merkezi: 8
- Hastane: 17
- EAP: 2
- Diaspora: 5
- Öğrenci topluluğu: 5

## CSV Yapısı

Sütunlar:
| Sıra | Batch | Tier | Kategori | Kurum | İsim | Ünvan | Email | İlgi Alanı | Şablon# | Kaynak | Notlar |

- **Sıra**: 1-407 öncelik sırası
- **Batch**: BATCH 1-5 (100/gün ücretsiz limit için günlük gönderi grubu)
- **Şablon#**: Hangi cold-mail şablonunu kullanacağın ([SALES_TARGETS.md](SALES_TARGETS.md) içinde)
- **Notlar**: "Web'den doğrulandı" = kesin yayınlanmış / "Standart örüntü tahmin" = `ad.soyad@uni.edu.tr` örüntüsünden çıkarılmış (TR üniversiteleri için %90+ doğru)

## Gönderim Stratejisi (Ücretsiz Servis Limitleri)

### Senaryo A — 100/gün limit (SendGrid Free, Resend Free)
- **Gün 1 — BATCH 1** (100 mail): Tier 1 tamamı + Tier 2 dernek/SEM/online platform
- **Gün 2 — BATCH 2** (100 mail): Tier 2 akademik kadro öncelikli (Bilgi, BAU, Üsküdar, Hacettepe vb.)
- **Gün 3 — BATCH 3** (100 mail): Tier 2 akademik kadro devamı
- **Gün 4 — BATCH 4** (100 mail): Tier 3 (terapi merkezi + hastane + enstitü + EAP)
- **Gün 5 — BATCH 5** (7 mail): Tier 4 kalan

### Senaryo B — 300/gün limit (Brevo/Sendinblue Free)
- **Gün 1**: BATCH 1+2+3 (300 mail) — Tier 1+2 tamamı
- **Gün 2**: BATCH 4+5 (107 mail) — Tier 3+4 tamamı
- 2 günde biter

### Senaryo C — 500/gün limit (Gmail SMTP, normal hesap)
- **Gün 1**: BATCH 1+2+3+4 (400 mail) — neredeyse tamamı
- **Gün 2**: BATCH 5 (7 mail) — bitiş

### Önerilen Servis Tercihi (kalite/limit dengesi)

| Servis | Limit | Avantaj | Dezavantaj |
|--------|-------|---------|------------|
| **Brevo (eski Sendinblue)** | 300/gün, ücretsiz | Kolay arayüz, transactional + marketing | TR'de spam'a düşme riski orta |
| **Resend** | 100/gün, 3000/ay | Geliştirici dostu, deliverability iyi | Düşük günlük limit |
| **Gmail SMTP (kendi hesabın)** | 500/gün | Yüksek deliverability, "kişisel" görünüm | Spam yememek için yavaş gönder |
| **SendGrid Free** | 100/gün | Endüstri standardı | Yeni hesaplarda warm-up gerek |
| **Mailgun** | İlk ay 5K, sonra paid | Profesyonel | Kart bilgisi şart |
| **Zoho ZeptoMail** | 100/gün ücretsiz | Transactional odaklı | Marketing için optimize değil |

**Öneri**: İlk gün **Gmail SMTP + senin kişisel hesabınla** dene (kişisel ton, 500/gün) — 100 maile cevap geliyor mu test et. Cevap geliyorsa Gün 2'de hızlan. Spam yememek için **30 saniye/mail aralık** koy.

## Şablon Eşleştirme

CSV'deki "Şablon#" sütunu, [SALES_TARGETS.md](SALES_TARGETS.md) içindeki numaralandırılmış şablonlara karşılık geliyor:

| # | Şablon | Hedef |
|---|--------|-------|
| 1 | Dernek | TÜRBAD, BDT, EMDR, PDR vb. |
| 2 | Üniversite SEM | Haliç-SEM, USEM, BAUPRO vb. |
| 3 | Online platform | Hiwell, Heltia, Terappin |
| 4 | Terapi merkezi zinciri | Sarı Psikoloji, ÇADEM, İnspira |
| 5 | EAP sağlayıcı | Sento, Albert, Heltia Business |
| 6 | Hastane | NPİstanbul, Acıbadem, Medipol |
| 7 | Üniversite YL/Akademisyen | Klinik psk bölüm kadroları |

## Önemli Notlar

1. **Tahmin örüntü güvenilirliği** (Standart örüntü tahmin işaretli olanlar):
   - TR vakıf üniversiteleri: `ad.soyad@uni.edu.tr` ~%95 doğru (bilgi, bau, uskudar, ieu, ozyegin vb.)
   - TR devlet üniversiteleri: `ad.soyad@uni.edu.tr` ~%85 doğru, bazıları `adsoyad@` (boşluksuz) kullanır
   - Türkçe karakterli isimler: ç→c, ş→s, ğ→g, ı→i, ü→u, ö→o (Türk üniversiteleri standardı)
   - Bounce gelirse normaldir, listeyi temizle

2. **Spam filtreleri için ipuçları**:
   - Konu satırında ALL CAPS, ünlem, "ÜCRETSİZ/FREE" kelimeleri kullanma
   - HTML değil plain text mail at (kişisel görünüm)
   - İlk mailinde link sayısı 2'yi geçmesin
   - SPF/DKIM ayarlarını domain'inde aktif et (deliverability için kritik)
   - Reply-to senin gerçek mailin olsun, no-reply@ kullanma

3. **Kişiselleştirme (mail-merge)**:
   - CSV'deki `İsim`, `Kurum`, `Ünvan` alanlarını `{{isim}}`, `{{kurum}}`, `{{unvan}}` placeholder olarak şablona koy
   - İsim "-" olanlarda generic "Sayın yetkili" kullan
   - Akademisyenlere "Sayın {{unvan}} {{soyad}}" — soyadını isimden ayır (CSV import sırasında split kolay)

4. **Takip ritmi**:
   - İlk mail → 5 gün sessizlik → kısa takip ("Önceki mailim ulaştı mı?")
   - 10 gün sonra → değer ekleyici takip ("Bu blog yazımız işinize yarayabilir")
   - 3 mail sonra cevap yoksa → CRM'de "dormant", 3 ay sonra farklı hook ile tekrar

5. **Cevap geldiğinde**:
   - Otomatik gönderimi DURDUR
   - Manuel cevap ver, 15-20 dakika içinde
   - Demo görüşme için Calendly link gönder (TR'de yaygınlaşıyor)
   - Demo sırasında ekran paylaşımı + 5 dakika platform turu + 1 vaka simülasyonu

## Manuel Doldurma Gerekenler

Bazı kurumlar yayınlanmış mail vermiyor — sadece iletişim formu. Bunlar CSV'de yok ama [SALES_TARGETS.md](SALES_TARGETS.md) listesinde var. Manuel form gönderimi gereken kurumlar:

- Heltia (uygulama içi "kurumsal teklif" formu)
- Hiterapi, 1001Terapist, Pisikoloji.co (iletişim formu)
- ÇADEM 5 şube (Cloudflare-obfuscated, siteden manuel kopyala)
- Anadolu Sağlık Merkezi (Cloudflare)
- Liv Hospital, Medical Park (form)
- Beykoz, ODTÜ Psk., Boğaziçi Psk. bölüm (form)

Bu kurumlar için ayrı bir "manuel" sheet veya Trello board tut.

## Yasal Notlar (KVKK light)

KVKK kapsamında B2B soğuk mail gri alandır:
- ✅ İzin verilen: kurumun KENDİ yayınladığı kurumsal adresler (info@, sem@, dekan@), meşru menfaat kapsamında
- ⚠️ Risk: akademisyenlerin kişisel kurumsal adresleri (kendi web sayfalarında ders/araştırma için yayınlanmış) — savunulabilir ama bir kişi şikayet ederse para cezası riski var
- ❌ Yapma: Bireysel terapistlerin info@adsoyad.com adreslerini scrape edip toplu gönderme (KVKK ihlali)

Pratik öneri:
- İlk maile **"Bu maili kurumunuzun resmi web sitesinde yayınlanmış kurumsal iletişim bilgisinden aldık. Çıkmak için yanıtlayın"** notu ekle. Bu KVKK m.5 "meşru menfaat" savunmasını güçlendirir.
- Cevap olarak "çıkar" diyene **anında unsubscribe** yap, kayıtla.
- 3 mail sonra cevap yoksa otomatik durmalı.
