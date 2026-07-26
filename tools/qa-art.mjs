/* ============================================================
   qa-art.mjs — measure every cutout before looking at it.

   Eyeballing catches "this looks like AI slop"; it does not catch a
   0.4% halo of leftover backdrop, and it does not distinguish
   leftover backdrop from a subject the model TINTED to match its
   backdrop. Both are real and they have different fixes:

     residue  -> cutout.mjs tolerances
     cast     -> the prompt (wrong chroma choice for that palette)

   The Null Seraph is the worked example: 0 residual magenta pixels,
   a clean key — and 7.3% of the character tinted pink, because it
   was asked for "wings of luminous light" on a magenta backdrop and
   made the light magenta. Every other magenta asset sits at 0.0%.

     node tools/qa-art.mjs
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets/generated');

/* ---- which chroma each asset was generated on ---- */
const ctx = vm.createContext({ console });
ctx.window = ctx;
for (const f of ['src/data/enemies.js', 'src/art/prompts.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const P = ctx.NI.prompts;
const manifest = [...P.MANIFEST, ...P.enemyManifest(ctx.NI.enemies.ENEMIES)];

const RGB = { green: [0x00, 0xb1, 0x40], magenta: [0xff, 0x00, 0xd0], orange: [0xff, 0x7a, 0x00] };

/** How strongly a pixel leans toward the chroma hue, on the axis that matters. */
function castOf(name, r, g, b) {
  if (name === 'green')   return g - Math.max(r, b);
  if (name === 'magenta') return Math.min(r, b) - g;
  return r - b - Math.max(0, g - 0x7a);   /* orange */
}

const rows = [];
for (const entry of manifest) {
  if (entry.kind === 'scene') continue;             /* scenes keep their background */
  const file = path.join(DIR, entry.key + '.png');
  if (!fs.existsSync(file)) { rows.push({ key: entry.key, missing: true }); continue; }

  const img = PNG.sync.read(fs.readFileSync(file));
  const chroma = entry.chroma || 'green';
  const C = RGB[chroma];

  let opaque = 0, soft = 0, residue = 0, cast = 0, worst = 0;
  for (let i = 0; i < img.data.length; i += 4) {
    const [r, g, b, a] = [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
    if (a <= 16) continue;
    opaque++;
    if (a < 240) soft++;
    if (Math.hypot(r - C[0], g - C[1], b - C[2]) < 110) residue++;
    const c = castOf(chroma, r, g, b);
    if (c > 30) { cast++; if (c > worst) worst = c; }
  }

  rows.push({
    key: entry.key, chroma,
    dim: img.width + 'x' + img.height,
    coverage: opaque / (img.width * img.height),
    residue: residue / opaque,
    cast: cast / opaque,
    worst, soft: soft / opaque
  });
}

console.log('asset                 chroma    size      subject%  residue%   cast%   soft-edge%');
console.log('-'.repeat(84));
const flagged = [];
for (const r of rows) {
  if (r.missing) { console.log(r.key.padEnd(22) + 'MISSING'); flagged.push(`${r.key}: file missing`); continue; }
  const pc = (n) => (n * 100).toFixed(1).padStart(7);
  console.log(
    r.key.padEnd(22) + r.chroma.padEnd(10) + r.dim.padEnd(10) +
    pc(r.coverage) + '  ' + pc(r.residue) + '  ' + pc(r.cast) + '  ' + pc(r.soft)
  );

  /* Thresholds calibrated against the assets, not guessed. Known-bad ran
     3.9-29.4%; everything that survived visual review sits at 0-2.2%. A
     subject that legitimately contains some of its own chroma hue (the Rust
     Hound's green cabling) lands under 1% and should not cry wolf. */
  if (r.residue > 0.01) flagged.push(`${r.key}: ${(r.residue * 100).toFixed(1)}% leftover ${r.chroma} backdrop — retune cutout.mjs`);
  if (r.cast > 0.03)    flagged.push(`${r.key}: ${(r.cast * 100).toFixed(1)}% of the subject is tinted ${r.chroma} (peak +${r.worst}) — wrong chroma for this palette, reroll on another`);
  if (r.coverage < 0.12) flagged.push(`${r.key}: only ${(r.coverage * 100).toFixed(1)}% of the frame is subject — the key probably ate it`);
  if (r.coverage > 0.92) flagged.push(`${r.key}: ${(r.coverage * 100).toFixed(1)}% opaque — the background was probably never removed`);
}

if (flagged.length) {
  console.log('\nFLAGGED');
  for (const f of flagged) console.log('  ! ' + f);
  process.exitCode = 1;
} else {
  console.log('\nOK — no measurable cutout or chroma-cast problems.');
}
console.log('\nMeasurement only. Composite these over a scene and LOOK at them before shipping:');
console.log('  node tools/qa-composite.mjs scene_field out.png kirito_sprite masha_sprite');
