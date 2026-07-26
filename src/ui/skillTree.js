/* ============================================================
   skillTree.js — 5-tier skill matrix UI (§4).

   Shows both party members' trees on tabs (protagonist's chosen
   class, companion's randomised one). Tier gating is by character
   level, so tiers 4-5 stay visibly locked through Chapter 5 —
   that's deliberate future content, not an oversight.
   ============================================================ */

window.NI = window.NI || {};

NI.tree = (function () {

  const $ = id => document.getElementById(id);
  let state = null;
  let viewing = 0;         // index into state.party
  let onChange = null;

  function open(gameState, changeCb) {
    state = gameState;
    onChange = changeCb;
    viewing = 0;
    render();
  }

  function member() { return state.party[viewing]; }

  /* ------------------------------------------------------------
     Purchase rules
     ------------------------------------------------------------ */

  function owned(m, nodeId) { return (m.unlocked || []).includes(nodeId); }

  function tierUnlocked(m, tier) { return m.level >= NI.classes.tierLevel(tier); }

  /** A node needs: points, tier level, and any intra-tier prerequisite. */
  function canBuy(m, node) {
    if (owned(m, node.id)) return { ok: false, why: 'owned' };
    if (!tierUnlocked(m, node.tier)) return { ok: false, why: 'LV ' + NI.classes.tierLevel(node.tier) };
    if (node.needs && !owned(m, node.needs)) return { ok: false, why: 'prereq' };
    if ((m.points || 0) < 1) return { ok: false, why: 'no points' };
    return { ok: true, why: '' };
  }

  function buy(nodeId) {
    const m = member();
    const node = NI.classes.findNode(m.classId, nodeId);
    if (!node) return;
    const gate = canBuy(m, node);
    if (!gate.ok) return;

    m.unlocked = m.unlocked || [];
    m.unlocked.push(nodeId);
    m.points -= 1;

    /* Passive HP/MP boosts should apply immediately, not next battle. */
    const stats = NI.battle.buildStats(m);
    m.hp = Math.min(stats.hp, (m.hp || stats.hp) + (node.mods && node.mods.hp || 0));
    m.mp = Math.min(stats.mp, (m.mp || stats.mp) + (node.mods && node.mods.mp || 0));

    NI.screens.toast(`${node.name} unlocked`, 'cyan');
    render();
    if (onChange) onChange();
  }

  /* ------------------------------------------------------------
     Render
     ------------------------------------------------------------ */

  function render() {
    renderTabs();
    renderMeta();
    renderBody();
  }

  function renderTabs() {
    $('tree-tabs').innerHTML = state.party.map((m, i) => {
      const cls = NI.classes.get(m.classId);
      const dot = (m.points > 0) ? ' ●' : '';
      return `<button class="tree-tab ${i === viewing ? 'on' : ''}"
                style="${i === viewing ? `color:${cls.color}` : ''}"
                data-i="${i}">${m.name} · ${cls.name.toUpperCase()}${dot}</button>`;
    }).join('');

    $('tree-tabs').querySelectorAll('.tree-tab').forEach(b => {
      b.addEventListener('click', () => { viewing = +b.dataset.i; render(); });
    });
  }

  function renderMeta() {
    const m = member();
    const cls = NI.classes.get(m.classId);
    const stats = NI.battle.buildStats(m);
    const nextTier = [1, 2, 3, 4, 5].find(t => !tierUnlocked(m, t));

    $('tree-meta').innerHTML = `
      <span>LEVEL <b>${m.level}</b></span>
      <span>POINTS <b>${m.points || 0}</b></span>
      <span>EXP ${m.xp || 0} / ${xpForNext(m.level)}</span>
      <span style="color:${cls.color}">${cls.role}</span>
      <span>HP ${stats.hp} · MP ${stats.mp} · ATK ${stats.atk} · MAG ${stats.mag} · DEF ${stats.def} · SPD ${stats.spd}</span>
      ${nextTier ? `<span>TIER ${nextTier} AT LV <b>${NI.classes.tierLevel(nextTier)}</b></span>` : ''}
    `;
  }

  /* ------------------------------------------------------------
     Node mechanics — the numbers behind the flavour text
     ------------------------------------------------------------ */

  /* A passive's `desc` says "+14 Max MP, +2 MAG. The basics, held properly."
     — readable, but it means every stat line is hand-maintained prose that
     can drift out of step with `mods`. These tags are generated from the
     data, so they cannot lie. */
  const MOD_LABEL = {
    hp: v => `+${v} Max HP`,
    mp: v => `+${v} Max MP`,
    atk: v => `+${v} ATK`,
    mag: v => `+${v} MAG`,
    def: v => `+${v} DEF`,
    spd: v => `+${v} SPD`,
    crit: v => `+${v}% crit chance`,
    evade: v => `+${v}% evasion`,
    critMult: v => `+${Math.round(v * 100)}% crit damage`,
    comboBonus: v => `+${Math.round(v * 100)}% combo bonus`,
    hpRegen: v => `${v} HP per turn`,
    mpRegen: v => `${v} MP per turn`,
    thorns: v => `Reflect ${Math.round(v * 100)}% of melee damage`,
    critMp: v => `+${v} MP on a crit`,
    allyDef: v => `+${v} DEF to your partner`
  };

  function nodeTags(node) {
    if (node.type === 'active') return NI.battle.skillTags(node.skill);
    return Object.entries(node.mods || {})
      .map(([k, v]) => (MOD_LABEL[k] ? MOD_LABEL[k](v) : `${k} +${v}`));
  }

  function renderBody() {
    const m = member();
    const cls = NI.classes.get(m.classId);

    $('tree-body').innerHTML = cls.tiers.map(tier => {
      const unlocked = tierUnlocked(m, tier.tier);
      const nodes = tier.nodes.map(nodeRaw => {
        const node = { ...nodeRaw, tier: tier.tier };
        const has = owned(m, node.id);
        const gate = canBuy(m, node);
        const cssState = has ? 'owned' : (!gate.ok && gate.why !== 'no points') ? 'locked'
                       : gate.ok ? 'affordable' : '';
        const kind = node.type === 'active'
          ? `ACTIVE · ${node.skill.mp ? node.skill.mp + ' MP' : 'FREE'}`
          : 'PASSIVE';

        return `
          <button class="node ${cssState}" data-node="${node.id}" ${has || !gate.ok ? 'disabled' : ''}>
            <span class="node-ico" style="color:${has ? 'var(--green)' : cls.color}">
              ${NI.icons.get(node.icon)}
            </span>
            <span class="node-body">
              <span class="node-name">${node.name}</span>
              <span class="node-kind">${kind}${!has && !gate.ok && gate.why !== 'no points' ? ' · ' + gate.why.toUpperCase() : ''}</span>
              <span class="node-desc">${node.desc}</span>
              <span class="node-tags">${
                nodeTags(node).map(t => `<span class="tip-tag">${t}</span>`).join('')
              }</span>
            </span>
          </button>`;
      }).join('');

      return `
        <div class="tier-row">
          <div class="tier-head ${unlocked ? '' : 'locked'}">
            <span>TIER ${tier.tier}</span>
            <span class="th-line"></span>
            <span>${unlocked ? 'AVAILABLE' : 'LOCKED · LV ' + NI.classes.tierLevel(tier.tier)}</span>
          </div>
          <div class="node-grid">${nodes}</div>
        </div>`;
    }).join('');

    $('tree-body').querySelectorAll('.node').forEach(b => {
      b.addEventListener('click', () => buy(b.dataset.node));
    });
  }

  /* ------------------------------------------------------------
     Levelling
     ------------------------------------------------------------ */

  /**
   * Level curve, measured against the real engine (tools/qa-balance.mjs).
   *
   * At ^1.6 x16 a full run ended at level 7 with 7 skill points — exactly the
   * seven nodes in tiers 1-2, so the player never once had to choose, tier 3
   * was cosmetic, and boss clears sat at 21-49% depending on class. At ^1.5
   * x15 a run landed at level 8-9.
   *
   * ^1.48 x14 is the current curve: a run lands at level 9-10, so the player
   * gets nine or ten points against the eleven nodes of tiers 1-3 and reaches
   * tier 3 with enough left to actually build inside it. The early levels are
   * the ones that moved most (level 2 costs 77 instead of 82, level 3 costs
   * 108 instead of 118) because the grind that felt worst was chapter 1,
   * where you have one skill and nothing to spend.
   *
   * It does not go softer than this. At ^1.45 x13 the run ended at a flat
   * level 10 and boss clears hit 89-99% — the whole game stopped being a
   * game. Both that curve and this one were measured, not guessed.
   */
  function xpForNext(level) { return Math.round(38 + Math.pow(level, 1.48) * 14); }

  /**
   * Award XP to the whole party; returns a list of level-up notices.
   * Companion levels alongside the protagonist so its tree stays useful.
   */
  function awardXp(gameState, amount) {
    const ups = [];
    for (const m of gameState.party) {
      m.xp = (m.xp || 0) + amount;
      while (m.xp >= xpForNext(m.level)) {
        m.xp -= xpForNext(m.level);
        m.level += 1;
        m.points = (m.points || 0) + 1;

        /* full restore on level-up keeps battle-heavy pacing viable */
        const stats = NI.battle.buildStats(m);
        m.hp = stats.hp;
        m.mp = stats.mp;
        ups.push({ name: m.name, level: m.level });
      }
    }
    return ups;
  }

  return { open, render, awardXp, xpForNext, tierUnlocked, canBuy };
})();
