// One function per scene of story/script.json. Each receives {t, d, L, E, cue}: seconds since the scene
// started, its duration, start/end times of its narration lines, and named sound-effect cue times.
const SCENES = {};
const D = LOOK.dad, RED = '#ff3d3d', GOLD = '#f0b534', GREEN = '#35c46a';
const boom = (x, y, str, size, k, rot = 0, fill = '#fff') => (k <= 0 ? '' : at(x, y, k, text(0, 0, str, size, fill, { w: 900, extra: `stroke="${OUT}" stroke-width="${size * 0.22}" paint-order="stroke" stroke-linejoin="round"` }), rot));
const dim = o => rect(-60, -60, W + 120, H + 120, '#0b0814', 0, `opacity="${o}"`);
const uiBg = (fill = 'url(#ui)') => rect(0, 0, W, H, fill, 0, '') + rect(0, 0, W, H, 'url(#grid)', 0, '');
const ruleBadge = (t, n, y = 70) => at(288, y, pop(t, 0.05), badge(0, -20, 'ПРАВИЛО ' + n, { size: 20 }));

const hall = (fy = 660) => room({ wall: 'wpB', floor: 'url(#lino)', floorY: fy });
const kids = (fy = 640) => room({ wall: 'wpK', floorY: fy, base: '#1f2748' }) + nightView(336, 110, 200, 250, 3)
  + rect(-10, 470, 270, 180, '#7c5aa6', 14) + rect(-10, 436, 124, 64, '#f1e9e4', 18) + rect(-10, 566, 270, 84, '#5b3f80', 6)
  + ell(320, 830, 250, 82, '#a8434a') + ell(320, 830, 196, 56, 'none', S(3, '#d98c3f'))
  + rect(482, 668, 46, 46, '#e3a93a', 6) + text(505, 702, 'А', 26, '#a8434a', { w: 900 }) + circ(60, 730, 20, '#d96b7d');
const kitchen = (fy = 660) => room({ wall: 'wpA', floor: 'url(#lino)', floorY: fy }) + rect(-5, 330, W + 10, fy - 342, 'url(#tiles)', 0, S(2.5))
  + rect(20, 80, 150, 180, '#d9cdb2', 4) + rect(180, 80, 150, 180, '#d9cdb2', 4) + circ(152, 175, 5, '#6b4a35') + circ(198, 175, 5, '#6b4a35')
  + clock(385, 150, 30, 9.8, 48) + rect(440, 190, 170, fy - 190, '#e9e6df', 8) + line(440, 360, 610, 360) + rect(456, 296, 8, 44, '#9aa0a8', 3) + rect(456, 384, 8, 60, '#9aa0a8', 3)
  + rect(-5, 500, 345, fy - 500, '#b79a74', 4) + rect(-10, 488, 356, 18, '#6b4a35', 3) + lamp(288, 50);
const stairwell = (x, y, w, h) => rect(x, y, w, h, '#34463b', 0) + rect(x, y + h * 0.55, w, h * 0.45, '#2a3930', 0, '')
  + path(`M${x} ${y + h * 0.55} h${w * 0.25} v-30 h${w * 0.25} v-30 h${w * 0.25} v-30 h${w * 0.25}`, 'none', S(3, '#1d2a22'));

SCENES.hook = c => {
  const { t, L, cue } = c, hit = cue.slam, k = seg(t, hit - 0.14, hit, x => x * x);
  const fist = [lerp(380, 312, k), lerp(170, 356, k)], [sx, sy] = shake(t, hit, 0.5, 11);
  const z = seg(t, L[2] - 0.2, L[2] + 0.3);
  const b = hall(650) + door(40, 90, 280, 572, '#7b4f33') + rect(120, 150, 110, 30, '#e8e1d2', 4, S(2)) + text(175, 171, 'ДЕТСКАЯ', 14, '#4a2e1f', { w: 900 })
    + (t > hit ? cracks(300, 356, seg(t, hit, hit + 0.12)) : '')
    + person({ look: LOOK.tim, x: 150, y: 1040, s: 3, expr: 'scared', gaze: t < hit ? [0.7, -0.6] : [0.9, -0.1] })
    + person({ look: D, x: 445, y: 1300, s: 3.6, back: true, armsBehindHead: true, armL: { to: fist, bend: 1 }, fistL: true, armR: [9, 6], fistR: true });
  return cam(lerp(288, 215, z) + sx, lerp(512, 420, z) + sy, lerp(1, 1.45, z), b);
};

SCENES.best = c => {
  const { t, L } = c;
  let b = rect(0, 0, W, H, 'url(#wpS)', 0, '') + rect(-5, 480, W + 10, 190, '#7d9a7c', 0, S(2.5)) + rect(0, 664, W, H - 664, 'url(#lino)', 0, '');
  b += rect(60, 120, 456, 250, '#8a5a3a', 8) + rect(74, 160, 428, 198, '#e9dfc8', 4) + text(288, 150, 'ДОСКА ПОЧЁТА', 19, '#f4d77a', { w: 900 });
  for (let i = 0; i < 8; i++) {
    const px = 92 + (i % 4) * 104, py = 170 + Math.floor(i / 4) * 92;
    b += rect(px, py, 80, 82, '#cfc3a8', 3, S(2)) + rect(px + 20, py + 50, 40, 32, ['#5e8e75', '#9a78d0', '#4c5763', '#b4663a'][i % 4], 8, S(2)) + circ(px + 40, py + 34, 16, ['#f0c5a6', '#e6b594', '#efc4a8'][i % 3], S(2));
  }
  b += person({ look: D, x: 288, y: 1230, s: 3.1, expr: 'grin', armL: { to: [120, 720], bend: 1 }, armR: { to: [456, 716], bend: -1 } });
  b += g('rotate(-7 105 700)', rect(48, 652, 124, 92, '#f6f0df', 4) + rect(58, 662, 104, 72, 'none', 2, S(2, GOLD)) + text(110, 692, 'ГРАМОТА', 13, '#8f2f3a', { w: 900 }) + circ(110, 716, 9, '#d8303c', S(2)));
  for (let i = 0; i < 5; i++) b += line(462, 730, 430 + i * 16, 640, S(4, '#3f7d4f')) + circ(428 + i * 17, 628 - (i % 2) * 14, 15, ['#e85d75', '#f0b534', '#f3ede2'][i % 3], S(2.5));
  b += rect(128, 26, 320, 76, '#17110e', 10, S(2.5, GOLD)) + text(288, 58, 'УЧИТЕЛЬ ГОДА', 22, '#fff', { w: 900 });
  for (let i = 0; i < 5; i++) b += star(196 + i * 17, 80, 7, GOLD);
  b += text(290, 85, '«золотой человек»', 12, '#d9cdb2', { a: 'start' });
  b += at(288, 250, pop(t, L[1]), rect(-158, -40, 316, 80, '#2b2118', 8, S(3, '#e6b93c')) + text(0, -6, 'ДИРЕКТОР ШКОЛЫ № 7', 19, '#f4d77a', { w: 900 }) + text(0, 20, 'ГРОМОВ АРТУР СЕРГЕЕВИЧ', 13, '#fff'));
  for (let i = 0; i < 8; i++) {
    const k = clamp((t - L[1] - 0.25 - i * 0.14) / 1.6);
    if (k > 0 && k < 1) b += op(1 - k, heart(i % 2 ? 500 - rnd(i) * 70 : 70 + rnd(i) * 70, lerp(600, 380, k), 1.6 + rnd(i + 3)));
  }
  return b;
};

SCENES.car = c => {
  const { t, L, cue } = c, k = seg(t, 0.15, L[1] - 0.4, eout), cx = lerp(520, 150, k);
  const j = shake(t, cue.door1, 0.2, 4)[0] + shake(t, cue.door2, 0.2, 4)[0];
  const car = g(`translate(${cx + j} 316)`, path('M-4 42 L-210 14 L-210 86Z', '#ffe9a8', 'opacity=".28"') + path('M34 24 L52 0 H112 L132 24Z', '#31405f', S(2.5)) + rect(0, 22, 170, 38, '#3e5078', 10, S(2.5))
    + rect(58, 6, 22, 16, '#9fc3e6', 2, S(2)) + rect(86, 6, 22, 16, '#9fc3e6', 2, S(2)) + circ(36, 62, 13, '#15151a', S(2.5)) + circ(134, 62, 13, '#15151a', S(2.5)) + circ(5, 40, 5, '#ffe9a8', S(1.5)));
  const yard = line(400, 150, 400, 380, S(5, '#0e1222')) + ell(400, 160, 60, 46, 'url(#glow)', '') + circ(400, 150, 8, '#ffe9a8', '') + car;
  let b = rect(0, 0, W, H, '#20263f', 0, '') + nightView(60, 130, 456, 440, 5, { inner: yard })
    + rect(28, 574, 520, 28, '#e8e1d2', 4) + rect(104, 650, 368, 260, '#cfc7b8', 12);
  for (let i = 1; i < 9; i++) b += line(104 + i * 41, 662, 104 + i * 41, 900, S(2.5, '#a8a092'));
  b += rect(96, 530, 46, 44, '#b4663a', 4) + ell(104, 506, 12, 30, '#3f7d4f') + ell(132, 500, 12, 34, '#4c9160') + rect(436, 540, 36, 34, '#d96b7d', 6);
  b += limb([[-40, 760], [20, 660], [78, 596]], 54, LOOK.tim.top) + hand(84, 590, 3.3, LOOK.tim.skin, false, -55);
  b += badge(288, 44, '19:40', { border: RED, size: 26 });
  b += boom(60 + cx + 40, 392, 'ХЛОП!', 34, pop(t, cue.door1), -8) + boom(60 + cx + 150, 366, 'ХЛОП!', 34, pop(t, cue.door2), 7, RED);
  return b;
};

SCENES.room = c => {
  const { t, d } = c, x = lerp(470, 200, t / d), bob = Math.abs(Math.sin(t * 8)) * 6, hp = [x + 96, 772 - bob];
  return kids(640)
    + person({ look: LOOK.sonya, x: x + 178, y: 968 - bob * 0.6, s: 2.3, gaze: [-0.8, 0.1], armL: { to: hp, bend: -1 }, armR: [6, 4] })
    + person({ look: LOOK.tim, x, y: 965 - bob, s: 2.3, expr: 'scared', gaze: [0.7, 0.2], armR: { to: hp, bend: -1 }, armL: [8, 6] });
};

const doorwayDad = expr => hall(660) + stairwell(150, 120, 276, 540) + rect(142, 112, 292, 548, 'none', 0, S(14, '#4a2e1f'))
  + path('M434 112 L540 150 V720 L434 664Z', '#7b4f33') + circ(520, 430, 8, '#d6b24a')
  + rect(14, 250, 104, 12, '#4a2e1f', 4) + path('M30 262 h40 l8 150 h-56z', '#3d4a66') + path('M76 262 h34 l6 110 h-46z', '#a8434a')
  + person({ look: D, x: 288, y: 1040, s: 2.6, expr, armL: [4, 2], armR: [4, 2], fistR: true })
  + rect(352, 760, 96, 66, '#5a3a26', 7) + rect(380, 746, 40, 16, 'none', 6, S(4)) + rect(390, 786, 20, 10, '#d6b24a', 2, S(2));

SCENES.twice = c => {
  const k = seg(c.t, 0, c.d);
  return cam(288, lerp(512, 440, k), lerp(1, 1.28, k), doorwayDad('cold')) + at(288, 60, pop(c.t, 0.15), badge(0, -20, 'СЕГОДНЯ — ДВАЖДЫ', { border: RED, size: 20 }));
};

SCENES.quiet = c => {
  const { t, L, E } = c;
  if (t < L[1] - 0.1) return cam(288, 365, 2.25, doorwayDad('smile'));
  if (t < L[2] - 0.1) {
    const k = seg(t, L[1] + 0.25, L[1] + 0.85), th = lerp(180, 90, k) * Math.PI / 180, hx = 441 + 74 * Math.cos(th), hy = 415 + 74 * Math.sin(th);
    return rect(0, 0, W, H, 'url(#wpA)', 0, '') + nightView(40, 60, 400, 720, 9, { bars: false }) + rect(40, 60, 400, 720, 'none', 0, S(30, '#e8e1d2')) + rect(25, 45, 430, 750, 'none', 0, S(3))
      + rect(428, 378, 26, 74, '#cfc7b8', 7) + limb([[441, 415], [hx, hy]], 15, '#bdb5a6', 2.5)
      + limb([[640, 720], [590, 540], [hx + 6, hy + 8]], 62, D.top) + hand(hx + 2, hy + 4, 3.5, D.skin, true, 60)
      + boom(300, 300, 'ЩЁЛК', 40, pop(t, L[1] + 0.85), -6);
  }
  const k = seg(t, L[2] + 0.15, E[2], x => x), vol = Math.round(lerp(12, 47, k));
  let b = rect(0, 0, W, H, 'url(#wpA)', 0, '') + rect(0, 620, W, H - 620, 'url(#wood)', 0, '') + rect(-5, 608, W + 10, 16, '#6b4a35', 0, S(2.5))
    + rect(50, 520, 476, 120, '#6b4a35', 6) + rect(70, 540, 200, 80, 'none', 4, S(2.5, '#4a2e1f')) + rect(306, 540, 200, 80, 'none', 4, S(2.5, '#4a2e1f'))
    + rect(64, 150, 448, 340, '#1c1c22', 16) + rect(84, 170, 408, 286, '#3b6ea5', 6) + rect(250, 490, 76, 32, '#1c1c22', 4)
    + rect(84, 380, 408, 76, '#2a4f7a', 0, '') + circ(210, 318, 34, '#f0c5a6', S(2.5)) + rect(166, 352, 88, 104, '#8f2f3a', 16, S(2.5)) + circ(366, 318, 34, '#e6b594', S(2.5)) + rect(322, 352, 88, 104, '#31405f', 16, S(2.5))
    + rect(112, 392, 352, 48, '#000', 8, 'opacity=".65"') + text(128, 412, 'ГРОМКОСТЬ', 12, '#fff', { a: 'start', w: 900 }) + text(448, 414, String(vol), 16, k > 0.6 ? RED : '#fff', { a: 'end', w: 900 }) + bar(128, 422, 320, vol / 50, k > 0.6 ? RED : GOLD);
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {
    const r = 40 + i * 26 + (t * 40) % 26, x0 = sd > 0 ? 512 : 64;
    b += op(k * (1 - i / 3.5), path(`M${x0 + sd * r * 0.5} ${320 - r} A${r} ${r} 0 0 ${sd > 0 ? 1 : 0} ${x0 + sd * r * 0.5} ${320 + r}`, 'none', S(5, k > 0.6 ? RED : GOLD)));
  }
  return b + rect(0, 0, W, H, '#c22f38', 0, `opacity="${k * 0.14}"`);
};

SCENES.rule1 = c => {
  const { t, L } = c, st = S(2.5);
  let b = uiBg() + ruleBadge(t, 1, 150);
  b += at(150, 300, pop(t, L[1]), card(-116, -86, 232, 172, GOLD) + text(0, -54, 'КРИК', 22, GOLD, { w: 900 })
    + circ(-24, -2, 27, '#f0c5a6', st) + circ(-33, -8, 4, OUT, '') + circ(-15, -8, 4, OUT, '') + ell(-24, 9, 7, 9, '#3a1a1a', st)
    + path('M18 -18 a22 22 0 0 1 0 34 M34 -30 a38 38 0 0 1 0 58', 'none', S(4, GOLD))
    + text(-96, 52, 'ОПАСНОСТЬ', 9, '#b9b3c9', { a: 'start' }) + bar(-96, 60, 192, 0.35 * seg(t, L[1] + 0.2, L[1] + 0.7), GOLD));
  b += at(426, 300, pop(t, L[2]), card(-116, -86, 232, 172, RED, '#2a0f16') + text(0, -54, 'ТИШИНА', 22, RED, { w: 900 })
    + rect(-52, -30, 42, 62, '#7b4f33', 3, st) + circ(-20, 2, 3.5, '#d6b24a', '') + path('M14 -8 h10 l14 -12 v44 l-14 -12 h-10z', '#d9d4e6', st) + cross(56, 2, 8, RED, 4)
    + text(-96, 52, 'ОПАСНОСТЬ', 9, '#b9b3c9', { a: 'start' }) + bar(-96, 60, 192, 0.97 * seg(t, L[2] + 0.2, L[2] + 0.8), RED));
  b += at(150, 478, pop(t, L[3]), card(-116, -70, 232, 140, RED, '#1d1220') + rect(-30, -56, 60, 56, '#27335a', 3, st) + line(0, -56, 0, 0, st) + lock(0, -26, 0.9)
    + text(0, 26, 'ОКНА ЗАКРЫТЫ', 15, '#fff', { w: 900 }) + text(0, 46, 'соседи не услышат', 11, '#b9b3c9'));
  b += at(426, 478, pop(t, L[3] + 1.0), card(-116, -70, 232, 140, RED, '#1d1220') + rect(-40, -56, 80, 50, '#1c1c22', 6, st) + rect(-33, -50, 66, 38, '#3b6ea5', 3, '')
    + path('M-22 -24 h44 M-22 -24 h34', 'none', S(5, GOLD)) + text(0, 26, 'ТЕЛЕВИЗОР ГРОМЧЕ', 14, '#fff', { w: 900 }) + text(0, 46, 'крик не слышно', 11, '#b9b3c9'));
  const s4 = pop(t, L[4]);
  if (s4 > 0) b += circ(288, 385, 90 + 30 * Math.sin(t * 9), 'url(#redglow)', '') + at(288, 385, s4, path('M-22 14 V-4 a22 22 0 0 1 44 0 V14Z', '#ff3d3d', st) + rect(-30, 14, 60, 12, '#8f2f3a', 4, st) + badge(0, 34, 'СИГНАЛ', { border: RED, fill: '#e23842', size: 18 }));
  return b;
};

SCENES.phone = c => {
  const { t, L, E } = c;
  if (t < L[2] - 0.1) {
    const k = seg(t, L[0] + 0.1, L[0] + 0.6, eout);
    return rect(0, 0, W, H, 'url(#wpA)', 0, '') + rect(0, 660, W, H - 660, 'url(#wood)', 0, '') + rect(-5, 648, W + 10, 16, '#6b4a35', 0, S(2.5))
      + rect(36, 110, 150, 190, '#8a5a3a', 4) + rect(50, 124, 122, 162, '#9fb7a0', 2) + lamp(420, 60)
      + person({ look: D, x: 288, y: 1190, s: 3, expr: 'cold', gaze: [0, 0.4], armL: [5, 3], armR: [5, 3] })
      + palm(300, lerp(1260, 700, k), 3, D.skin, D.top);
  }
  if (t < L[3] - 0.1) {
    const msgs = [['ты как?', 0], ['он опять хлопнул дважды', 1], ['приходи к нам ночевать', 0], ['не отпустит', 1], ['скажи кому-нибудь!!', 0], ['кому? его все любят', 1], ['удали переписку', 0]];
    const scroll = lerp(0, -120, seg(t, L[2], E[2]));
    const chat = g(`translate(0 ${scroll})`, msgs.map(([m, mine], i) => bubble(mine ? 264 : 12, 14 + i * 48, m, mine, 13)).join(''));
    return rect(0, 0, W, H, D.top, 0, '') + path('M150 -20 L288 330 L426 -20Z', '#f1ede6') + path('M262 -20 H314 L326 250 L288 320 L250 250Z', D.tie)
      + rect(90, 520, 400, 620, D.skin, 90) + rect(132, 80, 312, 560, '#16161c', 30) + rect(146, 96, 284, 528, '#e9eef5', 18, '')
      + rect(146, 96, 284, 58, '#5b53c9', 0, '') + circ(178, 125, 15, '#f0b534', S(2)) + text(204, 131, 'Лёха', 17, '#fff', { a: 'start', w: 900 })
      + clipBox(146, 154, 284, 470, chat)
      + [0, 1, 2, 3].map(i => rect(428, 250 + i * 62, 44, 50, D.skin, 18)).join('') + g('rotate(-24 120 470)', rect(96, 440, 78, 44, D.skin, 20));
  }
  const k = seg(t, L[3] + 0.3, L[3] + 0.9), up = seg(t, L[4], L[4] + 0.5), py = lerp(60, 128, k);
  return rect(0, 0, W, H, 'url(#wpA)', 0, '') + rect(0, 720, W, H - 720, 'url(#wood)', 0, '') + rect(-5, 708, W + 10, 16, '#6b4a35', 0, S(2.5))
    + rect(300, 150, 256, 570, '#6b4a35', 4) + line(428, 160, 428, 710) + circ(412, 440, 7, '#d6b24a') + circ(444, 440, 7, '#d6b24a') + rect(290, 138, 276, 18, '#4a2e1f', 3)
    + rect(372, py - 6, 84, 15, '#16161c', 5) + op(1 - seg(t, L[3] + 0.9, L[3] + 1.3), limb([[640, 20], [540, py - 60], [470, py - 12]], 50, D.top) + hand(462, py - 10, 3, D.skin, false, 60))
    + person({ look: LOOK.tim, x: 160, y: 1030, s: 2.5, back: true, armR: { to: [lerp(230, 262, up), lerp(760, 370, up)], bend: -1 }, armL: [6, 4] })
    + op(seg(t, L[4] + 0.4, L[4] + 0.7), line(268, 340, 380, 140, S(4, RED) + ' stroke-dasharray="9 9"')) + at(200, 250, pop(t, L[4] + 0.5), badge(0, -20, 'НЕ ДОСТАТЬ', { border: RED, size: 17 }));
};

SCENES.rule2 = c => {
  const { t, L } = c, wall = S(6, '#e8e4da'), lab = (x, y, s) => text(x, y, s, 13, '#e8e4da', { w: 900 });
  const kK = seg(t, L[2] + 0.55, L[2] + 0.9), kB = seg(t, L[2] + 1.35, L[2] + 1.7), red = (x, y, w, h, k) => rect(x, y, w, h, '#c22f38', 0, `opacity="${k * 0.85}"`);
  let b = uiBg('#131a2a') + ruleBadge(t, 2, 62);
  b += rect(60, 130, 270, 180, '#2c302b', 0, '') + rect(60, 310, 150, 110, '#243540', 0, '') + rect(60, 420, 150, 150, '#2c302b', 0, '') + rect(210, 310, 120, 260, '#2a2622', 0, '') + rect(330, 130, 186, 440, '#27335a', 0, '');
  b += red(60, 420, 150, 150, kK) + red(60, 310, 150, 110, kB);
  b += rect(84, 150, 110, 44, 'none', 8, S(2, '#59604f')) + rect(78, 330, 96, 46, 'none', 20, S(2, '#52707f')) + circ(120, 500, 30, 'none', S(2, '#59604f')) + rect(420, 150, 76, 120, 'none', 8, S(2, '#4b5a96'));
  b += rect(60, 130, 456, 440, 'none', 0, wall) + path('M60 310H236M296 310H330M330 130V396M330 462V570M210 310V342M210 388V466M210 522V570M60 420H210', 'none', wall)
    + line(238, 570, 302, 570, S(8, '#131a2a')) + path('M120 130H250M516 210V340M60 462V532', 'none', S(6, '#7fc4f0'));
  b += lab(195, 262, 'ЗАЛ') + lab(135, 400, 'ВАННАЯ') + lab(135, 556, 'КУХНЯ') + lab(270, 392, 'КОРИДОР') + lab(423, 540, 'ДЕТСКАЯ') + lock(270, 590, 1);
  if (t > L[1]) {
    const r = (t * 26) % 30;
    b += op(1 - r / 30, circ(195, 215, 12 + r, 'none', S(3, RED))) + circ(195, 215, 11, RED, S(3, '#fff')) + text(195, 190, 'ОН', 11, RED, { w: 900 });
  }
  b += at(135, 485, pop(t, L[2] + 0.6), cross(0, 0, 20, '#fff', 6)) + at(135, 364, pop(t, L[2] + 1.4), cross(0, 0, 15, '#fff', 6));
  for (let i = 0; i < 3; i++) b += at(92 + i * 24, 456, pop(t, L[3] + i * 0.12), g('rotate(-28)', path('M-3 0 L0 -24 L4 0Z', '#e8e4da', S(1.5)) + rect(-3, 0, 7, 13, '#2a2230', 2, S(1.5))));
  b += op(seg(t, L[3] + 1.0, L[3] + 1.3), text(135, 332, '1 ВЫХОД · НЕТ ОКНА', 9.5, '#fff', { w: 900 }));
  const pts = [[270, 500], [270, 430], [400, 430], [430, 330]], k = seg(t, L[4], L[4] + 1.3) * 3, i = Math.min(2, Math.floor(k)), f = k - i;
  const cur = [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
  if (t > L[4]) b += `<polyline points="${pts.slice(0, i + 1).concat([cur]).map(p => p.join(',')).join(' ')}" fill="none" ${S(5, GREEN)} stroke-dasharray="9 9"/>`;
  if (t > L[1]) b += circ(cur[0], cur[1], 10, GOLD, S(3, '#fff')) + (t < L[4] ? text(270, 532, 'ТЫ', 11, GOLD, { w: 900 }) : '');
  b += at(440, 250, pop(t, L[4] + 1.2), circ(0, 0, 19, GREEN, S(3, '#fff')) + check(-3, 2, 7, '#fff', 4.5)) + op(seg(t, L[4] + 1.0, L[4] + 1.4), text(516, 114, 'ОКНО: КРИЧАТЬ, ЗВАТЬ', 11, GREEN, { a: 'end', w: 900 }));
  return b;
};

SCENES.kitchen = c => {
  const { t, L, E } = c;
  const table = rect(-20, 772, 620, 300, 'url(#cloth)', 0, S(3)) + ell(120, 830, 62, 20, '#f3ede2') + ell(120, 828, 40, 11, '#d9cdb2', S(2)) + ell(470, 840, 62, 20, '#f3ede2') + rect(280, 800, 36, 40, '#31405f', 6);
  if (t < L[1] - 0.1) {
    const k = seg(t, L[0] + 0.3, E[0] + 0.1), y = lerp(1360, 1190, k);
    return kitchen(660) + person({ look: D, x: 300, y, s: 3, expr: 'angry', gaze: [0, 0.3], armL: { to: [150, 770], bend: 1 }, armR: { to: [450, 770], bend: -1 }, fistL: true, fistR: true }) + table;
  }
  const z = seg(t, L[1], E[2]);
  return cam(lerp(288, 260, z), lerp(512, 480, z), lerp(1, 1.12, z), kitchen(660) + person({ look: D, x: 455, y: 1110, s: 2.2, expr: 'angry', gaze: [-0.6, 0.2], fistL: true, fistR: true }) + dim(0.42)
    + person({ look: LOOK.mom, x: 200, y: 1500, s: 4.2, expr: t > L[2] ? 'surprised' : 'scared', gaze: [0.2, 0.3], armL: { to: [170, 905], bend: 1 }, armR: { to: [235, 905], bend: -1 } }));
};

SCENES.rule3 = c => {
  const { t, L, d } = c;
  if (t < L[3] - 0.1) {
    const z = seg(t, L[2], L[2] + 1.2), fy = 300 + Math.sin(t * 5) * 6;
    let b = kitchen(640);
    [[190, 930, 20], [250, 905, -30], [300, 950, 50], [215, 965, 80]].forEach(([x, y, r]) => { b += g(`rotate(${r} ${x} ${y})`, path(`M${x - 16} ${y} L${x} ${y - 9} L${x + 17} ${y + 3} L${x - 2} ${y + 8}Z`, '#f3ede2', S(2))); });
    b += at(376, 900, pop(t, L[1]), ell(0, 0, 46, 17, '#c22f38', S(3, RED) + ' fill-opacity=".35"') + cross(0, 0, 11, RED, 6));
    b += person({ look: LOOK.tim, x: 84, y: 965, s: 2.05, expr: 'scared', gaze: [0.9, -0.2] })
      + person({ look: LOOK.mom, x: 270, y: 965, s: 2.05, expr: 'scared', gaze: [0.8, -0.4], armL: { to: [282, 520], bend: 1 }, armR: { to: [330, 545], bend: 1 } })
      + person({ look: D, x: 476, y: 965, s: 2.05, expr: 'angry', gaze: [-0.8, 0.2], armR: { to: [552, fy + 40], bend: -1 }, fistR: true, armL: [12, 14], fistL: true });
    return cam(lerp(288, 330, z), lerp(512, 470, z), lerp(1, 1.14, z), b)
      + at(288, 62, pop(t, L[1]), rect(-190, -24, 380, 48, '#e23842', 10, S(3, '#fff')) + cross(-160, 0, 9, '#fff', 5) + text(14, 7, 'НЕ ВСТАВАЙ МЕЖДУ НИМИ', 19, '#fff', { w: 900 }));
  }
  const k = clamp((t - L[3]) / (d - L[3])), y = lerp(1010, 850, k), s = lerp(2.5, 1.9, k), hp = [262 + s * 44, y - s * 76];
  let b = rect(0, 0, W, H, '#3a2f28', 0, '') + path('M0 0H576L406 150H170Z', '#d8cfb8') + path('M0 0L170 150V560L0 1024Z', 'url(#wpB)') + path('M576 0L406 150V560L576 1024Z', 'url(#wpB)') + path('M576 0L406 150V560L576 1024Z', '#000', 'opacity=".18"')
    + rect(170, 150, 236, 410, '#a89a78', 0) + path('M0 1024L170 560H406L576 1024Z', 'url(#lino)') + path('M110 1024L228 560H348L466 1024Z', '#a8434a')
    + path('M40 300 L120 250 V700 L40 850Z', '#7b4f33') + circ(288, 400, 150, 'url(#glow)', '') + rect(226, 214, 124, 346, '#ffe9a8', 0) + rect(226, 214, 124, 346, 'none', 0, S(10, '#4a2e1f'));
  for (let i = 0; i < 5; i++) {
    const p = ((i / 5 + t * 0.22) % 1), cy = lerp(1000, 580, p), cs = lerp(1, 0.3, p);
    b += op(0.9 - p * 0.5, at(288, cy, cs, path('M-60 26 L0 -18 L60 26', 'none', S(15, GREEN))));
  }
  b += person({ look: LOOK.sonya, x: 262 + s * 62, y: y + 4, s, back: true, armL: { to: hp, bend: -1 } }) + person({ look: LOOK.tim, x: 262, y, s, back: true, armR: { to: hp, bend: -1 } });
  return b + at(288, 56, pop(t, L[3]), badge(0, -20, 'УВЕСТИ МЛАДШУЮ', { border: GREEN, size: 18 })) + at(288, 108, pop(t, L[4]), badge(0, -20, 'ПОЗВАТЬ ПОМОЩЬ', { border: GREEN, size: 18 }));
};

SCENES.tablet = c => {
  const { t, L } = c, T = LOOK.tim;
  if (t < L[1] - 0.1) {
    const k = seg(t, L[0] + 0.9, L[0] + 1.7), r = seg(t, L[0] + 0.4, L[0] + 1.3, eout);
    return rect(0, 0, W, H, 'url(#wpK)', 0, '') + rect(-5, 300, W + 10, 760, '#7c5aa6', 0, S(3)) + path('M0 560 Q288 520 576 580', 'none', S(3, '#5b3f80'))
      + rect(196, 400, 230, 160, '#e58aa0', 16) + rect(208, 412, 206, 136, '#16161c', 8) + rect(216, 420, 190, 120, '#4a5a78', 4, '')
      + g(`rotate(${lerp(0, -42, k)} 100 350)`, rect(100, 330, 380, 250, '#f1e9e4', 50) + path('M150 380 Q290 350 430 390', 'none', S(2.5, '#cfc3b8')))
      + limb([[540, 1100], [470, 860], [lerp(470, 400, r), lerp(860, 590, r)]], 62, T.top) + hand(lerp(470, 396, r), lerp(850, 580, r), 3.8, T.skin, false, 150);
  }
  const word = 'шахматы', sent = t > L[3] + 0.6, n = sent ? 0 : Math.floor(seg(t, L[1] + 0.3, L[3] + 0.35, x => x) * word.length + 0.01);
  let b = rect(0, 0, W, H, '#7c5aa6', 0, '') + rect(-30, 720, 130, 340, T.top, 40) + rect(476, 720, 130, 340, T.top, 40)
    + rect(34, 64, 508, 850, '#e58aa0', 36) + rect(52, 84, 472, 810, '#16161c', 22) + rect(64, 98, 448, 782, '#e9eef2', 10, '')
    + rect(64, 98, 448, 62, '#3f9d6b', 0, '') + circ(100, 129, 18, '#f3ede2', S(2)) + pawn(100, 127, 0.55) + text(130, 126, 'дед Коля (кв. 12)', 18, '#fff', { a: 'start', w: 900 }) + text(130, 146, 'был недавно', 11, '#d6f0e0', { a: 'start' })
    + rect(232, 174, 112, 22, '#cfd6dd', 11, '') + text(288, 190, '12 октября', 11, '#4a4f58')
    + rect(80, 210, 318, 66, '#fff', 12, S(1.8)) + text(94, 236, 'Тимка, если что — пиши', 15, '#1d1a22', { a: 'start' }) + text(94, 260, '«шахматы». Сразу звоню 112.', 15, '#1d1a22', { a: 'start' })
    + bubble(496, 290, 'хорошо', true, 15)
    + rect(80, 480, 356, 48, '#fff', 24, S(2)) + text(102, 511, word.slice(0, n), 20, '#1d1a22', { a: 'start' })
    + (Math.floor(t * 3) % 2 && !sent ? line(104 + n * 12.6, 492, 104 + n * 12.6, 516, S(2, '#3f9d6b')) : '')
    + circ(474, 504, 24, '#3f9d6b', S(2)) + path('M464 504 H484 M476 496 L484 504 L476 512', 'none', S(3, '#fff'));
  if (sent) b += at(496, 364, pop(t, L[3] + 0.6), g('translate(0 -22)', bubble(0, 0, word, true, 20))) + op(seg(t, L[3] + 0.9, L[3] + 1.1), check(476, 410, 5, '#3f9d6b', 2.5) + check(484, 410, 5, '#3f9d6b', 2.5));
  ['йцукенгшщзх', 'фывапролджэ', 'ячсмитьбю'].forEach((row, r) => [...row].forEach((ch, i) => {
    const x = 76 + (r === 2 ? 39 : 0) + i * 39, y = 720 + r * 50, on = !sent && n > 0 && word[n - 1] === ch;
    b += rect(x, y, 34, 42, on ? '#3f9d6b' : '#fff', 6, S(1.5)) + text(x + 17, y + 27, ch, 15, on ? '#fff' : '#1d1a22');
  }));
  return b + g('rotate(18 70 800)', rect(20, 770, 110, 60, T.skin, 28)) + g('rotate(-18 506 800)', rect(446, 770, 110, 60, T.skin, 28));
};

SCENES.rule4 = c => {
  const { t, L, E } = c, ink = '#2b3a67', hw = { font: 'Caveat', w: 700, a: 'start' };
  let pg = rect(0, 0, 470, 400, '#f6f0df', 6) + rect(0, 0, 470, 400, 'url(#ruled)', 6, '') + line(52, 0, 52, 400, S(1.6, '#e0626c'));
  for (let i = 0; i < 4; i++) pg += circ(24, 50 + i * 100, 7, '#3a2a20', S(2));
  pg += text(70, 58, 'КОД-СЛОВО:', 36, ink, hw) + text(70, 132, 'ШАХМАТЫ'.slice(0, Math.floor(seg(t, L[1], E[1], x => x) * 7 + 0.01)), 50, '#d8303c', hw)
    + at(326, 110, pop(t, E[1] + 0.05), pawn(0, 0, 1.25)) + at(404, 112, pop(t, L[4] + 0.2), text(0, 20, '= 112', 48, '#d8303c', { font: 'Caveat', w: 700 }));
  [[L[2] + 0.5, 'договориться ЗАРАНЕЕ'], [L[3] + 0.4, 'слово — самое обычное'], [L[4] + 0.55, 'знает дед Коля (кв. 12)']].forEach(([ts, s], i) => {
    pg += op(seg(t, ts, ts + 0.25), check(72, 208 + i * 58, 9) + text(104, 220 + i * 58, s, 30, ink, hw));
  });
  return rect(0, 0, W, H, 'url(#wood)', 0, '') + dim(0.2) + ruleBadge(t, 4, 70) + g('translate(53 128) rotate(-2)', pg)
    + rect(420, 770, 80, 84, '#c22f38', 10) + rect(498, 790, 22, 40, 'none', 10, S(7, '#c22f38')) + ell(460, 772, 40, 10, '#3a1a12')
    + limb([[90, 900], [250, 800]], 9, GOLD, 2.5) + limb([[110, 800], [240, 880]], 9, '#3f9d6b', 2.5) + limb([[60, 840], [200, 770]], 9, '#d8303c', 2.5);
};

SCENES.wait = c => {
  const { t, L, cue } = c, [sx, sy] = shake(t, cue.crash, 0.55, 10), z = seg(t, L[2] - 0.2, L[2] + 0.5);
  const b = kids(640)
    + person({ look: LOOK.tim, x: 222, y: 842, s: 2.6, sit: true, expr: 'scared', gaze: [0.9, -0.2], armR: { to: [455, 650], bend: -1 }, armL: { to: [180, 800], bend: 1 } })
    + person({ look: LOOK.sonya, x: 372, y: 846, s: 2.6, sit: true, expr: 'scared', gaze: [0.9, -0.2] })
    + op(1 - seg(t, cue.crash + 0.9, cue.crash + 1.3), boom(430, 420, 'ГРОХ!', 46, pop(t, cue.crash), 8, RED))
    + dim(seg(t, L[1], L[1] + 0.7) * 0.34);
  return cam(lerp(288, 270, z) + sx, lerp(512, 540, z) + sy, lerp(1, 1.32, z), b);
};

SCENES.bell = c => {
  const { t, cue } = c, r = cue.ring, on = t > r && t < r + 1.25, dx = on ? Math.sin(t * 85) * 4 : 0, st = S(3);
  let b = rect(0, 0, W, H, 'url(#wpB)', 0, '') + text(288, 110, '21:58', 34, RED, { w: 900 });
  b += at(288 + dx, 340, 1, rect(-80, -160, 160, 70, '#6b4a35', 10, st) + circ(0, 0, 100, '#c9ccd2', st) + circ(0, 0, 66, '#aeb2ba', st) + circ(0, 0, 16, '#6d7078', st)
    + path('M-58 -52 A78 78 0 0 1 20 -76', 'none', S(6, '#eef0f3')) + line(40, -150, 100 + (on ? Math.sin(t * 85) * 10 : 0), -70, S(8)) + circ(100 + (on ? Math.sin(t * 85) * 10 : 0), -68, 13, '#6d7078', st));
  if (on) for (let i = 0; i < 3; i++) for (const sd of [-1, 1]) {
    const rr = 130 + i * 30 + (t * 60) % 30;
    b += op(1 - i / 3.4, path(`M${288 + sd * rr * 0.8} ${340 - rr * 0.6} A${rr} ${rr} 0 0 ${sd > 0 ? 1 : 0} ${288 + sd * rr * 0.8} ${340 + rr * 0.6}`, 'none', S(6, GOLD)));
  }
  return b + boom(288, 560, 'ДЗЫНЬ!', 66, pop(t, r), -6, GOLD);
};

const overShoulder = (expr, gaze) => hall(700) + stairwell(215, 90, 330, 620) + rect(445, 150, 80, 110, '#1d2440', 0) + rect(206, 82, 348, 630, 'none', 0, S(16, '#4a2e1f'))
  + person({ look: LOOK.cop, x: 385, y: 1150, s: 2.9, expr, gaze, armL: [5, 3], armR: [5, 3] })
  + person({ look: D, x: 95, y: 1440, s: 4.2, back: true, armL: [8, 4], armR: { to: [226, 330], bend: -1 } });

SCENES.door = c => {
  const { t, L } = c;
  if (t < L[1] - 0.1) {
    const k = seg(t, L[0] + 0.3, L[0] + 1.1), w = 236 * (1 - 0.82 * k);
    return hall(660) + stairwell(170, 130, 236, 530) + person({ look: LOOK.cop, x: 335, y: 1000, s: 2.25, gaze: [-0.3, 0.1] })
      + door(170, 130, w, 530, '#7b4f33') + rect(162, 122, 252, 538, 'none', 0, S(14, '#4a2e1f')) + rect(182, 664, 212, 26, '#8a6a4c', 4)
      + person({ look: D, x: 80, y: 1100, s: 2.9, back: true, armR: [14, 22], armL: [8, 5] });
  }
  const expr = t < L[2] ? 'neutral' : t < L[3] ? 'surprised' : 'grin';
  return overShoulder(expr, [-0.6, -0.2]) + at(385, 60, pop(t, L[1] + 0.45), badge(0, -20, 'УЧАСТКОВЫЙ', { size: 19 }));
};

SCENES.students = c => {
  const { t, L } = c, skins = ['#f0c5a6', '#e6b594', '#efc4a8'], tops = ['#5e8e75', '#9a78d0', '#31405f', '#b4663a', '#8f2f3a'], hairs = ['#3a2a22', '#6a3e2a', '#b4663a', '#2d2933'];
  let ph = rect(0, 0, 460, 330, '#f3ecd9', 4) + rect(16, 16, 428, 262, '#b9a988', 2) + text(230, 310, '11 «Б» · ВЫПУСК 2009', 17, '#4a3a2c', { w: 900 });
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
    const x = 50 + i * 60, y = 96 + r * 86, teacher = r === 1 && i === 3;
    ph += rect(x - 24, y + 18, 48, 70, teacher ? D.top : tops[(i + r * 2) % 5], 14, S(2)) + circ(x, y, 21, teacher ? D.skin : skins[(i + r) % 3], S(2))
      + path(`M${x - 21} ${y - 2} A21 21 0 0 1 ${x + 21} ${y - 2} Q${x} ${y - 14} ${x - 21} ${y - 2}Z`, teacher ? D.hair : hairs[(i * 3 + r) % 4], S(2)) + circ(x - 8, y + 3, 2.6, OUT, '') + circ(x + 8, y + 3, 2.6, OUT, '');
    if (teacher) ph += rect(x - 16, y - 4, 13, 12, 'none', 3, S(1.8)) + rect(x + 3, y - 4, 13, 12, 'none', 3, S(1.8)) + path(`M${x - 5} ${y + 22} h10 l-5 30z`, D.tie, S(1.5));
  }
  ph += at(230, 182, pop(t, 0.25), circ(0, 0, 34, 'none', S(4, GOLD))) + at(350, 96, pop(t, L[0] + 0.5), circ(0, 0, 32, 'none', S(5, RED)));
  let b = uiBg('#2a1d18') + at(288, 70, pop(t, 0.05), badge(0, -20, 'ЕГО УЧЕНИК', { size: 20, border: RED })) + g('translate(58 130) rotate(-3)', ph);
  b += op(seg(t, L[0] + 0.8, L[0] + 1.1), path('M420 262 Q470 330 420 440', 'none', S(4, RED) + ' stroke-dasharray="9 9"'));
  return b + at(390, 520, pop(t, L[0] + 0.95), g('rotate(4)', rect(-140, -62, 280, 124, '#e9eef5', 10) + rect(-140, -62, 280, 30, '#31405f', 10) + text(0, -41, 'ПОЛИЦИЯ', 14, '#fff', { w: 900 })
    + rect(-126, -24, 70, 76, '#cfd6dd', 4, S(2)) + g('translate(-91 22) scale(.95)', head(LOOK.cop, { expr: 'smile' }, 25, 29)) + text(-44, 2, 'МАЛЫШЕВ С. П.', 15, '#1d1a22', { a: 'start', w: 900 }) + text(-44, 24, 'участковый', 13, '#4a4f58', { a: 'start' }) + text(-44, 44, 'выпускник школы № 7', 10.5, '#8f2f3a', { a: 'start' })));
};

const timShot = (k, gaze) => {
  const hx = lerp(40, 196, k), hy = lerp(210, 482, k);
  return hall(700) + door(330, 150, 240, 562, '#7b4f33') + person({ look: LOOK.tim, x: 288, y: 1075, s: 3.4, expr: 'scared', gaze })
    + limb([[-70, lerp(20, 150, k)], [lerp(0, 84, k), lerp(120, 330, k)], [hx, hy]], 66, D.top) + hand(hx + 4, hy + 6, 4.2, D.skin, false, -38);
};

SCENES.look = c => {
  const { t, L } = c;
  if (t < L[2] - 0.1) {
    const k = seg(t, L[0] + 0.8, L[1]), gz = [lerp(-0.6, -0.15, k), lerp(-0.2, 0.55, k)];
    const b = overShoulder(t > L[1] && Math.floor(t * 6) % 2 ? 'whisper' : 'neutral', gz);
    return cam(lerp(288, 345, k), lerp(512, 440, k), lerp(1, 1.4, k), b);
  }
  const k = seg(t, L[2] + 0.5, L[2] + 0.95, eout), [sx, sy] = shake(t, L[2] + 0.95, 0.3, 6);
  return cam(288 + sx, 512 + sy, 1, timShot(k, [lerp(-0.7, 0, k), lerp(-0.6, 0.1, k)]));
};

SCENES.choice = c => {
  const { t, L } = c, beat = Math.pow(Math.max(0, Math.sin((t - 0.2) / 0.95 * 2 * Math.PI)), 6), fin = t >= L[5] - 0.1;
  const aT = fin || t < L[3] - 0.1, aS = fin || t >= L[3] - 0.1, st = S(2.5);
  let b = g('translate(0 150)', timShot(1, [0, 0.1])) + dim(0.5) + rect(0, 0, W, H, '#c22f38', 0, `opacity="${beat * 0.12}"`)
    + text(288, 92, 'ЧТО ТЫ ОТВЕТИШЬ?', 15, GOLD, { w: 900, extra: 'letter-spacing="4"' });
  b += op(aT ? 1 : 0.5, at(150, 220, (aT ? 1.04 : 0.92) + (aT ? beat * 0.03 : 0), card(-112, -96, 224, 192, '#fff', aT ? '#d8303c' : '#4a1f28')
    + rect(-34, -72, 68, 46, '#fff', 12, st) + path('M-8 -28 L-16 -12 L6 -28Z', '#fff', st) + rect(-4, -64, 8, 20, '#d8303c', 3, '') + circ(0, -36, 4.5, '#d8303c', '')
    + text(0, 32, 'ПРАВДА', 31, '#fff', { w: 900 }) + text(0, 58, 'сказать участковому', 12, '#ffd9dc')));
  b += op(aS ? 1 : 0.5, at(426, 220, (aS ? 1.04 : 0.92) + (aS ? beat * 0.03 : 0), card(-112, -96, 224, 192, '#fff', aS ? '#3559b8' : '#1c2a52')
    + rect(-34, -72, 68, 46, '#dfe6f7', 12, st) + path('M-8 -28 L-16 -12 L6 -28Z', '#dfe6f7', st) + circ(-15, -49, 4, '#3559b8', '') + circ(0, -49, 4, '#3559b8', '') + circ(15, -49, 4, '#3559b8', '')
    + text(0, 32, 'ТИШИНА', 31, '#fff', { w: 900 }) + text(0, 58, 'промолчать', 12, '#d7e1ff')));
  b += at(288, 220, 1, path('M-11 -20 H11 L3 0 L11 20 H-11 L-3 0Z', '#f4d77a', st) + line(-13, -20, 13, -20, S(4)) + line(-13, 20, 13, 20, S(4)));
  const tag = fin ? null : t >= L[4] ? ['НИКТО НЕ ПРИДЁТ', '#6f93f0', L[4], 426] : t >= L[3] - 0.1 ? null : t >= L[2] ? ['ЗА ЗАКРЫТОЙ ДВЕРЬЮ', RED, L[2], 150] : t >= L[1] ? ['ЕСЛИ НЕ ПОВЕРЯТ…', RED, L[1], 150] : null;
  if (tag) b += at(clamp(tag[3], 140, 436), 372, pop(t, tag[2] + 0.1), badge(0, -20, tag[0], { border: tag[1], size: 15 }));
  return b;
};

SCENES.end = c => {
  const { t } = c;
  return rect(0, 0, W, H, '#0b0b12', 0, '')
    + op(seg(t, 0.2, 0.7), text(288, 372, '21:58 · ТОТ ЖЕ ВЕЧЕР', 13, RED, { extra: 'letter-spacing="4"' }))
    + at(288, 438, pop(t, 0.5, 0.4), text(0, 0, 'ЧАСТЬ 2', 54, '#fff', { w: 900 }))
    + op(seg(t, 1.0, 1.5), text(288, 482, 'ПРАВДА ИЛИ ТИШИНА', 26, GOLD, { w: 900 }) + text(288, 512, 'ОТЕЦ', 13, '#9a9fb4', { extra: 'letter-spacing="5"' }))
    + op(seg(t, 1.7, 2.3), rect(52, 560, 472, 140, '#14141d', 14, S(2, '#3a3a4a')) + text(288, 594, 'Если это происходит у тебя дома:', 15, '#fff', { w: 900 })
      + text(288, 624, '112 — экстренный вызов', 15, '#ff6b6b', { w: 900 }) + text(288, 651, '8-800-2000-122 — детский телефон доверия', 14, '#fff', { w: 900 }) + text(288, 678, 'бесплатно, анонимно, круглосуточно', 12, '#9a9fb4'));
};
