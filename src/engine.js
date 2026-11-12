// Time-driven renderer: frame(t) rebuilds the whole SVG, so any frame can be rendered in isolation.
const stage = document.getElementById('stage');

// Group caption words into short chunks, like the word-by-word captions of the reference style.
const CHUNKS = (() => {
  const out = [];
  for (const sc of TIMELINE.scenes) for (const ln of sc.lines) {
    let cur = null;
    ln.words.forEach((w, i) => {
      const len = cur ? cur.words.reduce((n, x) => n + x.text.length + 1, 0) : 0;
      if (!cur || cur.words.length >= 3 || len + w.text.length > 21 || cur.brk) {
        cur = { words: [], start: w.t0, lineEnd: ln.end };
        out.push(cur);
      }
      cur.words.push(w);
      cur.brk = /[,.:?!—»]$/.test(w.text) && i < ln.words.length - 1;
    });
  }
  out.forEach((c, i) => {
    const next = out[i + 1];
    c.end = next && next.start - c.lineEnd < 0.7 ? next.start : c.lineEnd + 0.35;
  });
  return out;
})();

function captions(t) {
  const c = CHUNKS.find(c => t >= c.start - 0.04 && t < c.end);
  if (!c) return '';
  const total = c.words.reduce((n, w) => n + w.text.length, 0);
  let rows = [c.words];
  if (total > 12 && c.words.length > 1) {
    let best = 1, bestDiff = 1e9;
    for (let i = 1; i < c.words.length; i++) {
      const a = c.words.slice(0, i).reduce((n, w) => n + w.text.length, 0);
      if (Math.abs(total - 2 * a) < bestDiff) { bestDiff = Math.abs(total - 2 * a); best = i; }
    }
    rows = [c.words.slice(0, best), c.words.slice(best)];
  }
  const size = 37, lh = 42, y0 = 650 - (rows.length - 1) * lh / 2;
  const k = 0.9 + 0.1 * eout(clamp((t - c.start + 0.04) / 0.12));
  const row = (ws, y, shadow) => {
    const spans = ws.map(w => {
      const fill = shadow ? '#120d0b' : t < w.t0 ? '#8e9dbd' : w.hl ? '#ff3d3d' : '#fff';
      return '<tspan fill="' + fill + '">' + w.text.replace(/</g, '&lt;').toUpperCase() + '</tspan>';
    }).join(' ');
    return '<text x="288" y="' + y + '" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="' + size
      + '" letter-spacing="-0.4" stroke="#120d0b" stroke-width="' + (shadow ? 10 : 8) + '" stroke-linejoin="round" paint-order="stroke"'
      + (shadow ? ' opacity=".85"' : '') + '>' + spans + '</text>';
  };
  const body = rows.map((r, i) => row(r, y0 + i * lh + 5, true) + row(r, y0 + i * lh, false)).join('');
  return '<g transform="translate(288 650) scale(' + k + ') translate(-288 -650)">' + body + '</g>';
}

function frame(t) {
  const sc = TIMELINE.scenes.find(s => t < s.end) || TIMELINE.scenes.at(-1);
  const lt = Math.max(0, t - sc.start), d = sc.end - sc.start;
  const ctx = { t: lt, d, cue: sc.cue, L: sc.lines.map(l => l.start - sc.start), E: sc.lines.map(l => l.end - sc.start) };
  // Every cut lands with a small zoom punch and a short fade, then drifts slowly inward.
  const z = 1 + 0.035 * lt / d + 0.06 * (1 - eout(clamp(lt / 0.3)));
  const fade = 1 - clamp(lt / 0.13);
  stage.innerHTML = DEFS
    + '<rect width="576" height="1024" fill="#0b0a12"/>'
    + '<g transform="translate(288 512) scale(' + z + ') translate(-288 -512)">' + SCENES[sc.id](ctx) + '</g>'
    + '<rect width="576" height="1024" fill="url(#vig)"/>'
    + (fade > 0 ? '<rect width="576" height="1024" fill="#000" opacity="' + fade * 0.9 + '"/>' : '')
    + captions(t);
}
window.frame = frame;
window.ready = Promise.all(['800 20px Montserrat', '900 20px Montserrat', '700 20px Caveat'].flatMap(f => [document.fonts.load(f, 'Жж'), document.fonts.load(f, 'Aa')]));
// Opened directly in a browser, the page simply plays in real time.
if (!navigator.webdriver) window.ready.then(() => {
  const t0 = performance.now();
  (function tick() { frame(((performance.now() - t0) / 1000) % TIMELINE.duration); requestAnimationFrame(tick); })();
});
