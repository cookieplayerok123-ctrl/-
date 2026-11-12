// Drawing kit: flat fills, dark outlines, big-eyed characters. Everything returns SVG markup strings.
const W = 576, H = 1024, OUT = '#241713';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const eio = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const eout = k => 1 - Math.pow(1 - k, 3);
const eback = k => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
const seg = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
const pop = (t, a, dur = 0.32) => (t < a ? 0 : eback(clamp((t - a) / dur)));
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const shake = (t, t0, dur, amp) => (t < t0 || t > t0 + dur ? [0, 0] : [Math.sin(t * 95) * amp * (1 - (t - t0) / dur), Math.cos(t * 71) * amp * (1 - (t - t0) / dur)]);

const S = (w = 3, c = OUT) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const rect = (x, y, w, h, fill, rx = 0, st = S()) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${st}/>`;
const circ = (x, y, r, fill, st = S()) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${st}/>`;
const ell = (x, y, rx, ry, fill, st = S()) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${st}/>`;
const path = (d, fill = 'none', st = S()) => `<path d="${d}" fill="${fill}" ${st}/>`;
const line = (x1, y1, x2, y2, st = S()) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${st}/>`;
const text = (x, y, str, size, fill = '#fff', o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || 'Montserrat'}" font-weight="${o.w || 800}" font-size="${size}" text-anchor="${o.a || 'middle'}" fill="${fill}" ${o.extra || ''}>${str}</text>`;
const g = (tf, inner, extra = '') => `<g transform="${tf}" ${extra}>${inner}</g>`;
const at = (x, y, s, inner, rot = 0) => g(`translate(${x} ${y}) rotate(${rot}) scale(${s})`, inner);
const op = (o, inner) => (o <= 0 ? '' : `<g opacity="${clamp(o)}">${inner}</g>`);
const cam = (cx, cy, z, inner) => g(`translate(288 512) scale(${z}) translate(${-cx} ${-cy})`, inner);
const clipBox = (x, y, w, h, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const limb = (pts, w, color, ow = 3) => {
  const p = pts.map(q => q.join(',')).join(' ');
  return `<polyline points="${p}" fill="none" stroke="${OUT}" stroke-width="${w + 2 * ow}" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<polyline points="${p}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const DEFS = `<defs>
<pattern id="wpA" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#cbb98f"/><path d="M18 5l5 7-5 7-5-7z" fill="#baa77c"/><circle cx="0" cy="28" r="2.2" fill="#baa77c"/><circle cx="36" cy="28" r="2.2" fill="#baa77c"/></pattern>
<pattern id="wpB" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#bdae8a"/><rect width="16" height="44" fill="#b2a27c"/><circle cx="30" cy="22" r="2.4" fill="#a5946d"/></pattern>
<pattern id="wpK" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="#2b355b"/><path d="M14 8l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#46528a"/><circle cx="42" cy="38" r="2.5" fill="#46528a"/></pattern>
<pattern id="wpS" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#c5ccab"/><circle cx="20" cy="20" r="1.8" fill="#b3bb97"/></pattern>
<pattern id="wood" width="140" height="36" patternUnits="userSpaceOnUse"><rect width="140" height="36" fill="#5c3e2d"/><path d="M0 0H140M0 18H140M50 0V18M110 18V36" stroke="#432c20" stroke-width="2"/></pattern>
<pattern id="lino" width="64" height="40" patternUnits="userSpaceOnUse"><rect width="64" height="40" fill="#7c5d43"/><rect width="32" height="20" fill="#8b6b4e"/><rect x="32" y="20" width="32" height="20" fill="#8b6b4e"/></pattern>
<pattern id="tiles" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#e7dfcf"/><path d="M0 0H34M0 0V34" stroke="#cbc1ad" stroke-width="2"/></pattern>
<pattern id="cloth" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#f2ecdf"/><path d="M0 22H44M22 0V44" stroke="#d8626c" stroke-width="5" opacity=".75"/></pattern>
<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 0H32M0 0V32" stroke="#fff" stroke-opacity=".045" stroke-width="1"/></pattern>
<pattern id="ruled" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 29H30" stroke="#9db4d6" stroke-width="1.4"/></pattern>
<radialGradient id="vig" cx=".5" cy=".46" r=".78"><stop offset=".52" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
<linearGradient id="ui" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1638"/><stop offset="1" stop-color="#0b0a18"/></linearGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141a33"/><stop offset="1" stop-color="#2a3558"/></linearGradient>
<radialGradient id="glow"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
<radialGradient id="redglow"><stop offset="0" stop-color="#ff3d3d" stop-opacity=".6"/><stop offset="1" stop-color="#ff3d3d" stop-opacity="0"/></radialGradient>
</defs>`;

// ---------- characters ----------
const LOOK = {
  dad: { skin: '#e6b594', hair: '#3a2a22', hairKind: 'short', top: '#4c5763', top2: '#3c4651', kind: 'jacket', tie: '#8f2f3a', pants: '#2c313a', shoes: '#1a1a1f', glasses: true, mustache: true },
  tim: { skin: '#f0c5a6', hair: '#2d2933', hairKind: 'messy', top: '#e3a93a', top2: '#c98f27', kind: 'hoodie', pants: '#3e4b68', shoes: '#ebe5da', child: 1 },
  sonya: { skin: '#f4cfb5', hair: '#b4663a', hairKind: 'pigtails', top: '#9a78d0', top2: '#8160b8', kind: 'dress', pants: '#f1e9e4', shoes: '#d96b7d', child: 2 },
  mom: { skin: '#efc4a8', hair: '#6a3e2a', hairKind: 'bun', top: '#5e8e75', top2: '#4c7861', kind: 'cardigan', pants: '#6d6577', shoes: '#cfc7bd' },
  cop: { skin: '#e2b091', hair: '#5a4535', hairKind: 'short', top: '#9dbfde', top2: '#84a8c9', kind: 'uniform', tie: '#27304a', pants: '#27304a', shoes: '#15151a', cap: true },
};
const PROP = [
  { leg: 128, th: 105, tw: 74, rx: 25, ry: 29, U: 54, F: 50, aw: 19, lw: 25 },
  { leg: 100, th: 84, tw: 62, rx: 24, ry: 27, U: 44, F: 42, aw: 17, lw: 22 },
  { leg: 58, th: 60, tw: 48, rx: 23, ry: 25, U: 30, F: 28, aw: 14, lw: 18 },
];
const P = S(1.5);

function hand(x, y, s, skin, fist, rot) {
  const body = fist
    ? rect(-12, -9, 24, 22, skin, 8, P) + path('M-5 3V12M2 4V13M8 3V11', 'none', S(1.4))
    : rect(-10, -8, 20, 20, skin, 9, P) + path('M-4 6V12M1 7V13M6 6V11', 'none', S(1.3));
  return at(x, y, s, body, rot);
}

function head(k, o, rx, ry) {
  const e = o.expr || 'neutral', [gx, gy] = o.gaze || [0, 0], m = rx / 25;
  let h = '';
  if (k.hairKind === 'bun') h += circ(0, -ry - 7, 11, k.hair, P);
  if (k.hairKind === 'pigtails') for (const sd of [-1, 1]) h += ell(sd * (rx + 8), 9, 8, 16, k.hair, P) + circ(sd * (rx + 2), -5, 4, '#e85d75', P);
  const capShape = () => path(`M${-rx - 3} ${-ry * 0.55} Q${-rx - 12} ${-ry - 16} 0 ${-ry - 15} Q${rx + 12} ${-ry - 16} ${rx + 3} ${-ry * 0.55}Z`, '#27304a', P)
    + rect(-rx - 3, -ry * 0.62, 2 * rx + 6, 9, '#1b2238', 3, P);
  if (o.back) {
    h += circ(-rx, 3, 5, k.skin, P) + circ(rx, 3, 5, k.skin, P) + ell(0, 0, rx, ry, k.hair, P);
    if (k.cap) h += capShape();
    return h;
  }
  h += circ(-rx, 3, 5, k.skin, P) + circ(rx, 3, 5, k.skin, P) + ell(0, 0, rx, ry, k.skin, P);
  const fringe = `Q${rx - 3} ${-ry * 0.5} 0 ${-ry * 0.58} Q${-rx + 3} ${-ry * 0.5} ${-rx - 1} -3Z`;
  if (k.hairKind === 'messy') h += path(`M${-rx - 1} -3 L${-rx - 5} ${-ry * 0.75} L${-rx * 0.62} ${-ry - 9} L${-rx * 0.25} ${-ry - 3} L${rx * 0.15} ${-ry - 11} L${rx * 0.6} ${-ry - 3} L${rx + 6} ${-ry * 0.85} L${rx + 1} -3 Q${rx - 2} ${-ry * 0.42} ${rx * 0.3} ${-ry * 0.55} L0 ${-ry * 0.36} L${-rx * 0.4} ${-ry * 0.56} Q${-rx + 3} ${-ry * 0.45} ${-rx - 1} -3Z`, k.hair, P);
  else if (k.hairKind === 'bun') h += path(`M${-rx - 2} 8 Q${-rx - 4} ${-ry - 7} 0 ${-ry - 5} Q${rx + 4} ${-ry - 7} ${rx + 2} 8 Q${rx - 2} ${-ry * 0.45} 0 ${-ry * 0.62} Q${-rx + 2} ${-ry * 0.45} ${-rx - 2} 8Z`, k.hair, P);
  else h += path(`M${-rx - 1} -3 Q${-rx - 3} ${-ry - 7} 0 ${-ry - 5} Q${rx + 3} ${-ry - 7} ${rx + 1} -3 ${fringe}`, k.hair, P);
  const wide = e === 'scared' || e === 'surprised';
  const er = (wide ? 8.8 : 7.4) * m, pr = (e === 'scared' ? 2.3 : 3) * m, ex = rx * 0.44, ey = -1, by = ey - er - 4.5 * m;
  for (const sd of [-1, 1]) {
    h += circ(sd * ex, ey, er, '#fff', P) + circ(sd * ex + gx * 3.4 * m, ey + gy * 3.4 * m, pr, '#1a1210', '');
    if (e === 'angry' || e === 'cold') h += path(`M${sd * ex - er} ${ey - er * 0.2} A${er} ${er} 0 0 1 ${sd * ex + er} ${ey - er * 0.2}Z`, k.skin, P);
    const b = wide ? [-4, 1] : e === 'angry' ? [5, -3] : e === 'cold' ? [2, 0] : [0, 0];
    h += line(sd * (ex - 7 * m), by + b[0] * m, sd * (ex + 7 * m), by + b[1] * m, S(2.6 * m, k.hair));
  }
  if (k.glasses) h += rect(-ex - er - 2, ey - er - 2, 2 * er + 4, 2 * er + 4, 'rgba(255,255,255,.12)', 5, S(2.2, '#17130f')) + rect(ex - er - 2, ey - er - 2, 2 * er + 4, 2 * er + 4, 'rgba(255,255,255,.12)', 5, S(2.2, '#17130f')) + line(-ex + er + 2, ey, ex - er - 2, ey, S(2.2, '#17130f'));
  h += path(`M0 ${4 * m} l${-3 * m} ${6 * m} h${4 * m}`, 'none', S(1.4));
  const my = ry * 0.58;
  if (k.mustache) h += path(`M${-10 * m} ${my - 3 * m} Q0 ${my - 10 * m} ${10 * m} ${my - 3 * m} Q0 ${my - 5 * m} ${-10 * m} ${my - 3 * m}Z`, k.hair, P);
  if (e === 'scared') h += ell(0, my + 2 * m, 4.5 * m, 6 * m, '#3a1a1a', P);
  else if (e === 'surprised' || e === 'whisper') h += ell(0, my + 1 * m, 4 * m, 3.6 * m, '#3a1a1a', P);
  else if (e === 'grin') h += path(`M${-10 * m} ${my - 1 * m} Q0 ${my + 12 * m} ${10 * m} ${my - 1 * m}Z`, '#fff', P);
  else if (e === 'smile') h += path(`M${-8 * m} ${my} Q0 ${my + 7 * m} ${8 * m} ${my}`, 'none', S(1.8));
  else if (e === 'angry') h += path(`M${-8 * m} ${my + 4 * m} Q0 ${my - 3 * m} ${8 * m} ${my + 4 * m}`, 'none', S(2));
  else h += line(-6 * m, my + 2 * m, 6 * m, my + 2 * m, S(1.8));
  if (k.cap) h += capShape() + path(`M${-rx + 1} ${-ry * 0.36} Q0 ${-ry * 0.2} ${rx - 1} ${-ry * 0.36} L${rx + 1} ${-ry * 0.42} H${-rx - 1}Z`, '#12162a', P) + circ(0, -ry * 0.86, 4, '#e6b93c', P);
  return h;
}

/* person({look, x, y, s, flip, back, sit, expr, gaze, armL, armR, fistL, fistR, spread})
   x,y is the point between the feet. Arms are [upper, fore] angles in degrees (0 = hanging down,
   positive = outward) or {to:[x,y], bend} to reach a point given in scene coordinates. */
function person(o) {
  const k = o.look, pr = PROP[k.child || 0], s = o.s || 1, fl = o.flip ? -1 : 1;
  const { th, tw, rx, ry, U, F, aw, lw } = pr, leg = o.sit ? 26 : pr.leg;
  const hipY = -leg, shY = hipY - th, hcY = shY - 5 - ry;
  let b = '';
  if (o.sit) for (const sd of [-1, 1]) b += limb([[sd * tw / 4, hipY + 4], [sd * tw * 0.95, hipY + 10], [sd * tw * 0.2, hipY + 22]], lw, k.pants, 1.5);
  else for (const sd of [-1, 1]) {
    const fx = sd * (tw / 4 + (o.spread ?? 5)), dress = k.kind === 'dress';
    b += ell(fx + (o.back ? 0 : sd * 3), -5, lw * 0.78, 7, k.shoes, P) + limb([[sd * tw / 4, hipY + 2], [fx, -13]], dress ? lw * 0.6 : lw, dress ? k.skin : k.pants, 1.5);
  }
  if (k.kind === 'hoodie') b += ell(0, shY + (o.back ? 12 : 3), tw / 2 - 5, o.back ? 20 : 12, k.top2, P);
  if (k.kind === 'dress') b += path(`M${-tw / 2} ${hipY - 14} L${-tw / 2 - 12} ${hipY + 26} H${tw / 2 + 12} L${tw / 2} ${hipY - 14}Z`, k.top, P);
  b += rect(-tw / 2, shY, tw, th + 8, k.top, 15, P);
  if (!o.back) {
    if (k.kind === 'jacket') b += path(`M-11 ${shY} L0 ${shY + 50} L11 ${shY}Z`, '#f1ede6', P) + path(`M-4 ${shY + 5} H4 L6 ${shY + 38} L0 ${shY + 47} L-6 ${shY + 38}Z`, k.tie, P) + circ(0, shY + 66, 2.4, k.top2, P) + circ(0, shY + 84, 2.4, k.top2, P) + path(`M0 ${shY + 50}V${shY + th + 8}`, 'none', S(1.3));
    if (k.kind === 'uniform') b += path(`M-13 ${shY} L-3 ${shY + 13} L0 ${shY + 5} L3 ${shY + 13} L13 ${shY}Z`, k.top2, P) + path(`M-3 ${shY + 9} H3 L5 ${shY + 56} L0 ${shY + 64} L-5 ${shY + 56}Z`, k.tie, P)
      + rect(-tw / 2 + 8, shY + 30, 20, 20, k.top2, 3, P) + path(`M${tw / 2 - 26} ${shY + 28} h14 v10 q-7 9 -14 0z`, '#e6b93c', P) + rect(tw / 2 - 29, shY + 54, 20, 7, '#1b2238', 2, P);
    if (k.kind === 'hoodie') b += path(`M-6 ${shY + 6}V${shY + 30}M6 ${shY + 6}V${shY + 30}`, 'none', S(2, '#f3ede2')) + path(`M${-tw / 2 + 12} ${shY + th + 8} L${-tw / 2 + 18} ${shY + th - 20} H${tw / 2 - 18} L${tw / 2 - 12} ${shY + th + 8}`, k.top2, P);
    if (k.kind === 'cardigan') b += rect(-9, shY, 18, th + 8, '#efe6d8', 0, P) + circ(15, shY + 40, 2.2, k.top2, P) + circ(15, shY + 60, 2.2, k.top2, P) + circ(15, shY + 80, 2.2, k.top2, P);
    if (k.kind === 'dress') b += path(`M-9 ${shY} Q0 ${shY + 12} 9 ${shY}`, '#f3ede2', P);
  } else if (k.kind === 'jacket') b += path(`M0 ${shY + 10}V${shY + th + 8}`, 'none', S(1.3));
  if (k.kind === 'uniform') for (const sd of [-1, 1]) b += rect(sd > 0 ? tw / 2 - 20 : -tw / 2 - 2, shY - 3, 22, 9, '#1b2238', 3, P);
  b += rect(-7, shY - 12, 14, 15, k.skin, 3, P);
  const hd = g(`translate(0 ${hcY})`, head(k, o, rx, ry));
  let arms = '';
  for (const [sd, spec, fist] of [[-1, o.armL, o.fistL], [1, o.armR, o.fistR]]) {
    const sh = [sd * (tw / 2 - 6), shY + 13];
    let el, hn;
    if (spec && spec.to) {
      let dx = (spec.to[0] - o.x) / (s * fl) - sh[0], dy = (spec.to[1] - o.y) / s - sh[1], d = Math.hypot(dx, dy);
      const mx = U + F - 0.5;
      if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
      d = Math.max(d, Math.abs(U - F) + 0.5);
      const base = Math.atan2(dy, dx), a = Math.acos(clamp((U * U + d * d - F * F) / (2 * U * d), -1, 1)) * (spec.bend || 1);
      el = [sh[0] + U * Math.cos(base + a), sh[1] + U * Math.sin(base + a)];
      hn = [sh[0] + dx, sh[1] + dy];
    } else {
      const [a1, a2] = spec || [7, 0], r1 = a1 * Math.PI / 180, r2 = (a1 + a2) * Math.PI / 180;
      el = [sh[0] + sd * U * Math.sin(r1), sh[1] + U * Math.cos(r1)];
      hn = [el[0] + sd * F * Math.sin(r2), el[1] + F * Math.cos(r2)];
    }
    const rot = Math.atan2(hn[1] - el[1], hn[0] - el[0]) * 180 / Math.PI - 90;
    arms += limb([sh, el, hn], aw, k.top, 1.5) + hand(hn[0], hn[1], aw / 15, k.skin, fist, rot);
  }
  return g(`translate(${o.x} ${o.y}) scale(${fl * s} ${s})`, b + (o.armsBehindHead ? arms + hd : hd + arms));
}

// ---------- props ----------
const star = (x, y, r, fill, st = '') => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; p += (i ? 'L' : 'M') + (x + q * Math.cos(a)).toFixed(1) + ' ' + (y + q * Math.sin(a)).toFixed(1); } return path(p + 'Z', fill, st); };
const cross = (x, y, r, c = '#ff3d3d', w = 7) => path(`M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}`, 'none', S(w, c));
const check = (x, y, r, c = '#35c46a', w = 5) => path(`M${x - r} ${y} l${r * 0.7} ${r * 0.7} l${r * 1.2} ${-r * 1.4}`, 'none', S(w, c));
const lock = (x, y, s, c = '#e6b93c') => at(x, y, s, path('M-8 -4 V-12 a8 8 0 0 1 16 0 V-4', 'none', S(4, OUT)) + path('M-8 -4 V-12 a8 8 0 0 1 16 0 V-4', 'none', S(2, c)) + rect(-12, -5, 24, 20, c, 4, S(2)) + circ(0, 4, 2.6, OUT, ''));
const pawn = (x, y, s, fill = '#2a2230') => at(x, y, s, path('M-12 20 H12 L7 12 Q4 4 5 -3 H-5 Q-4 4 -7 12Z', fill, S(1.6)) + rect(-8, -6, 16, 5, fill, 2, S(1.6)) + circ(0, -13, 8, fill, S(1.6)));
const heart = (x, y, s, fill = '#ff5d6c') => at(x, y, s, path('M0 8 C-14 -2 -8 -12 0 -5 C8 -12 14 -2 0 8Z', fill, S(1.6)));
function badge(cx, y, str, o = {}) {
  const size = o.size || 17, w = str.length * size * 0.72 + 34, h = size + 20;
  return rect(cx - w / 2, y, w, h, o.fill || '#17110e', 8, S(2.5, o.border || '#f0b534')) + text(cx, y + h / 2 + size * 0.36, str, size, o.color || '#fff', { w: 900 });
}
const card = (x, y, w, h, border, fill = '#15101f') => rect(x, y, w, h, fill, 12, S(3, border));
function bar(x, y, w, k, color) { return rect(x, y, w, 9, '#2a2338', 4, S(1.5, '#000')) + rect(x, y, Math.max(2, w * k), 9, color, 4, ''); }
function door(x, y, w, h, col, o = {}) {
  const dk = o.dark || '#4a2e1f';
  return rect(x - 10, y - 10, w + 20, h + 10, dk, 2) + rect(x, y, w, h, col, 2) + rect(x + w * 0.14, y + h * 0.07, w * 0.72, h * 0.36, 'none', 4, S(2.5, dk)) + rect(x + w * 0.14, y + h * 0.5, w * 0.72, h * 0.42, 'none', 4, S(2.5, dk))
    + circ(o.handleLeft ? x + 18 : x + w - 18, y + h * 0.5, 8, '#d6b24a');
}
function lamp(x, y) { return line(x, 0, x, y) + ell(x, y + 40, 120, 90, 'url(#glow)', '') + path(`M${x - 34} ${y + 26} L${x - 18} ${y} H${x + 18} L${x + 34} ${y + 26}Z`, '#d98c3f'); }
function nightView(x, y, w, h, seed = 1, o = {}) {
  let v = `<rect width="${w}" height="${h}" fill="url(#sky)"/>` + circ(w * 0.8, h * 0.16, 13, '#e9e4c9', '');
  for (let i = 0; i < 5; i++) {
    const bw = w / 5 + 6, bh = h * (0.35 + 0.4 * rnd(seed + i)), bx = i * w / 5 - 3;
    v += rect(bx, h * 0.86 - bh, bw, bh, '#161c33', 0, '');
    for (let r = 0; r < bh / 22 - 1; r++) for (let c = 0; c < 3; c++) if (rnd(seed * 7 + i * 31 + r * 5 + c) > 0.55) v += rect(bx + 8 + c * (bw - 16) / 3, h * 0.86 - bh + 10 + r * 22, 9, 11, '#e9c96a', 0, '');
  }
  v += rect(0, h * 0.86, w, h * 0.14, '#1d2238', 0, '') + (o.inner || '');
  return clipBox(x, y, w, h, v) + rect(x, y, w, h, 'none', 0, S(9, '#e8e1d2')) + rect(x, y, w, h, 'none', 0, S(3)) + (o.bars === false ? '' : line(x + w / 2, y, x + w / 2, y + h, S(7, '#e8e1d2')) + line(x, y + h * 0.36, x + w, y + h * 0.36, S(7, '#e8e1d2')));
}
const clock = (x, y, r, hh, mm) => circ(x, y, r, '#f2ecdf') + line(x, y, x + r * 0.5 * Math.sin(hh / 12 * 2 * Math.PI), y - r * 0.5 * Math.cos(hh / 12 * 2 * Math.PI), S(3)) + line(x, y, x + r * 0.75 * Math.sin(mm / 60 * 2 * Math.PI), y - r * 0.75 * Math.cos(mm / 60 * 2 * Math.PI), S(2));
function room(o) {
  const fy = o.floorY || 640;
  return rect(0, 0, W, H, `url(#${o.wall || 'wpA'})`, 0, '') + rect(0, fy, W, H - fy, o.floor || 'url(#wood)', 0, '') + rect(-5, fy - 12, W + 10, 16, o.base || '#6b4a35', 0, S(2.5));
}
function bubble(x, y, str, mine, size = 15) {
  const w = str.length * size * 0.56 + 24, h = size + 17, bx = mine ? x - w : x;
  return rect(bx, y, w, h, mine ? '#c5eab0' : '#fff', 11, S(1.8)) + text(bx + 12, y + h / 2 + size * 0.35, str, size, '#1d1a22', { a: 'start', w: 800 });
}
function cracks(x, y, k) {
  let c = '';
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.3, len = (46 + 50 * rnd(i)) * k, mx = x + Math.cos(a) * len * 0.5 + 8 * rnd(i + 9), my = y + Math.sin(a) * len * 0.5 - 8 * rnd(i + 4);
    c += path(`M${x} ${y} L${mx.toFixed(1)} ${my.toFixed(1)} L${(x + Math.cos(a + 0.15) * len).toFixed(1)} ${(y + Math.sin(a + 0.15) * len).toFixed(1)}`, 'none', S(2.6, '#2a160d'));
  }
  return c + circ(x, y, 15 * k, '#5a3622', S(2.5, '#2a160d'));
}
// Open palm facing the viewer, fingers up; origin at the palm centre.
function palm(x, y, s, skin, sleeve) {
  let p = rect(-34, 42, 68, 120, sleeve, 10, P) + rect(-37, 34, 74, 18, '#f1ede6', 6, P);
  [8, 0, 3, 13].forEach((dy, i) => { p += rect(-31 + i * 15.6, -74 + dy, 14, 56, skin, 7, P); });
  p += g('rotate(28 30 10)', rect(24, -14, 15, 44, skin, 7, P)) + rect(-31, -30, 62, 76, skin, 18, P) + path('M-18 6 Q0 16 18 2', 'none', S(1.4));
  return at(x, y, s, p);
}
