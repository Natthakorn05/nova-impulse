/* ============================================================
   qa-sheet.mjs — contact sheets of every cutout.

     node tools/qa-sheet.mjs            # writes qa-sheet-*.png
     node tools/qa-sheet.mjs --cols 5

   qa-art.mjs measures. This one lets you LOOK, which is the check
   that actually decides whether a player calls the art slop, and
   the one that keeps getting skipped because opening fifty files
   one at a time is tedious enough that nobody does it twice.

   Everything is composited over a mid-grey checkerboard rather
   than white or black: key damage is transparent, and transparent
   holes are invisible against a background that matches the
   subject. On a checker they are obvious.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets/generated');

const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const COLS = Number(arg('--cols', 4));
const CELL = Number(arg('--cell', 300));
const PER_SHEET = COLS * 3;              /* 3 rows per sheet keeps each image readable */

const keys = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.png') && !f.startsWith('scene_'))
  .map(f => path.basename(f, '.png'))
  .sort();

/** Nearest-neighbour fit into a CELL box, preserving aspect. */
function fit(img) {
  const s = Math.min(CELL / img.width, CELL / img.height);
  const w = Math.max(1, Math.round(img.width * s));
  const h = Math.max(1, Math.round(img.height * s));
  const out = { width: w, height: h, data: Buffer.alloc(w * h * 4) };
  for (let y = 0; y < h; y++) {
    const sy = Math.min(img.height - 1, Math.floor(y / s));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(img.width - 1, Math.floor(x / s));
      const si = (sy * img.width + sx) * 4, di = (y * w + x) * 4;
      out.data[di] = img.data[si];
      out.data[di + 1] = img.data[si + 1];
      out.data[di + 2] = img.data[si + 2];
      out.data[di + 3] = img.data[si + 3];
    }
  }
  return out;
}

let sheetNo = 0;
for (let start = 0; start < keys.length; start += PER_SHEET) {
  const batch = keys.slice(start, start + PER_SHEET);
  const rows = Math.ceil(batch.length / COLS);
  const W = COLS * CELL, H = rows * CELL;
  const sheet = new PNG({ width: W, height: H });

  /* Split background: the LEFT half of every cell is near-black, the right
     half is near-white, with a checker over both.

     A mid-grey checker was the first version and it hid the exact failure
     this tool exists to catch. Matikanetannhauser's blonde hair had been
     shredded into speckle by the key, and against mid-grey the holes were
     invisible — they only showed once she was put on a dark background. Light
     damage hides on light, dark damage hides on dark, so every asset has to
     be shown against both at once. */
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const leftHalf = (x % CELL) < CELL / 2;
      const base = leftHalf ? 22 : 232;
      const alt  = leftHalf ? 48 : 200;
      const c = (((x >> 4) + (y >> 4)) & 1) ? base : alt;
      const i = (y * W + x) * 4;
      sheet.data[i] = sheet.data[i + 1] = sheet.data[i + 2] = c;
      sheet.data[i + 3] = 255;
    }
  }

  batch.forEach((key, n) => {
    const img = PNG.sync.read(fs.readFileSync(path.join(DIR, key + '.png')));
    const t = fit(img);
    const cx = (n % COLS) * CELL + Math.floor((CELL - t.width) / 2);
    const cy = Math.floor(n / COLS) * CELL + Math.floor((CELL - t.height) / 2);
    for (let y = 0; y < t.height; y++) {
      for (let x = 0; x < t.width; x++) {
        const si = (y * t.width + x) * 4;
        const a = t.data[si + 3] / 255;
        if (a <= 0.01) continue;
        const di = ((cy + y) * W + (cx + x)) * 4;
        for (let k = 0; k < 3; k++) {
          sheet.data[di + k] = Math.round(t.data[si + k] * a + sheet.data[di + k] * (1 - a));
        }
      }
    }
  });

  const out = path.join(ROOT, `qa-sheet-${++sheetNo}.png`);
  fs.writeFileSync(out, PNG.sync.write(sheet));
  console.log(out + '   ' + batch.join(', '));
}
console.log(`\n${keys.length} assets across ${sheetNo} sheets.`);
