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
  /* ------------------------------------------------------------
     Rates

     Modelled on the standard gacha shape (Genshin, Wuthering Waves):
     a very low base rate, a soft-pity ramp near the end of the
     cycle, and a hard guarantee. That structure exists because a
     flat rate produces a long tail of players who pull eighty times
     and conclude the top tier is a lie — the ramp means almost
     everyone actually receives theirs in the seventies.

     Concretely: 0.5% per pull until 65, then climbing steeply, with
     a guarantee at 80. 4-star has its own ten-pull floor so a run of
     pulls is never entirely worthless.

     0.5% is low enough that an early 5-star is a genuine piece of
     luck — about one player in twenty hits one inside the ten free
     opening pulls — rather than something most players expect.
     ------------------------------------------------------------ */

  const PITY_AT      = 80;   // hard guarantee for a 5-star
  const SOFT_PITY_AT = 65;   // ramp begins
  const BASE_5       = 0.005;
  const SOFT_STEP    = 0.06; // added per pull past the soft threshold
  const BASE_4       = 0.06;
  const PITY_4       = 10;

  /* Each banner supplies its own base rate and thresholds; these stay as the
     defaults so anything calling without a banner behaves as before. */
  function fiveStarChance(pity, b) {
    const base = b ? b.base5 : BASE_5;
    const soft = b ? b.softAt : SOFT_PITY_AT;
    const hard = b ? b.pityAt : PITY_AT;
    if (pity + 1 >= hard) return 1;
    if (pity + 1 <= soft) return base;
    return Math.min(1, base + (pity + 1 - soft) * SOFT_STEP);
  }

  /** Weighted pick within one star tier, restricted to the banner's pool. */
  function pickOfStar(star, r, now, bannerId) {
    const b = NI.echoes.banner(bannerId);

    /* Featured rate-up. Applied only AFTER the tier has been decided, so it
       changes which 5-star you receive and never how often one arrives —
       the pity curve above and the shard economy are untouched by it.

       `now` is injectable because the featured Echo rotates daily. Without
       it, anything that simulates thousands of pulls in a loop holds the
       clock still and measures a world where one Echo is featured forever
       and the other five are permanently suppressed — which doubled the
       measured roster-completion cost and was purely an artefact. */
    if (star === 5 && b.hasFeatured && r() < NI.echoes.FEATURED_RATE) {
      return NI.echoes.featured(now);
    }

    const allowed = NI.echoes.poolFor(b.id);
    let pool = NI.echoes.pullTable()
      .filter(t => allowed.indexOf(t.id) >= 0 && NI.echoes.get(t.id).star === star);

    /* A small banner can legitimately have no Echo at some tier. Falling
       back to the next tier down beats returning undefined and crashing a
       pull — and it is the honest resolution, since the player was owed
       *something* from a tier that does not exist here. */
    if (!pool.length) {
      for (let s = star - 1; s >= 3 && !pool.length; s--) {
        pool = NI.echoes.pullTable()
          .filter(t => allowed.indexOf(t.id) >= 0 && NI.echoes.get(t.id).star === s);
      }
    }
    if (!pool.length) return allowed[0];

    const total = pool.reduce((n, t) => n + t.weight, 0);
    let x = r() * total;
    let chosen = pool[0];
    for (const t of pool) { x -= t.weight; if (x <= 0) { chosen = t; break; } }
    return chosen.id;
  }

  /* ------------------------------------------------------------
     Pull history

     Kept in the save so the summon screen can show what the account has
     actually done. Capped, and stores ids rather than whole records —
     a log that grows without limit would quietly bloat a save file that
     lives in localStorage.
     ------------------------------------------------------------ */

  const HISTORY_MAX = 60;

  function logPull(state, report, bannerId) {
    if (!Array.isArray(state.pullLog)) state.pullLog = [];
    state.pullLog.unshift({ id: report.id, star: report.star, at: Date.now(), b: bannerId });
    if (state.pullLog.length > HISTORY_MAX) state.pullLog.length = HISTORY_MAX;
  }

  function history(state) { return state.pullLog || []; }

  /**
   * One pull on a banner.
   *
   * Pity lives under the banner's own `pityKey`, so progress toward a
   * guarantee belongs to the banner it was earned on. A shared counter
   * would let a player grind 79 pulls of pity somewhere cheap and cash it
   * in somewhere else, which the interface does not promise and players
   * would rightly treat as a bug.
   */
  function pull(state, rand, now, bannerId) {
    if (!canPull(state)) return null;
    const r = rand || Math.random;
    const b = NI.echoes.banner(bannerId);
    const key = b.pityKey;
    state.shards -= NI.breach.PULL_COST;

    state[key] = (state[key] || 0);
    state.pity4 = (state.pity4 || 0);

    let star;
    if (r() < fiveStarChance(state[key], b)) {
      star = 5;
      state[key] = 0;
      state.pity4 = 0;
    } else {
      state[key] += 1;
      /* Four-star floor: guaranteed by the tenth pull without one. */
      if (state.pity4 + 1 >= PITY_4 || r() < BASE_4) {
        star = 4;
        state.pity4 = 0;
      } else {
        star = 3;
        state.pity4 += 1;
      }
    }

    const report = grant(state, pickOfStar(star, r, now, b.id));
    if (report) {
      report.star = star;
      report.banner = b.id;
      report.pity = b.pityAt - state[key];
      report.featured = b.hasFeatured && report.id === NI.echoes.featured(now);
      logPull(state, report, b.id);
    }
    return report;
  }

  /** Pity progress on a given banner, for the UI. */
  function pityOf(state, bannerId) {
    const b = NI.echoes.banner(bannerId);
    return { at: state[b.pityKey] || 0, soft: b.softAt, hard: b.pityAt };
  }

  /**
   * Ten pulls in one action — the primary summon in every modern gacha,
   * and the reason the four-star floor exists at all.
   *
   * Deliberately a loop over the single pull rather than its own rate
   * maths: every guarantee, the pity counters and the duplicate handling
   * are already correct in there, and a second implementation of the same
   * rules is a second thing to get out of step. It also means a ten-pull
   * and ten single pulls are genuinely identical, which is the honest
   * behaviour and the one players check.
   *
   * @returns {Array} up to ten grant reports; short if shards run out
   */
  function pullTen(state, rand, now, bannerId) {
    const out = [];
    for (let i = 0; i < 10; i++) {
      const r = pull(state, rand, now, bannerId);
      if (!r) break;
      out.push(r);
    }
    return out;
  }

  function canPullTen(state) {
    return (state.shards || 0) >= NI.breach.PULL_COST * 10;
  }

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
    canPull, canPullTen, pull, pullTen, history, pityOf,
    equip, release, progress,
    PITY_AT, SOFT_PITY_AT, BASE_5, BASE_4, PITY_4
  };
})();
