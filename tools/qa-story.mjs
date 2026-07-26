/* ============================================================
   qa-story.mjs — structural QA for the story graph.

   The browser caches src/*.js aggressively, so validating by
   playing the game gives you stale answers. This loads the same
   files in a browser-shaped vm context and walks the graph.

     node tools/qa-story.mjs

   Checks, in the order the user cares about:
     1. every exit resolves to a real beat
     2. every beat is reachable from the chapter start
     3. every flag that is set is read somewhere (orphan choices)
     4. both leads have text on every path-specific beat
     5. rough word parity between the two paths
     6. how visible the player's class is in the prose
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---- load browser-shaped sources ---- */
const ctx = vm.createContext({ console });
ctx.window = ctx;

const FILES = [
  'src/data/characters.js',
  'src/data/classes.js',
  'src/data/enemies.js',
  'src/data/chapters/chapter1.js',
  'src/data/chapters/chapter2.js',
  'src/data/chapters/chapter3.js',
  'src/data/chapters/chapter4.js',
  'src/data/chapters/chapter5.js',
  'src/data/chapters/chapter6.js',
  'src/data/chapters/chapter7.js',
  'src/data/chapters/chapter8.js',
  'src/data/chapters/chapter9.js',
  'src/data/chapters/chapter10.js',
  /* last: it grafts route beats onto every chapter above */
  'src/data/chapters/routes.js'
];

for (const f of FILES) {
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  } catch (err) {
    console.error(`PARSE FAILED  ${f}\n  ${err.message}`);
    process.exit(1);
  }
}

const NI = ctx.NI;
const CH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => NI.story['chapter' + n]);
const BATTLES = new Set(Object.keys(NI.enemies?.encounters || {}));

const problems = [];
const warnings = [];
const bad = (m) => problems.push(m);
const warn = (m) => warnings.push(m);

/* ---- 1 + 2: exits and reachability ---- */
let totalBeats = 0;
const flagsSet = new Set();
const flagsRead = new Set();

/** every beat id a given beat can hand control to, inside its own chapter */
function exitsOf(beat) {
  const out = [];
  if (beat.next) out.push(beat.next);
  if (beat.fallback) out.push(beat.fallback);
  if (beat.onWin) out.push(beat.onWin);
  if (beat.onLose) out.push(beat.onLose);
  for (const b of beat.branch || []) if (b.goto) out.push(b.goto);
  for (const c of beat.choices || []) if (c.goto) out.push(c.goto);
  return out;
}

for (const ch of CH) {
  const ids = new Set(Object.keys(ch.beats));
  totalBeats += ids.size;

  if (!ids.has(ch.start)) bad(`ch${ch.id}: start "${ch.start}" does not exist`);

  for (const [id, beat] of Object.entries(ch.beats)) {
    /* exits */
    for (const target of exitsOf(beat)) {
      if (!ids.has(target)) bad(`ch${ch.id}/${id} -> "${target}" (no such beat)`);
    }
    if (beat.goChapter && !NI.story['chapter' + beat.goChapter]) {
      bad(`ch${ch.id}/${id} -> chapter ${beat.goChapter} (missing)`);
    }
    if (beat.battle && BATTLES.size && !BATTLES.has(beat.battle)) {
      bad(`ch${ch.id}/${id} -> battle "${beat.battle}" (no such encounter)`);
    }

    /* a beat must be able to end its turn somehow */
    const isRouter = !!beat.branch;
    const terminates = beat.next || beat.goChapter || beat.hook || beat.choices ||
                       beat.battle || isRouter;
    if (!terminates) bad(`ch${ch.id}/${id} is a dead end (no next/goChapter/hook)`);

    /* flags */
    if (beat.sets) flagsSet.add(beat.sets);
    for (const c of beat.choices || []) if (c.sets) flagsSet.add(c.sets);
    for (const b of beat.branch || []) if (b.flag) flagsRead.add(b.flag);
  }

  /* reachability */
  const seen = new Set();
  const stack = [ch.start];
  while (stack.length) {
    const id = stack.pop();
    if (!id || seen.has(id) || !ids.has(id)) continue;
    seen.add(id);
    stack.push(...exitsOf(ch.beats[id]));
  }
  for (const id of ids) if (!seen.has(id)) bad(`ch${ch.id}/${id} is unreachable`);
}

/* ---- 3: orphan flags ---- */
const orphans = [...flagsSet].filter(f => !flagsRead.has(f));
const phantom = [...flagsRead].filter(f => !flagsSet.has(f));
for (const f of phantom) bad(`flag "${f}" is branched on but never set`);

/* ---- 4 + 5: path coverage and parity ---- */
const words = { kirito: 0, masha: 0 };
const strip = (s) => String(s).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

for (const ch of CH) {
  for (const [id, beat] of Object.entries(ch.beats)) {
    const t = beat.text;
    if (!t) continue;
    if (typeof t === 'string') { words.kirito += strip(t); words.masha += strip(t); continue; }
    for (const p of ['kirito', 'masha']) {
      if (!t[p]) { bad(`ch${ch.id}/${id}: text is path-specific but has no "${p}" variant`); continue; }
      words[p] += strip(t[p]);
    }
    for (const c of beat.choices || []) {
      if (typeof c.text === 'object') {
        for (const p of ['kirito', 'masha']) {
          if (!c.text[p]) bad(`ch${ch.id}/${id}: choice missing "${p}" text`);
        }
      }
    }
  }
}

/* ---- 6: class visibility ---- */
const CLASS_IDS = NI.classes?.ALL_IDS || [];
let classNoteBeats = 0;
const classNoteGaps = [];
for (const ch of CH) {
  for (const [id, beat] of Object.entries(ch.beats)) {
    for (const key of ['classNote', 'mateNote']) {
      const note = beat[key];
      if (!note) continue;
      classNoteBeats++;
      if (note.any) continue;
      const missing = CLASS_IDS.filter(c => !note[c]);
      if (missing.length) classNoteGaps.push(`ch${ch.id}/${id}.${key} missing: ${missing.join(', ')}`);
    }
  }
}
for (const g of classNoteGaps) bad(g);

/* ---- report ---- */
const skew = Math.abs(words.kirito - words.masha) / Math.max(words.kirito, words.masha);
if (skew > 0.10) warn(`path word skew ${(skew * 100).toFixed(1)}% (kirito ${words.kirito}, masha ${words.masha})`);
if (orphans.length) warn(`flags set but never read: ${orphans.join(', ')}`);
if (!classNoteBeats) warn('no beat mentions the player\'s class');

console.log(`beats            ${totalBeats}`);
console.log(`words            kirito ${words.kirito} / masha ${words.masha}  (skew ${(skew * 100).toFixed(1)}%)`);
console.log(`flags            ${flagsSet.size} set, ${flagsRead.size} read, ${orphans.length} orphan`);
console.log(`class-aware      ${classNoteBeats} note(s) across ${CLASS_IDS.length} classes`);

if (warnings.length) {
  console.log('\nWARNINGS');
  for (const w of warnings) console.log('  ! ' + w);
}
if (problems.length) {
  console.log('\nPROBLEMS');
  for (const p of problems) console.log('  x ' + p);
  process.exit(1);
}
console.log('\nOK — no structural problems.');
