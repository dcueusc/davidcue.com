import { content, VISITED, HEROES } from './content.js';
import { drawWorldMap } from './worldmap.js';
import {
  W, H, SCENES, BIRTHDAY, BIRTH_YEAR, PROFILES, PANES, FIREPLACE, LIGHTS, HOTSPOTS, TYPERS, CURTAIN, GOLD, BOOK, YEAR_SIGN, WALKERS,
} from './scene.js';
import sprites from './sprites.json';
import stp from './stpatricks.json';

const $ = (id) => document.getElementById(id);
const frame = $('frame');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct = (v, total) => `${(v / total) * 100}%`;
const rand = (a, b) => a + Math.random() * (b - a);
const IDS = SCENES.map((s) => s.id);
// version-stamp image URLs so a new deploy's images aren't served from old browser caches
const bust = (src) => `${src}?v=${__BUILD__}`;

// ---------- which scene for today ----------

function easterSunday(y) {
  // Anonymous Gregorian algorithm
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

function sceneForDate(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  if (BIRTHDAY && m === BIRTHDAY[0] && day === BIRTHDAY[1]) return 'birthday';
  if (m === 4 && day === 20) return 'fourtwenty';
  if (m === 12 && day === 31) return 'nye';
  if (m === 12) return 'christmas';
  if (m === 10) return 'halloween';
  if (m === 11) return 'thanksgiving';
  // Other holidays show for the two weeks leading up to them (the 14 days before and the day
  // itself). Where two windows overlap, the holiday coming up soonest wins.
  const holidays = {
    easter: easterSunday(y),
    valentines: new Date(y, 1, 14),
    stpatricks: new Date(y, 2, 17),
    july4: new Date(y, 6, 4),
  };
  let soonest = null, soonestDays = Infinity;
  for (const [id, date] of Object.entries(holidays)) {
    const daysUntil = Math.round((date - d) / 86400000);
    if (daysUntil >= 0 && daysUntil <= 14 && daysUntil < soonestDays) [soonest, soonestDays] = [id, daysUntil];
  }
  if (soonest) return soonest;
  if (m === 12 || m <= 2) return 'winter';
  if (m <= 5) return 'spring';
  if (m <= 8) return 'summer';
  return 'fall';
}

function initialScene() {
  const q = new URLSearchParams(location.search).get('scene') ?? new URLSearchParams(location.search).get('season');
  if (IDS.includes(q)) return q;
  // A scene picked by hand lasts for this visit only; a new visit shows the scene for the date.
  try {
    localStorage.removeItem('scene'); // older versions kept the pick forever
    const saved = sessionStorage.getItem('scene');
    if (IDS.includes(saved)) return saved;
  } catch {}
  return sceneForDate();
}

let scene = initialScene();
let profile = PROFILES[scene];

// ---------- background layers ----------

// Only the current scene loads up front; the rest stream in once the page has settled.
const layers = Object.fromEntries(
  IDS.map((id) => {
    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    img.className = 'layer';
    img.dataset.src = bust(`/img/office-${id}.webp`);
    $('layers').append(img);
    return [id, img];
  }),
);
const load = (id) => { if (!layers[id].src) layers[id].src = layers[id].dataset.src; };
addEventListener('load', () => setTimeout(() => SCENES.filter((s) => !s.hidden).forEach((s) => load(s.id)), 1500));

// ---------- scene menu ----------

const picker = $('picker');
const pickerButton = $('picker-button');
const pickerMenu = $('picker-menu');

const menuItems = {};
for (const group of [...new Set(SCENES.filter((s) => !s.hidden).map((s) => s.group))]) {
  const heading = document.createElement('li');
  heading.className = 'picker-group';
  heading.textContent = group;
  heading.setAttribute('role', 'presentation');
  pickerMenu.append(heading);
  for (const s of SCENES.filter((x) => x.group === group && !x.hidden)) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.setAttribute('role', 'menuitemradio');
    b.innerHTML = `<span class="picker-icon" aria-hidden="true">${s.icon}</span>${s.label}`;
    b.addEventListener('click', () => { setScene(s.id); closeMenu(); pickerButton.focus(); });
    li.append(b);
    pickerMenu.append(li);
    menuItems[s.id] = b;
  }
}

function openMenu() {
  picker.classList.add('open');
  pickerButton.setAttribute('aria-expanded', 'true');
  menuItems[scene].focus();
}
function closeMenu() {
  picker.classList.remove('open');
  pickerButton.setAttribute('aria-expanded', 'false');
}
pickerButton.addEventListener('click', () => (picker.classList.contains('open') ? closeMenu() : openMenu()));
document.addEventListener('click', (e) => { if (!picker.contains(e.target)) closeMenu(); });
picker.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeMenu(); pickerButton.focus(); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const items = Object.values(menuItems);
    const i = items.indexOf(document.activeElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
  }
});

function setScene(id) {
  scene = id;
  profile = PROFILES[id];
  load(id);
  try { sessionStorage.setItem('scene', id); } catch {}
  const meta = SCENES.find((s) => s.id === id);
  for (const k of IDS) {
    layers[k].classList.toggle('on', k === id);
    layers[k].alt = k === id ? `David's office in Beacon Hill: ${meta.label}` : '';
    menuItems[k]?.setAttribute('aria-checked', k === id);
  }
  $('picker-label').textContent = meta.label;
  $('picker-icon').textContent = meta.icon;
  document.body.dataset.scene = id;
  document.body.dataset.tint = profile.tint ?? '';
  $('flash').style.opacity = 0;
  for (const l of lightEls) l.el.classList.toggle('lit', profile.lights.includes(l.group));
  for (const [el, h] of hotspotEls) el.hidden = !!h.scenes && !h.scenes.includes(id);
  resetParticles();
}

// ---------- lights ----------

const lightEls = LIGHTS.map((l) => {
  const el = document.createElement('div');
  el.className = `glow glow-${l.kind}${l.soft ? ' soft' : ''}`;
  Object.assign(el.style, {
    left: pct(l.x - l.r, W),
    top: pct(l.y - l.r, H),
    width: pct(l.r * 2, W),
    height: pct(l.r * 2, H),
  });
  $('lights').append(el);
  return { ...l, el, phase: Math.random() * 1000, level: 1 };
});

// Smooth pseudo-noise: a few incommensurate sines.
const wobble = (t, p) => Math.sin(t * 1.3 + p) * 0.5 + Math.sin(t * 2.9 + p * 1.7) * 0.3 + Math.sin(t * 7.1 + p * 0.3) * 0.2;

const FLICKER = {
  candle: { base: 0.8, amt: 0.22, speed: 3.2, dip: 0.004 },
  lantern: { base: 0.75, amt: 0.25, speed: 4, dip: 0.003 },
  screen: { base: 0.8, amt: 0.08, speed: 2.2, dip: 0.002 },
  lamp: { base: 0.92, amt: 0.04, speed: 0.8, dip: 0.0006 },
  street: { base: 0.85, amt: 0.08, speed: 1.4, dip: 0.0015 },
  fire: { base: 0.78, amt: 0.3, speed: 5.5, dip: 0 },
};

function updateLights(t) {
  for (const l of lightEls) {
    if (!profile.lights.includes(l.group)) continue;
    const f = FLICKER[l.kind];
    let v = f.base + wobble(t * f.speed, l.phase) * f.amt;
    // occasional quick dip, like a draft catching the flame
    if (Math.random() < f.dip) l.level = 0.35;
    l.level += (1 - l.level) * 0.06;
    v *= l.level;
    l.el.style.opacity = Math.max(0, Math.min(1, v)).toFixed(3);
  }
}

// ---------- particles ----------

const canvas = $('fx');
const ctx = canvas.getContext('2d');
const animCanvas = $('anim');
const actx = animCanvas.getContext('2d');
let scale = 1;
let particles = [];

function resize() {
  const r = frame.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  for (const c of [canvas, animCanvas]) {
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
  }
  scale = canvas.width / W;
}
new ResizeObserver(resize).observe(frame);

const WIN = { x1: 760, y1: 107, x2: 1070, y2: 580 };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Weather seen through the window panes.
const WEATHER = {
  snow: { n: 70, spawn: () => ({ type: 'snow', x: rand(WIN.x1 - 20, WIN.x2), y: rand(WIN.y1 - 40, WIN.y2), vx: rand(-4, 6), vy: rand(14, 30), s: Math.random() < 0.3 ? 3 : 2, p: rand(0, 6) }) },
  leaves: { n: 14, spawn: () => ({ type: 'leaf', x: rand(WIN.x1, WIN.x2), y: rand(WIN.y1 - 40, WIN.y2), vx: rand(4, 16), vy: rand(16, 28), s: 3, p: rand(0, 6), c: pick(['#d9772b', '#b8451f', '#e9a23b', '#8f3a1a']) }) },
  darkLeaves: { n: 8, spawn: () => ({ type: 'leaf', x: rand(WIN.x1, WIN.x2), y: rand(WIN.y1 - 40, WIN.y2), vx: rand(8, 22), vy: rand(16, 28), s: 3, p: rand(0, 6), c: pick(['#c2621f', '#8f3a1a', '#5e2a14']) }) },
  petals: { n: 26, spawn: () => ({ type: 'petal', x: rand(WIN.x1 - 20, WIN.x2), y: rand(WIN.y1 - 40, WIN.y2), vx: rand(6, 16), vy: rand(10, 20), s: 2.5, p: rand(0, 6), c: Math.random() < 0.5 ? '#f6c9d6' : '#fbe4ea' }) },
  fireflies: { n: 16, spawn: () => ({ type: 'firefly', x: rand(WIN.x1, WIN.x2), y: rand(300, WIN.y2), s: 2.5, p: rand(0, 6) }) },
  fireworks: { n: 0, spawn: () => null },
};

function resetParticles() {
  particles = [];
  const w = WEATHER[profile.weather];
  for (let i = 0; i < w.n; i++) particles.push(w.spawn());
  if (profile.embers) for (let i = 0; i < 10; i++) particles.push(ember(true));
  if (profile.motes) for (let i = 0; i < 40; i++) particles.push(mote());
  if (profile.confetti) for (let i = 0; i < 45; i++) particles.push(confetti(true));
  if (profile.gold) for (let i = 0; i < 7; i++) particles.push(glint());
}

function ember(anywhere) {
  const [x1, y1, x2, y2] = FIREPLACE;
  return { type: 'ember', x: rand(x1 + 20, x2 - 20), y: anywhere ? rand(y1 + 60, y2) : rand(720, 780), vx: rand(-4, 4), vy: rand(-40, -20), s: 2, p: rand(0, 6), life: rand(1.5, 3) };
}

// dust motes floating in the summer sunbeam
function mote() {
  return { type: 'mote', x: rand(700, 1300), y: rand(150, 800), vx: rand(-3, 3), vy: rand(-3, 3), s: 1.6, p: rand(0, 6) };
}

// birthday confetti drifting down through the room
function confetti(anywhere) {
  return { type: 'confetti', x: rand(0, W), y: anywhere ? rand(-20, H) : rand(-60, -10), vx: rand(-6, 6), vy: rand(18, 34), s: 3, p: rand(0, 6), c: pick(['#ff5a6e', '#ffd23f', '#3ec1ff', '#7be27b', '#c77dff', '#ff9f43']) };
}

// St. Patrick's: a twinkle on the pot of gold or the coin trail
function glint() {
  const [x1, y1, x2, y2] = pick(GOLD);
  return { type: 'glint', x: rand(x1, x2), y: rand(y1, y2), life: rand(0, 1.6), max: 1.6 };
}

function clipPanes() {
  ctx.beginPath();
  for (const [x1, y1, x2, y2] of PANES) ctx.rect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale);
  ctx.clip();
}

function px(x, y, s, color, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  const k = s * scale;
  ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.max(1, Math.round(k)), Math.max(1, Math.round(k)));
}

const OUTSIDE = new Set(['snow', 'leaf', 'petal', 'firefly']);

function updateParticles(t, dt) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  clipPanes();
  const respawn = WEATHER[profile.weather].spawn;
  for (const p of particles) {
    if (!OUTSIDE.has(p.type)) continue;
    if (p.type === 'firefly') {
      p.x += Math.sin(t * 0.7 + p.p) * 6 * dt;
      p.y += Math.cos(t * 0.5 + p.p * 2) * 4 * dt;
      const glow = Math.max(0, Math.sin(t * 1.6 + p.p * 3));
      px(p.x - 2, p.y - 2, 6, '#f7f3a0', glow * 0.25);
      px(p.x, p.y, p.s, '#fffbd0', glow);
      continue;
    }
    p.x += (p.vx + Math.sin(t * 1.5 + p.p) * 8) * dt;
    p.y += p.vy * dt;
    if (p.y > WIN.y2 + 10 || p.x > WIN.x2 + 20) Object.assign(p, respawn(), { y: WIN.y1 - rand(5, 30) });
    if (p.type === 'snow') px(p.x, p.y, p.s, '#ffffff', 0.85);
    else if (p.type === 'leaf') { px(p.x, p.y, p.s, p.c); px(p.x + p.s, p.y + (Math.sin(t * 4 + p.p) > 0 ? -1 : 1), p.s * 0.7, p.c); }
    else px(p.x, p.y, p.s, p.c, 0.9);
  }
  ctx.restore();

  for (const p of particles) {
    if (OUTSIDE.has(p.type)) continue;
    if (p.type === 'ember') {
      p.x += (p.vx + Math.sin(t * 3 + p.p) * 10) * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y < FIREPLACE[1] + 20) Object.assign(p, ember(false));
      px(p.x, p.y, p.s, p.life > 1 ? '#ffd27a' : '#ff8a3d', Math.min(1, p.life));
    } else if (p.type === 'mote') {
      p.x += (p.vx + Math.sin(t * 0.3 + p.p) * 4) * dt;
      p.y += (p.vy + Math.cos(t * 0.4 + p.p) * 3) * dt;
      if (p.x < 650 || p.x > 1350 || p.y < 100 || p.y > 850) Object.assign(p, mote());
      px(p.x, p.y, p.s, '#fff3c4', 0.35 + 0.35 * Math.sin(t * 2 + p.p));
    } else if (p.type === 'confetti') {
      p.x += (p.vx + Math.sin(t * 2 + p.p) * 14) * dt;
      p.y += p.vy * dt;
      if (p.y > H) Object.assign(p, confetti(false));
      // flutter: the piece flips between a square and a thin sliver
      const flat = Math.sin(t * 6 + p.p) > 0;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = p.c;
      ctx.fillRect(Math.round(p.x * scale), Math.round(p.y * scale), Math.round(p.s * scale), Math.max(1, Math.round((flat ? 1 : p.s) * scale)));
    } else if (p.type === 'glint') {
      p.life -= dt;
      if (p.life <= 0) Object.assign(p, glint(), { life: p.max });
      const v = Math.sin((p.life / p.max) * Math.PI);
      if (v > 0.3) {
        const a = (v - 0.3) / 0.7;
        px(p.x, p.y, 2, '#fffbe0', a);
        px(p.x - 3, p.y, 2, '#ffe9a0', a * 0.6);
        px(p.x + 3, p.y, 2, '#ffe9a0', a * 0.6);
        px(p.x, p.y - 3, 2, '#ffe9a0', a * 0.6);
        px(p.x, p.y + 3, 2, '#ffe9a0', a * 0.6);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ---------- living scene: typing hands, curtain, tree lights ----------

const typers = Object.fromEntries(
  IDS.map((id) => [id, TYPERS[id].map((t) => ({ ...t, next: 0, until: 0, hand: 0, burst: 0 }))]),
);

// Keystrokes come in bursts with pauses between, hands mostly alternating.
function stepTyper(t, now) {
  if (now < t.next) return;
  if (t.burst <= 0) {
    t.burst = 4 + Math.floor(Math.random() * 16);
    t.next = now + rand(400, 2400);
    return;
  }
  t.burst--;
  if (Math.random() < 0.7) t.hand = 1 - t.hand;
  t.until = now + rand(60, 110);
  t.next = now + rand(90, 180);
}

function drawPatch(img, [x1, y1, x2, y2], dx, dy) {
  actx.drawImage(img, x1, y1, x2 - x1, y2 - y1, (x1 + dx) * scale, (y1 + dy) * scale, (x2 - x1) * scale, (y2 - y1) * scale);
}

function drawTyping(img, now) {
  for (const t of typers[scene]) {
    stepTyper(t, now);
    if (now < t.until) drawPatch(img, t.hands[t.hand], 0, 1.6);
  }
}

const curtainBox = CURTAIN.reduce(
  ([a, b, c, d], [x, y]) => [Math.min(a, x), Math.min(b, y), Math.max(c, x), Math.max(d, y)],
  [Infinity, Infinity, -Infinity, -Infinity],
);

// Ripple the sheer curtain: horizontal strips sway more the lower they hang.
function drawCurtain(img, t) {
  const [x1, y1, x2] = curtainBox;
  const y2 = Math.min(curtainBox[3], profile.curtainStop ?? Infinity);
  actx.save();
  actx.beginPath();
  CURTAIN.forEach(([x, y], i) => (i ? actx.lineTo(x * scale, y * scale) : actx.moveTo(x * scale, y * scale)));
  actx.closePath();
  actx.clip();
  const pad = 10;
  for (let y = y1; y < y2; y += 2) {
    // sway grows toward the hem; when the ripple is cut short it eases back to still at the cut
    const k = Math.pow((y - y1) / (curtainBox[3] - y1), 1.3) * Math.min(1, (y2 - y) / 60);
    const dx = k * (Math.sin(t * 1.7 - y * 0.022) * 4 + Math.sin(t * 0.8 - y * 0.009) * 3);
    actx.drawImage(img, x1 - pad, y, x2 - x1 + pad * 2, 2, (x1 - pad + dx) * scale, y * scale, (x2 - x1 + pad * 2) * scale, 2 * scale);
  }
  actx.restore();
}

const bulb = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,248,210,1)');
  grad.addColorStop(0.25, 'rgba(255,214,120,0.8)');
  grad.addColorStop(1, 'rgba(255,180,60,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
})();
const treeLights = Object.fromEntries(
  Object.entries(sprites.treeLights).map(([id, pts]) => [id, pts.map(([x, y]) => ({ x, y, p: rand(0, 6.3), s: rand(0.6, 1.6) }))]),
);

function drawTreeLights(t) {
  actx.globalCompositeOperation = 'lighter';
  for (const b of treeLights[scene] ?? []) {
    const v = Math.pow(Math.max(0, Math.sin(t * b.s + b.p)), 4);
    if (v < 0.05) continue;
    actx.globalAlpha = v * 0.9;
    const r = 7 * scale;
    actx.drawImage(bulb, b.x * scale - r, b.y * scale - r, r * 2, r * 2);
  }
  actx.globalAlpha = 1;
  actx.globalCompositeOperation = 'source-over';
}

// ---------- holiday characters: cut-out sprites animated in code ----------

const sprite = (src) => Object.assign(new Image(), { src: bust(src) });
const ready = (img) => img.complete && img.naturalWidth;
const bursts = sprites.fireworks.map((f) => ({ ...f, img: sprite(f.src), start: rand(0, 3), dx: 0 }));
const santaSip = { ...sprites['santa-sip'], img: sprite(sprites['santa-sip'].src) };
const turkeyFrames = sprites.turkey.frames.map((f) => ({ ...f, img: sprite(f.src) }));

// draw a sprite whose top-left is (x, y) in frame pixels
function blit(img, x, y, w, h, alpha = 1) {
  actx.globalAlpha = alpha;
  actx.drawImage(img, x * scale, y * scale, w * scale, h * scale);
  actx.globalAlpha = 1;
}
const size = ({ rect: [x1, y1, x2, y2] }) => [x2 - x1, y2 - y1];

// St. Patrick's: sprite-frame animation (frames drawn by Gemini, see tools/stpatricks_frames.py).
const swingFrames = stp.swing.frames.map((f) => ({ ...f, img: sprite(f.src) }));
const tossFrames = stp.toss.frames.map((src) => sprite(src));
const bookFrames = stp.book.map((f) => ({ ...f, img: sprite(f.src) }));

// Swinging on the chandelier: three poses (body right, straight, body left) picked by the pendulum's
// phase, with a small rotation about the rope's knot to smooth the motion between them.
function drawSwing(t) {
  const p = Math.sin(t * 2.2); // +1 swung right .. -1 swung left
  const f = swingFrames[p > 0.35 ? 0 : p < -0.35 ? 2 : 1];
  if (!ready(f.img)) return;
  const [px0, py0] = stp.swing.pivot;
  actx.save();
  actx.translate(px0 * scale, py0 * scale);
  actx.rotate(-p * 0.1);
  actx.drawImage(f.img, -f.ax * scale, 0, f.w * scale, f.h * scale);
  actx.restore();
}

// The ladder leprechaun reaches, grabs, pulls, hoists and flings a book, then laughs. Seconds per frame:
const TOSS_TIMES = [0.6, 0.35, 0.35, 0.55, 0.22, 0.9];
const TOSS_CYCLE = TOSS_TIMES.reduce((a, b) => a + b, 0);
const RELEASE = TOSS_TIMES.slice(0, 4).reduce((a, b) => a + b, 0);
function drawToss(t) {
  let k = t % TOSS_CYCLE;
  const into = k;
  let i = 0;
  while (k > TOSS_TIMES[i]) k -= TOSS_TIMES[i++];
  const img = tossFrames[Math.min(i, 5)];
  const [x1, y1, x2, y2] = stp.toss.rect;
  if (ready(img)) blit(img, x1, y1, x2 - x1, y2 - y1);
  // the flung book tumbles on from where it left his hand (frame 5 already shows it at release)
  const fly = into - RELEASE - TOSS_TIMES[4];
  if (fly > 0 && fly < 0.8) {
    const b = bookFrames[Math.floor(fly / 0.09) % bookFrames.length];
    if (!ready(b.img)) return;
    const [rx, ry] = stp.toss.release;
    const x = rx + fly * 70, y = ry + fly * 40 + 260 * fly * fly;
    blit(b.img, x - b.w / 2, y - b.h / 2, b.w, b.h, fly > 0.55 ? (0.8 - fly) / 0.25 : 1);
  }
}

// Fireworks: each painted burst rises as a trail, blooms out from its center, then fades and droops.
function drawFireworks(t) {
  actx.save();
  actx.beginPath();
  for (const [x1, y1, x2, y2] of PANES) actx.rect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale);
  actx.clip();
  for (const b of bursts) {
    if (!ready(b.img)) continue;
    const [w, h] = size(b);
    const cx = b.rect[0] + w / 2 + b.dx, cy = b.rect[1] + h / 2;
    const life = t - b.start;
    if (life < 0) continue;
    if (life > 3.4) { b.start = t + rand(0.3, 2.5); b.dx = rand(-25, 25); continue; }
    if (life < 0.7) {
      // rising trail
      const y = 585 + (cy - 585) * (life / 0.7);
      for (let i = 0; i < 6; i++) {
        actx.globalAlpha = 1 - i / 6;
        actx.fillStyle = '#fff2c0';
        actx.fillRect(Math.round(cx * scale), Math.round((y + i * 4) * scale), Math.max(1, Math.round(2 * scale)), Math.max(1, Math.round(2 * scale)));
      }
      continue;
    }
    const f = (life - 0.7) / 2.7;
    const grow = 0.25 + 0.75 * (1 - Math.pow(1 - Math.min(1, f / 0.3), 3));
    const alpha = f < 0.5 ? 1 : 1 - (f - 0.5) / 0.5;
    const twinkle = f > 0.4 ? 0.75 + 0.25 * Math.sin(t * 40 + cx) : 1;
    const droop = f * f * 12;
    actx.globalAlpha = Math.max(0, alpha * twinkle);
    actx.globalCompositeOperation = 'lighter';
    actx.drawImage(b.img, (cx - (w * grow) / 2) * scale, (cy - (h * grow) / 2 + droop) * scale, w * grow * scale, h * grow * scale);
    actx.globalCompositeOperation = 'source-over';
  }
  actx.restore();
  actx.globalAlpha = 1;
}

// Santa raises his milk and takes a sip every few seconds.
const sip = { next: 2, start: -10 };
function drawSanta(t) {
  if (!ready(santaSip.img)) return;
  if (t > sip.next) { sip.start = t; sip.next = t + rand(4, 7); }
  const k = t - sip.start;
  if (k > 1.8) return;
  const fade = 0.18;
  const a = k < fade ? k / fade : k > 1.8 - fade ? (1.8 - k) / fade : 1;
  const [w, h] = size(santaSip);
  blit(santaSip.img, santaSip.rect[0], santaSip.rect[1], w, h, a);
}

// The turkey stands, pecks at the rug and looks around. Frames: 0 stand, 1 peck, 2 look left, 3 look right.
const TURKEY_MOVES = [[0, 1.6], [1, 0.3], [0, 0.25], [1, 0.3], [0, 1.2], [2, 1.1], [3, 1.1], [0, 0.9], [1, 0.3], [0, 0.3]];
const gobble = { i: 0, until: 0 };
function drawTurkey(now) {
  if (now > gobble.until) {
    gobble.i = (gobble.i + 1) % TURKEY_MOVES.length;
    gobble.until = now + TURKEY_MOVES[gobble.i][1] * 1000 * rand(0.8, 1.3);
  }
  const fr = turkeyFrames[TURKEY_MOVES[gobble.i][0]];
  if (!ready(fr.img)) return;
  const [x1, , , y2] = sprites.turkey.rect;
  blit(fr.img, x1, y2 - fr.h, fr.w, fr.h);
}

// The pilgrim turns a page now and then: a cream page swings from right to left over the spine.
const page = { next: 3, start: -10 };
function drawPage(t) {
  if (t > page.next) { page.start = t; page.next = t + rand(4, 8); }
  const k = (t - page.start) / 0.7;
  if (k < 0 || k > 1) return;
  const [sx, sy] = BOOK.spine;
  const ease = k * k * (3 - 2 * k);
  // both angles are negative (above the spine), so interpolating swings the page up and over
  const from = Math.atan2(BOOK.right[1] - sy, BOOK.right[0] - sx);
  const to = Math.atan2(BOOK.left[1] - sy, BOOK.left[0] - sx);
  const ang = from + (to - from) * ease;
  const len = 23 * (0.75 + 0.25 * Math.abs(Math.cos(ang)));
  const tipX = sx + Math.cos(ang) * len, tipY = sy + Math.sin(ang) * len;
  actx.save();
  actx.lineCap = 'butt';
  actx.strokeStyle = '#efe4c8';
  actx.lineWidth = 3 * scale;
  actx.beginPath();
  actx.moveTo(sx * scale, sy * scale);
  actx.lineTo(tipX * scale, tipY * scale);
  actx.stroke();
  actx.strokeStyle = 'rgba(120, 90, 60, 0.8)';
  actx.lineWidth = 1 * scale;
  actx.beginPath();
  actx.moveTo((sx + 1) * scale, (sy + 1.5) * scale);
  actx.lineTo((tipX + 1) * scale, (tipY + 1.5) * scale);
  actx.stroke();
  actx.restore();
}

// Halloween: every 30 seconds lightning strikes; the clown is suddenly inside, front and center, staring.
// Three seconds later it strikes again and he is back outside by the lamppost.
const clownInside = { ...sprites['clown-inside'], img: sprite(sprites['clown-inside'].src) };
const clownStreet = { ...sprites['clown-street'], img: sprite(sprites['clown-street'].src) };
const STORM = { first: 4, every: 30, stay: 3 };
const STRIKE = 0.7; // seconds a strike's flash and bolt last
let bolt = null;

// flash brightness over a strike: a hard flash, a dip, a second flicker, then fading
function flashLevel(k) {
  if (k < 0 || k > STRIKE) return 0;
  if (k < 0.06) return 1;
  if (k < 0.12) return 0.25;
  if (k < 0.2) return 0.85;
  return 0.85 * (1 - (k - 0.2) / (STRIKE - 0.2));
}

function makeBolt() {
  const pts = [[rand(800, 1040), 100]];
  while (pts[pts.length - 1][1] < 330) {
    const [x, y] = pts[pts.length - 1];
    pts.push([x + rand(-22, 22), y + rand(14, 30)]);
  }
  const fork = pts.slice(0, Math.floor(rand(3, pts.length - 2)) + 1);
  const [fx, fy] = fork[fork.length - 1];
  const branch = [[fx, fy]];
  for (let i = 0; i < 4; i++) branch.push([branch[i][0] + rand(8, 20) * (Math.random() < 0.5 ? -1 : 1), branch[i][1] + rand(10, 22)]);
  return [pts, branch];
}

function drawLightning(t) {
  // time into the current storm cycle; strikes at 0 (clown comes in) and at `stay` (he leaves)
  const c = t < STORM.first ? -1 : (t - STORM.first) % STORM.every;
  const inside = c >= 0 && c < STORM.stay;
  const k = c < 0 ? -1 : c < STORM.stay ? c : c - STORM.stay;
  const level = flashLevel(k);
  $('flash').style.opacity = (level * 0.75).toFixed(3);

  if (inside && ready(clownInside.img) && ready(clownStreet.img)) {
    // the street outside goes empty, and he stands in the room directly in line with where he was
    let [x1, y1, x2, y2] = clownStreet.rect;
    blit(clownStreet.img, x1, y1, x2 - x1, y2 - y1);
    [x1, y1, x2, y2] = clownInside.rect;
    blit(clownInside.img, x1 + clownInside.dx, y1, x2 - x1, y2 - y1);
  }

  if (level > 0) {
    if (!bolt || k < 0.02) bolt = makeBolt();
    actx.save();
    actx.beginPath();
    for (const [x1, y1, x2, y2] of PANES) actx.rect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale);
    actx.clip();
    actx.globalCompositeOperation = 'lighter';
    actx.lineJoin = 'round';
    for (const [w, color] of [[7, 'rgba(160, 180, 255, 0.35)'], [2.5, 'rgba(240, 245, 255, 0.95)']]) {
      actx.strokeStyle = color;
      actx.lineWidth = w * scale;
      for (const line of bolt) {
        actx.beginPath();
        line.forEach(([x, y], i) => (i ? actx.lineTo(x * scale, y * scale) : actx.moveTo(x * scale, y * scale)));
        actx.globalAlpha = Math.min(1, level * 1.2);
        actx.stroke();
      }
    }
    actx.restore();
    actx.globalAlpha = 1;
  } else {
    bolt = null;
  }
}

// New Year's Eve: the banner is drawn back over the fireworks (they're outside, behind it), and the
// coming year hangs under it as gold digit cards matching the banner's letters. It's always the next
// New Year, so the current year plus one.
const nyeBanner = { ...sprites['nye-banner'], img: sprite(sprites['nye-banner'].src) };
const digitCards = sprites.digits.map((d) => ({ ...d, img: sprite(d.src) }));

function drawYear(t) {
  if (ready(nyeBanner.img)) {
    const [x1, y1, x2, y2] = nyeBanner.rect;
    blit(nyeBanner.img, x1, y1, x2 - x1, y2 - y1);
  }
  const cards = [...String(new Date().getFullYear() + 1)].map((d) => digitCards[d]);
  if (!cards.every((c) => ready(c.img))) return;
  const gap = 6; // the banner's letters sit about this far apart
  const total = cards.reduce((w, c) => w + c.w, 0) + gap * (cards.length - 1);
  const x0 = YEAR_SIGN.x - total / 2, y0 = YEAR_SIGN.y;
  // the string they hang from, sagging a little in the middle
  actx.strokeStyle = 'rgba(150, 120, 70, 0.9)';
  actx.lineWidth = Math.max(1, 1.5 * scale);
  actx.beginPath();
  actx.moveTo((x0 - 16) * scale, (y0 - 2) * scale);
  actx.quadraticCurveTo(YEAR_SIGN.x * scale, (y0 + 10) * scale, (x0 + total + 16) * scale, (y0 - 2) * scale);
  actx.stroke();
  let x = x0;
  cards.forEach((c, i) => {
    const mid = x + c.w / 2;
    const sag = Math.sin(((mid - x0) / total) * Math.PI) * 5;
    const tilt = (i % 2 ? 1 : -1) * 0.05 + Math.sin(t * 1.2 + i * 1.7) * 0.025; // gentle sway, like the banner
    actx.save();
    actx.translate(mid * scale, (y0 + sag) * scale);
    actx.rotate(tilt);
    actx.drawImage(c.img, (-c.w / 2) * scale, 0, c.w * scale, c.h * scale);
    actx.restore();
    x += c.w + gap;
  });
}

// Passers-by on the sidewalk outside: first at 4s, then every 30s (the same rhythm as the Halloween
// lightning), taking turns when a scene has more than one.
const walkerFrames = Object.fromEntries(
  Object.values(WALKERS).flatMap((w) => w.names).map((n) => [n, sprites[n].map((f) => ({ ...f, img: sprite(f.src) }))]),
);
const WALK = { first: 4, every: 30, walk: 6, from: 730, to: 1090 };
function drawWalkers(t, img) {
  const cfg = WALKERS[profile.walkers];
  const since = t - WALK.first;
  const k = since < 0 ? -1 : since % WALK.every;
  if (k < 0 || k > WALK.walk) return;
  const name = cfg.names[Math.floor(since / WALK.every) % cfg.names.length];
  const step = Math.floor(k / 0.3) % 2; // two-frame walk
  // Washington's generated poses change his head's size and position. Keep his likeness stable
  // and add a rhythmic step bounce and shoulder sway instead of swapping mismatched poses.
  const steady = name === 'washington';
  const f = walkerFrames[name][steady ? 0 : step];
  if (!ready(f.img)) return;
  const x = WALK.from + (WALK.to - WALK.from) * (k / WALK.walk);
  const stride = k * Math.PI / 0.3;
  const bob = steady ? 2.4 * Math.abs(Math.sin(stride)) : (step ? 2 : 0);
  const y = cfg.bottom - f.h - bob;
  actx.save();
  actx.beginPath();
  for (const [x1, y1, x2, y2] of PANES) actx.rect(x1 * scale, y1 * scale, (x2 - x1) * scale, (y2 - y1) * scale);
  actx.clip();
  if (steady) {
    actx.save();
    actx.translate((x + 0.8 * Math.sin(stride)) * scale, (y + f.h) * scale);
    actx.rotate(0.018 * Math.sin(stride));
    blit(f.img, -f.w / 2, -f.h, f.w, f.h);
    actx.restore();
  } else {
    blit(f.img, x - f.w / 2, y, f.w, f.h);
  }
  for (const r of cfg.front) drawPatch(img, r, 0, 0);
  for (const polygon of cfg.frontPolygons ?? []) {
    actx.save();
    actx.beginPath();
    polygon.forEach(([px, py], i) => i ? actx.lineTo(px * scale, py * scale) : actx.moveTo(px * scale, py * scale));
    actx.closePath();
    actx.clip();
    actx.drawImage(img, 0, 0, W * scale, H * scale);
    actx.restore();
  }
  actx.restore();
}

function updateAnim(t, now) {
  actx.clearRect(0, 0, animCanvas.width, animCanvas.height);
  const img = layers[scene];
  if (!img.complete || !img.naturalWidth) return;
  drawTyping(img, now);
  if (profile.walkers) drawWalkers(t, img); // before the curtain, which hangs in front of them
  if (profile.curtain) drawCurtain(img, t);
  if (profile.tree) drawTreeLights(t);
  if (profile.weather === 'fireworks') drawFireworks(t);
  if (profile.leprechaun) drawSwing(t);
  if (profile.books) drawToss(t);
  if (profile.santa) drawSanta(t);
  if (profile.turkey) drawTurkey(now);
  if (profile.pilgrim) drawPage(t);
  if (profile.lightning) drawLightning(t);
  if (profile.year) drawYear(t);
}

// ---------- hotspots + popup ----------

const popup = $('popup');

// Whole years since the last birthday, plus the days since it.
function age(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [bm, bd] = BIRTHDAY;
  let last = new Date(today.getFullYear(), bm - 1, bd);
  if (last > today) last = new Date(today.getFullYear() - 1, bm - 1, bd);
  return [last.getFullYear() - BIRTH_YEAR, Math.round((today - last) / 86400000)];
}

function openPopup(id) {
  const c = content[id];
  popup.onkeydown = null;
  $('popup-kicker').textContent = c.kicker;
  $('popup-title').textContent = c.title;
  popup.classList.toggle('popup-wide', !!c.map);
  if (c.map) {
    $('popup-body').innerHTML = '<p class="note" id="map-note"></p><canvas class="worldmap" id="worldmap"></canvas><p class="map-hover" id="map-hover">&nbsp;</p>';
    popup.showModal();
    drawWorldMap($('worldmap'), VISITED, (name) => { $('map-hover').innerHTML = name ?? '&nbsp;'; });
    $('map-note').textContent = `${VISITED.length} ${VISITED.length === 1 ? 'country' : 'countries'}. Lot to go.`;
    return;
  }
  if (c.age) {
    const [years, days] = age(new Date());
    $('popup-title').textContent = `${years} years, ${days} ${days === 1 ? 'day' : 'days'} old`;
    $('popup-body').innerHTML = '';
    popup.showModal();
    return;
  }
  if (c.photos) {
    $('popup-body').innerHTML = `
      <figure class="photo"><img id="photo-img" alt="" /><figcaption id="photo-caption"></figcaption></figure>
      <div class="photo-nav" id="photo-nav">
        <button class="hero-arrow" id="photo-prev" aria-label="Previous photo">‹</button>
        <span class="hero-count" id="photo-count"></span>
        <button class="hero-arrow" id="photo-next" aria-label="Next photo">›</button>
      </div>`;
    let i = c.start ?? 0;
    const show = (dir) => {
      i = (i + dir + c.photos.length) % c.photos.length;
      $('photo-img').src = bust(c.photos[i].src);
      $('photo-img').alt = c.photos[i].caption;
      $('photo-caption').textContent = c.photos[i].caption;
      $('photo-count').textContent = `${i + 1} / ${c.photos.length}`;
    };
    $('photo-nav').hidden = c.photos.length < 2;
    $('photo-prev').onclick = () => show(-1);
    $('photo-next').onclick = () => show(1);
    popup.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') show(-1);
      if (e.key === 'ArrowRight') show(1);
    };
    popup.classList.add('popup-wide');
    show(0);
    popup.showModal();
    return;
  }
  if (c.heroes) {
    $('popup-body').innerHTML = `
      <div class="heroes">
        <button class="hero-arrow" id="hero-prev" aria-label="Previous hero">‹</button>
        <figure class="hero"><img id="hero-img" alt="" /><figcaption id="hero-name"></figcaption></figure>
        <button class="hero-arrow" id="hero-next" aria-label="Next hero">›</button>
      </div>
      <p class="hero-why" id="hero-why"></p>
      <p class="hero-count" id="hero-count"></p>`;
    let i = 0;
    const show = (d) => {
      i = (i + d + HEROES.length) % HEROES.length;
      const h = HEROES[i];
      $('hero-img').src = bust(h.img);
      $('hero-img').alt = `Bust of ${h.name}`;
      $('hero-name').textContent = h.name;
      $('hero-why').textContent = h.why;
      $('hero-count').textContent = HEROES.length > 1 ? `${i + 1} / ${HEROES.length}` : '';
    };
    $('hero-prev').onclick = () => show(-1);
    $('hero-next').onclick = () => show(1);
    popup.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') show(-1);
      if (e.key === 'ArrowRight') show(1);
    };
    show(0);
    popup.showModal();
    return;
  }
  $('popup-body').innerHTML = c.body;
  popup.showModal();
}

popup.addEventListener('click', (e) => {
  if (e.target === popup) popup.close();
});

// The window steps through the scenes in calendar order, starting from whatever is showing.
const WINDOW_ORDER = ['fall', 'halloween', 'thanksgiving', 'birthday', 'christmas', 'nye', 'winter', 'valentines', 'stpatricks', 'easter', 'spring', 'july4', 'summer'];

const hotspotEls = [];
for (const h of HOTSPOTS) {
  const [x1, y1, x2, y2] = h.rect;
  const b = document.createElement('button');
  b.className = 'hotspot';
  b.setAttribute('aria-label', h.label);
  b.dataset.label = h.label;
  Object.assign(b.style, { left: pct(x1, W), top: pct(y1, H), width: pct(x2 - x1, W), height: pct(y2 - y1, H) });
  b.addEventListener('click', () => {
    if (h.id === 'me') $('about').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    else if (h.id === 'window') setScene(scene === 'fourtwenty' ? 'spring' : WINDOW_ORDER[(WINDOW_ORDER.indexOf(scene) + 1) % WINDOW_ORDER.length]);
    else openPopup(h.id);
  });
  $('hotspots').append(b);
  hotspotEls.push([b, h]);
}

// ---------- loop ----------

setScene(scene);
resize();

// On narrow screens the scene is wider than the viewport; start scrolled to the desk.
const sceneEl = $('scene');
requestAnimationFrame(() => {
  if (sceneEl.scrollWidth > sceneEl.clientWidth) sceneEl.scrollLeft = (sceneEl.scrollWidth - sceneEl.clientWidth) * 0.3;
});

let last = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  updateLights(t);
  updateAnim(t, now);
  updateParticles(t, dt);
  requestAnimationFrame(tick);
}

if (reduceMotion) {
  for (const l of lightEls) l.el.style.opacity = 0.85;
} else {
  requestAnimationFrame(tick);
}
