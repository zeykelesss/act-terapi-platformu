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
const FREE_MODULES = ['home', 'academy', 'metaphor', 'progress', 'history'];
const SIM_LIMIT = 3;
const TOKEN_KEY = 'actlab_token';

let currentUser = null;

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function getUser() { return currentUser; }
function getSimCount() { return parseInt(localStorage.getItem('actlab_simcount') || '0'); }
function incSimCount() { localStorage.setItem('actlab_simcount', String(getSimCount() + 1)); }
function isPremium() { return currentUser?.plan === 'premium'; }
function canAccess(name) { if (!currentUser) return false; if (isPremium()) return true; return FREE_MODULES.includes(name); }

async function loadCurrentUser() {
  const token = getToken();
  if (!token) { currentUser = null; return; }
  try {
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { clearToken(); currentUser = null; return; }
    const data = await res.json();
    currentUser = data.user;
  } catch {
    currentUser = null;
  }
}

async function loadStaticData() {
  const [pRes, sRes, mRes] = await Promise.all([
    fetch('/api/profiles'),
    fetch('/api/scenarios'),
    fetch('/api/metaphors'),
  ]);
  if (!pRes.ok || !sRes.ok || !mRes.ok) throw new Error('Statik veri yüklenemedi');
  const [pData, sData, mData] = await Promise.all([pRes.json(), sRes.json(), mRes.json()]);
  PROFILES = pData.profiles;
  SCENARIOS = sData.scenarios;
  METAPHOR_DATA = mData.metaphors;
}

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

async function doLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw }),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Giriş başarısız'; errEl.style.display = 'block'; return; }
    setToken(data.token);
    currentUser = data.user;
    closeLogin();
    renderAuthState();
  } catch (err) {
    errEl.textContent = 'Bağlantı hatası. Tekrar dene.';
    errEl.style.display = 'block';
  }
}

async function doRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw    = document.getElementById('reg-password').value;
  const errEl = document.getElementById('register-error');
  if (errEl) errEl.style.display = 'none';

  if (pw.length < 8) {
    if (errEl) { errEl.textContent = 'Şifre en az 8 karakter olmalı'; errEl.style.display = 'block'; }
    else alert('Şifre en az 8 karakter olmalı');
    return;
  }

  const plan = document.getElementById('selected-plan')?.value || 'free';
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw, name, plan }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Kayıt başarısız';
      if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } else alert(msg);
      return;
    }
    setToken(data.token);
    currentUser = data.user;
    closeRegister();
    renderAuthState();
  } catch (err) {
    const msg = 'Bağlantı hatası. Tekrar dene.';
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } else alert(msg);
  }
}

function toggleProfileMenu() {
  const dd = document.getElementById('profile-dropdown');
  if (!dd) return;
  dd.classList.toggle('open');
}
function closeProfileMenu() {
  document.getElementById('profile-dropdown')?.classList.remove('open');
}

function logout() {
  clearToken();
  currentUser = null;
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
    navEl.innerHTML = `<div class="nav-user" onclick="toggleProfileMenu()" id="nav-user-btn">
      <span class="nav-user-name">${esc(user.name)}</span>
      <span class="plan-badge ${badge}">${badgeText}${simInfo}</span>
    </div>
    <div class="profile-dropdown" id="profile-dropdown">
      <div class="profile-dropdown-name">${esc(user.name)}</div>
      <div class="profile-dropdown-email">${esc(user.email || '')}</div>
      <div class="profile-dropdown-divider"></div>
      <button class="profile-dropdown-item" onclick="closeProfileMenu();showView('progress')">Gelişim Takibi</button>
      <button class="profile-dropdown-item" onclick="closeProfileMenu();showView('history')">Seans Geçmişi</button>
      <div class="profile-dropdown-divider"></div>
      <button class="profile-dropdown-item danger" onclick="closeProfileMenu();logout()">Çıkış Yap</button>
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

// ── JSON HELPER ─────────────────────────────────────────────────────────────
// Claude bazen string içine gerçek satır sonu yazar → standart JSON.parse kırılır
function parseClaudeJSON(raw) {
  let s = (raw || '').replace(/```json\s*|```\s*/g, '').trim();
  // Char-by-char: string içindeki literal \n / \r'ları boşluğa çevir
  let out = '', inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (esc)                               { out += c; esc = false; continue; }
    if (c === '\\' && inStr)              { out += c; esc = true;  continue; }
    if (c === '"')                         { inStr = !inStr; out += c; continue; }
    if (inStr && (c === '\n' || c === '\r')) { out += ' '; continue; }
    out += c;
  }
  // Trailing comma temizle: ,} veya ,]
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(out);
}

// ── STATE ──────────────────────────────────────────────────────────────────
const state = { currentProfile: null, messages: [], totalTherapistMsgs: 0 };

// ── DRAFT PERSISTENCE ───────────────────────────────────────────────────────
function draftKey(profileId) {
  const u = getUser();
  return `act_draft_${u?.id || 'anon'}_${profileId}`;
}
function saveDraft() {
  if (!state.currentProfile || !state.messages.length) return;
  try {
    localStorage.setItem(draftKey(state.currentProfile.id), JSON.stringify({
      messages: state.messages,
      totalTherapistMsgs: state.totalTherapistMsgs,
      savedAt: Date.now(),
    }));
  } catch (_) {}
}
function loadDraft(profileId) {
  try {
    const raw = localStorage.getItem(draftKey(profileId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
function clearDraft(profileId) {
  try { localStorage.removeItem(draftKey(profileId)); } catch (_) {}
}

// METAFOR_DATA artık /api/metaphors'tan geliyor (data/metaphors.js)
let METAPHOR_DATA = [];

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
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    clearToken();
    currentUser = null;
    renderAuthState();
    openLogin();
    throw new Error('Oturum süresi doldu, lütfen tekrar giriş yap');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.upgrade) { openUpgrade(); throw new Error(err.error || 'Premium gerekli'); }
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// PROFILES artık /api/profiles'tan geliyor (data/profiles.js)
let PROFILES = [];

// SCENARIOS artık /api/scenarios'tan geliyor (data/scenarios.js)
let SCENARIOS = [];

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
  if (name === 'progress') renderProgressDashboard();
  if (name === 'history') renderSessionHistory();
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
function _setupSessionHeader(p) {
  document.getElementById('client-name-label').textContent = `${p.name}, ${p.age}`;
  document.getElementById('client-issue-label').textContent = p.issue;
  document.getElementById('client-avatar').textContent = p.name[0];
}

function _initFreshSession() {
  state.messages = [];
  state.totalTherapistMsgs = 0;
  document.getElementById('msg-counter').textContent = '0 mesaj';
  document.getElementById('supervisor-hint').style.display = 'none';
  document.getElementById('messages').innerHTML = `<div class="msg system"><div class="msg-bubble">Seans başladı. Terapist olarak ilk adımı sen at.</div></div>`;
  showView('session');
}

function startSession(id) {
  const p = PROFILES.find(x => x.id === id);
  state.currentProfile = p;
  _setupSessionHeader(p);

  const draft = loadDraft(id);
  if (draft && draft.messages.length >= 2) {
    showView('session');
    const date = new Date(draft.savedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    document.getElementById('messages').innerHTML = `
      <div class="resume-prompt">
        <div class="resume-title">${esc(p.name)} ile devam eden seans</div>
        <div class="resume-meta">${draft.totalTherapistMsgs} mesaj · ${date}</div>
        <div class="resume-actions">
          <button class="btn primary" onclick="resumeSession()">Kaldığım Yerden Devam Et</button>
          <button class="btn" onclick="newSession()">Yeni Seans Başlat</button>
        </div>
      </div>`;
    document.getElementById('msg-counter').textContent = `${draft.totalTherapistMsgs} mesaj`;
    document.getElementById('supervisor-hint').style.display = 'none';
    return;
  }

  if (!isPremium() && getSimCount() >= SIM_LIMIT) { openUpgrade(); return; }
  if (!isPremium()) incSimCount();
  renderAuthState();
  _initFreshSession();
}

function resumeSession() {
  const draft = loadDraft(state.currentProfile.id);
  if (!draft) { _initFreshSession(); return; }
  state.messages = draft.messages;
  state.totalTherapistMsgs = draft.totalTherapistMsgs;
  document.getElementById('msg-counter').textContent = `${state.totalTherapistMsgs} mesaj`;
  document.getElementById('supervisor-hint').style.display = state.totalTherapistMsgs >= 4 ? 'inline' : 'none';
  document.getElementById('messages').innerHTML = `<div class="msg system"><div class="msg-bubble">Seans kaldığı yerden devam ediyor.</div></div>`;
  state.messages.forEach(m => addMessage(m.role === 'user' ? 'therapist' : 'client', m.content));
}

function newSession() {
  if (!isPremium() && getSimCount() >= SIM_LIMIT) { openUpgrade(); return; }
  if (!isPremium()) incSimCount();
  renderAuthState();
  clearDraft(state.currentProfile.id);
  _initFreshSession();
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
    saveDraft();
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

function computeFeedbackScore(fb) {
  const p = fb.act_surecler || {};
  const vals = [p.kabul, p.bilissel_ayrisma, p.anda_olma, p.bagiam_olarak_benlik, p.degerler, p.kararli_eylem]
    .map(v => parseFloat(v)).filter(v => !isNaN(v));
  if (!vals.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10);
}

async function saveSession({ module, profile_id, messages, supervisor_feedback, score }) {
  try {
    await api('sessions/save', { module, profile_id, messages, supervisor_feedback, score });
  } catch (e) {
    console.warn('Seans kaydedilemedi:', e.message);
  }
}

async function requestSupervisorFeedback(isFinal = false) {
  if (state.messages.length < 2) { alert('En az birkaç mesaj gerekli.'); return; }
  document.getElementById('supervisor-panel').classList.add('open');
  document.getElementById('supervisor-body').innerHTML = `<div style="font-size:13px;color:var(--text3);font-style:italic;text-align:center;margin-top:40px;">Seans analiz ediliyor...</div>`;
  try {
    const data = await api('supervisor', { messages: state.messages, clientProfile: state.currentProfile });
    const parsed = parseClaudeJSON(data.feedback);
    renderSupervisorFeedback(parsed);
    if (isFinal) {
      await saveSession({
        module: 'simulation',
        profile_id: state.currentProfile?.id,
        messages: state.messages,
        supervisor_feedback: data.feedback,
        score: computeFeedbackScore(parsed),
      });
      clearDraft(state.currentProfile?.id);
    }
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
function endSession() { if (confirm('Seansı bitirmek istiyor musun?')) requestSupervisorFeedback(true); }

// ── ACADEMY ────────────────────────────────────────────────────────────────
async function loadAcademy(key, name) {
  const inner = document.getElementById('academy-inner');
  inner.innerHTML = `<div class="academy-content"><div class="back-link" onclick="document.getElementById('academy-inner').innerHTML=''; showView('academy')">← Geri</div><div style="font-size:13px;color:var(--text3);font-style:italic;">Yükleniyor...</div></div>`;
  setLoading(true);
  try {
    const data = await api('academy', { topic: key });
    const d = parseClaudeJSON(data.content);
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
      <div class="difficult-end-row">
        <button class="difficult-end-btn" id="d-end-btn" onclick="getDifficultSupervisor()" disabled>
          Süpervizörden Geri Bildirim Al
        </button>
      </div>
    </div>`;

  if (s.opening) {
    dState.messages.push({ role: 'client', text: s.opening });
    updateDifficultUI();
  }
}

function updateDifficultUI() {
  const conv = document.getElementById('d-conv');
  const turnEl = document.getElementById('d-turn');
  const endBtn = document.getElementById('d-end-btn');
  if (!conv) return;

  conv.innerHTML = dState.messages.map(m => `
    <div class="difficult-msg ${m.role}">
      <div class="difficult-msg-label">${m.role === 'therapist' ? 'Sen' : 'Danışan'}</div>
      <div class="difficult-msg-text">${esc(m.text)}</div>
    </div>`).join('');
  conv.scrollTop = conv.scrollHeight;

  if (turnEl) turnEl.textContent = dState.therapistCount > 0 ? `${dState.therapistCount}. yanıt` : '';
  if (endBtn) endBtn.disabled = dState.therapistCount < 1;
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
    renderSupervisorFeedback(parseClaudeJSON(data.feedback));
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
    const fb = parseClaudeJSON(data.guidance);
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
    const fb = parseClaudeJSON(data.feedback);
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

document.addEventListener('click', e => {
  const dd  = document.getElementById('profile-dropdown');
  const btn = document.getElementById('nav-user-btn');
  if (dd && !dd.contains(e.target) && !btn?.contains(e.target)) closeProfileMenu();
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

// ── SESSION HISTORY ───────────────────────────────────────────────────────────

async function renderSessionHistory() {
  const container = document.getElementById('history-inner');
  const meta      = document.getElementById('history-meta');
  if (!container) return;
  container.innerHTML = `<div style="font-size:13px;color:var(--text3);text-align:center;padding:48px;">Yükleniyor...</div>`;

  const token = getToken();
  try {
    const res = await fetch('/api/sessions?limit=50', { headers: { Authorization: `Bearer ${token}` } });
    const { sessions = [] } = await res.json();
    if (meta) meta.textContent = sessions.length ? `${sessions.length} seans` : '';

    if (sessions.length === 0) {
      container.innerHTML = `<div class="sh-empty">Henüz tamamlanan seans yok.<br>İlk simülasyonu bitirince burada görünecek.</div>`;
      return;
    }

    container.innerHTML = sessions.map(s => {
      const label = MODULE_LABELS[s.module] || s.module;
      const date  = new Date(s.created_at).toLocaleDateString('tr-TR');
      const hasFb = !!s.supervisor_feedback;
      return `
        <div class="sh-row" onclick="openSessionDetail('${esc(s.id)}')">
          <div class="sh-row-left">
            <div class="sh-module">${esc(label)}</div>
            ${s.profile_id ? `<div class="sh-profile">${esc(s.profile_id)}</div>` : ''}
          </div>
          <div class="sh-row-right">
            ${hasFb ? `<span class="sh-badge">Süpervizör notu var</span>` : ''}
            <span class="sh-date">${date}</span>
            <button class="sh-delete-btn" onclick="deleteSession(event,'${esc(s.id)}')">✕</button>
          </div>
        </div>`;
    }).join('');
  } catch {
    container.innerHTML = `<div style="color:var(--danger);font-size:13px;padding:24px;">Veriler yüklenemedi.</div>`;
  }
}

async function openSessionDetail(id) {
  const container = document.getElementById('history-inner');
  container.innerHTML = `<div style="font-size:13px;color:var(--text3);text-align:center;padding:48px;">Yükleniyor...</div>`;

  const token = getToken();
  try {
    const res = await fetch(`/api/sessions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const { session } = await res.json();
    const label = MODULE_LABELS[session.module] || session.module;
    const date  = new Date(session.created_at).toLocaleDateString('tr-TR');
    const fb    = parseSupervisorFeedback(session.supervisor_feedback);
    const msgs  = session.messages_json || [];

    const transcriptHTML = msgs.length
      ? msgs.map(m => {
          const isUser = m.role === 'user';
          return `<div class="sh-msg ${isUser ? 'therapist' : 'client'}">
            <div class="sh-msg-label">${isUser ? 'Terapist (Sen)' : esc(label)}</div>
            <div class="sh-msg-bubble">${esc(m.content)}</div>
          </div>`;
        }).join('')
      : `<div style="font-size:13px;color:var(--text3);">Transkript kaydedilmemiş.</div>`;

    const feedbackHTML = fb ? `
      ${fb.guclu_yanlar?.length ? `
        <div class="sh-fb-section">
          <div class="sh-fb-title good">+ Güçlü Hamleler</div>
          <ul class="sh-fb-list">${fb.guclu_yanlar.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        </div>` : ''}
      ${fb.act_firsatlari?.length ? `
        <div class="sh-fb-section">
          <div class="sh-fb-title gap">△ Kaçırılan ACT Fırsatları</div>
          <ul class="sh-fb-list">${fb.act_firsatlari.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        </div>` : ''}
      ${fb.somut_oneri ? `
        <div class="sh-fb-section">
          <div class="sh-fb-title next">→ Somut Öneri</div>
          <div class="sh-fb-text">${esc(fb.somut_oneri)}</div>
        </div>` : ''}
      ${fb.sonraki_seans_odagi ? `
        <div class="sh-fb-section">
          <div class="sh-fb-title next">→ Sonraki Seans Odağı</div>
          <div class="sh-fb-text">${esc(fb.sonraki_seans_odagi)}</div>
        </div>` : ''}
      ${fb.genel_yorum ? `
        <div class="sh-fb-section">
          <div class="sh-fb-title gap">Genel Yorum</div>
          <div class="sh-fb-text">${esc(fb.genel_yorum)}</div>
        </div>` : ''}
    ` : `<div style="font-size:13px;color:var(--text3);">Bu seans için süpervizör notu yok.</div>`;

    container.innerHTML = `
      <div class="sh-detail-wrap">
        <button class="sh-back" onclick="renderSessionHistory()">← Geri</button>
        <div class="sh-detail-header">
          <div class="sh-detail-title">${esc(label)}</div>
          <div class="sh-detail-date">${date}</div>
        </div>

        <div class="sh-detail-section-title">Süpervizör Geri Bildirimi</div>
        <div class="sh-feedback-wrap">${feedbackHTML}</div>

        <div class="sh-detail-section-title" style="margin-top:32px;">Seans Transkripti</div>
        <div class="sh-transcript">${transcriptHTML}</div>
      </div>`;
  } catch {
    container.innerHTML = `<div style="color:var(--danger);font-size:13px;padding:24px;">Seans yüklenemedi.</div>`;
  }
}

async function deleteSession(e, id) {
  e.stopPropagation();
  if (!confirm('Bu seansı silmek istediğine emin misin?')) return;
  const token = getToken();
  try {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    renderSessionHistory();
  } catch {
    alert('Seans silinemedi.');
  }
}

// ── PROGRESS DASHBOARD ────────────────────────────────────────────────────────

const MODULE_LABELS = {
  session: 'Simülasyon Lab',
  supervisor: 'Süpervizör',
  academy: 'Akademi Lab',
  difficult: 'Zor Anlar Lab',
  metaphor: 'Metafor Lab',
  'case-formulation': 'Vaka Formülasyon',
};

function parseSupervisorFeedback(raw) {
  if (!raw) return null;
  try { return parseClaudeJSON(raw); }
  catch { return null; }
}

const ACT_PROCESS_META = [
  { key: 'acceptance',      label: 'Kabul',            subtitle: 'Zor duyguyla kalma kapasitesi' },
  { key: 'defusion',        label: 'Defusion',          subtitle: 'Düşüncelerle ilişkilenme biçimi' },
  { key: 'presence',        label: 'Şimdiki An',        subtitle: 'Anda kalma ve sessizlik toleransı' },
  { key: 'values',          label: 'Değerler',          subtitle: 'Değer keşfi çalışması' },
  { key: 'committedAction', label: 'Kararlı Eylem',     subtitle: 'Taahhüt ve somut adım çalışması' },
];

async function renderProgressDashboard() {
  const container = document.getElementById('progress-inner');
  if (!container) return;
  container.innerHTML = `<div style="font-size:13px;color:var(--text3);text-align:center;padding:48px;">Yükleniyor...</div>`;

  const token = getToken();
  try {
    const [progRes, sessRes] = await Promise.all([
      fetch('/api/progress',         { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/sessions?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const { progress = [] } = await progRes.json();
    const { sessions = [] } = await sessRes.json();
    const profile = null; // growth-profile ayrı yüklenir

    const totalSessions = progress.reduce((s, p) => s + (p.total_sessions || 0), 0);

    const noDataNote = `<div class="gp-empty">İlk simülasyondan sonra oluşacak.</div>`;

    container.innerHTML = `
      <div class="gp-wrap">

        <!-- Üst istatistikler -->
        <div class="gp-top-row">
          <div class="gp-stat">
            <div class="gp-stat-num">${totalSessions}</div>
            <div class="gp-stat-label">Toplam Pratik</div>
          </div>
          <div class="gp-stat">
            <div class="gp-stat-num">${sessions.length > 0 ? new Date(sessions[0].created_at).toLocaleDateString('tr-TR') : '—'}</div>
            <div class="gp-stat-label">Son Pratik</div>
          </div>
          <div class="gp-style-block">
            <div class="gp-block-title">Terapötik Stil</div>
            <div class="gp-style-tags" id="gp-style-tags">
              <span class="gp-style-tag muted gp-loading-ai">Yükleniyor…</span>
            </div>
          </div>
        </div>

        <!-- Terapötik Esneklik Haritası (AI gözlemler) -->
        <div class="gp-section-title" style="margin-top:36px;">Terapötik Esneklik Haritası</div>
        <div class="gp-act-grid" id="gp-act-grid">
          ${ACT_PROCESS_META.map(({ label, subtitle }) => `
              <div class="gp-act-card">
                <div class="gp-act-label">${label}</div>
                <div class="gp-act-subtitle">${subtitle}</div>
                <div class="gp-act-obs"><span class="gp-empty-inline gp-loading-ai">Analiz yükleniyor…</span></div>
              </div>`).join('')}
        </div>

        <!-- Son Klinik Gözlemler -->
        <div class="gp-section-title" style="margin-top:36px;">Son Klinik Gözlemler</div>
        <div id="gp-observations"><div class="gp-empty gp-loading-ai">Analiz yükleniyor…</div></div>

        <!-- Zorlanılan Alanlar -->
        <div id="gp-challenges"></div>

      </div>`;

    // Growth profile'ı arka planda yükle
    fetch('/api/growth-profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ profile: gp }) => {
        if (!gp) {
          container.querySelectorAll('.gp-loading-ai').forEach(el => { el.textContent = 'İlk simülasyondan sonra oluşacak.'; });
          return;
        }
        // ACT grid güncelle
        const grid = document.getElementById('gp-act-grid');
        if (grid) {
          grid.innerHTML = ACT_PROCESS_META.map(({ key, label, subtitle }) => {
            const obs = gp.actProcesses?.[key];
            return `<div class="gp-act-card">
              <div class="gp-act-label">${label}</div>
              <div class="gp-act-subtitle">${subtitle}</div>
              <div class="gp-act-obs">${obs && obs !== 'Henüz veri yok' ? esc(obs) : '<span class="gp-empty-inline">İlk simülasyondan sonra oluşacak.</span>'}</div>
            </div>`;
          }).join('');
        }
        // Terapötik stil güncelle
        const styleEl = document.getElementById('gp-style-tags');
        if (styleEl && gp.therapeuticStyle?.length) {
          styleEl.innerHTML = gp.therapeuticStyle.map(s => `<span class="gp-style-tag">${esc(s)}</span>`).join('');
        }
        // Klinik gözlemler
        const obsEl = document.getElementById('gp-observations');
        if (obsEl) {
          obsEl.innerHTML = gp.clinicalObservations?.length
            ? gp.clinicalObservations.map(o => `<div class="gp-observation">"${esc(o)}"</div>`).join('')
            : `<div class="gp-empty">İlk simülasyondan sonra oluşacak.</div>`;
        }
        // Zorlanılan alanlar
        const chalEl = document.getElementById('gp-challenges');
        if (chalEl && gp.challengeAreas?.length) {
          chalEl.innerHTML = `<div class="gp-section-title" style="margin-top:32px;">Zorlanılan Alanlar</div>
            <div class="gp-challenges">${gp.challengeAreas.map(a => `<div class="gp-challenge-item">△ ${esc(a)}</div>`).join('')}</div>`;
        }
      })
      .catch(() => {
        container.querySelectorAll('.gp-loading-ai').forEach(el => { el.textContent = 'Yüklenemedi.'; });
      });

  } catch (e) {
    container.innerHTML = `<div style="color:var(--danger);font-size:13px;padding:24px;">Veriler yüklenemedi.</div>`;
  }
}

// Başlangıç — statik veri + kullanıcı paralel yüklenir, sonra UI render edilir
(async () => {
  try {
    await Promise.all([loadCurrentUser(), loadStaticData()]);
  } catch (e) {
    console.error('Boot hatası:', e);
    document.body.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;padding:24px;text-align:center;">
      <div style="font-size:18px;margin-bottom:12px;">Bağlantı hatası</div>
      <div style="font-size:14px;color:#888;margin-bottom:20px;">Veri yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.</div>
      <button onclick="location.reload()" style="padding:10px 20px;border:1px solid #888;background:transparent;color:inherit;cursor:pointer;border-radius:4px;">Yenile</button>
    </div>`;
    return;
  }
  renderAuthState();
})();
