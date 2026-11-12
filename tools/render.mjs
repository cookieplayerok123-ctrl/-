// Renders src/index.html frame by frame in headless Chrome and muxes it with build/audio.wav.
//   node tools/render.mjs                 full video -> out/rules-of-silence.mp4
//   node tools/render.mjs --stills        contact sheets of key moments -> build/stills/
//   node tools/render.mjs --at 3.2,40.5   single frames -> build/stills/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const FPS = 30, W = 576, H = 1024, SCALE = 1.875; // 1080x1920 output
const timeline = JSON.parse(fs.readFileSync(path.join(root, 'build/timeline.json'), 'utf8'));
const chrome = process.env.CHROME_PATH || ['/usr/local/bin/google-chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
const launch = () => puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb'] });
const browsers = [];

async function openPage(scale) {
  // One browser per page: Chrome only paints the foreground tab, so parallel tabs stall screenshots.
  const browser = await launch();
  browsers.push(browser);
  const page = await browser.newPage();
  page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.setViewport({ width: W, height: H, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(path.join(root, 'src/index.html')).href);
  await page.evaluate(() => window.ready);
  return page;
}
const shoot = async (page, t, file) => {
  await page.evaluate(t => window.frame(t), t);
  await page.screenshot({ path: file, type: 'jpeg', quality: 95 });
};
const ffmpeg = a => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' }); if (r.status) process.exit(r.status); };
const name = i => String(i).padStart(5, '0') + '.jpg';

if (args.includes('--stills') || args.includes('--at')) {
  const dir = path.join(root, 'build/stills');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const single = args.includes('--at');
  const at = single ? args[args.indexOf('--at') + 1].split(',').map(Number)
    : timeline.scenes.flatMap(s => [0.12, 0.38, 0.62, 0.9].map(k => s.start + (s.end - s.start) * k));
  const page = await openPage(single ? 1.25 : 0.6);
  for (const [i, t] of at.entries()) await shoot(page, t, path.join(dir, name(i)));
  if (!single) ffmpeg(['-framerate', '1', '-i', path.join(dir, '%05d.jpg'), '-vf', 'tile=8x2', path.join(dir, 'sheet%02d.jpg')]);
  console.log(at.length + ' stills in build/stills');
} else {
  const dir = path.join(root, 'build/frames');
  // RESUME=1 keeps frames from an interrupted run and renders only the missing ones.
  if (!process.env.RESUME) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const total = Math.ceil(timeline.duration * FPS), workers = Number(process.env.WORKERS || 2);
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage(SCALE);
    for (let i = w; i < total; i += workers) {
      if (!fs.existsSync(path.join(dir, name(i)))) await shoot(page, i / FPS, path.join(dir, name(i)));
      if (i % 600 === 0) console.log('frame ' + i + '/' + total);
    }
  }));
  fs.mkdirSync(path.join(root, 'out'), { recursive: true });
  const out = path.join(root, 'out/rules-of-silence.mp4');
  ffmpeg(['-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'), '-i', path.join(root, 'build/audio.wav'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-ac', '2', '-shortest', '-movflags', '+faststart', out]);
  console.log('wrote ' + path.relative(root, out));
}
await Promise.all(browsers.map(b => b.close()));
