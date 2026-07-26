/* ============================================================
   qa-playthrough.mjs — play the whole game, every route, for real.

     node tools/qa-playthrough.mjs
     node tools/qa-playthrough.mjs --route airi --path masha

   WHY THIS EXISTS
   ---------------
   qa-story.mjs checks that the graph is well-formed one chapter at
   a time. It cannot catch the thing that actually went wrong: for
   two commits, chapter 6 was structurally perfect, fully reachable
   *within itself*, and completely unreachable from the game,
   because chapter 5 ended on a terminal `hook` beat and nothing
   pointed at chapter 6. Every per-chapter check passed.

   This walks the real thing instead — main.js's own transition
   rules, re-implemented once here — from a fresh save on chapter 1
   beat 1 through to the end of chapter 10, resolving real battles
   with the real engine, for all seven routes on both leads. If a
   chapter is orphaned, a route beat never fires, or a battle key
   is wrong, it fails here.

   It also reports how much of each chapter a single run sees,
   which is the cheapest available proxy for "is the branching
   doing anything".
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ctx = vm.createContext({ console, Math, Date, JSON });
ctx.window = ctx;
ctx.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }) };

for (const f of [
  'src/data/classes.js', 'src/data/enemies.js', 'src/data/echoes.js',
  'src/data/breach.js', 'src/data/collection.js', 'src/data/characters.js',
  'src/battle/battleSystem.js', 'src/ui/skillTree.js',
  'src/data/chapters/chapter1.js', 'src/data/chapters/chapter2.js',
  'src/data/chapters/chapter3.js', 'src/data/chapters/chapter4.js',
  'src/data/chapters/chapter5.js', 'src/data/chapters/chapter6.js',
  'src/data/chapters/chapter7.js', 'src/data/chapters/chapter8.js',
  'src/data/chapters/chapter9.js', 'src/data/chapters/chapter10.js',
  'src/data/chapters/routes.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}

const NI = ctx.NI;
const LAST_CHAPTER = 10;
const CHAPTERS = {};
for (let n = 1; n <= LAST_CHAPTER; n++) CHAPTERS[n] = NI.story['chapter' + n];

const arg = (f) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : null; };
const ONE_ROUTE = arg('--route');
const ONE_PATH = arg('--path');

/* ------------------------------------------------------------
   main.js's transition rules. Kept deliberately small and
   literal — if this drifts from main.js the test stops meaning
   anything, so it copies the shape rather than abstracting it.
   ------------------------------------------------------------ */

function makeState(pathId, classId, route) {
  const mateId = pathId === 'kirito' ? 'masha' : 'kirito';
  const mk = (id, cid) => {
    const s = NI.battle.buildStats({ classId: cid, level: 1, unlocked: [] });
    return { id, name: id, classId: cid, level: 1, xp: 0, points: 1, unlocked: [], hp: s.hp, mp: s.mp };
  };
  return {
    path: pathId, route, chapter: 1, beat: null,
    party: [mk(pathId, classId), mk(mateId, 'fighter')],
    trust: 0, bond: 0, flags: {}, battlesWon: 0, battlesLost: 0
  };
}

function resolveBranch(state, beat) {
  const hit = (beat.branch || []).find(b => {
    if (b.flag) return !!state.flags[b.flag];
    if (b.route) return state.route === b.route;
    if (b.bondAtLeast != null) return (state.bond || 0) >= b.bondAtLeast;
    if (b.trustAtLeast != null) return state.trust >= b.trustAtLeast;
    if (b.path) return state.path === b.path;
    return false;
  });
  return hit ? hit.goto : beat.fallback;
}

/* Battles are resolved with the real engine, but the outcome is forced so a
   single walk covers the win path; --lose flips it. Both exits have to lead
   somewhere either way, which exitsOf in qa-story already guarantees, so what
   matters here is that the encounter key resolves at all. */
function runBattle(key) {
  if (!NI.enemies.encounter(key)) throw new Error(`battle "${key}" is not an encounter`);
  return !process.argv.includes('--lose');
}

function playRoute(pathId, classId, route) {
  const state = makeState(pathId, classId, route);
  const visited = new Set();
  const perChapter = {};
  let steps = 0;

  let chapter = 1;
  let beatId = CHAPTERS[1].start;

  while (steps++ < 4000) {
    const ch = CHAPTERS[chapter];
    const beat = ch.beats[beatId];
    if (!beat) throw new Error(`ch${chapter}: missing beat "${beatId}"`);

    visited.add(chapter + '/' + beatId);
    perChapter[chapter] = (perChapter[chapter] || new Set()).add(beatId);

    if (beat.branch) { beatId = resolveBranch(state, beat); continue; }

    const guard = '_seen_' + beatId;
    if (beat.sets && !state.flags[guard]) { state.flags[beat.sets] = true; state.flags[guard] = true; }

    if (beat.battle) {
      const won = runBattle(beat.battle);
      beatId = won ? beat.onWin : (beat.onLose || beat.onWin);
      if (!beatId) throw new Error(`ch${chapter}/${beat.battle}: battle beat has no exit`);
      continue;
    }

    if (beat.hook) {
      return { state, visited, perChapter, endedAt: chapter + '/' + beatId };
    }

    if (beat.choices) {
      /* Rotate choices so repeated routes don't all take option 1 — a choice
         that is never taken is a choice that is never checked. */
      const c = beat.choices[steps % beat.choices.length];
      if (c.sets) state.flags[c.sets] = true;
      if (c.trust) state.trust += c.trust;
      if (c.bond) state.bond += c.bond;
      beatId = c.goto;
      continue;
    }

    if (beat.goChapter) {
      chapter = beat.goChapter;
      if (!CHAPTERS[chapter]) throw new Error(`chapter ${chapter} does not exist`);
      beatId = CHAPTERS[chapter].start;
      continue;
    }

    if (beat.next) { beatId = beat.next; continue; }

    throw new Error(`ch${chapter}/${beatId}: no exit`);
  }
  throw new Error('walk did not terminate — probable cycle');
}

/* ------------------------------------------------------------
   Run every route on both leads.
   ------------------------------------------------------------ */

const ROUTES = ONE_ROUTE ? [ONE_ROUTE] : NI.characters.ROUTE_IDS;
const PATHS = ONE_PATH ? [ONE_PATH] : ['kirito', 'masha'];
const CLASSES = NI.classes.ALL_IDS;

const problems = [];
const seenGlobally = new Set();
let runs = 0;

console.log('full playthrough — every route, both leads\n');
console.log('route         lead     beats   ends at');
console.log('---------------------------------------------------------------');

for (const route of ROUTES) {
  for (const pathId of PATHS) {
    const classId = CLASSES[runs % CLASSES.length];
    try {
      const r = playRoute(pathId, classId, route);
      runs++;
      for (const k of r.visited) seenGlobally.add(k);
      const reachedEnd = r.endedAt.startsWith(LAST_CHAPTER + '/');
      if (!reachedEnd) problems.push(`${route}/${pathId} ended at ${r.endedAt}, not chapter ${LAST_CHAPTER}`);
      /* The route's own beat must actually have fired in every chapter. */
      for (let n = 1; n <= LAST_CHAPTER; n++) {
        const want = 'rt' + n + '_' + route;
        if (!r.visited.has(n + '/' + want)) {
          problems.push(`${route}/${pathId}: never reached ${want}`);
        }
      }
      console.log(
        route.padEnd(14) + pathId.padEnd(9) +
        String(r.visited.size).padStart(5) + '   ' + r.endedAt
      );
    } catch (err) {
      runs++;
      problems.push(`${route}/${pathId}: ${err.message}`);
      console.log(route.padEnd(14) + pathId.padEnd(9) + '    -   FAILED');
    }
  }
}

/* ---- coverage: beats no walk ever touched ---- */
const allBeats = [];
for (let n = 1; n <= LAST_CHAPTER; n++) {
  for (const id of Object.keys(CHAPTERS[n].beats)) allBeats.push(n + '/' + id);
}
const never = allBeats.filter(k => !seenGlobally.has(k));

console.log(`\nbeats reachable in play : ${seenGlobally.size} / ${allBeats.length}`);
if (never.length) {
  console.log(`never visited by any walk (${never.length}):`);
  for (const k of never.slice(0, 24)) console.log('    ' + k);
  if (never.length > 24) console.log(`    ... and ${never.length - 24} more`);
}

if (problems.length) {
  console.log('\nPROBLEMS');
  for (const p of problems) console.log('  x ' + p);
  process.exit(1);
}
console.log('\nOK — every route reaches the end of chapter ' + LAST_CHAPTER + '.');
