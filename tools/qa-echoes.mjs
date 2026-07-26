/* ============================================================
   qa-echoes.mjs — checks the Echo and Breach systems.

     node tools/qa-echoes.mjs           # structure + 300 runs
     node tools/qa-echoes.mjs 1200

   Three jobs:

   1. Structure. Every Echo must point at a real enemy (that is
      where its art comes from), carry usable skills, and target
      the correct side. An Echo whose support skill aims across
      the field heals the boss, and no win-rate table will ever
      show you that.

   2. Contribution, measured as BREACH DEPTH.

      The first version of this file benchmarked a fresh level-10
      party against Warden Prime and every row read 100% — with
      or without an Echo, common or legendary. That is not a
      balance result, it is a broken instrument: the story's
      difficulty is attrition across sixteen fights, so any
      single fight against a rested party is free. Depth reached
      in a gauntlet has no ceiling and is the thing the mode is
      actually scored on, so that is what gets measured here.

   3. The economy. How long the roster takes to complete, so
      "collect them all" is a goal rather than a taunt.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUNS = Number(process.argv[2]) || 300;

const ctx = vm.createContext({ console, Math, Date, JSON });
ctx.window = ctx;
ctx.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add(){}, remove(){} } }) };

for (const f of [
  'src/data/classes.js', 'src/data/enemies.js', 'src/data/echoes.js',
  'src/data/breach.js', 'src/data/collection.js', 'src/data/characters.js',
  'src/battle/battleSystem.js', 'src/ui/skillTree.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}

const NI = ctx.NI;
const problems = [];

/* ============================================================
   1. Structure
   ============================================================ */

const FRIENDLY = new Set(['ally', 'allAllies', 'self']);
const rarityCount = {};

for (const id of NI.echoes.ALL_IDS) {
  const e = NI.echoes.get(id);

  /* 5-star banner exclusives have no source enemy on purpose. */
  if (e.from && !NI.enemies.get(e.from)) {
    problems.push(`${id}: source enemy "${e.from}" does not exist — no art to draw`);
  }
  if (!NI.echoes.STARS[e.star]) problems.push(`${id}: unknown star tier "${e.star}"`);
  if (!e.from && e.star !== 5) problems.push(`${id}: only 5-star Echoes may be summon-only`);
  if (!e.art) problems.push(`${id}: no art prompt — nothing to generate`);
  rarityCount[e.star] = (rarityCount[e.star] || 0) + 1;

  if (!e.skills || e.skills.length < 2) problems.push(`${id}: needs at least 2 skills`);

  for (const s of e.skills || []) {
    const friendly = FRIENDLY.has(s.target || 'enemy');
    if (friendly && s.power > 0) {
      problems.push(`${id}/${s.name}: aims at allies but deals ${s.power} damage`);
    }
    if (!friendly && (s.heal || s.shield)) {
      problems.push(`${id}/${s.name}: aims at enemies but heals/shields them`);
    }
    if (!s.weight) problems.push(`${id}/${s.name}: no weight — will never be picked fairly`);
  }

  if (e.from && NI.echoes.fromEnemy(e.from) !== id) {
    problems.push(`${id}: fromEnemy("${e.from}") does not map back`);
  }
  if (!e.from && NI.echoes.fromEnemy(e.from)) {
    problems.push(`${id}: summon-only but reachable by catching`);
  }
}

for (const enemyId of Object.keys(NI.enemies.ENEMIES)) {
  if (!NI.echoes.fromEnemy(enemyId)) {
    problems.push(`enemy ${enemyId} has no Echo — defeating it can never drop one`);
  }
}

/* Breach must never generate a wave the stage cannot draw or the engine
   cannot resolve. */
for (let w = 1; w <= 40; w++) {
  const enc = NI.breach.wave(w, Math.random);
  if (!enc.foes.length || enc.foes.length > 3) {
    problems.push(`breach wave ${w}: ${enc.foes.length} foes (must be 1-3)`);
  }
  for (const f of enc.foes) {
    if (!NI.enemies.get(f)) problems.push(`breach wave ${w}: unknown enemy "${f}"`);
  }
}

/* ============================================================
   2. Breach depth
   ============================================================ */

function endgameParty(a, b) {
  const build = (id, cid) => {
    const m = { id, name: id, classId: cid, level: 10, xp: 0, points: 10, unlocked: [] };
    let guard = 30;
    while (m.points > 0 && guard-- > 0) {
      const n = NI.classes.allNodes(cid)
        .filter(x => NI.tree.canBuy(m, x).ok)
        .sort((p, q) => (p.tier - q.tier) || ((q.type === 'active') - (p.type === 'active')))[0];
      if (!n) break;
      m.unlocked.push(n.id); m.points--;
    }
    const s = NI.battle.buildStats(m);
    m.hp = s.hp; m.mp = s.mp;
    return m;
  };
  return [build('lead', a), build('mate', b)];
}

function playerAction(B, unit) {
  const foes = B.foesAlive();
  if (!foes.length) return { kind: 'guard' };
  const affordable = unit.skills.filter(s => (s.mp || 0) <= unit.mp);
  if (!affordable.length) return { kind: 'guard' };

  const hurt = unit.hp / unit.maxHp;
  if (hurt < 0.3 && unit.mp < unit.maxMp * 0.25) return { kind: 'guard' };

  const target = foes.slice().sort((a, b) => a.hp - b.hp)[0];
  const score = s => {
    const hits = Math.max(1, s.hits || 1);
    const stat = s.scaling === 'mag' ? unit.stats.mag
               : s.scaling === 'def' ? unit.stats.def : unit.stats.atk;
    let raw = ((s.power || 0) + (stat * 0.75) / hits) * hits;
    const cc = Math.min(1, ((unit.stats.crit || 0) + (s.critBonus || 0)) / 100);
    raw *= s.alwaysCrit ? (1.6 + (unit.stats.critMult || 0))
                        : (1 + cc * (0.6 + (unit.stats.critMult || 0)));
    const dfn = (target.stats.def || 0) * (1 - (s.defPierce || 0));
    raw *= 100 / (100 + dfn * 2.2);
    if (s.target === 'allEnemies') raw *= Math.min(foes.length, 3);
    return raw;
  };
  const best = affordable.slice().sort((a, b) => score(b) - score(a))[0];
  return { kind: 'skill', skillId: best.id, targetUid: target.uid };
}

/** One Breach run. Returns the last wave cleared. */
function breachRun(echo, maxWave = 60) {
  const party = endgameParty('fighter', 'mage');
  let wave = 1;

  while (wave <= maxWave) {
    const enc = NI.breach.wave(wave, Math.random);
    const B = NI.battle.create(party, enc, echo);

    let guard = 600;
    while (!B.over && guard-- > 0) {
      const r = B.advance();
      if (r && r.waiting) B.act(r.waiting, playerAction(B, r.waiting));
    }
    if (!B.won) return wave - 1;

    /* Carry damage forward — attrition is the entire mode. */
    const heal = NI.breach.recoveryAfter(wave);
    for (let i = 0; i < party.length; i++) {
      const u = B.allies[i];
      if (!u) continue;
      party[i].hp = Math.min(u.maxHp, Math.max(1, Math.round(u.hp + u.maxHp * heal)));
      party[i].mp = Math.min(u.maxMp, Math.round(u.mp + u.maxMp * heal));
    }
    wave++;
  }
  return maxWave;
}

function depthStats(echo, runs) {
  const out = [];
  for (let i = 0; i < runs; i++) out.push(breachRun(echo));
  out.sort((a, b) => a - b);
  const mean = out.reduce((n, x) => n + x, 0) / out.length;
  return { mean, median: out[Math.floor(out.length / 2)], best: out[out.length - 1] };
}

/* ============================================================
   3. Economy
   ============================================================ */

function pullsToComplete(trials) {
  let total = 0;
  for (let t = 0; t < trials; t++) {
    const state = { echoes: [], shards: 0, equipped: null };
    let pulls = 0;
    while (NI.collection.progress(state).have < NI.echoes.ALL_IDS.length && pulls < 20000) {
      state.shards = NI.breach.PULL_COST;
      NI.collection.pull(state, Math.random);
      pulls++;
    }
    total += pulls;
  }
  return Math.round(total / trials);
}

/* ============================================================
   Report
   ============================================================ */

console.log(`\nEchoes: ${NI.echoes.ALL_IDS.length}  (` +
  Object.entries(rarityCount).sort().map(([k, v]) => `${v} x ${k}★`).join(', ') + ')');

const runs = Math.max(60, Math.round(RUNS / 6));
console.log(`\nBreach depth — level-10 fighter+mage, ${runs} runs per row\n`);
console.log('echo               stars       bond   mean  median   best   delta');
console.log('------------------------------------------------------------------');

const base = depthStats(null, runs);
console.log(`(none)             —              —  ${base.mean.toFixed(1).padStart(5)}  ` +
            `${String(base.median).padStart(6)}  ${String(base.best).padStart(5)}       —`);

const sample = ['shardling', 'stalkerling', 'golemling', 'seraphling', 'kagura', 'ouros', 'sovereign'];
const deltas = [];
for (const id of sample) {
  for (const bond of [1, 5]) {
    const s = depthStats({ id, bond }, runs);
    const d = s.mean - base.mean;
    deltas.push({ id, bond, d });
    console.log(
      `${id.padEnd(18)} ${(NI.echoes.get(id).star + '★').padEnd(10)} ${String(bond).padStart(4)}  ` +
      `${s.mean.toFixed(1).padStart(5)}  ${String(s.median).padStart(6)}  ` +
      `${String(s.best).padStart(5)}   ${(d >= 0 ? '+' : '') + d.toFixed(1)}`);
  }
}

const need = pullsToComplete(200);
console.log(`\nGacha: ${need} pulls to complete the roster ` +
            `(${need * NI.breach.PULL_COST} shards, about ` +
            `${Math.round(need * NI.breach.PULL_COST / (NI.breach.shardsFor(8) * 8))} full runs to wave 8)`);

/* An Echo that changes nothing is not a reward; one that carries the run
   makes the party irrelevant. Both are failures, and both are quiet.

   The ceiling is one full doubling of depth. That is not arbitrary: waves
   scale +9% each, so depth grows roughly with the LOG of party power, and a
   third body worth ~55% of a member is about +30% power — which buys around
   3-4 waves. Anything near double means an Echo is contributing more than
   the two characters the game is about, and the first cut of this roster did
   exactly that (+11.6 on a base of 6.6) before the wardens were trimmed. */
const b1 = deltas.filter(x => x.bond === 1).map(x => x.d);
const b5 = deltas.filter(x => x.bond === 5).map(x => x.d);

if (Math.min(...b1) < 0.8) {
  problems.push(`weakest Echo at bond 1 adds ${Math.min(...b1).toFixed(1)} waves — not felt`);
}

/* Two ceilings, because bond 1 and bond 5 are not the same claim.
   A freshly summoned Echo must not double a run on its own — that is the
   check that caught the first roster, where an epic warden added 11.6 waves
   to a 6.6-wave base straight out of the box.
   Bond 5 is five copies of the same Echo, which is on the order of a hundred
   pulls. It is the ceiling of the whole mode and it is allowed to be
   transformative; capping it at parity with bond 1 would mean investment
   bought nothing. 1.4x is where "extends the run a lot" becomes "the party
   is a passenger".
   Both numbers are judgement calls, but they are judgement calls made after
   looking at the measurements rather than before. */
if (Math.max(...b1) > base.mean * 1.05) {
  problems.push(`best Echo at bond 1 adds ${Math.max(...b1).toFixed(1)} waves ` +
                `against a base of ${base.mean.toFixed(1)} — too strong untrained`);
}
if (Math.max(...b5) > base.mean * 1.4) {
  problems.push(`best Echo at bond 5 adds ${Math.max(...b5).toFixed(1)} waves ` +
                `against a base of ${base.mean.toFixed(1)} — it is carrying the run`);
}

/* Rarity has to track how much a thing changes a run, or the gacha is
   lying about what it is selling. Compared at equal bond. */
const byRarity = {};
for (const { id, bond, d } of deltas) {
  if (bond !== 1) continue;
  const r = NI.echoes.get(id).star;
  byRarity[r] = Math.max(byRarity[r] == null ? -Infinity : byRarity[r], d);
}
const order = [3, 4, 5].filter(r => byRarity[r] != null);
for (let i = 1; i < order.length; i++) {
  if (byRarity[order[i]] < byRarity[order[i - 1]]) {
    problems.push(`${order[i]}★ (+${byRarity[order[i]].toFixed(1)}) is worth less than ` +
                  `${order[i - 1]}★ (+${byRarity[order[i - 1]].toFixed(1)}) — stars do not track power`);
  }
}
if (base.mean < 4)  problems.push(`base run ends at wave ${base.mean.toFixed(1)} — too short to feel like a mode`);
if (base.mean > 30) problems.push(`base run reaches wave ${base.mean.toFixed(1)} — the ramp is too gentle`);

console.log('');
if (problems.length) {
  console.log('PROBLEMS');
  for (const p of problems) console.log('  ! ' + p);
  process.exitCode = 1;
} else {
  console.log('OK — Echo roster sound, contribution in range, economy reachable.');
}
