/* ============================================================
   breach.js — the endless endgame run (§10).

   A Breach is a gauntlet. You enter with the party you finished
   the story with, fight escalating waves without going back to
   town, and it ends when you are wiped. How deep you got is the
   score.

   Everything here is pure: given a wave number it returns the
   encounter, the rewards and the recovery. No DOM, no state, no
   randomness that the caller cannot seed. That is what lets
   tools/qa-echoes.mjs measure real runs instead of guessing.

   WHY A GAUNTLET AND NOT REPEATABLE BOSSES
   ----------------------------------------
   A full-health party at level 10 beats Warden Prime close to
   100% of the time — the story's difficulty comes from attrition
   across sixteen fights, not from any single one. So a "fight the
   boss again" endgame would be free, and measuring anything in it
   is impossible: every number reads 100%.

   Attrition is therefore the whole design. You recover a little
   between waves and never all of it, so a run ends because you
   ran out of resources, not because one fight was unfair.
   ============================================================ */

window.NI = window.NI || {};

NI.breach = (function () {

  /* ------------------------------------------------------------
     Wave composition
     ------------------------------------------------------------ */

  /* Drawn from the enemies the player has already met, so a Breach reads as
     "the world is leaking" rather than as a separate minigame with its own
     bestiary. Grouped by how hard they hit rather than by chapter. */
  /* `deep` is the staging bestiary from chapters 7-10. It exists because the
     Breach used to top out at the chapter-5 roster, so a run past wave 15 was
     the same four enemies at ever-larger multipliers — the numbers got bigger
     and nothing got more interesting. It also gives the second act's art a
     reason to appear outside the story, and its members something to drop. */
  const POOLS = {
    light: ['shardSlime', 'dataWisp', 'rustHound', 'sentryDrone'],
    mid:   ['brambleWarden', 'cinderMoth', 'voidStalker', 'glitchBoar'],
    heavy: ['hollowKnight', 'siegeGolem', 'echoDuelist'],
    deep:  ['greyboxWalker', 'strayInstance', 'iterationEcho', 'archivistShell', 'coreAspect'],
    apex:  ['nullSeraph', 'wardenPrime']
  };

  /* Every fifth wave is a single scaled apex enemy — a breather in pacing
     terms (one target, no crowd) that is anything but in damage terms. */
  const BOSS_EVERY = 5;

  function isBossWave(wave) { return wave % BOSS_EVERY === 0; }

  /**
   * Difficulty multiplier for a wave.
   *
   * Linear, not exponential. An exponential curve produces a run that is
   * trivial for twelve waves and then impossible on the thirteenth, which
   * reads as a bug rather than as a wall. +9% a wave means wave 20 is
   * roughly 2.7x wave 1 and the ramp is felt the whole way up.
   */
  function scaleFor(wave) {
    return 1 + (wave - 1) * 0.09;
  }

  /** Weighted pool choice — later waves stop drawing trash. */
  function poolFor(wave, rand) {
    if (isBossWave(wave)) return POOLS.apex;
    const r = rand();
    if (wave <= 3)  return r < 0.75 ? POOLS.light : POOLS.mid;
    if (wave <= 8)  return r < 0.45 ? POOLS.light : POOLS.mid;
    if (wave <= 14) return r < 0.40 ? POOLS.mid   : POOLS.heavy;
    if (wave <= 19) return r < 0.55 ? POOLS.heavy : POOLS.deep;
    return r < 0.25 ? POOLS.heavy : POOLS.deep;
  }

  /** How many enemies a wave fields. Capped at 3 — the stage fits three. */
  function countFor(wave, rand) {
    if (isBossWave(wave)) return 1;
    if (wave <= 2) return 1 + (rand() < 0.5 ? 1 : 0);
    if (wave <= 9) return 2;
    return rand() < 0.45 ? 3 : 2;
  }

  /**
   * Build the encounter for a wave.
   * @param {number} wave 1-based
   * @param {function} [rand] injectable RNG, so a run can be replayed
   * @returns {object} encounter literal for NI.battle.create
   */
  function wave(waveNo, rand) {
    const r = rand || Math.random;
    const pool = poolFor(waveNo, r);
    const n = countFor(waveNo, r);

    const foes = [];
    for (let i = 0; i < n; i++) {
      foes.push(pool[Math.floor(r() * pool.length)]);
    }

    const boss = isBossWave(waveNo);
    return {
      name: boss ? `BREACH ${waveNo} — SURGE` : `Breach ${waveNo}`,
      foes,
      boss,
      scale: scaleFor(waveNo)
    };
  }

  /* ------------------------------------------------------------
     Between waves
     ------------------------------------------------------------ */

  /**
   * Fraction of max HP/MP restored after clearing a wave.
   *
   * This single number is the difficulty dial for the whole mode. Too
   * generous and the run never ends; too stingy and it ends on wave four
   * regardless of how well the player is doing. Surge waves pay out more
   * because losing a run to the wave immediately after a boss — with no
   * chance to recover from it — is the least satisfying way to go out.
   */
  function recoveryAfter(waveNo) {
    return isBossWave(waveNo) ? 0.34 : 0.16;
  }

  /* ------------------------------------------------------------
     Rewards
     ------------------------------------------------------------ */

  /** Resonance shards for clearing a wave — the gacha currency.
   *
   * Raised once the pull rates moved to a real gacha curve (0.8% base,
   * hard pity at 80). At the old income a complete roster was roughly 345
   * runs, which is not a long-term goal, it is an unreachable one for a
   * game this size. */
  function shardsFor(waveNo) {
    return Math.round((20 + waveNo * 6) * (isBossWave(waveNo) ? 2.2 : 1));
  }

  /**
   * Chance to bind a defeated enemy into an Echo.
   *
   * Scaled down in deep waves on purpose: by wave 20 you are killing dozens
   * of enemies a run, and a flat rate would hand over the entire roster in
   * one sitting. The floor keeps it from ever being pointless.
   */
  function catchChance(enemyId, waveNo) {
    const echoId = NI.echoes.fromEnemy(enemyId);
    if (!echoId) return 0;
    const base = NI.echoes.rarity(NI.echoes.get(echoId).star).catchRate;
    return Math.max(base * 0.35, base * (1 - (waveNo - 1) * 0.03));
  }

  /* Cost of one gacha pull, and what releasing a duplicate gives back. */
  const PULL_COST = 100;
  const RELEASE_REFUND = 45;

  return {
    POOLS, BOSS_EVERY, PULL_COST, RELEASE_REFUND,
    wave, scaleFor, isBossWave, recoveryAfter, shardsFor, catchChance
  };
})();
