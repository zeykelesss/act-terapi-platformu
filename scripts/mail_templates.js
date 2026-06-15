// ACT Lab — Soğuk Mail Şablonları (Şablon# → konu + gövde)
// Mail-merge değişkenleri: {{isim}}, {{soyad}}, {{kurum}}, {{unvan}}, {{salutation}}

const SIGNATURE = `
${process.env.MAIL_SIGNATURE_NAME || '[Ad Soyad]'} — Kurucu, ACT Lab
${process.env.MAIL_SIGNATURE_PHONE || ''}
${process.env.MAIL_SIGNATURE_EMAIL || ''}
${process.env.MAIL_SIGNATURE_WEB || ''}
${process.env.MAIL_SIGNATURE_DEMO ? `Demo: ${process.env.MAIL_SIGNATURE_DEMO}` : ''}
`.split('\n').filter(Boolean).join('\n');

const FOOTER = `

---
Bu mail, kurumunuzun resmi web sitesinde yayınlanmış kurumsal iletişim bilgisinden gönderilmiştir.
Listemizden çıkmak için bu maile "ÇIKAR" yazarak yanıtlayın.`;

export const TEMPLATES = {
  // Şablon 1 — Dernek
  '1': {
    subject: 'ACT eğitimini AI ile ölçeklendirme — {{kurum}} için ortaklık önerisi',
    body: `{{salutation}},

{{kurum}} ekibinin ACT/üçüncü dalga psikoterapiler alanındaki çalışmalarını takip ediyoruz. Türkiye'de bu eğitimin yetkin eğitmen sayısının sınırlı olması, talebi karşılamada darboğaz yaratıyor; özellikle Anadolu'daki klinisyenler ve psikoloji lisansüstü öğrencileri için ulaşılabilirlik sorunu büyük.

ACT Lab olarak bu açığı kapatmak için AI destekli, Türkçe bir ACT terapist eğitim platformu geliştirdik. Platform; vaka simülasyonu, defüzyon/değer çalışması canlı senaryoları ve süpervizyon kayıtları üretebiliyor. Hedefimiz eğitmenlerin yerini almak değil — bilakis sizin gibi otoritelerin müfredatını ölçekte uygulanabilir kılmak.

Somut teklif: {{kurum}} bünyesindeki mevcut müfredatı platformumuzda white-label olarak sunmak, derneğin onaylı rozetiyle sertifika çıkışı vermek ve gelir paylaşımı modeliyle çalışmak. Eğitmen ekiplerinizin yükü değil, erişimi artıyor.

15 dakikalık bir demo için önümüzdeki iki hafta içinde uygun musunuz?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },

  // Şablon 2 — Üniversite SEM
  '2': {
    subject: '{{kurum}} psikoterapi katalogu için Türkçe ACT modülü — pilot teklifi',
    body: `{{salutation}},

{{kurum}} bünyesinde yürütülen psikoterapi sertifika programlarında ACT/üçüncü dalga terapilerinin önemli bir yer tuttuğunu görüyoruz. Bu alanda en sık duyduğumuz iki ihtiyaç: (1) katılımcıların eğitim sonrası uygulama pratiği bulamaması, (2) eğitmenlerin canlı süpervizyon yükü.

ACT Lab — AI destekli, Türkçe ACT eğitim platformu — bu iki sorunu hedefliyor. Katılımcılar platformda vaka simülasyonu yapıp anlık geri bildirim alıyor; eğitmen ise süpervizyon kayıtlarına asenkron bakabiliyor. Programınızın 6 haftalık modülüne plug-in olarak girer ve katılımcıya 24/7 pratik alanı sağlar.

Pilot teklifimiz: bir dönem için {{kurum}} katılımcılarına ücretsiz erişim. Karşılığında geri bildirim ve sonuçlara göre uzun vadeli lisans görüşmesi. Yatırım sıfır, kazanç katılımcı memnuniyeti ölçümü.

Önümüzdeki 2 hafta içinde 20 dakikalık bir demo için uygun bir zaman var mı?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },

  // Şablon 3 — Online platform
  '3': {
    subject: '{{kurum}} terapistleri için Türkçe ACT sertifika rozeti — B2B partnership',
    body: `{{salutation}},

{{kurum}} ekibinin Türkiye'de online terapi alanındaki konumunu biliyoruz. Bu ölçekte en kritik metriklerden biri kullanıcı tarafında terapist kalite algısı.

ACT Lab olarak terapistlere yönelik Türkçe, kanıt temelli ACT eğitimi sunan bir platform geliştirdik. Önerimiz: {{kurum}} terapistleri ACT Lab sertifikasını ücretli/indirimli alır, profillerinde "ACT Sertifikalı Terapist" rozeti gösterir. Sonuç: kullanıcının terapist seçiminde güven artışı + {{kurum}} markasında klinik kalite kanıtı.

İki olası model:
1. Affiliate: ACT Lab fiyatından {{kurum}} tarafına komisyon
2. Bulk lisans: {{kurum}} tüm aktif terapistlerine paket alır, uzman başına maliyet düşer

20 dakikalık tanışma görüşmesi için önümüzdeki iki hafta içinde uygun musunuz?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },

  // Şablon 4 — Terapi merkezi zinciri
  '4': {
    subject: '{{kurum}} psikolog kadrosu için sürekli eğitim aboneliği',
    body: `{{salutation}},

{{kurum}} ekibinin Türkiye'de klinik psikoloji alanında öne çıkan zincirlerden olduğunu görüyoruz. Bu büyüklükte kadronun ortak metodoloji altında çalışması — özellikle yeni mezun psikologlarda — klinik kaliteyi belirleyen faktör.

ACT Lab, Türkçe ACT eğitimini standartlaştıran AI destekli bir platform. Sunduğumuz:
- Yeni katılan psikologlar için onboarding modülü (4-6 hafta)
- Mevcut kadro için aylık vaka simülasyonu pratiği
- Klinik direktör paneli: kadronun eğitim ilerlemesi takibi

Kurumsal lisans modeli — uzman başına aylık abonelik, volume discount ile.

Bir demo + karşılıklı uygunluk konuşması için önümüzdeki iki hafta içinde 30 dakika ayırabilir misiniz?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },

  // Şablon 5 — EAP sağlayıcı
  '5': {
    subject: 'Kurumsal müşterileriniz için Türkçe ACT temelli iyilik hali modülü',
    body: `{{salutation}},

{{kurum}} ekibinin kurumsal müşterilere sunduğu çalışan destek programlarında ACT temelli içeriklere talep arttığını biliyoruz — özellikle stres, tükenmişlik ve değer odaklı kariyer çalışmalarında.

ACT Lab olarak hem terapistlere hem son kullanıcıya yönelik Türkçe ACT içeriği üretiyoruz. {{kurum}} için iki tür değer önerisi sunabiliriz:

1. Terapist tarafı: EAP ağınızdaki uzmanlar için sürekli eğitim modülü (terapist kalite artışı = kurumsal müşteri güveni)
2. Son kullanıcı tarafı: Kurumsal çalışanların kullanabileceği self-help ACT modülleri (white-label, {{kurum}} markasıyla)

Hangisi öncelik sizde — onunla başlayalım. 20 dakikalık keşif görüşmesi için önümüzdeki iki hafta içinde uygun musunuz?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },

  // Şablon 6 — Hastane
  '6': {
    subject: '{{kurum}} psikoloji kadrosu için hizmet içi ACT eğitimi',
    body: `{{salutation}},

{{kurum}} psikiyatri/klinik psikoloji bölümünün hasta yükü ve uzman kadrosu büyüklüğü düşünüldüğünde, hizmet içi eğitimde ölçeklenebilir kaynak ihtiyacının kritik olduğunu varsayıyoruz.

ACT Lab, Türkçe ACT eğitimini AI destekli vaka simülasyonu üzerinden veren bir platform. Hekim ve psikolog kadrolarınızın:
- Mesai dışı esnek erişimle pratik yapması
- Süpervizör eğitmenin asenkron geri bildirim verebilmesi
- Bölüm bazında ilerleme raporlaması

{{kurum}} için kurumsal pilot lisans önerimiz — ücretsiz 3 aylık değerlendirme dönemi sonrası yıllık abonelik. Klinik kalite + akreditasyon süreçlerine veri katkısı bonus.

20 dakikalık tanışma için önümüzdeki iki hafta içinde uygun musunuz?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },

  // Şablon 7 — Üniversite YL / Akademisyen
  '7': {
    subject: '{{kurum}} Klinik Psikoloji programı için ACT pratik modülü',
    body: `{{salutation}},

{{kurum}} klinik psikoloji programının üçüncü dalga terapileri öğrenciye nasıl deneyimletebileceği konusundaki çalışmalarınızı takip ediyoruz. Bu alanda en sık karşılaşılan zorluk — sınıf saatinin sınırlı, vaka pratiği için süpervizyon kaynağının yetersiz olması.

ACT Lab, bu boşluğu doldurmak üzere geliştirildi: lisansüstü öğrenciler vaka simülasyonu üzerinden defüzyon, değer çalışması ve metaforla çalışma pratiği yapıyor, eğitmenler asenkron kayıtlardan değerlendirme verebiliyor.

Pilot teklif: bir dönem boyunca {{kurum}} öğrencilerine ücretsiz erişim, karşılığında akademik veri (kullanıcı deneyim ölçümleri, öğrenme çıktısı) ve geri bildirim. Pilot başarılı olursa müfredat lisansı görüşülebilir.

Önümüzdeki 3 hafta içinde 20 dakikalık bir görüşme için uygun musunuz?

Saygılarımla,
${SIGNATURE}${FOOTER}`,
  },
};

export function renderTemplate(templateId, row) {
  const tpl = TEMPLATES[String(templateId)];
  if (!tpl) throw new Error(`Bilinmeyen şablon: ${templateId}`);

  const isim = (row['İsim'] || '').trim();
  const unvan = (row['Ünvan'] || '').trim();
  const kurum = (row['Kurum'] || '').trim();

  // Generic rol/birim isimleri — gerçek kişi adı değilse "Sayın Yetkili"
  const GENERIC_ROLES = ['genel merkez', 'merkez', 'yetkili', 'myk', 'yönetim kurulu',
    'yönetim', 'sekreterya', 'sekreter', 'bölüm', 'iletişim', 'koordinatör',
    'rektör', 'dekan', 'bölüm başkanlığı', 'enstitü', 'info', 'genel sekreterlik'];
  const isimLower = isim.toLowerCase();
  const isGenericRole = GENERIC_ROLES.some(r => isimLower.includes(r));

  let salutation;
  if (isim && isim !== '-' && isim !== '—' && !isGenericRole) {
    if (unvan && unvan !== '-' && unvan !== '—' &&
        !unvan.toLowerCase().includes('genel') &&
        !unvan.toLowerCase().includes('info') &&
        !unvan.toLowerCase().includes('sekreter')) {
      // Akademisyen: "Sayın Prof. Dr. {soyad}" (isim'den soyadını al)
      const parts = isim.split(/\s+/);
      const soyad = parts.length > 1 ? parts[parts.length - 1] : isim;
      salutation = `Sayın ${unvan} ${soyad}`;
    } else {
      salutation = `Sayın ${isim}`;
    }
  } else {
    salutation = 'Sayın Yetkili';
  }

  const vars = {
    '{{isim}}': isim,
    '{{unvan}}': unvan,
    '{{kurum}}': kurum,
    '{{salutation}}': salutation,
  };

  let subject = tpl.subject;
  let body = tpl.body;
  for (const [k, v] of Object.entries(vars)) {
    subject = subject.split(k).join(v);
    body = body.split(k).join(v);
  }

  return { subject, body };
}
