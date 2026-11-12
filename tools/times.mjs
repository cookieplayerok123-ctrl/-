// Prints absolute times for "scene:fraction" arguments, e.g. `node tools/times.mjs hook:0.3 end:0.9`,
// ready to pass to `node tools/render.mjs --at`.
import fs from 'node:fs';
const { scenes } = JSON.parse(fs.readFileSync(new URL('../build/timeline.json', import.meta.url), 'utf8'));
console.log(process.argv.slice(2).map(a => {
  const [id, k] = a.split(':'), s = scenes.find(x => x.id === id);
  return (s.start + (s.end - s.start) * Number(k)).toFixed(2);
}).join(','));
