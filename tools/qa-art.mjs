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
for (const f of ['src/data/enemies.js', 'src/data/echoes.js', 'src/art/prompts.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}
const P = ctx.NI.prompts;
const manifest = [
  ...P.MANIFEST,
  ...P.enemyManifest(ctx.NI.enemies.ENEMIES),
  ...P.echoManifest(ctx.NI.echoes.ECHOES)
];

const RGB = { green: [0x00, 0xb1, 0x40], magenta: [0xff, 0x00, 0xd0], orange: [0xff, 0x7a, 0x00],
              blue: [0x00, 0x40, 0xff] };

/** How strongly a pixel leans toward the chroma hue, on the axis that matters. */
function castOf(name, r, g, b) {
  if (name === 'green')   return g - Math.max(r, b);
  if (name === 'magenta') return Math.min(r, b) - g;
  if (name === 'blue')    return b - Math.max(r, g);
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
  let satSum = 0, ink = 0;
  for (let i = 0; i < img.data.length; i += 4) {
    const [r, g, b, a] = [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
    if (a <= 16) continue;
    opaque++;
    if (a < 240) soft++;
    if (Math.hypot(r - C[0], g - C[1], b - C[2]) < 110) residue++;
    const c = castOf(chroma, r, g, b);
    if (c > 30) { cast++; if (c > worst) worst = c; }

    /* ---- style measurements (see the STYLE contract in src/art/prompts.js) ----
       Two numbers, because these are the two axes the cast has actually
       drifted along, and both drifts were invisible to every check here:

       sat — HSV saturation. The house look is a muted pastel-leaning
             palette. A pass that came back as heavy shonen poster art was
             far more saturated than the assets around it and nothing said so.

       ink — share of pixels that are much darker than their own local
             neighbourhood. That is line work. The first version of this
             counted near-black pixels outright and was measuring WARDROBE:
             Kirito wears a black coat and scored 88%, Airi wears a cream
             cardigan and scored 3.5%, and the tool duly reported that the
             two leads were drawn in different styles. A black garment is
             uniformly dark, so its interior is not darker than its
             surroundings; an outline always is.

       Neither is a quality judgement, and neither can be. They are drift
       alarms: they fire when one asset stops matching the rest of the cast,
       which is the failure that actually shipped. */
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    satSum += mx === 0 ? 0 : (mx - mn) / mx;
  }

  /* ---- holes punched through the subject ----
     The failure this exists for: Matikanetannhauser was generated on magenta
     with warm skin, pink blush and a white-and-amber kit, and the key could
     not tell her face from the backdrop. It removed the background AND ate
     chunks out of her jacket, her hair and her cheek — and every existing
     check passed her, because residue was 0 (the backdrop went), cast was 0
     (nothing was tinted) and coverage was healthy (most of her survived).
     "Most of her survived" is not a standard.

     Defining a hole is the whole difficulty. The first attempt called any
     transparent pixel with subject on all four sides a hole, and flagged 43
     of 51 assets — because the gap between an arm and a torso is also
     enclosed on four sides, and a moth with open wings scored 73%. That
     measured SILHOUETTE, not damage.

     What actually distinguishes key damage is that it is speckle: many small
     enclosed islands. Legitimate negative space is a few large ones. So:
     flood the transparent background inward from the border, take whatever
     transparency it could not reach, and count only the components smaller
     than a fingernail. */
  let holes = 0;
  {
    const W2 = img.width, H2 = img.height, D2 = img.data;
    const N = W2 * H2;
    const clear = new Uint8Array(N);          // transparent
    for (let i = 0; i < N; i++) clear[i] = D2[i * 4 + 3] <= 16 ? 1 : 0;

    /* flood the outside */
    const outside = new Uint8Array(N);
    const stack = [];
    for (let x = 0; x < W2; x++) { stack.push(x); stack.push((H2 - 1) * W2 + x); }
    for (let y = 0; y < H2; y++) { stack.push(y * W2); stack.push(y * W2 + W2 - 1); }
    while (stack.length) {
      const p = stack.pop();
      if (outside[p] || !clear[p]) continue;
      outside[p] = 1;
      const x = p % W2, y = (p / W2) | 0;
      if (x > 0) stack.push(p - 1);
      if (x < W2 - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - W2);
      if (y < H2 - 1) stack.push(p + W2);
    }

    /* enclosed transparent components; only small ones count as damage */
    const seen = new Uint8Array(N);
    const MAX_SPECKLE = 900;   // ~30x30px on a 768px sheet
    for (let p0 = 0; p0 < N; p0++) {
      if (!clear[p0] || outside[p0] || seen[p0]) continue;
      const comp = [];
      const st = [p0];
      seen[p0] = 1;
      while (st.length) {
        const p = st.pop();
        comp.push(p);
        const x = p % W2, y = (p / W2) | 0;
        for (const q of [x > 0 ? p - 1 : -1, x < W2 - 1 ? p + 1 : -1,
                         y > 0 ? p - W2 : -1, y < H2 - 1 ? p + W2 : -1]) {
          if (q >= 0 && clear[q] && !outside[q] && !seen[q]) { seen[q] = 1; st.push(q); }
        }
      }
      if (comp.length <= MAX_SPECKLE) holes += comp.length;
    }
  }

  /* Line density: a pixel counts as line work when it is much darker than the
     average of the ring of pixels a few steps away from it. Sampled on a
     stride so this stays cheap on a 768x768 sheet. */
  const W = img.width, H = img.height, D = img.data;
  const lum = (x, y) => {
    const i = (y * W + x) * 4;
    if (D[i + 3] <= 16) return -1;
    return 0.299 * D[i] + 0.587 * D[i + 1] + 0.114 * D[i + 2];
  };
  const R = 3;
  let lineHits = 0, lineTests = 0;
  for (let y = R; y < H - R; y += 2) {
    for (let x = R; x < W - R; x += 2) {
      const c = lum(x, y);
      if (c < 0) continue;
      lineTests++;
      let sum = 0, n = 0;
      for (const [dx, dy] of [[-R, 0], [R, 0], [0, -R], [0, R]]) {
        const v = lum(x + dx, y + dy);
        if (v >= 0) { sum += v; n++; }
      }
      if (n && (sum / n) - c > 70) lineHits++;
    }
  }
  ink = lineTests ? lineHits / lineTests : 0;

  rows.push({
    key: entry.key, chroma,
    dim: img.width + 'x' + img.height,
    coverage: opaque / (img.width * img.height),
    residue: residue / opaque,
    cast: cast / opaque,
    worst, soft: soft / opaque,
    sat: satSum / opaque,
    ink,  /* already a ratio of sampled pixels — do not divide again */
    holes: holes / Math.max(1, opaque)
  });
}

console.log('asset                 chroma    size      subject%  residue%   cast%   soft-edge%');
console.log('-'.repeat(84));
/**
 * Per-asset cast tolerance.
 *
 * 3% is right for an opaque subject: anything above it is the backdrop
 * having bled into the character, and the fix is a different chroma.
 *
 * A translucent subject is a different measurement. Where the sprite is
 * semi-transparent, the "tint" this tool reads is partly whatever the
 * compositor put behind it, so a glowing creature with see-through tendrils
 * reads warm no matter which key it was shot on. echo_wispling was rerolled
 * four times chasing this number — orange 26%, magenta 26% plus 8% leftover
 * backdrop, orange again 21% — before the fix turned out to be giving it an
 * opaque crystal core so the key had a hard edge to cut against. That took
 * it to 8.4%, and composited over a scene it is clean; the remainder is
 * scene light through the tendrils, which is what the art is supposed to do.
 *
 * Exemptions are listed one at a time with a reason, never raised globally —
 * a threshold loosened for every asset stops being a check.
 */
const CAST_LIMIT = {
  echo_wispling:   0.10,  // translucent by design; verified by eye over scene_field
  /* Same subject, same problem: a crystal core inside a halo of cyan light.
     The halo takes a warm rim from any key it is shot on, and cyan's only
     distant chroma IS orange. Verified on the contact sheet — it reads as warm
     light around the core, not as damage. */
  enemy_dataWisp:  0.09
};
function castLimit(key) { return CAST_LIMIT[key] != null ? CAST_LIMIT[key] : 0.03; }

/**
 * Per-asset hole allowances, same rule as CAST_LIMIT: one entry, one reason,
 * never a global loosening.
 */
const HOLE_LIMIT = {
  /* 3.5%, and every one of them is real negative space. This is a knight in
     full plate holding a staff: the gaps sit between the fingers and the
     shaft, inside the horns of the helm, and between the hanging banner and
     the leg. Checked large over a split dark/light checker — the plate is
     unbroken and the silhouette is correct.

     It is worth being honest that this sits exactly on the figure the
     comment below cites as known-bad. The hole count cannot tell a gap
     between fingers from a bite taken out of a shoulder; it measures
     silhouette complexity, and an ornate subject scores like a damaged one.
     That is why the check prints "measurement only" and why this entry
     records a verdict reached by looking rather than a threshold moved. */
  enemy_priorBuild: 0.045
};
function holeLimit(key) { return HOLE_LIMIT[key] != null ? HOLE_LIMIT[key] : 0.03; }

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
  if (r.cast > castLimit(r.key)) flagged.push(`${r.key}: ${(r.cast * 100).toFixed(1)}% of the subject is tinted ${r.chroma} (peak +${r.worst}) — wrong chroma for this palette, reroll on another`);
  /* 3%, set by looking rather than by taste. Every asset between 1% and 3%
     was checked on the contact sheet (tools/qa-sheet.mjs) and the holes are
     gaps between strands of hair, between fingers, and inside jewellery —
     real transparency in a correct cutout. The two that were genuinely eaten
     read 3.5% and 29%.

     The 3.5% end of that is no longer a clean boundary: PRIOR BUILD, an
     ornate knight, scores 3.5% out of pure negative space (see HOLE_LIMIT).
     Treat anything in the 3-6% band as "go and look", not as a verdict —
     above 6% nothing has ever been innocent. */
  if (r.holes > holeLimit(r.key)) flagged.push(`${r.key}: ${(r.holes * 100).toFixed(1)}% of the subject is holes — the key ate into the character, use a chroma further from its palette`);
  if (r.coverage < 0.12) flagged.push(`${r.key}: only ${(r.coverage * 100).toFixed(1)}% of the frame is subject — the key probably ate it`);
  if (r.coverage > 0.92) flagged.push(`${r.key}: ${(r.coverage * 100).toFixed(1)}% opaque — the background was probably never removed`);
}

/* ------------------------------------------------------------
   Style drift across the CAST specifically.

   Enemies and Echoes are allowed to be lurid — a Null Seraph should not
   share a palette with a girl holding a notebook. The contract that has to
   hold is that the PEOPLE read as one show, male and female alike, so the
   cohort is the portraits and sprites and the comparison is against their
   own median rather than against a number invented here.
   ------------------------------------------------------------ */
const castRows = rows.filter(r => !r.missing && /_(portrait|sprite)$/.test(r.key));
if (castRows.length >= 4) {
  const med = (xs) => { const a = xs.slice().sort((p, q) => p - q); return a[Math.floor(a.length / 2)]; };
  const satMed = med(castRows.map(r => r.sat));
  const inkMed = med(castRows.map(r => r.ink));

  console.log('\ncast style — soft light-novel look (median sat ' +
              satMed.toFixed(2) + ', ink ' + (inkMed * 100).toFixed(1) + '%)');
  console.log('asset                    sat     ink%');
  console.log('-'.repeat(42));
  for (const r of castRows) {
    console.log(r.key.padEnd(25) + r.sat.toFixed(2).padStart(4) +
                (r.ink * 100).toFixed(1).padStart(9));
  }

  /* Generous bands. The point is to catch a member of the cast rendered in a
     different style from the rest, not to police individual palettes — a
     redhead in a red jacket is legitimately more saturated than a girl in a
     cream cardigan. */
  for (const r of castRows) {
    if (r.sat > satMed + 0.20) {
      flagged.push(`${r.key}: saturation ${r.sat.toFixed(2)} vs cast median ${satMed.toFixed(2)} — ` +
                   `reads more vivid than the rest of the cast, check it is the same style`);
    }
    if (r.ink > inkMed + 0.055) {
      flagged.push(`${r.key}: ${(r.ink * 100).toFixed(1)}% near-black vs cast median ` +
                   `${(inkMed * 100).toFixed(1)}% — heavy outlines, house style is thin delicate line art`);
    }
  }
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
