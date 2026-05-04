// Danışan profilleri — UI ve simülasyon için tek kaynak
export const PROFILES = [
  {
    id:'ayse', name:'Ayşe', age:28, occupation:'Finans uzmanı', resistanceLevel:'orta',
    issue:'İş yerinde yoğun kaygı ve başarısızlık korkusu',
    background:'Sürekli terfi almış, yüksek performans beklentisi olan birisi. Hata yapmaktan aşırı korkuyor.',
    fusionThemes:'"Başarısız olursam her şey biter", "Yeterince iyi değilim"',
    avoidanceStyle:'Mükemmel olmayan işleri erteliyor, zor toplantılardan kaçıyor',
    description:'Mükemmeliyetçi, başarı odaklı, duyguları bastıran bir danışan',
    difficulty:'Orta', tags:['kaygı','mükemmeliyetçilik','iş stresi']
  },
  {
    id:'mert', name:'Mert', age:35, occupation:'Yazılım geliştirici', resistanceLevel:'yüksek',
    issue:'Kronik depresyon belirtileri ve anlamsızlık hissi',
    background:'3 yıldır evden çalışıyor. Arkadaşlıklarını yavaş yavaş bıraktı. Terapiye şüpheyle geliyor.',
    fusionThemes:'"Hiçbir şeyin önemi yok", "Zaten değişmez", "Bu terapi de işe yaramaz"',
    avoidanceStyle:'Sosyal izolasyon, aşırı uyku, oyunlara gömülme',
    description:'Terapiye şüpheyle yaklaşan, değişime dirençli, nihilist eğilimli bir danışan',
    difficulty:'Zor', tags:['depresyon','direniş','anlamsızlık']
  },
  {
    id:'elif', name:'Elif', age:22, occupation:'Üniversite öğrencisi', resistanceLevel:'düşük',
    issue:'Sosyal kaygı ve yargılanma korkusu',
    background:'İlk yıl üniversite. Sınıfta konuşmaktan, sunum yapmaktan korkuyor.',
    fusionThemes:'"Herkes beni yargılıyor", "Aptal görünüyorum"',
    avoidanceStyle:'Arka sıralara oturma, söz almaktan kaçınma, sosyal davetleri reddetme',
    description:'Değişmek isteyen ama nasıl yapacağını bilemeyen, terapiste güvenen bir danışan',
    difficulty:'Kolay-Orta', tags:['sosyal kaygı','genç yetişkin']
  },
  {
    id:'can', name:'Can', age:42, occupation:'İnşaat mühendisi', resistanceLevel:'orta',
    issue:'Kronik bel ağrısı ve buna bağlı yaşam kalitesi kaybı',
    background:'2 yıldır bel ağrısı çekiyor. Psikolojik bileşeni kabul etmiyor.',
    fusionThemes:'"Ağrı gerçek, bu psikoloji değil", "Eski ben yoktu artık"',
    avoidanceStyle:'Fiziksel aktiviteden kaçınma, öfkeyle tepki verme',
    description:'Psikolojik boyutu kabul etmekte zorlanan, bedensel soruna yapışık bir danışan',
    difficulty:'Orta-Zor', tags:['kronik ağrı','kabul güçlüğü']
  },
  {
    id:'kerem', name:'Kerem', age:31, occupation:'Satış temsilcisi', resistanceLevel:'orta',
    issue:'Alkol kullanım bozukluğu — iş stresiyle içiyor',
    background:'Hafta içi birkaç bira, hafta sonları kontrolden çıkıyor. Eşi tehdit etti.',
    fusionThemes:'"Sadece rahatlamak istiyorum", "Ben alkolik değilim"',
    avoidanceStyle:'Kaygıdan kaçmak için içiyor, iş sorunlarını görmezden geliyor',
    description:'Bağımlılığı minimalize eden, değişim motivasyonu dış baskıdan gelen bir danışan',
    difficulty:'Zor', tags:['bağımlılık','alkol','inkar']
  },
  {
    id:'neslihan', name:'Neslihan', age:38, occupation:'Hemşire', resistanceLevel:'orta',
    issue:'İş yerinde şiddete maruz kalma sonrası PTSD belirtileri',
    background:'6 ay önce hasta yakını tarafından saldırıya uğradı. Hastaneye gitmekten korkuyor.',
    fusionThemes:'"Orada olmam gerekmiyordu", "Bir daha güvende olamam"',
    avoidanceStyle:'Hastane koridorlarından kaçınma, duygusal uyuşma',
    description:'Travmatik deneyimi olan, anılardan kaçınan ama anlam arayan bir danışan',
    difficulty:'Zor', tags:['travma','PTSD','mesleki']
  },
  {
    id:'tarık', name:'Tarık', age:17, occupation:'Lise öğrencisi', resistanceLevel:'yüksek',
    issue:'Aile çatışması ve okul reddi — terapiye zorla getirildi',
    background:'Ebeveynleri boşanıyor. Okula gitmiyor. Ben sorun değilim diyor.',
    fusionThemes:'"Kimse anlamıyor", "Neden buradayım ki", "Terapi işe yaramaz"',
    avoidanceStyle:'Okul ve sorumluluktan kaçınma, telefon ve oyuna gömülme',
    description:'Terapiye direnen, zorla gelen, otorite figürlerine karşı çıkan bir ergen',
    difficulty:'Zor', tags:['ergen','direniş','aile']
  },
  {
    id:'fatma', name:'Fatma', age:55, occupation:'Ev hanımı', resistanceLevel:'düşük',
    issue:'Eş kaybı sonrası komplike yas ve anlam yitimi',
    background:'8 ay önce kocasını kaybetti. Ağlamıyor, hissizleşmiş.',
    fusionThemes:'"Olmadan yaşanmaz", "İçim bomboş"',
    avoidanceStyle:'Duyguları bastırıyor, anıları konuşmuyor',
    description:'Duygusal uyuşma yaşayan, yas sürecinde tıkalmış, anlam arayan bir danışan',
    difficulty:'Orta', tags:['yas','kayıp','anlam']
  },
  {
    id:'emre', name:'Emre', age:26, occupation:'Tıp öğrencisi', resistanceLevel:'orta',
    issue:'Obsesif düşünceler ve kontrol etme kompulsiyonları',
    background:'Tıp okuyor, hastalık obsesyonları var. Her belirti kanser olabilir diye araştırıyor.',
    fusionThemes:'"Kontrol etmezsem bir şey olacak", "Düşünceler gerçek tehlikeyi gösteriyor"',
    avoidanceStyle:'Sürekli googlelama, doktor arama, fiziksel kontroller',
    description:'Düşüncelerle kaynaşmış, kontrolün geçici rahatlama verdiğini bilen bir danışan',
    difficulty:'Orta-Zor', tags:['OCD','kontrol','sağlık anksiyetesi']
  },
  {
    id:'selin', name:'Selin', age:33, occupation:'Öğretmen', resistanceLevel:'düşük',
    issue:'Tekrarlayan ilişki örüntüleri ve terk edilme korkusu',
    background:'3. kez benzer bir ilişki bitti. Neden hep aynı insanları seçiyorum diye soruyor.',
    fusionThemes:'"Ben sevilmeye layık değilim", "Hep terk edilirim"',
    avoidanceStyle:'Gerçek duygularını saklamak, çatışmadan kaçmak',
    description:'İçgörü arayan ama değişmekten korkan, ilişki örüntülerini keşfetmek isteyen bir danışan',
    difficulty:'Orta', tags:['ilişki','terk edilme korkusu']
  },
  {
    id:'burak', name:'Burak', age:44, occupation:'Avukat', resistanceLevel:'orta',
    issue:'Dışarıdan başarılı görünen ama içten çöken yüksek fonksiyonlu depresyon',
    background:'Herkes iyi görüyor onu. Ama sabahları kalkmak çok zor. Hiçbir şeyden zevk almıyor.',
    fusionThemes:'"Şikayet etme hakkım yok", "Güçsüzlük göstermek tehlikeli"',
    avoidanceStyle:'İşe gömülerek duygulardan kaçma, yardım istememe',
    description:'Dışarıdan başarılı, içeriden boş — zayıflık göstermemeyi değer olarak benimseyen bir danışan',
    difficulty:'Orta', tags:['depresyon','yüksek fonksiyonlu','maske']
  },
  {
    id:'zehra', name:'Zehra', age:29, occupation:'Grafik tasarımcı', resistanceLevel:'düşük',
    issue:'Panik bozukluğu — metroda ve kalabalıklarda panik atak',
    background:'1 yıldır metro binemiyor. Hayatı giderek daralıyor.',
    fusionThemes:'"Kalp krizi geçireceğim", "Kontrolü kaybedeceğim"',
    avoidanceStyle:'Metro, AVM, asansörlerden kaçınma — yaşam alanı daraldı',
    description:'Kaçınma davranışları hayatını kısıtlamış, değişmek isteyen ama korkuyla bloke olmuş bir danışan',
    difficulty:'Orta', tags:['panik','kaçınma','yaşam kısıtlaması']
  },
];
