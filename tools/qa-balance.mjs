/* ============================================================
   qa-balance.mjs — Monte Carlo balance check.

   Plays whole 5-chapter runs against the REAL battle engine, not a
   model of it, so the numbers mean something. Every balance claim
   about this game should be produced by this file.

     node tools/qa-balance.mjs            # 800 runs per class
     node tools/qa-balance.mjs 3000

   Battle order is walked out of the story graph rather than
   hardcoded, so adding a fight to a chapter shows up here.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUNS = Number(process.argv[2]) || 800;

/* ---- load the game, browser-shaped ---- */
const ctx = vm.createContext({ console, Math, Date, JSON });
ctx.window = ctx;
/* skillTree.js only touches the DOM inside render paths we never call */
ctx.document = { getElementById: () => null, createElement: () => ({ style: {}, classList: { add(){}, remove(){} } }) };

for (const f of [
  'src/data/classes.js', 'src/data/enemies.js', 'src/data/characters.js',
  'src/battle/battleSystem.js', 'src/ui/skillTree.js',
  'src/data/chapters/chapter1.js', 'src/data/chapters/chapter2.js',
  'src/data/chapters/chapter3.js', 'src/data/chapters/chapter4.js',
  'src/data/chapters/chapter5.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
}

const NI = ctx.NI;
const CLASS_IDS = NI.classes.ALL_IDS;

/* ---- battle order, walked out of the story ---- */
function battleOrder(chapterNum) {
  const ch = NI.story['chapter' + chapterNum];
  const out = [];
  const seen = new Set();
  let id = ch.start;
  while (id && !seen.has(id)) {
    seen.add(id);
    const b = ch.beats[id];
    if (!b) break;
    if (b.battle) { out.push(b.battle); id = b.onWin; continue; }
    if (b.branch) { id = (b.branch[0] && b.branch[0].goto) || b.fallback; continue; }
    if (b.choices) { id = b.choices[0].goto; continue; }
    id = b.next;
  }
  return out;
}
const CHAPTERS = [1, 2, 3, 4, 5].map(battleOrder);

/* ---- party AI ---------------------------------------------------------- */

/**
 * Expected damage, mirroring battleSystem's formula closely enough to rank
 * options. Scoring on raw `power` alone silently mis-plays every crit- or
 * pierce-based class: it made the Ranger look 30 points worse than it is,
 * because a 38% crit chance is invisible to a power comparison.
 */
function expectedDamage(unit, skill, foe, foeCount) {
  const hits = Math.max(1, skill.hits || 1);
  const statVal = skill.scaling === 'mag' ? (unit.stats.mag || 0) : (unit.stats.atk || 0);
  let raw = ((skill.power || 0) + (statVal * 0.75) / hits) * hits;

  const critChance = Math.min(1, ((unit.stats.crit || 0) + (skill.critBonus || 0)) / 100);
  const critMult   = 1.6 + (unit.stats.critMult || 0);
  raw *= skill.alwaysCrit ? critMult : (1 + critChance * (critMult - 1));

  const dfn = (foe.stats?.def || 0) * (1 - (skill.defPierce || 0));
  let dmg = raw * (100 / (100 + dfn * 2.2));

  if (skill.target === 'allEnemies') dmg *= Math.min(foeCount, 3);
  return dmg;
}

function pickAction(B, unit) {
  const foes = B.foesAlive();
  if (!foes.length) return { kind: 'guard' };

  const affordable = unit.skills.filter(s => (s.mp || 0) <= unit.mp);

  /* heal/self-sustain first when badly hurt */
  const hurt = unit.hp / unit.maxHp;
  const heal = affordable.find(s => s.heal && hurt < 0.45);
  if (heal) return { kind: 'skill', skillId: heal.id, targetUid: unit.uid };

  /* no MP and hurt -> guard to bank some back */
  if (hurt < 0.25 && affordable.length <= 1 && unit.mp < unit.maxMp * 0.3) {
    return { kind: 'guard' };
  }

  /* focus the weakest foe so fights actually shrink */
  const target = foes.slice().sort((a, b) => a.hp - b.hp)[0];

  /* Setup skills (mark, defence-down) are worth a turn on anything that will
     outlive three of them — which is what a competent player does. */
  const marked = (target.statuses || []).some(s => s.type === 'mark');
  const best = affordable.slice()
    .sort((a, b) => expectedDamage(unit, b, target, foes.length)
                  - expectedDamage(unit, a, target, foes.length))[0]
    || unit.skills.find(s => s.basic);

  if (!marked) {
    const setup = affordable.find(s => s.status && s.status.type === 'mark');
    if (setup && target.hp > expectedDamage(unit, best, target, foes.length) * 3) {
      return { kind: 'skill', skillId: setup.id, targetUid: target.uid };
    }
  }

  return { kind: 'skill', skillId: best.id, targetUid: target.uid };
}

/* ---- skill point spending: greedy, actives first ----------------------- */

function spendPoints(m) {
  let guard = 40;
  while ((m.points || 0) > 0 && guard-- > 0) {
    const nodes = NI.classes.allNodes(m.classId)
      .filter(n => NI.tree.canBuy(m, n).ok)
      .sort((a, b) => (a.tier - b.tier) || ((b.type === 'active') - (a.type === 'active')));
    if (!nodes.length) break;
    m.unlocked.push(nodes[0].id);
    m.points--;
  }
}

/* ---- one full playthrough --------------------------------------------- */

function makeMember(id, classId) {
  const stats = NI.battle.buildStats({ classId, level: 1, unlocked: [] });
  return { id, name: id, classId, level: 1, xp: 0, points: 1, unlocked: [], hp: stats.hp, mp: stats.mp };
}

function runOnce(playerClass, fixedMate) {
  const mateClass = fixedMate || NI.classes.randomClassId(null);
  const state = {
    party: [makeMember('kirito', playerClass), makeMember('masha', mateClass)],
    trust: 0
  };

  let won = 0, lost = 0, bossWon = false;
  const chapterLevel = [];

  for (let c = 0; c < CHAPTERS.length; c++) {
    /* chapters are rest points — start whole */
    for (const m of state.party) {
      const s = NI.battle.buildStats(m);
      m.hp = s.hp; m.mp = s.mp;
    }
    chapterLevel.push(state.party[0].level);

    for (const key of CHAPTERS[c]) {
      for (const m of state.party) spendPoints(m);

      const B = NI.battle.create(state.party, key);
      let rounds = 0;
      while (rounds++ < 400) {
        const step = B.advance();
        if (step.done) break;
        B.act(step.waiting, pickAction(B, step.waiting));
      }
      B.flush();

      const victory = B.foes.every(f => !f.alive) && B.allies.some(a => a.alive);
      const isBoss = key === 'c5_prime';
      if (victory && isBoss) bossWon = true;

      /* carry HP/MP forward exactly as main.js does */
      for (const u of B.allies) {
        const m = state.party.find(p => p.id === u.uid);
        if (m) { m.hp = Math.max(1, u.hp); m.mp = u.mp; }
      }

      const foeXp = B.foes.reduce((n, f) => n + (f.xp || 0), 0);
      if (victory) {
        won++;
        NI.tree.awardXp(state, foeXp);
        for (const m of state.party) {
          const s = NI.battle.buildStats(m);
          m.hp = Math.min(s.hp, m.hp + Math.round(s.hp * 0.30));
          m.mp = Math.min(s.mp, m.mp + Math.round(s.mp * 0.25));
        }
      } else {
        lost++;
        NI.tree.awardXp(state, Math.round(foeXp * 0.4));
        for (const m of state.party) {
          const s = NI.battle.buildStats(m);
          m.hp = Math.max(1, Math.round(s.hp * 0.55));
          m.mp = Math.round(s.mp * 0.5);
        }
      }
    }
  }

  return { won, lost, bossWon, endLevel: state.party[0].level, chapterLevel };
}

/* ---- party-composition matrix ------------------------------------------
   Measured across a FULL run, not as an isolated level-8 duel. In isolation
   every pair beats Warden Prime 94-100%, because the fight that matters is
   the one you reach after the Seraph and the Escort have already spent your
   HP and MP. An isolated benchmark here reports 100% and tells you nothing.  */
if (process.argv.includes('--matrix')) {
  const ids = CLASS_IDS;
  const n = Math.max(120, Math.round(RUNS / 3));
  console.log(`party composition — boss clear across a full run, ${n} runs each\n`);
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i; j < ids.length; j++) {
      let boss = 0;
      for (let k = 0; k < n; k++) if (runOnce(ids[i], ids[j]).bossWon) boss++;
      out.push([`${ids[i]} + ${ids[j]}`, boss / n]);
    }
  }
  out.sort((a, b) => b[1] - a[1]);
  for (const [k, v] of out) console.log('  ' + k.padEnd(20) + (v * 100).toFixed(0) + '%');
  process.exit(0);
}

/* ---- report ------------------------------------------------------------ */

console.log(`${RUNS} runs per class, ${CHAPTERS.flat().length} battles per run\n`);
console.log('class     boss win   battles won   end LV   LV by chapter');
console.log('-------------------------------------------------------------------');

const perBattle = {};
for (const cls of CLASS_IDS) {
  let boss = 0, w = 0, l = 0, lv = 0;
  const chLv = [0, 0, 0, 0, 0];
  for (let i = 0; i < RUNS; i++) {
    const r = runOnce(cls);
    if (r.bossWon) boss++;
    w += r.won; l += r.lost; lv += r.endLevel;
    r.chapterLevel.forEach((v, k) => { chLv[k] += v; });
  }
  const pct = (n) => (n * 100 / RUNS).toFixed(1).padStart(5) + '%';
  console.log(
    cls.padEnd(9) +
    pct(boss).padEnd(11) +
    ((w * 100) / (w + l)).toFixed(1).padStart(9) + '%'.padEnd(6) +
    (lv / RUNS).toFixed(1).padStart(6) + '   ' +
    chLv.map(v => (v / RUNS).toFixed(1)).join(' / ')
  );
  perBattle[cls] = boss / RUNS;
}

const rates = CLASS_IDS.map(c => perBattle[c]);
const spread = Math.max(...rates) - Math.min(...rates);
console.log('\nboss-win spread between best and worst class: ' + (spread * 100).toFixed(1) + ' pts');
if (Math.min(...rates) < 0.25) console.log('! a class wins the boss under 25% of the time — likely unviable');
if (Math.max(...rates) > 0.95) console.log('! a class wins the boss over 95% of the time — likely trivial');
if (spread > 0.35) console.log('! classes are more than 35 points apart — one is strictly better');
