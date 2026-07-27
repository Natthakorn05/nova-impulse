/* ============================================================
   tune-bosses.mjs — sweep late-game difficulty and measure it.

     node tools/tune-bosses.mjs                 # default grid
     node tools/tune-bosses.mjs --runs 250
     node tools/tune-bosses.mjs --hp 0.6,0.7 --atk 0.85

   Chapters 7-10 were authored with hand-picked HP and ATK values
   and no measurement behind them, which produced a second half
   almost nobody can finish. This drives qa-balance.mjs through
   NI_BALANCE_PATCH so a candidate curve can be measured before it
   is written into enemies.js.

   It reports the per-chapter boss clear spread, because a single
   average hides the failure that matters here: chapter 10 sitting
   at 46% for the Mage and 11% for everyone else is not "about
   30%", it is one class having a finale and three not.
   ============================================================ */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const arg = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const nums = s => s.split(',').map(Number);

const RUNS = Number(arg('--runs', 250));
const HP_MULTS = nums(arg('--hp', '1,0.8,0.7,0.6'));
const ATK_MULTS = nums(arg('--atk', '1'));

/* The four chapter bosses at their shipped values, so x1.00 measures what a
   player actually fights. Keep these in step with enemies.js — a sweep whose
   baseline has drifted reports multipliers of a curve nobody plays. */
const BOSSES = {
  continuityWarden: { hp: 1330, atk: 44, chapter: 7 },
  priorBuild:       { hp: 1275, atk: 45, chapter: 8 },
  architectProxy:   { hp: 1600, atk: 49, chapter: 9 },
  impulseCore:      { hp: 1620, atk: 50, chapter: 10 }
};

/* The elites standing between the player and each boss. Attrition is most of
   the difficulty in this game — the boss is fought with whatever HP and MP
   the trash left behind — so sweeping bosses alone would mistune them to
   compensate for fights happening earlier in the chapter. */
const ELITES = {
  greyboxWalker:  { hp: 375, atk: 41 },
  strayInstance:  { hp: 325, atk: 39 },
  iterationEcho:  { hp: 460, atk: 42 },
  archivistShell: { hp: 520, atk: 43 },
  coreAspect:     { hp: 590, atk: 48 }
};

function scaled(table, hpMult, atkMult) {
  const out = {};
  for (const [id, base] of Object.entries(table)) {
    out[id] = { hp: Math.round(base.hp * hpMult), atk: Math.round(base.atk * atkMult) };
  }
  return out;
}

/** Run qa-balance under a patch and pull the per-chapter boss table out. */
function measure(patch) {
  const raw = execFileSync(process.execPath,
    [path.join(ROOT, 'tools/qa-balance.mjs'), String(RUNS), '--late'],
    { env: { ...process.env, NI_BALANCE_PATCH: JSON.stringify(patch) },
      encoding: 'utf8', maxBuffer: 1 << 24 });

  const lines = raw.split('\n');
  const head = lines.findIndex(l => l.startsWith('class ') && l.includes('ch7'));
  if (head < 0) throw new Error('could not find the boss table:\n' + raw.slice(-800));

  const cols = lines[head].trim().split(/\s+/).slice(1);       // ch5 ch6 ... ch10
  const rows = {};
  for (let i = head + 2; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length !== cols.length + 1) break;
    rows[parts[0]] = Object.fromEntries(
      cols.map((c, n) => [c, Number(parts[n + 1].replace('%', ''))]));
  }
  return rows;
}

/* ---- report ------------------------------------------------------------ */

const CHAPTERS = ['ch6', 'ch7', 'ch8', 'ch9', 'ch10'];

console.log(`${RUNS} runs per class per cell\n`);
console.log('boss hp   elite/atk  ' + CHAPTERS.map(c => c.padStart(11)).join('') + '     worst');
console.log('-'.repeat(88));

for (const hp of HP_MULTS) {
  for (const atk of ATK_MULTS) {
    const patch = { ...scaled(BOSSES, hp, atk), ...scaled(ELITES, hp, atk) };
    const rows = measure(patch);
    const classes = Object.keys(rows);

    let worst = 100;
    const cells = CHAPTERS.map(c => {
      const vals = classes.map(k => rows[k][c]).filter(v => Number.isFinite(v));
      if (!vals.length) return ''.padStart(11);
      const lo = Math.min(...vals), hi = Math.max(...vals);
      worst = Math.min(worst, lo);
      return `${lo}-${hi}%`.padStart(11);
    });

    console.log(
      `x${hp.toFixed(2)}       x${atk.toFixed(2)}   ` +
      cells.join('') + `     ${worst}%`);
  }
}

console.log(`
Read the columns, not the average. The target is every chapter landing
roughly 60-85% with a spread inside ~20 points; a chapter where the low
end sits under 25% is one no player of that class finishes.`);
