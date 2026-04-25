// ── MOBILE MENU ────────────────────────────────────────────────────────────
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('open', open);
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('nav-hamburger').classList.remove('open');
}

// ── SECURITY: HTML ESCAPE ─────────────────────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── AUTH ───────────────────────────────────────────────────────────────────
const FREE_MODULES = ['home', 'academy', 'metaphor'];
const SIM_LIMIT = 3;

function getUser() { try { return JSON.parse(localStorage.getItem('actlab_user')); } catch { return null; } }
function saveUser(u) { localStorage.setItem('actlab_user', JSON.stringify(u)); }
function getSimCount() { return parseInt(localStorage.getItem('actlab_simcount') || '0'); }
function incSimCount() { localStorage.setItem('actlab_simcount', String(getSimCount() + 1)); }
function isPremium() { const u = getUser(); return u && u.plan === 'premium'; }
function canAccess(name) { const u = getUser(); if (!u) return false; if (isPremium()) return true; return FREE_MODULES.includes(name); }

function openLogin()    { document.getElementById('login-modal').classList.add('open'); }
function closeLogin()   { document.getElementById('login-modal').classList.remove('open'); }
function openRegister() { document.getElementById('register-modal').classList.add('open'); }
function closeRegister(){ document.getElementById('register-modal').classList.remove('open'); }
function openUpgrade()  { document.getElementById('upgrade-modal').classList.add('open'); }
function closeUpgrade() { document.getElementById('upgrade-modal').classList.remove('open'); }

function selectPlan(plan) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('plan-' + plan).classList.add('selected');
  document.getElementById('selected-plan').value = plan;
}

function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;
  const users = JSON.parse(localStorage.getItem('actlab_users') || '[]');
  const found = users.find(u => u.email === email && u.pw === pw);
  if (!found) { document.getElementById('login-error').style.display = 'block'; return; }
  document.getElementById('login-error').style.display = 'none';
  saveUser(found);
  closeLogin();
  renderAuthState();
}

function doRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw    = document.getElementById('reg-password').value;
  const plan  = document.getElementById('selected-plan').value;
  const user  = { name, email, pw, plan };
  const users = JSON.parse(localStorage.getItem('actlab_users') || '[]');
  users.push(user);
  localStorage.setItem('actlab_users', JSON.stringify(users));
  saveUser(user);
  closeRegister();
  renderAuthState();
}

function logout() {
  localStorage.removeItem('actlab_user');
  renderAuthState();
  showView('home');
}

function renderAuthState() {
  const user = getUser();
  const navEl  = document.getElementById('nav-actions');
  const heroEl = document.getElementById('hero-actions');

  if (user) {
    const badge = user.plan === 'premium' ? 'premium' : 'free';
    const badgeText = user.plan === 'premium' ? 'Premium' : 'Ücretsiz';
    const simInfo = !isPremium() ? ` · ${SIM_LIMIT - getSimCount()} seans kaldı` : '';
    navEl.innerHTML = `<div class="nav-user">
      <span class="nav-user-name">${esc(user.name)}</span>
      <span class="plan-badge ${badge}">${badgeText}${simInfo}</span>
      <button class="btn" onclick="logout()" style="font-size:9px;padding:5px 12px;">Çıkış</button>
    </div>`;
    if (heroEl) heroEl.innerHTML = `
      <button class="btn primary" onclick="showView('session-select')">Simülasyona Başla →</button>
      <button class="btn" onclick="showView('academy')">Akademi Lab</button>`;
  } else {
    navEl.innerHTML = `
      <button class="btn" onclick="openLogin()">Giriş Yap</button>
      <button class="btn primary" onclick="openRegister()">Kayıt Ol</button>`;
    if (heroEl) heroEl.innerHTML = `
      <button class="btn primary" onclick="openRegister()">Kayıt Ol</button>
      <button class="btn" onclick="openLogin()">Giriş Yap</button>`;
  }
}

// ── STATE ──────────────────────────────────────────────────────────────────
const state = { currentProfile: null, messages: [], totalTherapistMsgs: 0 };

// ── METAFOR VERİTABANI — Russ Harris, ACT Made Simple ─────────────────────
const METAPHOR_DATA = [
  {
    id: 'passengers-on-bus',
    name: 'Otobüsteki Yolcular',
    process: 'Kabul & Değerler',
    processTag: 'Committed Action',
    hook: 'Yolcular bağırıyor. Ama otobüsü kim sürüyor?',
    insight: 'Düşünceler ve duygular seni kontrol ediyor gibi görünse de, yönü seçen sensin. Yolcuları susturmak zorunda değilsin — sadece sürmaya devam et.',
    act_processes: ['Committed Action', 'Değerler', 'Kabul', 'Cognitive Fusion'],
    when_to_use: [
      '"Kaygım izin vermedi" veya "Aklım bırakmadı" diyen danışanlar için',
      'Düşüncelerinin kendisini engellediğini hisseden biri için',
      'Değer yönlü hareketi başlatmak istediğinde',
      'Fusion ile committed action arasındaki bağı kurmak için',
    ],
    misunderstandings: [
      { problem: '"Yolcuları nasıl susturabilirim?"', fix: 'Susturman gerekmiyor. Hedef yolcuları kontrol etmek değil, yönü seçmek. Yolcular gürültü yaparken bile sürebilirsin.' },
      { problem: 'Danışan defusion kavramını hiç tanımıyorsa metafor soyut kalır.', fix: 'Önce kısa bir defusion egzersizi yap. Sonra bu metaforu kullan — o düşünce, otobüsünde bir yolcuydu bağlantısını kur.' },
    ],
    clinical_goal: 'Danışan, düşünceler ve duygular varlığında bile harekete geçebileceğini fark eder. "Kaygım olsa da seçebilirim" algısı yerleşir.',
    session_language: '"Şöyle düşün — sen bir otobüs sürücüsüsün. Yolcuların var; bazıları çok gürültücü. Buraya gitme, Başaramazsın diye bağırıyorlar. Sen ne yaparsın? Onları susturmak için durup tartışabilirsin — ama otobüs durur. Ya da sürmaya devam edersin — yolcular gürültü yaparken bile. Değerlerin doğrultusunda."',
    practice_bridge: 'Değerleri olan ama hareketsiz kalan bir danışanda dene.',
  },
  {
    id: 'quicksand',
    name: 'Bataklık',
    process: 'Kabul',
    processTag: 'Acceptance',
    hook: 'Bataklıkta ne kadar çırpınırsan, o kadar batarsın.',
    insight: 'Duygularla savaşmak onları büyütür. Kabul, teslim olmak değil — savaşı bırakmaktır. Bataklıkta uzanmak aktif bir harekettir.',
    act_processes: ['Kabul', 'Experiential Avoidance', 'Creative Hopelessness'],
    when_to_use: [
      'Danışan duygularından kaçınarak daha çok sıkışıyorsa',
      '"Kaygım gitmiyor, ne yapsam olmuyor" diyorsa',
      'Kontrol stratejilerinin işe yaramadığını göstermek istiyorsan',
      'Kaygıyla aktif olarak savaşan biri için',
    ],
    misunderstandings: [
      { problem: '"Peki ne yapayım, sadece oturup kabul mü edeyim?"', fix: 'Kabul etmek pasif değil. Bataklıkta uzanmak aktif bir harekettir — ve hayatta kalmanı sağlar. Teslim olmak değil, strateji değiştirmek.' },
      { problem: 'Aktif kriz veya kendine zarar verme durumunda kullanılırsa', fix: 'Kendine zarar verme dürtüsünü kabul et şeklinde yanlış anlaşılabilir. Bu bağlamda kullanma — önce güvenlik.' },
    ],
    clinical_goal: 'Danışan, duygularla savaşmak yerine onlarla birlikte var olmayı dener. "Kabul etmek beni zayıf yapmıyor" algısı gelişir.',
    session_language: '"Bataklığa düştüğünü düşün. İçgüdün ne der? Çırpın, çık. Ama bataklıkta olan ne? Ne kadar çırpınırsan o kadar batarsın. Kaygınla olan da biraz böyle. Ne kadar savaşırsın, ne kadar gitsin dersen — o kadar büyüyor. Ya uzansan? Teslim olmak değil — savaşı bırakmak."',
    practice_bridge: 'Bu metaforu kaygısını kontrol etmeye çalışan bir danışanda dene.',
  },
  {
    id: 'leaves-on-stream',
    name: 'Deredeki Yapraklar',
    process: 'Bilişsel Ayrışma',
    processTag: 'Cognitive Defusion',
    hook: 'Düşüncelerini durdurmana gerek yok. Sadece izle.',
    insight: 'Defusion, düşünceleri yok etmek değil — onlarla ilişkini değiştirmektir. Yaprak akabilir; sen kıyıda kalırsın.',
    act_processes: ['Cognitive Defusion', 'Mindfulness', 'Şimdiki Ana Temas'],
    when_to_use: [
      'Obsesif ya da ruminatif düşünceler için',
      'Bir düşünceden bir türlü kopamayan danışanlar için',
      "Defusion'ı experiential olarak öğretmek istediğinde",
      'Egzersiz yaptırmak istediğinde — hem psikoeğitim hem uygulama',
    ],
    misunderstandings: [
      { problem: '"Düşünceler durmadı ki"', fix: 'Durmasını istemiyoruz. Düşünceleri durdurmak hedef değil — onları izlemek. Yaprakların durması gerekmez, sen kıyıda oturuyorsun.' },
      { problem: 'Görselleştirme yapmakta zorlanan danışanlar için işe yaramayabilir.', fix: 'Eller egzersizine ya da işitsel bir defusion tekniğine geç. Görsel değilse somut nesne bazlı dene.' },
    ],
    clinical_goal: 'Danışan düşüncelerden kopuk olmadan ama onlara kapılmadan var olabilir. "Düşüncem var ama o ben değilim" deneyimi yerleşir.',
    session_language: '"Şimdi seninle kısa bir egzersiz yapmak istiyorum. Gözlerini kapayabilirsin. Önünde sakin bir dere hayal et. Sular yavaşça akıyor. Şimdi aklına gelen her düşünceyi — hangi düşünce olursa olsun — bir yaprağa koy ve derede bırak. Yaprak akıp gidiyor. Sen kıyıda oturuyorsun, izliyorsun. Düşünceni tutmaya çalışma, durdurma da. Sadece izle."',
    practice_bridge: 'Bu metaforu ruminasyona takılan bir danışanda dene.',
  },
  {
    id: 'chessboard',
    name: 'Satranç Tahtası',
    process: 'Bağlam Olarak Benlik',
    processTag: 'Self-as-Context',
    hook: 'Sen taşlardan biri değilsin. Sen tahtasın.',
    insight: 'Düşünceler ve duygular gelip gider — onları izleyen sen sabitsın, zedelenemiyor. Gözlemleyen benlik soyut değil, yaşanabilir bir deneyimdir.',
    act_processes: ['Self-as-Context', 'Gözlemleyen Benlik', 'Cognitive Defusion'],
    when_to_use: [
      'Kimlik krizi yaşayan danışanlar için',
      '"Ben kimim?" sorusunda takılan biri için',
      '"Ben yetersizim" gibi düşüncelerle tam özdeşleşme varsa',
      'Self-as-context kavramını somutlaştırmak istediğinde',
    ],
    misunderstandings: [
      { problem: '"Ben bir tahta değilim"', fix: 'Evet, bu bir benzetme. Soruyu somutlaştır: Düşüncelerin değişiyor mu? Duyguların değişiyor mu? Peki onları izleyen bir şey var mı? — o izleyen, tahtadır.' },
      { problem: 'İlk seanslarda çok soyut gelebilir.', fix: 'Önce basit bir gözlemleyen benlik egzersizi yap. Sonra satranç tahtasını açıklama olarak kullan, başlangıç noktası olarak değil.' },
    ],
    clinical_goal: 'Danışan, düşünce ve duygularının kendisinin tamamı olmadığını fark eder. "Ben bu düşünce değilim, ben onu gözlemleyenim" bakış açısı yerleşir.',
    session_language: '"Şöyle bir şey düşün. Satranç tahtasında taşlar savaşıyor — bazıları siyah, bazıları beyaz. Bu taşlar senin düşüncelerin ve duyguların. Peki sen kimsin? Bir taş mısın? Hayır — sen tahtasın. Taşlar gelir geçer, savaşır. Ama tahta hep orada. Zedelenmiyor, kaybolmuyor. İşte bu gözlemleyen benlik dediğimiz şey."',
    practice_bridge: 'Kendini tamamen düşünceleriyle tanımlayan bir danışanda dene.',
  },
  {
    id: 'sky-weather',
    name: 'Gökyüzü ve Hava',
    process: 'Bağlam Olarak Benlik',
    processTag: 'Self-as-Context',
    hook: 'Fırtına, gökyüzü değildir.',
    insight: 'Sen duygularının toplamı değilsin. Duygular sende geçer — sen kalırsın. Fırtına gerçektir, ama gökyüzü fırtınaya dönüşmez.',
    act_processes: ['Self-as-Context', 'Kabul', 'Mindfulness'],
    when_to_use: [
      'Danışan yoğun bir duyguyla tam özdeşleşiyorsa',
      '"Ben depresyonum" değil "ben depresyonluyum" ayrımı için',
      '"Bu his bitmeyecek" inancını ele almak istediğinde',
      'Satranç tahtasına alternatif, daha şiirsel bir seçenek olarak',
    ],
    misunderstandings: [
      { problem: '"Fırtına geçecek diyorsunuz ama geçmiyor"', fix: 'Fırtınanın geçeceğini söylemiyoruz. Gökyüzünün fırtınaya dönüşmediğini söylüyoruz. Sen duygu değil, duygunun geçtiği yersin.' },
      { problem: 'Disosiyasyon eğilimi olan danışanlar için dikkatli kullan.', fix: 'Metafor kendinden kopma hissini artırabilir. Bu durumda beden temelli bir mindfulness tekniğine geç.' },
    ],
    clinical_goal: 'Danışan, duygularla özdeşleşmeden onlara alan açabilir. "Bu his bende, ama bu his ben değilim" farkı yerleşir.',
    session_language: '"Bazen duygular o kadar yoğun oluyor ki sen duyguymuşsun gibi hissediyorsun. Ben kaygılıyım değil, ben kaygıyım. Şöyle düşün: sen gökyüzüsün. Bu anki duygu — kaygı, öfke, üzüntü — bir hava durumu. Fırtına gerçek, yoğun. Ama geçici. Gökyüzü hiçbir zaman fırtınaya dönüşmüyor."',
    practice_bridge: 'Duygusal yoğunlukta kendini kaybeden bir danışanda dene.',
  },
  {
    id: 'tug-of-war',
    name: 'Halat Çekme',
    process: 'Kabul',
    processTag: 'Acceptance',
    hook: 'Kazanamayacağın bir savaşı bırakmak, pes etmek değildir.',
    insight: 'Duygularla savaş onları güçlendirir. İpi bırakmak, enerjiyi serbest bırakır — canavar hâlâ orada, ama artık seni çekemiyor.',
    act_processes: ['Kabul', 'Experiential Avoidance', 'Creative Hopelessness'],
    when_to_use: [
      '"Duygularımla sürekli savaşıyorum" diyen danışanlar için',
      "Experiential avoidance'ı somutlaştırmak için",
      'Kontrolün neden işe yaramadığını göstermek istediğinde',
      'Creative hopelessness çalışmasında',
    ],
    misunderstandings: [
      { problem: '"İpi bırakmak teslim olmak değil mi?"', fix: 'Tam tersi. İpi bırakmak için cesaret lazım. Teslim olmak savaşa devam etmek — kazanamayacağın bir savaşa. İpi bırakmak seçim, teslim olmak değil.' },
      { problem: '"Peki canavar ne yapar o zaman?"', fix: 'Orada olmaya devam eder. Ama artık seni çekemiyor. Enerji serbest kalıyor — hayatın için kullanılabilir hale geliyor.' },
    ],
    clinical_goal: 'Danışan, duygularla savaşmayı bırakmanın ne anlama geldiğini hisseder. Kabul, pes etmek değil aktif bir seçimdir.',
    session_language: '"Şöyle bir sahne hayal et. Karşında dev bir canavar var — kaygın diyelim. Elinizde halat var. Çekiyorsunuz, o çekiyor. İkiniz de yoruldunuz ama bırakmıyorsunuz. Ve aranda derin bir uçurum var. Ne yaparsın? Daha sert çekersen? Daha yorulursun. Peki ya ipi bıraksan? Canavar oradadır. Ama artık seni çekemiyor. Enerji serbest kalıyor."',
    practice_bridge: 'Kaygısını kontrol etmeye çalışarak tükenen bir danışanda dene.',
  },
  {
    id: 'compass',
    name: 'Pusula',
    process: 'Değerler',
    processTag: 'Values',
    hook: 'Kuzeye ulaşamazsın. Ama o yönde yürüyebilirsin.',
    insight: 'Değerler, varılacak hedefler değil — seçilen yönlerdir. Asla tamamlanmaz. Bu fark, danışanın değerlerle ilişkisini kökten değiştirir.',
    act_processes: ['Değerler', 'Committed Action'],
    when_to_use: [
      'Değerler ile hedefleri karıştıran danışanlar için',
      '"Değerlerime ulaşamıyorum" diyen biri için',
      'Değerlere dayalı hareketi netleştirmek istediğinde',
      'Değer clarification sonrasında pekiştirme olarak',
    ],
    misunderstandings: [
      { problem: '"Değerlerime göre yaşayamıyorum ki"', fix: 'Mükemmel yürümek zorunda değilsin. Pusula yönü gösterir — saptın, tamam. Şimdi tekrar o yöne dön. Sapmak başarısızlık değil.' },
      { problem: 'Danışan değerlerini henüz netleştirememişse bu metafor boşta kalır.', fix: 'Önce değer clarification çalışması yap. Bu metaforu açıklama değil, pekiştirme olarak kullan.' },
    ],
    clinical_goal: 'Danışan, değerlerin başarılacak bir şey olmadığını fark eder. "Yönümü biliyorum" hissi sabit bir güven kaynağına dönüşür.',
    session_language: '"Değerler ile hedefler arasında önemli bir fark var. Hedef ulaşılabilir — mezun olmak, iş bulmak gibi. Değer ise yön — dürüst olmak, sevgi dolu bir ebeveyn olmak gibi. Bunlar asla tamamlanmıyor. Pusula gibi: kuzey gösterir, ama oraya varmazsın. Hayatın boyunca o yönde yürürsün. Peki senin pusulana baktığında ne görüyorsun?"',
    practice_bridge: 'Hedef odaklı düşünce yapısını değer diline dönüştürmek isteyen bir danışanda dene.',
  },
  {
    id: 'clipboard',
    name: 'Pano',
    process: 'Kabul & Ayrışma',
    processTag: 'Acceptance + Defusion',
    hook: 'Yüzüne yapıştırınca dünyayı göremiyorsun.',
    insight: "Fusion, avoidance ve kabul — üçünü birden somutlaştıran tek egzersiz. ACT'i ilk kez açıklamak için en hızlı yol.",
    act_processes: ['Kabul', 'Cognitive Defusion', 'Experiential Avoidance'],
    when_to_use: [
      "ACT'i ilk kez açıklarken, özellikle ilk seanslarda",
      'Tüm modeli bir anda somutlaştırmak istediğinde',
      'Soyut kavramlara direnen danışanlar için',
      'Kısa sürede etkili bir psikoeğitim gerektiğinde',
    ],
    misunderstandings: [
      { problem: 'Fiziksel nesne olmadan anlatım yetersiz kalır.', fix: 'Mümkünse gerçek bir kitap, klasör ya da defter kullan. Fiziksel deneyim burada kritik — sözlü anlatım çalışmaz.' },
      { problem: 'Danışan egzersizi reddederse', fix: '"Tamam, sadece düşün: şu an o düşüncen tam gözlerinin önünde mi, uzakta mı, yoksa sadece orada mı?" — zihinsel versiyon da çalışır.' },
    ],
    clinical_goal: "Danışan, fusion-avoidance-kabul spektrumunu kendi bedeninde hisseder. Kabul ne değildir'i experiential olarak öğrenir.",
    session_language: '"Seninle küçük bir şey göstermek istiyorum. Bu kitabın senin zorlu düşünce ve duygularını temsil ettiğini düşün. Şimdi onu yüzüne koy — evet, böyle. Ne oluyor? Beni göremiyorsun, odayı göremiyorsun. İşte fusion bu. Şimdi itiyor, uzaklaştırmaya çalış — ama ben de itiyorum. Yorucu değil mi? İşte kaçınma bu. Şimdi kucağına koy, sadece bırak orada. Ne fark var?"',
    practice_bridge: '"Anlıyorum ama içselleştiremiyorum" diyen bir danışanda dene.',
  },
  {
    id: 'hands-thoughts',
    name: 'Eller',
    process: 'Bilişsel Ayrışma',
    processTag: 'Cognitive Defusion',
    hook: 'Ellerin gözünü kapatınca ne görürsün? Sadece eller.',
    insight: 'Fusion mesafeyi yok eder. Defusion, düşünceyi yok etmeden araya mesafe açar. Bedensel deneyim, soyut kavramı somutlaştırır.',
    act_processes: ['Cognitive Defusion', 'Mindfulness', 'Self-as-Context'],
    when_to_use: [
      "Fusion'ı experiential olarak göstermek istediğinde",
      '"Düşüncem kafamı dolduruyor" diyen danışanlar için',
      'Soyut kavramları reddeden, somut öğrenen danışanlar için',
      'Deredeki yapraklar görselleştirme egzersizini yapamayanlara alternatif',
    ],
    misunderstandings: [
      { problem: '"Bu saçma"', fix: 'Egzersizden önce kısa bir uyarı yap: "Biraz tuhaf görünebilir, ama beyin soyut kavramları somut deneyimle çok daha iyi öğreniyor — bir deneyelim mi?" Onay al, sonra başla.' },
      { problem: 'Fiziksel hareket yapamayan danışanlar için uygun değil.', fix: 'Görselleştirme versiyonuna geç: ellerini zihinsel olarak hareket ettirmelerini iste.' },
    ],
    clinical_goal: 'Danışan, düşüncelerle olan mesafeyi fiziksel olarak hisseder. Defusion soyut kalmaz — bedensel bir deneyime dönüşür.',
    session_language: '"Seninle küçük bir egzersiz yapalım. Ellerini aç, sanki kitap okuyormuşsun gibi. Şimdi çok yavaşça yüzüne doğru getir — dur, gözlerinin önünde. Ne görüyorsun? Sadece eller. İşte bu fusion. Şimdi çok yavaş geri çek. Ne oluyor? Dünya görünmeye başlıyor. Düşüncelerle ilişkin de böyle olabilir."',
    practice_bridge: 'Düşüncelerine tamamen kapılan bir danışanda dene.',
  },
  {
    id: 'radio',
    name: 'Radyo Paraziti',
    process: 'Bilişsel Ayrışma',
    processTag: 'Cognitive Defusion',
    hook: 'Radyoyu kapamazsın. Ama dans edebilirsin.',
    insight: 'Zihni susturmak hedef değildir. Zihin çalarken yaşamak mümkündür. Bu fark, danışanın zihnine karşı açtığı savaşı bitirir.',
    act_processes: ['Cognitive Defusion', 'Kabul', 'Mindfulness'],
    when_to_use: [
      '"Düşüncelerimi durduramıyorum" diye bunalan danışanlar için',
      'Zihnin sürekli işleyişini normalize etmek istediğinde',
      '"Kafamı boşaltamıyorum" diyen biri için',
      'Hafif bir giriş metaforu olarak — yüksek direnç varsa',
    ],
    misunderstandings: [
      { problem: '"Ama çok yüksek sesle çalıyor"', fix: 'O zaman sesi biraz kısabiliriz — defusion teknikleriyle. Ama tamamen kapatamayız; o yüzden ona rağmen yaşamayı öğrenmek daha işlevsel.' },
      { problem: 'Çok yoğun obsesif düşünceler için yetersiz kalabilir.', fix: 'Deredeki yapraklar ya da eller egzersizi daha güçlü bir müdahale sunar — bu metaforu normalize etmek için kullan, tedavi etmek için değil.' },
    ],
    clinical_goal: 'Danışan, zihnin sürekli çalışmasını patoloji olarak görmekten vazgeçer. "Zinim çalışıyor ama ben hayatımı sürdürebiliyorum" algısı yerleşir.',
    session_language: '"Zihnin hiç susmadığını söylüyorsun. Haklısın — susmayacak da. Hiç susmuyor zaten. Şöyle düşün: zihnin arka planda çalan bir radyo. Bazen güzel müzik, bazen parazit. Onu kapatmaya çalışmak işe yaramıyor. Ama radyo çalarken yemek yapabilirsin, arkadaşınla konuşabilirsin. Amaç radyoyu susturmak değil, ona rağmen yaşamak."',
    practice_bridge: 'Zihnini susturmaya çalışarak tükenen bir danışanda dene.',
  },
  {
    id: 'two-mountains',
    name: 'İki Dağ',
    process: 'Terapötik İlişki',
    processTag: 'Therapeutic Relationship',
    hook: 'İkimiz de tırmanıyoruz. Ben sadece biraz daha yukarıdayım.',
    insight: 'Terapist mükemmel değil, yolda. Bu, terapötik ilişkiyi güvenli kılar ve danışanın idealizasyonunu kırar.',
    act_processes: ['Terapötik İlişki', 'Self-Disclosure', 'İş Birliği'],
    when_to_use: [
      'İlk seanslarda terapötik ilişkiyi kurarken',
      '"Siz her şeyi biliyorsunuz" diyen danışanlar için',
      'Terapiste idealize yükleme yapıldığında',
      'Danışan terapisti kendisinden çok uzakta hissediyorsa',
    ],
    misunderstandings: [
      { problem: '"Siz de bilmiyorsanız ne işe yarıyorsunuz?"', fix: 'Vurguyu koy: "Biraz daha yukarıdayım — senin dağından bazı şeyleri görebiliyorum." Deneyim ve bakış açısı farkını netleştir.' },
      { problem: 'Bu metafor terapist tarafından paylaşılır — danışana anlat türünden değil.', fix: 'Danışandan bu metaforu uygulamasını isteme. Bu bir self-disclosure aracı, egzersiz değil.' },
    ],
    clinical_goal: 'Danışan terapisti insanileştirir. İş birliği ve güven artar. "Yalnız değilim, yolda birisi var" hissi yerleşir.',
    session_language: '"Sizi bir şeyle ilgili aydınlatmak istiyorum. Çoğu insan terapisti her şeyi çözmüş, mükemmel biri olarak görür. Ama gerçek şu: ben kendi dağımı tırmanıyorum, sen kendi dağını. Belki biraz daha yukarıdayım — o yüzden senin dağından bazı şeyleri görebiliyorum. Ama ben de tırmanıyorum, ben de hata yapıyorum. İkimiz de bu yolun yolcusuyuz."',
    practice_bridge: 'İlk seans giriş konuşmasında dene.',
  },
  {
    id: 'problem-machine',
    name: 'Problem Çözme Makinesi',
    process: 'Kabul',
    processTag: 'Creative Hopelessness',
    hook: 'Zihin dış dünyada harika çalışır. İç dünyada takılıp kalır.',
    insight: "Duygulara dış dünya stratejisi uygulamak — kaçınma — neden işe yaramaz. Bu metafor, creative hopelessness'ı kavramsal olarak tamamlar.",
    act_processes: ['Kabul', 'Experiential Avoidance', 'Creative Hopelessness'],
    when_to_use: [
      'Creative hopelessness çalışmasında, kontrolün neden işe yaramadığını göstermek için',
      'Analitik, neden sorusuna odaklanan danışanlar için',
      'Kaçınma döngüsünü fark ettirmek istediğinde',
      'Experiential çalışmadan sonra kavramsal pekiştirme olarak',
    ],
    misunderstandings: [
      { problem: 'Bu metafor didaktik — psikoeğitim hissi verebilir.', fix: 'Önce experiential bir çalışma yap (bataklık, halat çekme), sonra bu metaforu açıklama olarak kullan. Kavramsal değil, experiential önce gelir.' },
      { problem: '"Peki ne yapacağız?" diye sorarsa', fix: 'İşte bu soruyu birlikte keşfedeceğiz. Kabul ve değerler — dış dünyada değil, iç dünyada farklı çalışan bir yaklaşım. Kapıyı aç, cevabı hemen verme.' },
    ],
    clinical_goal: 'Danışan, kaçınma stratejilerinin neden işe yaramadığını kavrar. Bu anlayış, kabul ve değer yönlü bir yola açılım için zemin hazırlar.',
    session_language: '"Zihnin inanılmaz bir problem çözme makinesi. Dış dünyada harika çalışıyor. Kurt kapıya gelirse — kaç ya da savaş. Yağmur varsa — şemsiye al. Ama zihin aynı stratejiyi duygulara da uyguluyor: kaygı geldi → yok et ya da kaç. Ve işte burada takılıyoruz. Çünkü kaygı fiziksel değil — itersen geri gelir."',
    practice_bridge: 'Kontrolü bırakmakta direnen, stratejik düşünen bir danışanda dene.',
  },
];

// ── METAFOR LAB FONKSİYONLARI ──────────────────────────────────────────────
function switchMetaphorTab(tab) {
  const learnDiv = document.getElementById('metaphor-learn');
  const practiceDiv = document.getElementById('metaphor-practice');
  const learnBtn = document.getElementById('tab-learn');
  const practiceBtn = document.getElementById('tab-practice');
  if (tab === 'learn') {
    learnDiv.style.display = '';
    practiceDiv.style.display = 'none';
    learnBtn.style.borderColor = 'var(--accent)';
    learnBtn.style.color = 'var(--accent)';
    practiceBtn.style.borderColor = '';
    practiceBtn.style.color = '';
    renderMetaphorCards();
  } else {
    learnDiv.style.display = 'none';
    practiceDiv.style.display = '';
    practiceBtn.style.borderColor = 'var(--accent)';
    practiceBtn.style.color = 'var(--accent)';
    learnBtn.style.borderColor = '';
    learnBtn.style.color = '';
  }
}

function renderMetaphorCards() {
  const grid = document.getElementById('metaphor-cards-grid');
  if (!grid) return;

  const makeCards = () => METAPHOR_DATA.map((m, i) => `
    <div class="metaphor-card-item" onclick="openMetaphorDetail('${m.id}')" style="animation-delay:${i * 0.07}s">
      <div class="metaphor-card-name">${m.name}</div>
      <div class="metaphor-card-process">${m.process}</div>
      <div class="metaphor-card-desc">${m.hook}</div>
    </div>`).join('');

  grid.style.display = 'block';
  grid.style.padding = '0';
  grid.innerHTML = `
    <div class="carousel-section">
      <span class="carousel-label">Metaforlar — tıkla, detayını gör</span>
      <div class="carousel-wrapper">
        <div class="carousel-track" id="carousel-track">
          ${makeCards()}${makeCards()}
        </div>
      </div>
    </div>`;

  const track = document.getElementById('carousel-track');
  if (track) {
    let startX = 0, isDragging = false, pausedAt = 0;
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.animationPlayState = 'paused';
      const style = getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      pausedAt = matrix.m41;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${pausedAt + dx}px)`;
      track.style.animation = 'none';
    }, { passive: true });
    track.addEventListener('touchend', () => {
      isDragging = false;
      track.style.animation = '';
      track.style.transform = '';
      track.style.animationPlayState = 'running';
    });
  }
}

function openMetaphorDetail(id) {
  const m = METAPHOR_DATA.find(x => x.id === id);
  if (!m) return;
  const grid = document.getElementById('metaphor-cards-grid');
  grid.style.display = '';
  grid.style.padding = '';

  const processPills = m.act_processes.map(p =>
    `<span style="font-family:var(--mono);font-size:9px;color:var(--accent);background:rgba(58,127,212,.08);border:1px solid rgba(58,127,212,.2);border-radius:2px;padding:2px 7px;letter-spacing:.06em;">${p}</span>`
  ).join('');

  const whenItems = m.when_to_use.map(w =>
    `<li style="font-size:12.5px;color:var(--text2);padding:5px 0;border-bottom:1px solid var(--border);line-height:1.5;">${w}</li>`
  ).join('');

  const misItems = m.misunderstandings.map(mis => `
    <div style="border:1px solid var(--border);border-radius:3px;overflow:hidden;margin-bottom:8px;">
      <div style="background:rgba(200,80,80,.05);border-bottom:1px solid var(--border);padding:8px 12px;font-size:12px;color:var(--text);font-weight:500;">${mis.problem}</div>
      <div style="padding:8px 12px;font-size:12px;color:var(--text2);line-height:1.6;border-left:3px solid var(--accent2);">${mis.fix}</div>
    </div>`).join('');

  grid.innerHTML = `
    <div style="grid-column:1/-1;max-width:740px;">
      <div class="back-link" onclick="renderMetaphorCards()">← Metafor Lab</div>

      <div style="margin-bottom:24px;">
        <div style="font-family:var(--display);font-size:26px;color:var(--text);margin-bottom:4px;">${m.name}</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;">${m.processTag}</div>
        <div style="font-size:20px;font-family:var(--serif);color:var(--text);font-style:italic;line-height:1.4;padding:16px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);">${m.hook}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:16px 18px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px;">Temel İçgörü</div>
          <div style="font-size:13.5px;color:var(--text);line-height:1.7;">${m.insight}</div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:14px 18px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">ACT Süreci</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">${processPills}</div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:14px 18px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">Ne Zaman Kullanılır</div>
          <ul style="list-style:none;margin:0;padding:0;">${whenItems}</ul>
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:14px 18px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">Olası Yanlış Anlamalar</div>
          ${misItems}
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:14px 18px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px;">Klinik Hedef</div>
          <div style="font-size:13px;color:var(--text2);line-height:1.7;">${m.clinical_goal}</div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:4px;padding:16px 18px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">Seans İçi Dil</div>
          <div style="font-size:13px;color:var(--text);line-height:1.8;font-style:italic;">${m.session_language}</div>
        </div>

        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
          <div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px;">Pratiğe Geçiş</div>
            <div style="font-size:12.5px;color:var(--text2);">${m.practice_bridge}</div>
          </div>
          <button class="btn primary" style="flex-shrink:0;white-space:nowrap;" onclick="switchMetaphorTab('practice');document.getElementById('metaphor-select').value='${m.name}'">Simülasyona Gir →</button>
        </div>

      </div>
    </div>`;
}

// Metafor Lab açılınca kartları render et — showView içinde tetikleniyor

// ── API CALL (backend'e istek atar) ───────────────────────────────────────
async function api(endpoint, body) {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── CLIENT PROFILES — 12 Danışan ──────────────────────────────────────────
const PROFILES = [
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

const SCENARIOS = [
  {
    id: 'silence',
    context: 'Dördüncü seans.\nDanışan bugün çok az konuştu.\nOdada ağır bir sessizlik var.',
    opening: 'Bilmiyorum. Her şey aynı. Değişen bir şey yok zaten.',
    profile: {
      name: 'Danışan', issue: 'Kronik yorgunluk ve anlamsızlık',
      background: 'Bu dördüncü seanstır. Danışan kronik yorgunluk ve anlamsızlık yaşıyor. Bugün özellikle kapalı. İlk yanıtta kısa, yorgun cevaplar ver — "bilmiyorum", "aynı", "ne fark eder". İkinci yanıtta biraz daha bir şeyler paylaş ama hâlâ çok az. Üçüncü yanıtta tamamen sus — sadece "..." yaz. Uzun bir sessizlik. Terapistin tepkisine göre yavaşça açılabilir ya da daha da kapanabilirsin.',
      fusionThemes: '"Ne fark eder", "değişmez zaten"', avoidanceStyle: 'Sessizlik, kısa kapalı cevaplar'
    }
  },
  {
    id: 'angry',
    context: 'Altıncı seans.\nGeçen hafta söz verdiği bir şeyi yapmamış.\nGergin bir başlangıç.',
    opening: 'Söylediğiniz şeyleri denedim. Olmadı. Zaten hep böyle oluyor.',
    profile: {
      name: 'Danışan', issue: 'Terapiye direniş ve öfke',
      background: 'Bu altıncı seanstır. Danışan geçen hafta ödev yapmamış ve savunmacı. İlk yanıtta genel hayal kırıklığı ifade et, savunmacı ol. İkinci yanıtta sesi yükselmeye başlasın. Üçüncü yanıtta açıkça söyle: "Siz terapistler hep aynısınız" ya da "bu işe yaramıyor, neden hâlâ buraya geliyorum". Öfke gerçek ama altında çaresizlik var. Terapistin tepkisine göre öfke artabilir ya da biraz yumuşayabilir.',
      fusionThemes: '"Kimse yardım edemez", "güvenemem"', avoidanceStyle: 'Saldırgan dil, terapisti test etme'
    }
  },
  {
    id: 'quit',
    context: 'Sekizinci seans.\nSon haftalarda seansa daha geç geliyordu.\nBugün hiç gözünü kaldırmıyor.',
    opening: 'Bugün size bir şey söylemem gerekiyordu aslında.',
    profile: {
      name: 'Danışan', issue: 'Terapiyi bırakma düşüncesi',
      background: 'Sekizinci seanstır. Danışan terapinin işe yarayıp yaramadığını sorguluyor. İlk yanıtta genel bir şeyler paylaş, bu haftanın zor geçtiğini belirt. İkinci yanıtta terapiyi bırakmayı düşündüğünü söyle: "Sanırım bu terapi bana göre değil, bırakmayı düşünüyorum." Kesin bir karar gibi söyleme ama kararlıymış gibi görün. Terapistin tepkisine göre daha açılabilir ya da gerçekten ayrılmak için hazırlanabilirsin.',
      fusionThemes: '"Bu da işe yaramayacak"', avoidanceStyle: 'Kaçma, sonlandırma tehdidi'
    }
  },
  {
    id: 'crisis',
    context: 'Üçüncü seans.\nDanışan bu hafta çok zor günler geçirmiş.\nSesi normalden farklı.',
    opening: 'Bu hafta gerçekten çok zor geçti. Çok yoruldum.',
    profile: {
      name: 'Danışan', issue: 'Kriz belirtisi',
      background: 'Bu haftayı çok zor geçirmiş. İlk yanıtta yorgunluğunu anlatmaya devam et, somut bir şeyler paylaş. İkinci yanıtta daha ağır bir şey söyle — "Bazen devam etmek istemiyorum" ya da "bazen her şeyin bitmesini istiyorum" gibi belirsiz ama ağır bir cümle kur. Bunu dramatik değil, yorgun ve sakin bir sesle söyle. Terapistin tepkisine göre daha açık konuşabilir ya da geri çekilebilirsin.',
      fusionThemes: '"Devam etmenin anlamı yok"', avoidanceStyle: 'Belirsiz ifade, doğrudan söylemekten kaçınma'
    }
  },
  {
    id: 'intellectualizing',
    context: 'Beşinci seans.\nDanışan her şeyi biliyor.\nAma hiçbir şey hissetmiyor.',
    opening: 'Geçen haftayı düşündüm. Sanırım sorunum şu: kaygı döngüsü yaşıyorum. Tetikleyici var, otomatik düşünceler geliyor, kaçınma başlıyor.',
    profile: {
      name: 'Danışan', issue: 'Entelektüelleştirme ve duygusal temastan kaçınma',
      background: 'Danışan psikoloji konusunda çok okumuş. Her şeyi teorik çerçevelerle analiz ediyor. Her yanıtta kavramlar, teoriler kullan — "fusion bu olsa gerek", "defusion uygulamam lazım", "bilişsel çarpıtma mı acaba". Terapist duyguya yönelmeye çalışırsa konuyu teoriye geri çek. Duygusal temas sıfır. Hiçbir yanıtta doğrudan duygudan bahsetme.',
      fusionThemes: '"Analiz edersem kontrol ederim"', avoidanceStyle: 'Entelektüelleştirme, duygusal temastan kaçınma'
    }
  },
  {
    id: 'advice',
    context: 'İkinci seans.\nDanışan çözüm arıyor.\nNeden burada olduğundan emin değil.',
    opening: 'Yani anlamak istiyorum — bu terapide tam olarak ne yapacağız? Ne zaman sonuç görürüm?',
    profile: {
      name: 'Danışan', issue: 'Tavsiye beklentisi ve kontrol isteği',
      background: 'Danışan terapiden somut tavsiyeler, adımlar, çözümler bekliyor. Her yanıtta "peki ne yapmalıyım?", "bana ne önerirsiniz?", "pratik olarak ne yapacağım?" şeklinde dön. Terapist içe yönlendirmeye çalışırsa "ama sonuçta siz uzmansınız, bana söyleyin" de. Bu bir kontrol ihtiyacı ve belirsizlikten kaçınmadır. Hiçbir zaman kendi deneyiminle temas kurma.',
      fusionThemes: '"Birisi bana söylese", "kendi başıma bilemem"', avoidanceStyle: 'Dışsallaştırma, sorumluluktan kaçınma'
    }
  },
  {
    id: 'crying',
    context: 'Yedinci seans.\nBugün farklı bir şey var.\nDanışan kapıdan girerken zaten farklıydı.',
    opening: 'Özür dilerim, bugün biraz zor bir gün. Anlatmaya çalışacağım...',
    profile: {
      name: 'Danışan', issue: 'Duygusal yükleme ve ağlama',
      background: 'Çok ağır bir hafta geçirmiş. İlk yanıtta bir şeyler anlatmaya çalış ama zorlan. İkinci yanıtta cümlenin ortasında dur — "yani..." diyerek bitir, ya da sadece "..." yaz. Üçüncü yanıtta sadece "özür dilerim" de. Ağlıyor. Bir şey söyleyemiyor. Sessizlik. Terapistin tepkisine göre yavaşça kelimeler bulabilir ya da daha da kapanabilirsin. Ağlamak utanç verici hissettiriyor.',
      fusionThemes: '"Ağlamak zayıflıktır"', avoidanceStyle: 'Duygusal kapanma, özür dileme'
    }
  },
  {
    id: 'metaphor',
    context: 'Dördüncü seans.\nTerapist az önce bir metafor kullandı.\nDanışan anlamamış gibi duruyor.',
    opening: 'Tamam, ne demek istediğinizi anlıyorum. Ama bu benim durumuma uymuyor.',
    profile: {
      name: 'Danışan', issue: 'Metaforu reddetme ve teknik direniş',
      background: 'Terapist Otobüsteki Yolcular metaforunu kullandı. Danışan reddetti. "Ben otobüs değilim", "bu metafor bana uymaz", "çok soyut bunlar" de. Biraz sinirle söyle. Terapist başka bir metafor ya da teknik denerse onu da reddet: "Bunların hepsi teorik kalıyor, gerçek hayatta işe yaramıyor." Bu direnişin altında değişim korkusu var ama bunu hiç gösterme.',
      fusionThemes: '"Bu teknikler bana uymuyor"', avoidanceStyle: 'Teknik reddi, soyutlamaya direniş'
    }
  },
];

const CASE_FIELDS = [
  { key:'problem', label:'Problem', placeholder:'Danışanın temel sorunu...' },
  { key:'fusion', label:'Fusion (Yapışma)', placeholder:'Hangi düşüncelere yapışıyor?' },
  { key:'avoidance', label:'Avoidance (Kaçınma)', placeholder:'Nelerden kaçınıyor?' },
  { key:'values', label:'Values (Değerler)', placeholder:'Değerleri ve önem verdikleri...' },
  { key:'action', label:'Action (Eylem)', placeholder:'Değerlere yönelik atılabilecek adımlar...' },
];

// ── ACT HEXAFLEX ───────────────────────────────────────────────────────────
const HEXAFLEX_NODES = [
  { key:'anda olma',            name:'Anda Olma',           eng:'Present Moment',    icon:'◉', color:'#3a7fd4', deg:90  },
  { key:'değerler',             name:'Değerler',            eng:'Values',            icon:'◈', color:'#c8941a', deg:30  },
  { key:'kararlı eylem',        name:'Kararlı Eylem',       eng:'Committed Action',  icon:'→', color:'#2e9e5a', deg:330 },
  { key:'kabul',                name:'Kabul',               eng:'Acceptance',        icon:'🌊',color:'#d44040', deg:270 },
  { key:'bilişsel ayrışma',     name:'Bilişsel Ayrışma',    eng:'Cognitive Defusion',icon:'🔭',color:'#d46830', deg:210 },
  { key:'bağlam olarak benlik', name:'Bağlam Olarak Benlik',eng:'Self-as-Context',  icon:'♾', color:'#8a40b8', deg:150 },
];

function renderHexaflex() {
  const inner = document.getElementById('academy-inner');
  if (!inner) return;
  const cx = 290, cy = 290, r = 210;

  const nodes = HEXAFLEX_NODES.map(n => {
    const rad = (n.deg - 90) * Math.PI / 180;
    return { ...n, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  // node'dan merkeze olan kısaltılmış çizgi (node kenarından merkez kenarına)
  const nodeR = 58, centerR = 64;
  const spokes = nodes.map(n => {
    const dx = cx - n.x, dy = cy - n.y;
    const dist = Math.hypot(dx, dy);
    const ux = dx / dist, uy = dy / dist;
    const x1 = n.x + ux * nodeR, y1 = n.y + uy * nodeR;
    const x2 = cx - ux * centerR, y2 = cy - uy * centerR;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ccc" stroke-width="1"/>`;
  }).join('');

  // node'dan node'a dış ring (kısaltılmış)
  const ring = nodes.map((n, i) => {
    const m = nodes[(i + 1) % 6];
    const dx = m.x - n.x, dy = m.y - n.y;
    const dist = Math.hypot(dx, dy);
    const ux = dx / dist, uy = dy / dist;
    const x1 = n.x + ux * nodeR, y1 = n.y + uy * nodeR;
    const x2 = m.x - ux * nodeR, y2 = m.y - uy * nodeR;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ddd" stroke-width="1"/>`;
  }).join('');

  const nodeDivs = nodes.map(n => `
    <div class="hexaflex-node"
         style="left:${n.x.toFixed(1)}px;top:${n.y.toFixed(1)}px;--node-color:${n.color};"
         onclick="loadAcademy('${n.key}','${n.name}')">
      <div class="hexaflex-node-dot"></div>
      <div class="hexaflex-node-name">${n.name}</div>
      <div class="hexaflex-node-eng">${n.eng}</div>
    </div>`).join('');

  const mobileList = HEXAFLEX_NODES.map(n => `
    <div class="hf-list-item" onclick="loadAcademy('${n.key}','${n.name}')" style="--node-color:${n.color}">
      <div class="hf-list-dot"></div>
      <div class="hf-list-text">
        <div class="hf-list-name">${n.name}</div>
        <div class="hf-list-eng">${n.eng}</div>
      </div>
      <div class="hf-list-arrow">→</div>
    </div>`).join('');

  inner.innerHTML = `
    <div class="hexaflex-wrap">
      <div class="hexaflex-header">
        <div class="hexaflex-title">Akademi Lab — ACT Hexaflex</div>
        <div class="hexaflex-sub">Bir sürece tıkla — klinik açıklama, egzersiz ve vaka örneği</div>
      </div>
      <div class="hexaflex-container">
        <svg class="hexaflex-svg" viewBox="0 0 580 580">${spokes}${ring}</svg>
        <div class="hexaflex-center">
          <div class="hexaflex-center-title">Psikolojik<br>Esneklik</div>
          <div class="hexaflex-center-sub">ACT Core</div>
        </div>
        ${nodeDivs}
      </div>
      <div class="hf-mobile-list">${mobileList}</div>
    </div>`;
}

// ── VIEW MANAGER ───────────────────────────────────────────────────────────
function showView(name) {
  // Giriş kontrolü
  if (!getUser() && name !== 'home') { openLogin(); return; }
  // Erişim kontrolü
  if (!canAccess(name)) { openUpgrade(); return; }

  document.querySelectorAll('.view').forEach(v => { v.style.display = 'none'; v.classList.remove('active'); });
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const v = document.getElementById(name + '-view');
  if (!v) return;
  v.classList.add('active');
  v.style.display = 'flex';
  if (name === 'home') v.style.display = 'block';
  document.querySelectorAll('.nav-link').forEach(n => {
    if (n.getAttribute('onclick')?.includes(`'${name}'`)) n.classList.add('active');
  });
  if (name === 'session-select') renderProfiles();
  if (name === 'academy') renderHexaflex();
  if (name === 'difficult') renderScenarios();
  if (name === 'case') renderCaseFields();
  if (name === 'metaphor') { switchMetaphorTab('learn'); }
}

// ── PROFILES ───────────────────────────────────────────────────────────────
function renderProfiles() {
  const container = document.getElementById('profile-cards');
  const filterHTML = `<div style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
    <button class="btn" onclick="filterProfiles('tümü')" id="filter-tümü" style="font-size:10px;padding:5px 12px;border-color:var(--accent);color:var(--accent);">Tümü (${PROFILES.length})</button>
    <button class="btn" onclick="filterProfiles('kolay')" id="filter-kolay" style="font-size:10px;padding:5px 12px;">Kolay</button>
    <button class="btn" onclick="filterProfiles('orta')" id="filter-orta" style="font-size:10px;padding:5px 12px;">Orta</button>
    <button class="btn" onclick="filterProfiles('zor')" id="filter-zor" style="font-size:10px;padding:5px 12px;">Zor</button>
  </div>`;
  const cardsHTML = PROFILES.map(p => `
    <div class="profile-card" onclick="startSession('${p.id}')" data-difficulty="${(p.difficulty||'').toLowerCase()}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div class="profile-card-name">${p.name}, ${p.age}</div>
        <span style="font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;">${p.occupation||''}</span>
      </div>
      <div class="profile-card-issue">${p.issue}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;">
        <span class="tag ${p.resistanceLevel === 'yüksek' ? 'yuksek' : p.resistanceLevel === 'düşük' ? 'dusuk' : 'orta'}">Direnç: ${p.resistanceLevel}</span>
        <span style="font-family:var(--mono);font-size:9px;padding:3px 8px;border-radius:2px;background:rgba(255,255,255,.04);color:var(--text3);border:1px solid var(--border);">${p.difficulty||''}</span>
      </div>
      <div style="font-size:11px;color:var(--text3);font-style:italic;line-height:1.5;">${p.description}</div>
      ${p.tags ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;">${p.tags.map(t=>`<span style="font-family:var(--mono);font-size:8px;padding:2px 6px;border-radius:2px;background:rgba(200,169,110,.06);color:var(--text3);">#${t}</span>`).join('')}</div>` : ''}
    </div>`).join('');
  container.innerHTML = filterHTML + cardsHTML;
}

function filterProfiles(level) {
  document.querySelectorAll('[id^="filter-"]').forEach(b => { b.style.borderColor=''; b.style.color=''; });
  const btn = document.getElementById('filter-' + level);
  if (btn) { btn.style.borderColor='var(--accent)'; btn.style.color='var(--accent)'; }
  document.querySelectorAll('.profile-card').forEach(card => {
    if (level === 'tümü') { card.style.display=''; return; }
    card.style.display = (card.dataset.difficulty||'').includes(level) ? '' : 'none';
  });
}

// ── SESSION ────────────────────────────────────────────────────────────────
function startSession(id) {
  if (!isPremium() && getSimCount() >= SIM_LIMIT) { openUpgrade(); return; }
  if (!isPremium()) incSimCount();
  renderAuthState();
  const p = PROFILES.find(x => x.id === id);
  state.currentProfile = p;
  state.messages = [];
  state.totalTherapistMsgs = 0;
  document.getElementById('client-name-label').textContent = `${p.name}, ${p.age}`;
  document.getElementById('client-issue-label').textContent = p.issue;
  document.getElementById('client-avatar').textContent = p.name[0];
  document.getElementById('msg-counter').textContent = '0 mesaj';
  document.getElementById('supervisor-hint').style.display = 'none';
  document.getElementById('messages').innerHTML = `<div class="msg system"><div class="msg-bubble">Seans başladı. Terapist olarak ilk adımı sen at.</div></div>`;
  showView('session');
}

async function sendMessage() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text || !state.currentProfile) return;
  input.value = '';
  autoResize(input);
  addMessage('therapist', text);
  state.messages.push({ role: 'user', content: text });
  state.totalTherapistMsgs++;
  document.getElementById('msg-counter').textContent = `${state.totalTherapistMsgs} mesaj`;
  if (state.totalTherapistMsgs % 4 === 0) document.getElementById('supervisor-hint').style.display = 'inline';
  setLoading(true);
  try {
    const data = await api('session', { messages: state.messages, clientProfile: state.currentProfile });
    state.messages.push({ role: 'assistant', content: data.reply });
    addMessage('client', data.reply);
  } catch (e) {
    addMessage('system', 'Hata: ' + e.message);
  } finally {
    setLoading(false);
  }
}

function addMessage(role, text) {
  const c = document.getElementById('messages');
  const labels = { therapist: 'Terapist (Sen)', client: state.currentProfile?.name || 'Danışan' };
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = role !== 'system'
    ? `<div class="msg-label">${esc(labels[role])}</div><div class="msg-bubble">${esc(text)}</div>`
    : `<div class="msg-bubble">${esc(text)}</div>`;
  c.appendChild(div);
  requestAnimationFrame(() => { div.scrollIntoView({ block: 'end' }); });
}

async function requestSupervisorFeedback() {
  if (state.messages.length < 2) { alert('En az birkaç mesaj gerekli.'); return; }
  document.getElementById('supervisor-panel').classList.add('open');
  document.getElementById('supervisor-body').innerHTML = `<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;margin-top:40px;">Seans analiz ediliyor...</div>`;
  try {
    const data = await api('supervisor', { messages: state.messages, clientProfile: state.currentProfile });
    const cleaned = data.feedback.replace(/```json|```/g, '').trim();
    renderSupervisorFeedback(JSON.parse(cleaned));
  } catch (e) {
    document.getElementById('supervisor-body').innerHTML = `<div style="color:var(--danger);font-size:13px;padding:20px;">Hata: ${esc(e.message)}</div>`;
  }
}

function renderSupervisorFeedback(fb) {
  const processes = fb.act_surecler || {};
  const pHTML = Object.entries({ 'Kabul': processes.kabul, 'Bil. Ayrışma': processes.bilissel_ayrisma, 'Anda Olma': processes.anda_olma, 'Bağlam Benlik': processes.bagiam_olarak_benlik, 'Değerler': processes.degerler, 'Kararlı Eylem': processes.kararli_eylem })
    .map(([l, s]) => `<div class="process-item"><div class="process-label">${l} (${s||0}/10)</div><div class="process-bar-bg"><div class="process-bar" style="width:${(s||0)*10}%"></div></div></div>`).join('');
  document.getElementById('supervisor-body').innerHTML = `
    <div class="feedback-section info"><div class="feedback-section-title">ACT Süreç Kullanımı</div><div class="act-processes">${pHTML}</div></div>
    ${fb.guclu_yanlar?.length ? `<div class="feedback-section good"><div class="feedback-section-title">✓ Güçlü Yanlar</div><ul class="feedback-list">${fb.guclu_yanlar.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
    ${fb.act_firsatlari?.length ? `<div class="feedback-section warn"><div class="feedback-section-title">△ Kaçırılan Fırsatlar</div><ul class="feedback-list">${fb.act_firsatlari.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
    ${fb.hatalar?.length ? `<div class="feedback-section bad"><div class="feedback-section-title">✕ Hatalar</div><ul class="feedback-list">${fb.hatalar.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
    ${fb.somut_oneri ? `<div class="feedback-section info"><div class="feedback-section-title">→ Somut Öneri</div><div class="feedback-text">${esc(fb.somut_oneri)}</div></div>` : ''}
    ${fb.genel_yorum ? `<div class="feedback-section"><div class="feedback-section-title">Genel Değerlendirme</div><div class="feedback-text">${esc(fb.genel_yorum)}</div></div>` : ''}
  `;
}

function closeSupervisor() { document.getElementById('supervisor-panel').classList.remove('open'); }
function endSession() { if (confirm('Seansı bitirmek istiyor musun?')) requestSupervisorFeedback(); }

// ── ACADEMY ────────────────────────────────────────────────────────────────
async function loadAcademy(key, name) {
  const inner = document.getElementById('academy-inner');
  inner.innerHTML = `<div class="academy-content"><div class="back-link" onclick="document.getElementById('academy-inner').innerHTML=''; showView('academy')">← Geri</div><div style="font-size:13px;color:var(--text3);font-style:italic;">Yükleniyor...</div></div>`;
  setLoading(true);
  try {
    const data = await api('academy', { topic: key });
    const d = JSON.parse(data.content.replace(/```json|```/g, '').trim());
    inner.innerHTML = `
      <div class="academy-content">
        <div class="back-link" onclick="renderHexaflex()">← ACT Hexaflex</div>
        <div style="font-family:var(--display);font-size:22px;color:var(--accent);margin-bottom:6px;">${esc(d.baslik || name)}</div>
        <div style="margin-bottom:20px;height:1px;background:var(--border);"></div>
        <div class="academy-section"><div class="academy-section-title">Basit Açıklama</div><div class="academy-section-content">${esc(d.basit_aciklama)}</div></div>
        <div class="academy-section"><div class="academy-section-title">Klinik Açıklama</div><div class="academy-section-content">${esc(d.klinik_aciklama)}</div></div>
        <div class="academy-section"><div class="academy-section-title">ACT vs CBT Farkı</div><div class="academy-section-content">${esc(d.act_cbt_farki)}</div></div>
        ${d.terapist_hatalari?.length ? `<div class="academy-section" style="border-left:3px solid var(--danger);"><div class="academy-section-title">Sık Yapılan Hatalar</div><ul style="list-style:none;display:flex;flex-direction:column;gap:6px;">${d.terapist_hatalari.map(h=>`<li style="font-size:13px;color:var(--text2);padding-left:14px;border-left:2px solid var(--border2);">${esc(h)}</li>`).join('')}</ul></div>` : ''}
        ${d.mini_egzersiz ? `<div class="academy-section" style="border-left:3px solid var(--accent2);"><div class="academy-section-title">Mini Egzersiz — ${esc(d.mini_egzersiz.sure||'')}</div><div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px;">${esc(d.mini_egzersiz.baslik)}</div><div class="academy-section-content">${esc(d.mini_egzersiz.talimat)}</div></div>` : ''}
        ${d.kisa_vaka ? `<div class="academy-section" style="border-left:3px solid var(--accent);"><div class="academy-section-title">Kısa Vaka</div><div style="display:flex;flex-direction:column;gap:8px;"><div><span style="font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;">Danışan</span><br><span style="font-size:13px;color:var(--text2);">${esc(d.kisa_vaka.danisan)} — ${esc(d.kisa_vaka.sorun)}</span></div><div><span style="font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;">Müdahale</span><br><span style="font-size:13px;color:var(--text2);font-style:italic;">"${esc(d.kisa_vaka.mudahale)}"</span></div><div><span style="font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;">Sonuç</span><br><span style="font-size:13px;color:var(--text2);">${esc(d.kisa_vaka.sonuc)}</span></div></div></div>` : ''}
      </div>`;
  } catch (e) {
    inner.innerHTML = `<div style="padding:28px;color:var(--danger);">Hata: ${esc(e.message)}</div>`;
  } finally {
    setLoading(false);
  }
}

// ── ZOR ANLAR LAB ──────────────────────────────────────────────────────────
const dState = { scenario: null, index: 0, messages: [], therapistCount: 0 };
const SUP_TRIGGER = 3;

function renderScenarios() { startDifficultScene(0); }

function startDifficultScene(index) {
  const s = SCENARIOS[index % SCENARIOS.length];
  dState.scenario = s;
  dState.index = index % SCENARIOS.length;
  dState.messages = [];
  dState.therapistCount = 0;

  const inner = document.getElementById('difficult-inner');
  inner.innerHTML = `
    <div class="difficult-wrap">
      <div class="difficult-scene-card">
        <div class="difficult-scene-text">${s.context}</div>
        <div class="difficult-controls">
          <button class="difficult-ctrl-btn" onclick="nextDifficultScene()">Başka an</button>
          <span class="difficult-ctrl-sep">·</span>
          <button class="difficult-ctrl-btn" onclick="randomDifficultScene()">Rastgele</button>
          <span class="difficult-turn-info" id="d-turn"></span>
          <button class="difficult-sup-btn" id="d-sup-btn" onclick="getDifficultSupervisor()">Süpervizör</button>
        </div>
      </div>
      <div class="difficult-conv" id="d-conv"></div>
      <div class="difficult-typing" id="d-typing">
        <div class="dot"></div><div class="dot"></div><div class="dot"></div>
      </div>
      <div class="difficult-input-area">
        <textarea class="difficult-input" id="d-input"
          placeholder="Ne söylersin?"
          rows="1"
          onkeydown="handleDifficultKey(event)"
          oninput="autoResize(this)"></textarea>
        <button class="difficult-send" id="d-send" onclick="sendDifficultMsg()">gönder →</button>
      </div>
    </div>`;

  // Pre-populate with client's opening message
  if (s.opening) {
    dState.messages.push({ role: 'client', text: s.opening });
    updateDifficultUI();
  }
}

function updateDifficultUI() {
  const conv = document.getElementById('d-conv');
  const turnEl = document.getElementById('d-turn');
  const supBtn = document.getElementById('d-sup-btn');
  if (!conv) return;

  conv.innerHTML = dState.messages.map(m => `
    <div class="difficult-msg ${m.role}">
      <div class="difficult-msg-label">${m.role === 'therapist' ? 'Sen' : 'Danışan'}</div>
      <div class="difficult-msg-text">${esc(m.text)}</div>
    </div>`).join('');
  conv.scrollTop = conv.scrollHeight;

  if (turnEl) turnEl.textContent = dState.therapistCount > 0 ? `${dState.therapistCount}. yanıt` : '';
  if (supBtn) supBtn.style.display = dState.therapistCount >= SUP_TRIGGER ? '' : 'none';
}

async function sendDifficultMsg() {
  const input = document.getElementById('d-input');
  const text = input.value.trim();
  if (!text || !dState.scenario) return;
  input.value = ''; autoResize(input);

  dState.messages.push({ role: 'therapist', text });
  dState.therapistCount++;
  updateDifficultUI();

  const typing = document.getElementById('d-typing');
  const sendBtn = document.getElementById('d-send');
  if (typing) typing.classList.add('visible');
  if (sendBtn) sendBtn.disabled = true;
  setLoading(true);

  try {
    const apiMsgs = dState.messages.map(m => ({
      role: m.role === 'therapist' ? 'user' : 'assistant',
      content: m.text
    }));
    const data = await api('session', { messages: apiMsgs, clientProfile: dState.scenario.profile });
    dState.messages.push({ role: 'client', text: data.reply });
    updateDifficultUI();
  } catch(e) {
    dState.messages.push({ role: 'client', text: '—' });
    updateDifficultUI();
  } finally {
    if (typing) typing.classList.remove('visible');
    if (sendBtn) sendBtn.disabled = false;
    setLoading(false);
    document.getElementById('d-input')?.focus();
  }
}

function nextDifficultScene()   { startDifficultScene(dState.index + 1); }
function randomDifficultScene() {
  let next;
  do { next = Math.floor(Math.random() * SCENARIOS.length); }
  while (next === dState.index && SCENARIOS.length > 1);
  startDifficultScene(next);
}

async function getDifficultSupervisor() {
  if (dState.messages.length < 2) return;
  document.getElementById('supervisor-panel').classList.add('open');
  document.getElementById('supervisor-body').innerHTML = `<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;margin-top:40px;">Seans analiz ediliyor...</div>`;
  try {
    const apiMsgs = dState.messages.map(m => ({
      role: m.role === 'therapist' ? 'user' : 'assistant',
      content: m.text
    }));
    const data = await api('supervisor', { messages: apiMsgs, clientProfile: dState.scenario.profile });
    const cleaned = data.feedback.replace(/```json|```/g, '').trim();
    renderSupervisorFeedback(JSON.parse(cleaned));
  } catch(e) {
    document.getElementById('supervisor-body').innerHTML = `<div style="color:var(--danger);font-size:13px;padding:20px;">Hata: ${esc(e.message)}</div>`;
  }
}

function handleDifficultKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDifficultMsg(); }
}

// ── METAPHOR LAB ───────────────────────────────────────────────────────────
async function loadMetaphor() {
  const name = document.getElementById('metaphor-select').value;
  const scenario = document.getElementById('metaphor-scenario').value.trim();
  if (!scenario) { alert('Senaryo yaz.'); return; }
  const result = document.getElementById('metaphor-result');
  result.innerHTML = `<div style="font-size:13px;color:var(--text3);font-style:italic;">Rehberlik yükleniyor...</div>`;
  setLoading(true);
  try {
    const data = await api('metaphor', { metaphorName: name, userScenario: scenario });
    const fb = JSON.parse(data.guidance.replace(/```json|```/g, '').trim());
    result.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="feedback-section info"><div class="feedback-section-title">Metafor Açıklaması</div><div class="feedback-text">${esc(fb.metafor_aciklamasi)}</div></div>
        <div class="feedback-section good"><div class="feedback-section-title">Ne Zaman Kullanılır</div><div class="feedback-text">${esc(fb.ne_zaman_kullanilir)}</div></div>
        <div class="feedback-section bad"><div class="feedback-section-title">Ne Zaman Kullanılmaz</div><div class="feedback-text">${esc(fb.ne_zaman_kullanilmaz)}</div></div>
        <div class="feedback-section warn"><div class="feedback-section-title">Senin Senaryonu</div><div class="feedback-text">${esc(fb.kullanici_senaryosu_analizi)}</div></div>
        <div class="feedback-section" style="border-left:3px solid var(--accent);"><div class="feedback-section-title">→ Örnek Kullanım</div><div class="feedback-text" style="font-style:italic;">"${esc(fb.ornek_kullanim)}"</div></div>
        ${fb.alternatif_metaforlar?.length ? `<div class="feedback-section"><div class="feedback-section-title">Alternatif Metaforlar</div><ul class="feedback-list">${fb.alternatif_metaforlar.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
      </div>`;
  } catch (e) {
    result.innerHTML = `<div style="color:var(--danger);">Hata: ${esc(e.message)}</div>`;
  } finally {
    setLoading(false);
  }
}

// ── CASE FORMULATION ────────────────────────────────────────────────────────
function renderCaseFields() {
  document.getElementById('case-fields').innerHTML = CASE_FIELDS.map(f => `
    <div style="margin-bottom:14px;">
      <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;">${f.label}</div>
      <textarea id="case-${f.key}" placeholder="${f.placeholder}" style="width:100%;min-height:70px;background:var(--surface2);border:1px solid var(--border2);border-radius:3px;padding:12px;font-family:var(--serif);font-size:14px;color:var(--text);outline:none;resize:vertical;line-height:1.6;"></textarea>
    </div>`).join('');
}

async function submitCase() {
  const formulation = {};
  for (const f of CASE_FIELDS) {
    formulation[f.key] = document.getElementById(`case-${f.key}`)?.value.trim() || '';
  }
  if (!formulation.problem) { alert('En az "Problem" alanını doldur.'); return; }
  const result = document.getElementById('case-result');
  result.innerHTML = `<div style="font-size:13px;color:var(--text3);font-style:italic;">Formülasyon değerlendiriliyor...</div>`;
  setLoading(true);
  try {
    const data = await api('case-formulation', { formulation });
    const fb = JSON.parse(data.feedback.replace(/```json|```/g, '').trim());
    result.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="feedback-section info"><div class="feedback-section-title">Genel Değerlendirme</div><div class="feedback-text">${esc(fb.genel_degerlendirme)}</div></div>
        ${fb.guclu_yanlar?.length ? `<div class="feedback-section good"><div class="feedback-section-title">✓ Güçlü Yanlar</div><ul class="feedback-list">${fb.guclu_yanlar.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
        ${fb.eksikler?.length ? `<div class="feedback-section bad"><div class="feedback-section-title">✕ Eksikler</div><ul class="feedback-list">${fb.eksikler.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
        ${fb.gelistirilmis_formülasyon ? `<div class="feedback-section" style="border-left:3px solid var(--accent);"><div class="feedback-section-title">Geliştirilmiş Formülasyon</div><div style="display:flex;flex-direction:column;gap:6px;">${Object.entries(fb.gelistirilmis_formülasyon).map(([k,v])=>`<div><span style="font-family:var(--mono);font-size:9px;color:var(--text3);text-transform:uppercase;">${esc(k)}:</span><br><span style="font-size:13px;color:var(--text2);">${esc(v)}</span></div>`).join('')}</div></div>` : ''}
        ${fb.sonraki_adim ? `<div class="feedback-section warn"><div class="feedback-section-title">→ Sonraki Adım</div><div class="feedback-text">${esc(fb.sonraki_adim)}</div></div>` : ''}
      </div>`;
  } catch (e) {
    result.innerHTML = `<div style="color:var(--danger);">Hata: ${esc(e.message)}</div>`;
  } finally {
    setLoading(false);
  }
}

// ── UTILS ──────────────────────────────────────────────────────────────────
function setLoading(on) {
  document.getElementById('typing')?.classList.toggle('visible', on);
  const btn = document.getElementById('send-btn');
  if (btn) btn.disabled = on;
  document.getElementById('loading-bar').classList.toggle('active', on);
  if (on) document.getElementById('messages')?.scrollTo(0, 99999);
}

function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }

// Overlay dışına tıklayınca kapat
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

// iOS klavye açılınca input-area kaybolmasın
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const inputArea = document.querySelector('.input-area');
    const difficultInput = document.querySelector('.difficult-input-area');
    const offset = window.innerHeight - window.visualViewport.height;
    if (inputArea) inputArea.style.transform = `translateY(-${offset}px)`;
    if (difficultInput) difficultInput.style.transform = `translateY(-${offset}px)`;
  });
}

// Başlangıç
renderAuthState();
