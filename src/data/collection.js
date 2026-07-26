/* ============================================================
   collection.js — owning Echoes (§10).

   All the rules about acquiring, upgrading and spending sit here
   rather than in the UI, so the same logic runs in the browser
   and in tools/qa-echoes.mjs.

   SAVE SHAPE
   ----------
     state.echoes  = [ { id, bond, caught } ]
     state.shards  = number
     state.equipped = echoId | null
     state.breachBest = number

   Every function takes the game state and mutates it, returning
   a small report the caller can turn into a toast or a card.
   Nothing here touches the DOM.
   ============================================================ */

window.NI = window.NI || {};

NI.collection = (function () {

  /* ------------------------------------------------------------
     Access
     ------------------------------------------------------------ */

  function all(state) { return state.echoes || (state.echoes = []); }

  function owned(state, id) { return all(state).find(e => e.id === id) || null; }

  function equipped(state) {
    if (!state.equipped) return null;
    return owned(state, state.equipped);
  }

  /* ------------------------------------------------------------
     Acquiring
     ------------------------------------------------------------ */

  /**
   * Add an Echo. A duplicate raises bond instead of stacking, up to the cap;
   * past the cap it converts to shards so a legendary duplicate is never a
   * pure disappointment.
   *
   * @returns {object} { id, name, isNew, bond, maxed, shards }
   */
  function grant(state, id) {
    const def = NI.echoes.get(id);
    if (!def) return null;

    const have = owned(state, id);
    if (!have) {
      all(state).push({ id, bond: 1, caught: 1 });
      /* First Echo auto-equips. Making the player visit a menu before their
         reward does anything is a bad first impression of the whole system. */
      if (!state.equipped) state.equipped = id;
      return { id, name: def.name, isNew: true, bond: 1, maxed: false, shards: 0 };
    }

    have.caught = (have.caught || 1) + 1;

    if (have.bond >= NI.echoes.BOND_MAX) {
      const refund = NI.breach.RELEASE_REFUND;
      state.shards = (state.shards || 0) + refund;
      return { id, name: def.name, isNew: false, bond: have.bond, maxed: true, shards: refund };
    }

    have.bond += 1;
    return { id, name: def.name, isNew: false, bond: have.bond, maxed: false, shards: 0 };
  }

  /**
   * Roll every defeated foe for a bind. Called once on victory.
   * @returns {Array} grant reports, one per Echo actually bound
   */
  function rollCatches(state, foes, waveNo, rand) {
    const r = rand || Math.random;
    const got = [];
    for (const f of foes) {
      if (f.alive) continue;
      const chance = NI.breach.catchChance(f.enemyId, waveNo || 1);
      if (chance > 0 && r() < chance) {
        const report = grant(state, NI.echoes.fromEnemy(f.enemyId));
        if (report) got.push(report);
      }
    }
    return got;
  }

  /* ------------------------------------------------------------
     Gacha
     ------------------------------------------------------------ */

  function canPull(state) {
    return (state.shards || 0) >= NI.breach.PULL_COST;
  }

  /**
   * One pull. Weighted by rarity; spends shards; may return a duplicate,
   * which is the point of bond existing.
   * @returns {object|null} grant report, or null when it cannot be afforded
   */
  function pull(state, rand) {
    if (!canPull(state)) return null;
    const r = rand || Math.random;
    state.shards -= NI.breach.PULL_COST;
    state.pity = (state.pity || 0) + 1;

    let table = NI.echoes.pullTable();

    /* Pity. Without it the distribution has a tail a real player will
       actually hit: the unlucky quarter of players would pull sixty times
       and see nothing above epic, conclude the legendaries are fake, and
       stop. Guaranteeing one every PITY_AT pulls costs the lucky player
       nothing and rescues the unlucky one. */
    if (state.pity >= PITY_AT) {
      table = table.filter(t => NI.echoes.get(t.id).star === 5);
    }

    const total = table.reduce((n, t) => n + t.weight, 0);
    let x = r() * total;
    let chosen = table[0];
    for (const t of table) { x -= t.weight; if (x <= 0) { chosen = t; break; } }

    if (NI.echoes.get(chosen.id).star === 5) state.pity = 0;

    const report = grant(state, chosen.id);
    if (report) report.pity = PITY_AT - (state.pity || 0);
    return report;
  }

  /** Pulls without a legendary before one is guaranteed. */
  const PITY_AT = 35;

  /* ------------------------------------------------------------
     Spending
     ------------------------------------------------------------ */

  function equip(state, id) {
    if (id && !owned(state, id)) return false;
    state.equipped = id || null;
    return true;
  }

  /**
   * Release an Echo for shards. Refuses the last copy of an equipped one
   * rather than silently unequipping — losing the creature you were using
   * because you mis-tapped is not a recoverable mistake in a game with one
   * save slot.
   */
  function release(state, id) {
    const have = owned(state, id);
    if (!have) return { ok: false, why: 'not owned' };
    if (state.equipped === id) return { ok: false, why: 'equipped' };

    state.echoes = all(state).filter(e => e.id !== id);
    const refund = NI.breach.RELEASE_REFUND * (have.bond || 1);
    state.shards = (state.shards || 0) + refund;
    return { ok: true, shards: refund };
  }

  /* ------------------------------------------------------------
     Summary
     ------------------------------------------------------------ */

  function progress(state) {
    const list = all(state);
    const byRarity = {};
    for (const key of Object.keys(NI.echoes.STARS)) byRarity[key] = { have: 0, total: 0 };
    for (const id of NI.echoes.ALL_IDS) byRarity[NI.echoes.get(id).star].total++;
    for (const e of list) {
      const def = NI.echoes.get(e.id);
      if (def) byRarity[def.star].have++;
    }
    return {
      have: list.length,
      total: NI.echoes.ALL_IDS.length,
      shards: state.shards || 0,
      best: state.breachBest || 0,
      byRarity
    };
  }

  return {
    all, owned, equipped, grant, rollCatches,
    canPull, pull, equip, release, progress, PITY_AT
  };
})();
