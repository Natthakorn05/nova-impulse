/* ============================================================
   battleSystem.js — skill-driven party combat (§5).

   Headless by design: this module never touches the DOM. It owns
   the rules and emits a timeline of events; battleHud.js and the
   Phaser stage decide how to draw them. That split is what makes
   the combat testable and lets the HUD be redesigned freely.

   Key mechanics
   -------------
   * Turn order  — recomputed each round from effective SPD, so
                   Slow/Haste actually move the queue (§6).
   * Combo       — a skill tagged with `combo` hits harder if your
                   partner already acted this round (§5).
   * One pipeline — enemy skills resolve through the exact same
                   damage code as player skills. No duplicate math.
   ============================================================ */

window.NI = window.NI || {};

NI.battle = (function () {

  const CRIT_MULT  = 1.6;
  const VARIANCE   = 0.12;   // ±12% damage roll
  const GUARD_CUT  = 0.45;   // damage taken while guarding
  const GUARD_MP   = 8;
  const STAT_SCALE = 0.75;   // how hard ATK/MAG/DEF push damage

  const rnd  = (lo, hi) => lo + Math.random() * (hi - lo);
  const roll = n => Math.random() < n;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  /* ============================================================
     Stat assembly — base + level growth + skill tree passives
     ============================================================ */

  /**
   * Build the effective stat block for a party member.
   * Passive nodes and equipment-like modifiers all fold in here so
   * the rest of the system only ever reads finished numbers.
   */
  function buildStats(member) {
    const cls = NI.classes.get(member.classId);
    const lv = member.level || 1;
    const g = cls.growth;

    const s = {
      hp:    Math.round(cls.base.hp  + g.hp  * (lv - 1)),
      mp:    Math.round(cls.base.mp  + g.mp  * (lv - 1)),
      atk:   Math.round(cls.base.atk + g.atk * (lv - 1)),
      mag:   Math.round(cls.base.mag + g.mag * (lv - 1)),
      def:   Math.round(cls.base.def + g.def * (lv - 1)),
      spd:   Math.round(cls.base.spd + g.spd * (lv - 1)),
      crit:  cls.base.crit,
      evade: cls.base.evade,
      critMult: 0, comboBonus: 0, hpRegen: 0, mpRegen: 0,
      thorns: 0, critMp: 0, allyDef: 0
    };

    for (const nodeId of (member.unlocked || [])) {
      const node = NI.classes.findNode(member.classId, nodeId);
      if (!node || node.type !== 'passive' || !node.mods) continue;
      for (const [k, v] of Object.entries(node.mods)) {
        s[k] = (s[k] || 0) + v;
      }
    }
    return s;
  }

  /** Active skills the member has actually unlocked, plus their basic. */
  function skillsFor(member) {
    const cls = NI.classes.get(member.classId);
    const list = [{
      id: 'basic',
      name: cls.basic.name,
      icon: cls.basic.icon,
      basic: true,
      desc: 'Your free attack. No MP, no cooldown — what you fall back on ' +
            'when the interesting options are spent.',
      mp: 0, power: cls.basic.power, scaling: cls.basic.scaling,
      target: 'enemy', element: cls.basic.element, combo: 1.15
    }];

    for (const nodeId of (member.unlocked || [])) {
      const node = NI.classes.findNode(member.classId, nodeId);
      if (!node || node.type !== 'active' || !node.skill) continue;
      /* desc travels with the skill so the battle HUD can explain it without
         reaching back into the class tree to find the node it came from. */
      list.push({ id: node.id, name: node.name, icon: node.icon, desc: node.desc, ...node.skill });
    }
    return list;
  }

  /* ============================================================
     Skill description — the same words in the tree and in battle
     ============================================================ */

  const ELEMENT_LABEL = {
    fire: 'Fire', ice: 'Ice', storm: 'Storm', dark: 'Dark', light: 'Light',
    nature: 'Nature', arcane: 'Arcane', physical: 'Physical'
  };

  const TARGET_LABEL = {
    enemy: 'One enemy', allEnemies: 'All enemies', ally: 'One ally',
    allAllies: 'Whole party', self: 'Self'
  };

  const STATUS_LABEL = {
    burn: 'Burn', poison: 'Poison', bleed: 'Bleed', slow: 'Slow',
    freeze: 'Freeze', stun: 'Stun', mark: 'Mark', taunt: 'Taunt'
  };

  function pctOf(n) { return Math.round(n * 100) + '%'; }

  function statusTag(s) {
    const name = STATUS_LABEL[s.type] || s.type;
    const odds = s.chance >= 1 ? '' : pctOf(s.chance) + ' ';
    const turns = s.turns ? ` ${s.turns}t` : '';
    return `${odds}${name}${turns}`;
  }

  /**
   * Short mechanical tags for a skill, in the order a player reads them:
   * what it hits, what it costs, then everything unusual about it.
   *
   * The `desc` field on a node is flavour and deliberately vague ("good
   * chance to inflict Burn"). These are the actual numbers, so a player can
   * compare two skills without opening the source.
   */
  function skillTags(skill) {
    const t = [];
    if (!skill) return t;

    t.push(TARGET_LABEL[skill.target || 'enemy'] || 'One enemy');
    if (skill.element && skill.element !== 'none') {
      t.push(ELEMENT_LABEL[skill.element] || skill.element);
    }
    if (skill.power) {
      const stat = (skill.scaling || 'atk').toUpperCase();
      t.push(`Power ${skill.power} · ${stat}`);
    }
    if (skill.hits > 1)         t.push(`${skill.hits} hits`);
    if (skill.combo)           t.push(`Combo x${skill.combo.toFixed(2).replace(/0$/, '')}`);
    if (skill.critBonus)       t.push(`+${skill.critBonus}% crit`);
    if (skill.alwaysCrit)      t.push('Always crits');
    if (skill.defPierce)       t.push(`Ignores ${pctOf(skill.defPierce)} DEF`);
    if (skill.lifesteal)       t.push(`Heals ${pctOf(skill.lifesteal)} of damage`);
    if (skill.bonusVs) {
      const names = skill.bonusVs.status.map(s => STATUS_LABEL[s] || s).join('/');
      t.push(`+${Math.round((skill.bonusVs.mult - 1) * 100)}% vs ${names}`);
    }
    if (skill.executeBelow) {
      t.push(`x${skill.executeMult || 2} below ${pctOf(skill.executeBelow)} HP`);
    }
    if (skill.missingHpScale)  t.push('Stronger the more HP you have lost');
    if (skill.status)          t.push(statusTag(skill.status));
    if (skill.status2)         t.push(statusTag(skill.status2));

    if (skill.selfBuff) {
      const parts = Object.entries(skill.selfBuff)
        .filter(([k]) => k !== 'turns')
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`);
      t.push(`Self: ${parts.join(', ')}${skill.selfBuff.turns ? ` ${skill.selfBuff.turns}t` : ''}`);
    }
    if (skill.allyBuff && skill.allyBuff.damageTaken != null) {
      t.push(`Takes ${pctOf(1 - skill.allyBuff.damageTaken)} less damage` +
             (skill.allyBuff.turns ? ` ${skill.allyBuff.turns}t` : ''));
    }
    if (skill.shield)          t.push('Absorbs damage outright');
    if (skill.guardian)        t.push(`Cannot drop below 1 HP · ${skill.guardian}t`);
    if (skill.heal)            t.push(`Heals ${skill.heal}`);
    if (skill.selfHeal)        t.push(`Heals self ${skill.selfHeal}`);
    if (skill.restoreMp)       t.push(`+${skill.restoreMp} MP`);
    if (skill.cleanse)         t.push('Clears status effects');
    if (skill.cooldown)        t.push(`Cooldown ${skill.cooldown}t`);

    return t;
  }

  /* ============================================================
     Combatant construction
     ============================================================ */

  function makeAlly(member, side) {
    const stats = buildStats(member);
    return {
      uid: member.id,
      side, kind: 'ally',
      name: member.name,
      classId: member.classId,
      color: NI.classes.get(member.classId).color,
      level: member.level,
      stats,
      hp: member.hp != null ? Math.min(member.hp, stats.hp) : stats.hp,
      maxHp: stats.hp,
      mp: member.mp != null ? Math.min(member.mp, stats.mp) : stats.mp,
      maxMp: stats.mp,
      skills: skillsFor(member),
      statuses: [], buffs: [], cooldowns: {},
      shield: 0, guarding: false, alive: true, actedThisRound: false
    };
  }

  /**
   * Build the third party slot from an owned Echo.
   *
   * `auto: true` is the important field. The Echo takes its own turn from
   * the same weighted picker the enemies use, rather than stopping the loop
   * for input. That is a design choice: a pet the player micromanages is a
   * third set of buttons every round and doubles the length of a fight,
   * and the Echo's job is to change how a fight feels, not how long it is.
   */
  function makeEcho(owned, partyLevel) {
    const def = NI.echoes.get(owned.id);
    if (!def) return null;
    const stats = NI.echoes.stats(owned, partyLevel);
    const r = NI.echoes.rarity(def.star);

    return {
      uid: 'echo',
      side: 'party', kind: 'echo', auto: true,
      name: def.name,
      echoId: def.id,
      enemyId: def.from,           // art key — Echoes reuse their source sprite
      star: def.star,
      role: def.role,
      bond: owned.bond || 1,
      color: r.color,
      level: partyLevel,
      stats,
      hp: stats.hp, maxHp: stats.hp, mp: 0, maxMp: 0,
      skills: def.skills.map((s, i) => ({ id: 'k' + i, ...s })),
      statuses: [], buffs: [], cooldowns: {},
      shield: 0, guarding: false, alive: true, actedThisRound: false
    };
  }

  /**
   * @param {number} [scale=1] flat multiplier on the enemy's combat numbers,
   *        used by Breach waves. Applied to the spawned copy, never to the
   *        template — NI.enemies.spawn already deep-copies, so scaling one
   *        wave cannot leak into the next.
   */
  function makeFoe(enemyId, index, scale) {
    const e = NI.enemies.spawn(enemyId);
    const k = scale || 1;
    if (k !== 1) {
      e.hp  = Math.round(e.hp  * k);
      e.atk = Math.round(e.atk * k);
      e.mag = Math.round(e.mag * k);
      /* Defence scales at a lower rate than offence on purpose. Multiplying
         DEF at the same rate as HP makes deep waves immune rather than
         dangerous, because mitigation is already non-linear (100/(100+def*2.2)). */
      e.def = Math.round(e.def * (1 + (k - 1) * 0.55));
      e.xp  = Math.round(e.xp  * k);
    }
    return {
      uid: 'foe' + index,
      side: 'foe', kind: 'foe',
      name: e.name,
      enemyId: e.id,
      art: e.art,
      color: '#ff5f6d',
      stats: {
        hp: e.hp, mp: 0, atk: e.atk, mag: e.mag, def: e.def,
        spd: e.spd, crit: e.crit, evade: e.evade,
        critMult: 0, comboBonus: 0, hpRegen: 0, mpRegen: 0, thorns: 0
      },
      hp: e.hp, maxHp: e.hp, mp: 0, maxMp: 0,
      xp: e.xp,
      tier: e.tier,
      enrageAt: e.enrageAt, enrage: e.enrage, enraged: false,
      skills: e.skills.map((s, i) => ({ id: 'e' + i, ...s })),
      statuses: [], buffs: [], cooldowns: {},
      shield: 0, guarding: false, alive: true, actedThisRound: false
    };
  }

  /* ============================================================
     Effective stat reads (base + buffs + statuses)
     ============================================================ */

  function eff(unit, stat) {
    let v = unit.stats[stat] || 0;
    for (const b of unit.buffs) if (b[stat]) v += b[stat];
    if (stat === 'spd' && hasStatus(unit, 'slow')) v = Math.round(v * 0.6);
    return v;
  }

  function hasStatus(unit, type) {
    return unit.statuses.some(s => s.type === type);
  }

  function getStatus(unit, type) {
    return unit.statuses.find(s => s.type === type);
  }

  function addStatus(unit, type, turns, power) {
    const existing = getStatus(unit, type);
    if (existing) {
      existing.turns = Math.max(existing.turns, turns);
      if (power != null) existing.power = Math.max(existing.power || 0, power);
    } else {
      unit.statuses.push({ type, turns, power });
    }
  }

  /** Damage-taken multiplier from Cover/Fortress style buffs. */
  function damageTakenMult(unit) {
    let m = 1;
    for (const b of unit.buffs) if (b.damageTaken) m *= b.damageTaken;
    return m;
  }

  /* ============================================================
     Damage resolution — one path for everyone
     ============================================================ */

  function resolveDamage(attacker, defender, skill, opts = {}) {
    const scale = skill.scaling || 'atk';
    const statVal = eff(attacker, scale);

    /* Stat contribution is split across a skill's hits. Without this, a
       multi-hit skill multiplies the whole stat bonus per hit and becomes
       strictly better than everything else — an 8-hit skill was landing
       8x the scaling and ending boss fights in two rounds. Splitting it
       makes extra hits worth more crit rolls and status procs instead of
       raw damage, which is the interesting trade. */
    const hits = Math.max(1, skill.hits || 1);
    let raw = (skill.power || 0) + (statVal * STAT_SCALE) / hits;

    /* Retaliation-style: scale with HP already lost */
    if (skill.missingHpScale) {
      const missing = 1 - attacker.hp / attacker.maxHp;
      raw *= 1 + missing * skill.missingHpScale;
    }

    /* Execute threshold */
    if (skill.executeBelow && defender.hp / defender.maxHp <= skill.executeBelow) {
      raw *= skill.executeMult || 2;
    }

    /* Combo (§5) — partner already acted this round */
    let combo = false;
    if (skill.combo && opts.comboReady) {
      const bonus = (attacker.stats.comboBonus || 0);
      raw *= (skill.combo + bonus);
      combo = true;
    }

    /* Bonus versus a status the defender already has */
    if (skill.bonusVs && skill.bonusVs.status.some(t => hasStatus(defender, t))) {
      raw *= skill.bonusVs.mult;
    }

    /* Crit */
    const critChance = (eff(attacker, 'crit') + (skill.critBonus || 0)) / 100;
    const crit = skill.alwaysCrit || roll(critChance);
    if (crit) raw *= CRIT_MULT + (attacker.stats.critMult || 0);

    /* Defence mitigation, after any pierce */
    const pierce = skill.defPierce || 0;
    const dfn = eff(defender, 'def') * (1 - pierce);
    let dmg = raw * (100 / (100 + dfn * 2.2));

    /* Mark: defender takes extra damage */
    const mark = getStatus(defender, 'mark');
    if (mark) dmg *= 1 + (mark.power || 0.3);

    /* Guard + protective buffs */
    if (defender.guarding) dmg *= GUARD_CUT;
    dmg *= damageTakenMult(defender);

    dmg *= rnd(1 - VARIANCE, 1 + VARIANCE);

    return { damage: Math.max(1, Math.round(dmg)), crit, combo };
  }

  /** Apply damage through shields, return what actually landed. */
  function applyDamage(unit, amount) {
    let remaining = amount;
    let absorbed = 0;
    if (unit.shield > 0) {
      absorbed = Math.min(unit.shield, remaining);
      unit.shield -= absorbed;
      remaining -= absorbed;
    }
    unit.hp = Math.max(0, unit.hp - remaining);

    /* Guardian (The Last Wall) — cannot drop below 1 */
    if (unit.hp === 0 && unit.buffs.some(b => b.guardian)) unit.hp = 1;

    if (unit.hp === 0) unit.alive = false;
    return { dealt: remaining, absorbed };
  }

  function evaded(attacker, defender) {
    const chance = clamp(eff(defender, 'evade') / 100, 0, 0.6);
    return roll(chance);
  }

  /* ============================================================
     Battle instance
     ============================================================ */

  /**
   * @param {Array} party save-shaped party members (2)
   * @param {string|object} encounterId key into NI.enemies.ENCOUNTERS, or a
   *        literal encounter { name, foes, boss, scale } — Breach waves are
   *        generated per run, so they cannot be looked up from a table.
   * @param {object} [echo] owned Echo { id, bond } for the third slot
   */
  function create(party, encounterId, echo) {
    const enc = (encounterId && typeof encounterId === 'object')
      ? encounterId
      : NI.enemies.encounter(encounterId);
    if (!enc) throw new Error('Unknown encounter: ' + encounterId);

    const allies = party.map(m => makeAlly(m, 'party'));
    const foes = enc.foes.map((id, i) => makeFoe(id, i, enc.scale));

    /* Echo joins as a third body, and its aura buffs the two real members.
       Applied before the Vanguard pass so the two stack predictably. */
    if (echo && echo.id) {
      const avgLevel = Math.round(
        party.reduce((n, m) => n + (m.level || 1), 0) / Math.max(1, party.length));
      const unit = makeEcho(echo, avgLevel);
      if (unit) {
        const aura = NI.echoes.auraOf(echo);
        for (const a of allies) {
          for (const [k, v] of Object.entries(aura)) a.stats[k] = (a.stats[k] || 0) + v;
          /* Aura HP is max-HP, so it has to reach the current pool too or it
             is a bar that starts partly empty for no visible reason. */
          if (aura.hp) { a.maxHp += aura.hp; a.hp += aura.hp; }
        }
        allies.push(unit);
      }
    }

    /* Vanguard: passive ally DEF aura */
    for (const a of allies) {
      if (a.stats.allyDef) {
        for (const other of allies) if (other !== a) other.stats.def += a.stats.allyDef;
      }
    }

    const B = {
      encounterId,
      name: enc.name,
      isBoss: !!enc.boss,
      allies, foes,
      units: allies.concat(foes),
      round: 0,
      queue: [],
      current: null,
      over: false, won: false,
      events: [],
      xpEarned: 0
    };

    /* ---------- helpers ---------- */

    B.living = side => B.units.filter(u => u.side === side && u.alive);
    B.alliesAlive = () => B.living('party');
    B.foesAlive = () => B.living('foe');

    const emit = (type, data) => { B.events.push({ type, ...data }); };

    /** Partner already acted this round? Drives the combo bonus. */
    function comboReadyFor(unit) {
      if (unit.side !== 'party') {
        return B.foes.some(f => f !== unit && f.actedThisRound && f.alive);
      }
      return B.allies.some(a => a !== unit && a.actedThisRound);
    }
    B.comboReadyFor = comboReadyFor;

    /* ---------- round / turn order ---------- */

    function buildQueue() {
      B.queue = B.units
        .filter(u => u.alive)
        .map(u => ({ uid: u.uid, spd: eff(u, 'spd') + rnd(-1.5, 1.5) }))
        .sort((a, b) => b.spd - a.spd)
        .map(x => x.uid);
    }

    function startRound() {
      B.round++;
      for (const u of B.units) { u.actedThisRound = false; u.guarding = false; }
      buildQueue();
      emit('round', { round: B.round, queue: B.queue.slice() });
    }

    /** Tick DoTs, regen and buff/status durations at a unit's turn start. */
    function upkeep(unit) {
      if (!unit.alive) return;

      for (const st of unit.statuses.slice()) {
        if (st.type === 'burn' || st.type === 'poison' || st.type === 'bleed') {
          const dmg = Math.max(1, Math.round(st.power || 4));
          applyDamage(unit, dmg);
          emit('dot', { uid: unit.uid, status: st.type, damage: dmg, name: unit.name });
          if (!unit.alive) { emit('down', { uid: unit.uid, name: unit.name }); return; }
        }
      }

      if (unit.stats.hpRegen && unit.hp < unit.maxHp) {
        const amt = Math.min(unit.stats.hpRegen, unit.maxHp - unit.hp);
        unit.hp += amt;
        emit('heal', { uid: unit.uid, amount: amt, name: unit.name, quiet: true });
      }
      if (unit.stats.mpRegen && unit.mp < unit.maxMp) {
        unit.mp = Math.min(unit.maxMp, unit.mp + unit.stats.mpRegen);
      }

      /* durations */
      unit.statuses = unit.statuses.filter(s => --s.turns > 0);
      unit.buffs = unit.buffs.filter(b => --b.turns > 0);
      for (const k of Object.keys(unit.cooldowns)) {
        if (unit.cooldowns[k] > 0) unit.cooldowns[k]--;
      }
    }

    /** Boss phase change (§ enemies.enrageAt). */
    function checkEnrage(unit) {
      if (unit.kind !== 'foe' || unit.enraged || !unit.enrageAt) return;
      if (unit.hp / unit.maxHp > unit.enrageAt) return;
      unit.enraged = true;
      unit.stats.atk += unit.enrage.atk || 0;
      unit.stats.spd += unit.enrage.spd || 0;
      emit('enrage', { uid: unit.uid, name: unit.name, note: unit.enrage.note });
    }

    /* ---------- targeting ---------- */

    function pickTargets(actor, skill, chosenUid) {
      const enemySide = actor.side === 'party' ? 'foe' : 'party';
      const t = skill.target || 'enemy';

      if (t === 'self') return [actor];
      if (t === 'ally') {
        const mates = B.living(actor.side).filter(u => u !== actor);
        return mates.length ? [mates[0]] : [actor];
      }
      if (t === 'allAllies') return B.living(actor.side);
      if (t === 'allEnemies') return B.living(enemySide);

      /* single enemy — respect taunt, then explicit choice */
      const pool = B.living(enemySide);
      const taunting = pool.filter(u => hasStatus(u, 'taunt'));
      if (taunting.length) return [taunting[0]];
      const chosen = pool.find(u => u.uid === chosenUid);
      return chosen ? [chosen] : (pool.length ? [pool[0]] : []);
    }

    /* ---------- action execution ---------- */

    /**
     * Execute one action. Returns the events generated.
     * @param actor    unit taking the action
     * @param action   { kind:'skill'|'guard', skillId, targetUid }
     */
    function act(actor, action) {
      const start = B.events.length;
      if (!actor.alive || B.over) return [];

      /* Stun / freeze consume the turn */
      if (hasStatus(actor, 'stun') || hasStatus(actor, 'freeze')) {
        const which = hasStatus(actor, 'stun') ? 'stun' : 'freeze';
        emit('skipped', { uid: actor.uid, name: actor.name, reason: which });
        actor.actedThisRound = true;
        return B.events.slice(start);
      }

      if (action.kind === 'guard') {
        actor.guarding = true;
        const gained = Math.min(GUARD_MP, actor.maxMp - actor.mp);
        actor.mp += gained;
        emit('guard', { uid: actor.uid, name: actor.name, mp: gained });
        actor.actedThisRound = true;
        return B.events.slice(start);
      }

      const skill = actor.skills.find(s => s.id === action.skillId) || actor.skills[0];

      if (skill.mp && actor.mp < skill.mp) {
        emit('nomp', { uid: actor.uid, name: actor.name, skill: skill.name });
        return B.events.slice(start);
      }
      if (actor.cooldowns[skill.id] > 0) {
        emit('cooling', { uid: actor.uid, skill: skill.name, turns: actor.cooldowns[skill.id] });
        return B.events.slice(start);
      }

      if (skill.mp) actor.mp -= skill.mp;
      if (skill.cooldown) actor.cooldowns[skill.id] = skill.cooldown + 1;

      const comboReady = comboReadyFor(actor);
      const targets = pickTargets(actor, skill, action.targetUid);

      emit('cast', {
        uid: actor.uid, name: actor.name, skill: skill.name, icon: skill.icon,
        element: skill.element, combo: comboReady && !!skill.combo,
        targets: targets.map(t => t.uid)
      });

      /* --- self / ally support --- */
      if (skill.selfBuff) {
        actor.buffs.push({ ...skill.selfBuff, turns: skill.selfBuff.turns + 1 });
        emit('buff', { uid: actor.uid, name: actor.name, label: skill.name });
      }
      if (skill.restoreMp) {
        const g = Math.min(skill.restoreMp, actor.maxMp - actor.mp);
        actor.mp += g;
      }
      if (skill.selfHeal) {
        const h = Math.min(skill.selfHeal, actor.maxHp - actor.hp);
        actor.hp += h;
        emit('heal', { uid: actor.uid, amount: h, name: actor.name });
      }

      for (const target of targets) {
        if (skill.allyBuff) {
          target.buffs.push({ ...skill.allyBuff, turns: skill.allyBuff.turns + 1 });
          emit('buff', { uid: target.uid, name: target.name, label: skill.name });
        }
        if (skill.shield) {
          const amt = Math.round(eff(actor, skill.scaling || 'def') * skill.shield);
          target.shield += amt;
          emit('shield', { uid: target.uid, name: target.name, amount: amt });
        }
        if (skill.guardian) {
          target.buffs.push({ guardian: true, turns: skill.guardian + 1 });
          emit('buff', { uid: target.uid, name: target.name, label: 'Guarded' });
        }
        if (skill.heal) {
          const amt = Math.round(skill.heal + eff(actor, skill.scaling || 'mag') * 0.8);
          const real = Math.min(amt, target.maxHp - target.hp);
          target.hp += real;
          emit('heal', { uid: target.uid, amount: real, name: target.name });
        }
      }

      /* --- offensive --- */
      if (skill.power > 0) {
        const hits = skill.hits || 1;

        for (let h = 0; h < hits; h++) {
          /* multi-hit AoE spreads across living targets */
          const pool = targets.filter(t => t.alive);
          if (!pool.length) break;
          const target = skill.target === 'allEnemies' && hits > 1
            ? pool[h % pool.length]
            : null;

          const list = target ? [target] : pool;

          for (const tg of list) {
            if (!tg.alive) continue;

            if (evaded(actor, tg)) {
              emit('miss', { uid: tg.uid, name: tg.name });
              continue;
            }

            const r = resolveDamage(actor, tg, skill, { comboReady });
            const applied = applyDamage(tg, r.damage);

            emit('hit', {
              uid: tg.uid, name: tg.name, from: actor.uid,
              damage: applied.dealt + applied.absorbed,
              absorbed: applied.absorbed,
              crit: r.crit, combo: r.combo, element: skill.element
            });

            /* lifesteal */
            if (skill.lifesteal) {
              const gain = Math.min(Math.round(r.damage * skill.lifesteal), actor.maxHp - actor.hp);
              if (gain > 0) {
                actor.hp += gain;
                emit('heal', { uid: actor.uid, amount: gain, name: actor.name });
              }
            }

            /* thorns */
            if (tg.stats.thorns && skill.element === 'physical' && actor.alive) {
              const back = Math.max(1, Math.round(r.damage * tg.stats.thorns));
              applyDamage(actor, back);
              emit('thorns', { uid: actor.uid, name: actor.name, damage: back });
            }

            /* crit mana return */
            if (r.crit && actor.stats.critMp) {
              actor.mp = Math.min(actor.maxMp, actor.mp + actor.stats.critMp);
            }

            /* statuses */
            for (const key of ['status', 'status2']) {
              const st = skill[key];
              if (st && roll(st.chance)) {
                addStatus(tg, st.type, st.turns + 1, st.power);
                emit('status', { uid: tg.uid, name: tg.name, status: st.type });
              }
            }

            checkEnrage(tg);

            if (!tg.alive) emit('down', { uid: tg.uid, name: tg.name });
          }
        }
      } else {
        /* pure-utility skills that still apply status (e.g. Taunt) */
        for (const tg of targets) {
          const st = skill.status;
          if (st && roll(st.chance)) {
            addStatus(tg, st.type, st.turns + 1, st.power);
            emit('status', { uid: tg.uid, name: tg.name, status: st.type });
          }
        }
      }

      actor.actedThisRound = true;
      checkEnd();
      return B.events.slice(start);
    }

    /* ---------- enemy AI ---------- */

    /**
     * Weighted action pick for any unit the player does not control — foes
     * and the Echo alike. Written against `unit.side` rather than assuming
     * the actor is an enemy, because the Echo runs through this same path.
     */
    function autoAction(unit) {
      const usable = unit.skills.filter(s => !(unit.cooldowns[s.id] > 0));
      const pool = usable.length ? usable : unit.skills;

      const total = pool.reduce((n, s) => n + (s.weight || 1), 0);
      let r = Math.random() * total;
      let chosen = pool[0];
      for (const s of pool) { r -= (s.weight || 1); if (r <= 0) { chosen = s; break; } }

      /* Support skills aim at the actor's own side; everything else aims
         across. Getting this backwards makes an Echo heal the boss. */
      const t = chosen.target || 'enemy';
      const friendly = (t === 'ally' || t === 'allAllies' || t === 'self');
      const targets = friendly
        ? B.living(unit.side)
        : B.living(unit.side === 'party' ? 'foe' : 'party');

      let targetUid = null;
      if (targets.length) {
        /* Heal the worst-off friend; finish the worst-off enemy. Same sort,
           opposite intent, and both want the lowest HP fraction. */
        const wounded = targets.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        targetUid = (friendly || Math.random() < 0.45)
          ? wounded.uid
          : targets[Math.floor(Math.random() * targets.length)].uid;
      }
      return { kind: 'skill', skillId: chosen.id, targetUid };
    }

    /* ---------- flow ---------- */

    function checkEnd() {
      if (B.over) return;
      if (!B.foesAlive().length) {
        B.over = true; B.won = true;
        B.xpEarned = B.foes.reduce((n, f) => n + (f.xp || 0), 0);
        emit('victory', { xp: B.xpEarned });
      } else if (!B.alliesAlive().some(u => !u.auto)) {
        /* Both leads down is a defeat even if the Echo is still standing.
           A creature winning the fight alone after the party has been wiped
           is not a comeback, it is a softlock with good animation. */
        B.over = true; B.won = false;
        emit('defeat', {});
      }
    }

    function unitByUid(uid) { return B.units.find(u => u.uid === uid); }
    B.unitByUid = unitByUid;

    /**
     * Advance to whoever acts next. Returns:
     *   { waiting: unit }  -> a player unit needs input
     *   { done: true }     -> battle finished
     * Enemy turns resolve automatically and push events.
     */
    function advance() {
      if (B.over) return { done: true };

      while (true) {
        if (!B.queue.length) startRound();

        /* skip dead/absent units left in the queue */
        let uid = B.queue.shift();
        let unit = unitByUid(uid);
        while (unit && !unit.alive && B.queue.length) {
          uid = B.queue.shift();
          unit = unitByUid(uid);
        }
        if (!unit || !unit.alive) { if (!B.queue.length) continue; else continue; }

        B.current = unit;
        upkeep(unit);
        checkEnd();
        if (B.over) return { done: true };
        if (!unit.alive) continue;

        /* The Echo is on the party's side but plays itself. */
        if (unit.side === 'party' && !unit.auto) return { waiting: unit };

        act(unit, autoAction(unit));
        if (B.over) return { done: true };
      }
    }

    B.act = act;
    B.advance = advance;
    B.startRound = startRound;
    B.eff = eff;
    B.flush = () => { const e = B.events.slice(); B.events.length = 0; return e; };

    startRound();
    return B;
  }

  return {
    create, buildStats, skillsFor, skillTags,
    CRIT_MULT, GUARD_CUT, GUARD_MP
  };
})();
