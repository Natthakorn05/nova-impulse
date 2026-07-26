#!/usr/bin/env node
/* ============================================================
   cutout.mjs — turn generated character/enemy art into cutouts
   with a real alpha channel, so sprites sit *in* a scene instead
   of on top of it as a visible rectangle.

   Why flood fill and not a colour key:
     Masha's jacket is white and Kirito's coat is black. A global
     "delete all white pixels" would punch holes straight through
     the characters. Filling inward from the border only removes
     background that is actually connected to the edge, so
     interior white/black is untouched.

   Edge handling:
     Anti-aliased pixels are partially background-coloured. They
     get fractional alpha, then the background colour is un-mixed
     out of them — otherwise every sprite carries a white or black
     halo that looks exactly as pasted-on as the original box.

   Usage:
     node tools/cutout.mjs                  # process all character/enemy art
     node tools/cutout.mjs --only kirito
     node tools/cutout.mjs --check          # report only, write nothing
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets', 'generated');

const argv = process.argv.slice(2);
const has = f => argv.includes(f);
const val = f => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
const ONLY = val('--only');
const CHECK = has('--check');

/* Tolerances in 0-255 RGB distance. */
const TOL_SOLID = 26;   // below this: definitely background
const TOL_EDGE  = 74;   // above this: definitely subject; between: feathered

/* ---------------- io ---------------- */

function load(file) {
  const buf = fs.readFileSync(file);
  if (/\.png$/i.test(file)) {
    const p = PNG.sync.read(buf);
    return { w: p.width, h: p.height, data: p.data };
  }
  const j = jpeg.decode(buf, { useTArray: true });
  return { w: j.width, h: j.height, data: Buffer.from(j.data) };
}

function save(file, w, h, data) {
  const png = new PNG({ width: w, height: h });
  data.copy(png.data);
  fs.writeFileSync(file, PNG.sync.write(png));
}

const dist = (d, i, r, g, b) => {
  const dr = d[i] - r, dg = d[i + 1] - g, db = d[i + 2] - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

/* ---------------- background colour ---------------- */

/** Average the 1px frame; generated art backdrops are flat, so this is stable. */
function borderColor(w, h, d) {
  let r = 0, g = 0, b = 0, n = 0;
  const add = (x, y) => { const i = (y * w + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; };
  for (let x = 0; x < w; x++) { add(x, 0); add(x, h - 1); }
  for (let y = 0; y < h; y++) { add(0, y); add(w - 1, y); }
  return { r: r / n, g: g / n, b: b / n };
}

/* ---------------- main pass ---------------- */

function cutout(img) {
  const { w, h, data } = img;
  const bg = borderColor(w, h, data);

  /* Flood fill inward from every border pixel, through anything within
     the loose tolerance. `region` marks what is connected to the outside. */
  const region = new Uint8Array(w * h);
  const stack = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (region[p]) return;
    if (dist(data, p * 4, bg.r, bg.g, bg.b) > TOL_EDGE) return;
    region[p] = 1;
    stack.push(x, y);
  };

  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  /* Second pass: hue-based chroma suppression.

     The flood fill only removes background within a fixed RGB distance, so
     any part of the backdrop the model shaded or gradient-lit survives — it
     shows up as coloured residue in hair gaps and under arms. This catches
     it by direction rather than distance: a *shaded* magenta is still
     magenta-hued, just darker. Safe because the key colours are far more
     saturated than anything the characters actually wear. */
  const bgMag = Math.hypot(bg.r, bg.g, bg.b) || 1;

  /* Is the backdrop a saturated key colour? If so we can test every pixel
     against it globally, not just ones reachable from the border. That is
     what clears background trapped in enclosed pockets — the gap between a
     character's legs is walled in by the coat and shoes, so a border flood
     fill can never reach it and it survives as a green blob. Safe precisely
     because the key colours are chosen to be far from the subject palette. */
  const bgMx = Math.max(bg.r, bg.g, bg.b), bgMn = Math.min(bg.r, bg.g, bg.b);
  const bgSat = bgMx > 0 ? (bgMx - bgMn) / bgMx : 0;
  const keyed = bgSat > 0.35;
  /* Tuned between two failure modes seen in QA:
       82  -> a saturated chroma glow survived as a pink halo
       100 -> ate the Cinder Moth's wings, whose olive shadows sit near green
     The saturation gate below is what makes 90 safe: chroma residue is always
     highly saturated, while the subject tones that collide with a key colour
     (dark iron, olive shadow, black cloth) are muted. */
  const TOL_GLOBAL = 90;
  const GLOBAL_MIN_SAT = 0.45;

  const isChroma = (r, g, b) => {
    const mag = Math.hypot(r, g, b);
    if (mag < 40) return false;                    // near-black: not the key
    const cos = (r * bg.r + g * bg.g + b * bg.b) / (mag * bgMag);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx > 0 ? (mx - mn) / mx : 0;
    /* 0.975 left dark residue behind: key colour mixed with black hair (e.g.
       rgb(15,64,31) against a green key) lands at cosine ~0.954 and slipped
       through as green speckle along Kirito's silhouette. 0.945 catches it and
       is still far from any subject tone — his skin sits at 0.71, his crimson
       eyes at 0.30 against the same key. */
    if (cos > 0.945 && sat > 0.40) return true;
    if (!keyed || sat < GLOBAL_MIN_SAT) return false;
    const dr = r - bg.r, dg = g - bg.g, db = b - bg.b;
    return Math.sqrt(dr * dr + dg * dg + db * db) < TOL_GLOBAL;
  };

  /* Assign alpha, and un-mix the background out of feathered pixels. */
  let cleared = 0;
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;

    if (!region[p]) {
      if (isChroma(data[i], data[i + 1], data[i + 2])) { data[i + 3] = 0; cleared++; }
      else data[i + 3] = 255;
      continue;
    }

    const dd = dist(data, i, bg.r, bg.g, bg.b);
    if (dd <= TOL_SOLID || isChroma(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
      cleared++;
      continue;
    }

    const a = Math.min(1, (dd - TOL_SOLID) / (TOL_EDGE - TOL_SOLID));
    data[i + 3] = Math.round(a * 255);

    /* observed = subject*a + bg*(1-a)  ->  solve for subject */
    if (a > 0.05) {
      data[i]     = clamp8((data[i]     - bg.r * (1 - a)) / a);
      data[i + 1] = clamp8((data[i + 1] - bg.g * (1 - a)) / a);
      data[i + 2] = clamp8((data[i + 2] - bg.b * (1 - a)) / a);
    }
  }

  /* Despeckle: drop opaque pixels that are almost entirely surrounded by
     transparency. Keying leaves isolated survivors along a busy silhouette
     — spiky hair especially — and single stray dots read as dirt on the
     sprite once it's over a scene. Colour-agnostic, so it also cleans
     residue the chroma tests miss. */
  const alpha = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) alpha[p] = data[p * 4 + 3];

  /* Despill.

     Deleting more pixels is the wrong tool for edge fringing: the green in
     Kirito's hair edge is a genuine blend of key and hair, so removing it
     eats the silhouette. Standard chroma practice is to *neutralise* the key
     tint instead — pull the key's dominant channels back toward the others.

     Scoped to pixels near a transparent edge, because that is the only place
     spill occurs. Applying it globally would drain colour from anything
     legitimately sharing the key's hue. */
  const HIGH = Math.max(bg.r, bg.g, bg.b);
  const hiCh = [bg.r, bg.g, bg.b].map(v => v >= HIGH * 0.6);

  const nearEdge = (x, y) => {
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) return true;
        if (alpha[ny * w + nx] < 128) return true;
      }
    return false;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (alpha[p] < 128 || !nearEdge(x, y)) continue;
      const i = p * 4;
      const c = [data[i], data[i + 1], data[i + 2]];

      const lows = c.filter((_, k) => !hiCh[k]);
      if (!lows.length) continue;
      const lowAvg = lows.reduce((a, b) => a + b, 0) / lows.length;

      for (let k = 0; k < 3; k++) {
        if (!hiCh[k] || c[k] <= lowAvg) continue;
        data[i + k] = clamp8(lowAvg + (c[k] - lowAvg) * 0.30);
      }
    }
  }

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (alpha[p] < 128) continue;
      let opaqueNeighbours = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (alpha[(y + dy) * w + (x + dx)] >= 128) opaqueNeighbours++;
        }
      if (opaqueNeighbours <= 2) { data[p * 4 + 3] = 0; cleared++; }
    }
  }

  return { bg, clearedPct: (cleared / (w * h)) * 100 };
}

const clamp8 = v => Math.max(0, Math.min(255, Math.round(v)));

/**
 * Trim fully-transparent margins so sprites scale predictably in the UI.
 *
 * NOT applied to portraits. A portrait is generated square with the face
 * deliberately framed inside it; trimming to the alpha bounding box turns
 * 768x768 into something like 334x744, and a square thumbnail with
 * object-fit:cover then crops the middle of that tall strip — which lands
 * on the chest instead of the face. Keeping portraits square preserves the
 * framing the model was asked for.
 */
function trim(img) {
  const { w, h, data } = img;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return img;                     // fully transparent — leave alone
  const pad = 2;
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);

  const nw = x1 - x0 + 1, nh = y1 - y0 + 1;
  if (nw === w && nh === h) return img;

  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++) {
    data.copy(out, y * nw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x0 + nw) * 4);
  }
  return { w: nw, h: nh, data: out };
}

/* ---------------- run ---------------- */

/* Scenes keep their backgrounds — only the things that stand *in* a scene
   get cut out.

   Stated as "everything that is not a scene" rather than as a list of known
   prefixes. It used to be /^(kirito|masha|enemy|echo)_/, which meant adding a
   character to the cast silently skipped the cutout for it: the six romance
   portraits generated fine, produced no .png, and qa-art reported them as
   "file missing" with no hint that the cause was a regex three files away.
   An allowlist that has to be edited whenever content is added is a trap. */
const isSubject = name => !/^scene_/.test(name);

function main() {
  if (!fs.existsSync(DIR)) { console.error('no assets/generated'); process.exit(1); }

  /* One file per key. A previous run leaves a .png beside the source .jpg;
     processing both would re-key an already-transparent image, sampling its
     "border colour" from transparent pixels and eating into the subject.
     The .jpg is always the untouched source, so it wins. */
  const byKey = new Map();
  for (const f of fs.readdirSync(DIR)) {
    if (!/\.(png|jpe?g)$/i.test(f)) continue;
    const key = path.basename(f, path.extname(f));
    if (!isSubject(key)) continue;
    if (ONLY && !key.includes(ONLY)) continue;
    const isJpg = /\.jpe?g$/i.test(f);
    if (!byKey.has(key) || isJpg) byKey.set(key, f);
  }
  const files = [...byKey.values()];

  if (!files.length) { console.log('nothing to cut out'); return; }

  console.log(`cutout — ${files.length} subject assets\n`);
  const index = readIndex();
  let ok = 0, warn = 0;

  for (const f of files) {
    const key = path.basename(f, path.extname(f));
    const src = path.join(DIR, f);
    let img = load(src);
    const before = `${img.w}x${img.h}`;
    const { bg, clearedPct } = cutout(img);
    if (!/_portrait$/.test(key)) img = trim(img);

    const bgDesc = `rgb(${bg.r | 0},${bg.g | 0},${bg.b | 0})`;
    /* A near-zero clear means the backdrop wasn't flat and nothing was
       removed — the sprite would still render as a box. */
    const suspicious = clearedPct < 8 || clearedPct > 92;
    if (suspicious) warn++; else ok++;

    console.log(
      `  ${key.padEnd(24)} ${before.padEnd(10)} -> ${(img.w + 'x' + img.h).padEnd(10)} ` +
      `bg ${bgDesc.padEnd(20)} cleared ${clearedPct.toFixed(1).padStart(5)}%` +
      (suspicious ? '   <-- CHECK' : '')
    );

    if (CHECK) continue;

    const out = path.join(DIR, key + '.png');
    save(out, img.w, img.h, img.data);
    /* Keep the source jpg. Deleting it makes the cutout destructive — if the
       png is ever lost or the keying needs retuning, the only way back is a
       full regeneration. index.json points at the png, so the leftover source
       is never served. */
    index[key] = `assets/generated/${key}.png`;
  }

  if (!CHECK) {
    index._v = Date.now();
  fs.writeFileSync(path.join(DIR, 'index.json'), JSON.stringify(index, null, 2));
    console.log(`\ndone — ${ok} clean, ${warn} flagged. index.json updated.`);
  } else {
    console.log(`\ncheck only — ${ok} clean, ${warn} flagged.`);
  }
}

function readIndex() {
  const f = path.join(DIR, 'index.json');
  if (!fs.existsSync(f)) return {};
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; }
}

main();
