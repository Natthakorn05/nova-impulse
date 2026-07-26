/* ============================================================
   battleHud.js — JRPG battle HUD (§6) and the battle loop driver.

   Owns: portraits both sides, turn-order queue, HP/MP bars, the
   icon action menu, target selection, the log, floating damage
   numbers, and the result card.

   Delegates sprite animation to NI.stage (Phaser). Every stage
   call is safe when Phaser is unavailable, so the HUD alone is a
   complete, playable battle.
   ============================================================ */

window.NI = window.NI || {};

NI.hud = (function () {

  const $ = id => document.getElementById(id);
  const icons = () => NI.icons;

  let B = null;              // active battle
  let cb = {};               // { onEnd(result) }
  let pending = null;        // skill awaiting a target
  let busy = false;
  let acting = null;         // unit currently taking input

  const el = {};
  function cache() {
    el.encounter = $('bt-encounter');
    el.turnorder = $('bt-turnorder');
    el.foes      = $('bt-foes');
    el.popups    = $('bt-popups');
    el.log       = $('bt-log');
    el.party     = $('bt-party');
    el.actions   = $('bt-actions');
    el.targets   = $('bt-targets');
    el.canvas    = $('bt-canvas');
    el.tip       = $('bt-tip');
  }

  /* ============================================================
     Entry
     ============================================================ */

  function start(battle, callbacks) {
    cache();
    B = battle;
    cb = callbacks || {};
    pending = null; busy = false; acting = null;

    el.encounter.textContent = '⚠ ' + B.name;
    el.encounter.classList.toggle('boss', !!B.isBoss);
    el.log.innerHTML = '';
    el.targets.hidden = true;
    hideTip();

    NI.stage.init(el.canvas);
    /* setFoes queues internally until the scene exists, so there is nothing
       to time here. The old 60ms guess dropped the sprites outright whenever
       Phaser booted slower than that. */
    NI.stage.setFoes(B.foes);

    logLine('sys', `Encounter started — ${B.name}.`);
    renderAll();
    step();
  }

  /* ============================================================
     Rendering
     ============================================================ */

  function renderAll() {
    renderFoes();
    renderParty();
    renderTurnOrder();
  }

  function pct(a, b) { return Math.max(0, Math.min(100, (a / b) * 100)) + '%'; }

  function statusPips(unit) {
    const pips = unit.statuses.map(s =>
      `<span class="pip ${s.type}">${s.type.slice(0, 4).toUpperCase()}${s.turns > 1 ? s.turns : ''}</span>`);
    if (unit.shield > 0) pips.unshift(`<span class="pip shield">SHLD ${Math.round(unit.shield)}</span>`);
    return pips.join('');
  }

  function renderFoes() {
    el.foes.innerHTML = B.foes.map(f => {
      const low = f.hp / f.maxHp <= 0.3;
      return `
        <div class="foe-card ${f.alive ? '' : 'dead'}" data-uid="${f.uid}">
          <div class="foe-name">${f.name}</div>
          <div class="foe-hpwrap">
            <div class="bar hp ${low ? 'low' : ''}"><i style="width:${pct(f.hp, f.maxHp)}"></i></div>
            <div class="foe-hpnum">${Math.max(0, f.hp)}/${f.maxHp}</div>
          </div>
          <div class="foe-status">${statusPips(f)}</div>
        </div>`;
    }).join('');

    el.foes.querySelectorAll('.foe-card').forEach(card => {
      card.addEventListener('click', () => {
        if (pending) confirmTarget(card.dataset.uid);
      });
      if (pending) card.classList.add('targeting');
    });
  }

  function renderParty() {
    el.party.innerHTML = B.allies.map(a => {
      const cls = NI.classes.get(a.classId);
      const key = a.uid + '_portrait';
      const low = a.hp / a.maxHp <= 0.3;
      return `
        <div class="bp-card ${acting === a ? 'active' : ''} ${a.alive ? '' : 'down'}" data-uid="${a.uid}">
          <div class="bp-portrait">${NI.art.figure(key, a.name)}</div>
          <div class="bp-info">
            <div class="bp-top">
              <span class="bp-name" style="color:${cls.color}">${a.name}</span>
              <span class="bp-lv">${cls.name.toUpperCase()} · L${a.level}</span>
            </div>
            <div class="bp-bars">
              <div class="bar hp ${low ? 'low' : ''}"><i style="width:${pct(a.hp, a.maxHp)}"></i></div>
              <div class="bar mp"><i style="width:${pct(a.mp, a.maxMp)}"></i></div>
            </div>
            <div class="bp-nums"><span>HP ${Math.max(0, a.hp)}/${a.maxHp}</span><span>MP ${a.mp}/${a.maxMp}</span></div>
            <div class="bp-status">${statusPips(a)}</div>
          </div>
        </div>`;
    }).join('');
  }

  function renderTurnOrder() {
    const upcoming = [B.current, ...B.queue.map(uid => B.unitByUid(uid))]
      .filter(u => u && u.alive).slice(0, 6);

    el.turnorder.innerHTML = '<span class="to-label">ORDER</span>' +
      upcoming.map((u, i) => {
        const isFoe = u.side === 'foe';
        return `<span class="to-chip ${isFoe ? 'foe' : ''} ${i === 0 ? 'now' : ''}">${u.name}</span>`;
      }).join('');
  }

  /* ============================================================
     Action menu
     ============================================================ */

  /* ---- skill tooltip ----
     Skill names alone ("Shatterfrost", "Retaliation") do not tell a player
     what a skill does, and the only place that information existed was the
     skill tree — which is not reachable mid-fight. */

  function tipHtml(unit, skill, comboReady) {
    const tags = NI.battle.skillTags(skill)
      .map(t => `<span class="tip-tag">${t}</span>`).join('');
    const cd = unit.cooldowns[skill.id] || 0;

    const notes = [];
    if (cd > 0) notes.push(`Cooling down — ${cd} more turn${cd > 1 ? 's' : ''}.`);
    if (skill.mp > unit.mp) notes.push(`Needs ${skill.mp} MP; you have ${unit.mp}.`);
    if (comboReady && skill.combo) {
      const bonus = unit.stats.comboBonus || 0;
      notes.push(`Combo link is live — this hits for x${(skill.combo + bonus).toFixed(2)} right now.`);
    }

    return `
      <div class="tip-head">
        <span class="tip-ico">${icons().get(skill.icon)}</span>
        <span class="tip-name">${skill.name}</span>
        <span class="tip-cost">${skill.mp ? skill.mp + ' MP' : 'FREE'}</span>
      </div>
      ${skill.desc ? `<p class="tip-desc">${skill.desc}</p>` : ''}
      <div class="tip-tags">${tags}</div>
      ${notes.map(n => `<p class="tip-note">${n}</p>`).join('')}`;
  }

  function showTip(btn, html) {
    if (!el.tip) return;
    el.tip.innerHTML = html;
    el.tip.hidden = false;

    /* Anchor above the button, clamped to the viewport so the leftmost and
       rightmost actions do not push the panel off-screen. */
    const b = btn.getBoundingClientRect();
    const t = el.tip.getBoundingClientRect();
    const margin = 8;
    let left = b.left + b.width / 2 - t.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - t.width - margin));
    let top = b.top - t.height - 10;
    if (top < margin) top = b.bottom + 10;     // flip below when there is no room

    el.tip.style.left = left + 'px';
    el.tip.style.top = top + 'px';
  }

  function hideTip() {
    if (el.tip) { el.tip.hidden = true; el.tip.innerHTML = ''; }
  }

  function renderActions(unit) {
    const comboReady = B.comboReadyFor(unit);

    const buttons = unit.skills.map(s => {
      const cd = unit.cooldowns[s.id] || 0;
      const noMp = s.mp > unit.mp;
      const disabled = cd > 0 || noMp;
      const isCombo = comboReady && s.combo;
      /* `off` rather than the disabled attribute: a disabled button fires no
         mouse events and takes no focus, so the tooltip explaining WHY it is
         unavailable would be unreachable exactly when it is needed. Clicks
         are refused in the handler instead. */
      return `
        <button class="act ${isCombo ? 'combo-ready' : ''} ${disabled ? 'off' : ''}"
                data-skill="${s.id}" aria-disabled="${disabled}">
          ${cd > 0 ? `<span class="act-cd">${cd}</span>` : ''}
          <span class="act-ico" style="color:${NI.classes.get(unit.classId).color}">${icons().get(s.icon)}</span>
          <span class="act-name">${s.name}</span>
          <span class="act-cost ${s.mp ? '' : 'free'}">${s.mp ? s.mp + ' MP' : '—'}</span>
        </button>`;
    }).join('');

    const guard = `
      <button class="act" data-guard="1">
        <span class="act-ico" style="color:var(--cyan)">${icons().get('guard')}</span>
        <span class="act-name">Guard</span>
        <span class="act-cost">+${NI.battle.GUARD_MP} MP</span>
      </button>`;

    el.actions.innerHTML = buttons + guard;

    const guardTip = `
      <div class="tip-head">
        <span class="tip-ico">${icons().get('guard')}</span>
        <span class="tip-name">Guard</span>
        <span class="tip-cost">FREE</span>
      </div>
      <p class="tip-desc">Brace instead of attacking. Halves the damage you take
        until your next turn and banks some MP back.</p>
      <div class="tip-tags">
        <span class="tip-tag">Self</span>
        <span class="tip-tag">${Math.round((1 - NI.battle.GUARD_CUT) * 100)}% less damage</span>
        <span class="tip-tag">+${NI.battle.GUARD_MP} MP</span>
      </div>`;

    el.actions.querySelectorAll('.act').forEach(btn => {
      /* Hover and keyboard focus both open it; disabled buttons still explain
         themselves, which is the case where a player most wants to know why. */
      const html = () => btn.dataset.guard
        ? guardTip
        : tipHtml(unit, unit.skills.find(s => s.id === btn.dataset.skill), comboReady);

      btn.addEventListener('mouseenter', () => showTip(btn, html()));
      btn.addEventListener('focus',      () => showTip(btn, html()));
      btn.addEventListener('mouseleave', hideTip);
      btn.addEventListener('blur',       hideTip);

      btn.addEventListener('click', () => {
        hideTip();
        if (busy || btn.classList.contains('off')) return;
        if (btn.dataset.guard) return submit({ kind: 'guard' });
        const skill = unit.skills.find(s => s.id === btn.dataset.skill);
        if (!skill) return;

        /* AoE / self / ally skills need no target pick */
        const t = skill.target || 'enemy';
        if (t !== 'enemy') return submit({ kind: 'skill', skillId: skill.id });

        const foes = B.foesAlive();
        if (foes.length <= 1) {
          return submit({ kind: 'skill', skillId: skill.id, targetUid: foes[0] && foes[0].uid });
        }
        beginTargeting(skill);
      });
    });
  }

  function setActionsEnabled(on) {
    el.actions.querySelectorAll('.act').forEach(b => {
      let off;
      if (!on) off = true;
      else if (b.dataset.guard) off = false;
      else {
        const s = acting && acting.skills.find(x => x.id === b.dataset.skill);
        off = !s || (acting.cooldowns[s.id] > 0) || s.mp > acting.mp;
      }
      b.classList.toggle('off', off);
      b.setAttribute('aria-disabled', String(off));
    });
  }

  /* ---- targeting ---- */

  function beginTargeting(skill) {
    pending = skill;
    const foes = B.foesAlive();
    el.targets.hidden = false;
    el.targets.innerHTML =
      `<span class="tg-label">TARGET · ${skill.name}</span>` +
      foes.map(f => `<button class="tg-btn" data-uid="${f.uid}">${f.name}</button>`).join('') +
      `<button class="tg-btn tg-cancel" data-cancel="1">CANCEL</button>`;

    el.targets.querySelectorAll('.tg-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (b.dataset.cancel) return cancelTargeting();
        confirmTarget(b.dataset.uid);
      });
    });
    renderFoes();
  }

  function cancelTargeting() {
    pending = null;
    el.targets.hidden = true;
    renderFoes();
  }

  function confirmTarget(uid) {
    if (!pending) return;
    const skill = pending;
    pending = null;
    el.targets.hidden = true;
    renderFoes();
    submit({ kind: 'skill', skillId: skill.id, targetUid: uid });
  }

  /* ============================================================
     Loop
     ============================================================ */

  /** Ask the battle who acts next; play enemy turns, stop on player input. */
  function step() {
    if (!B || B.over) return finish();

    let r, events;
    try {
      r = B.advance();
      events = B.flush();
    } catch (err) {
      console.error('battle advance failed', err);
      return recoverInput();
    }

    playEvents(events, () => {
      if (B.over) return finish();

      if (r && r.waiting) {
        acting = r.waiting;
        renderAll();
        renderActions(acting);
        el.actions.style.visibility = 'visible';
        busy = false;
      } else {
        step();
      }
    });
  }

  function submit(action) {
    if (busy || !acting) return;
    busy = true;
    setActionsEnabled(false);

    let events;
    try {
      B.act(acting, action);
      events = B.flush();
    } catch (err) {
      console.error('battle action failed', err);
      return recoverInput();
    }

    playEvents(events, () => {
      acting = null;
      if (B.over) return finish();
      step();
    });
  }

  /**
   * Last-resort unstick. A frozen battle with every button disabled is
   * unrecoverable for the player — there is no undo and no way back to the
   * menu mid-fight — so any failure path must hand control back rather than
   * leave the run dead.
   */
  function recoverInput() {
    busy = false;
    if (!B || B.over) return finish();
    acting = acting || B.alliesAlive()[0];
    if (acting) {
      renderAll();
      renderActions(acting);
      el.actions.style.visibility = 'visible';
      logLine('sys', 'Recovered from an internal error — your turn.');
    }
  }

  /* ============================================================
     Event playback — pacing + animation
     ============================================================ */

  const PACE = {
    cast: 260, hit: 300, dot: 280, heal: 240, status: 200,
    down: 420, guard: 240, buff: 220, shield: 220, miss: 220,
    round: 60, enrage: 700, skipped: 400, nomp: 200, thorns: 260,
    victory: 200, defeat: 200, cooling: 150
  };

  function playEvents(events, done) {
    let i = 0;
    (function next() {
      if (i >= events.length) { renderAll(); return done(); }
      const ev = events[i++];
      /* A throw inside one event handler used to break the timeout chain
         and freeze the battle with every action disabled. One bad event
         must never be able to strand the player. */
      try { handleEvent(ev); }
      catch (err) { console.error('battle event failed', ev, err); }
      try { renderAll(); } catch (err) { console.error('render failed', err); }
      setTimeout(next, PACE[ev.type] != null ? PACE[ev.type] : 240);
    })();
  }

  /* Debug surface — lets a test harness see why the loop is idle. */
  function debugState() {
    return {
      busy, acting: acting && acting.name, pending: pending && pending.name,
      over: B && B.over, won: B && B.won, round: B && B.round,
      queue: B && B.queue.slice(),
      current: B && B.current && B.current.name,
      alive: B && B.units.filter(u => u.alive).map(u => u.name + ':' + u.hp)
    };
  }

  function handleEvent(ev) {
    switch (ev.type) {
      case 'round':
        logLine('sys', `── Round ${ev.round} ──`);
        break;

      case 'cast': {
        const combo = ev.combo ? ' <b class="lg-combo">COMBO LINK!</b>' : '';
        logLine(sideOf(ev.uid), `${ev.name} uses <b>${ev.skill}</b>.${combo}`);
        NI.stage.lunge(ev.uid);
        if (ev.element && ev.element !== 'none') NI.stage.elementFlash(ev.element);
        if (ev.combo) floatText(ev.targets[0] || ev.uid, 'COMBO', 'combo-flag');
        break;
      }

      case 'hit': {
        const cls = ev.crit ? 'lg-crit' : sideOf(ev.uid) === 'ally' ? 'lg-foe' : 'lg-ally';
        logLine(cls, `${ev.name} takes <b>${ev.damage}</b>${ev.crit ? ' <b>CRITICAL</b>' : ''}.`);
        NI.stage.flashHit(ev.uid, ev.crit);
        floatText(ev.uid, ev.damage, 'dmg' + (ev.crit ? ' crit' : '') + (ev.combo ? ' combo' : ''));
        if (ev.absorbed) floatText(ev.uid, '-' + ev.absorbed, 'dmg absorb');
        break;
      }

      case 'miss':
        logLine('lg-sys', `${ev.name} evades.`);
        floatText(ev.uid, 'MISS', 'dmg miss');
        break;

      case 'dot':
        logLine('lg-sys', `${ev.name} suffers <b>${ev.damage}</b> from ${ev.status}.`);
        floatText(ev.uid, ev.damage, 'dmg');
        break;

      case 'heal':
        if (!ev.quiet) logLine('lg-heal', `${ev.name} recovers <b>${ev.amount}</b> HP.`);
        if (ev.amount > 0) floatText(ev.uid, '+' + ev.amount, 'dmg heal');
        break;

      case 'shield':
        logLine('lg-ally', `${ev.name} gains a <b>${ev.amount}</b> shield.`);
        break;

      case 'buff':
        logLine('lg-ally', `${ev.name}: <b>${ev.label}</b>.`);
        break;

      case 'status':
        logLine('lg-sys', `${ev.name} is afflicted with <b>${ev.status}</b>.`);
        break;

      case 'guard':
        logLine('lg-ally', `${ev.name} guards.${ev.mp ? ` +${ev.mp} MP.` : ''}`);
        break;

      case 'skipped':
        logLine('lg-sys', `${ev.name} cannot act (${ev.reason}).`);
        break;

      case 'nomp':
        logLine('lg-sys', `Not enough MP for ${ev.skill}.`);
        break;

      case 'cooling':
        logLine('lg-sys', `${ev.skill} is still cooling down.`);
        break;

      case 'thorns':
        logLine('lg-foe', `${ev.name} is hurt by thorns for <b>${ev.damage}</b>.`);
        floatText(ev.uid, ev.damage, 'dmg');
        break;

      case 'enrage':
        logLine('lg-crit', `<b>${ev.note}</b>`);
        NI.stage.elementFlash('light');
        break;

      case 'down':
        logLine(sideOf(ev.uid) === 'ally' ? 'lg-foe' : 'lg-ally', `<b>${ev.name}</b> is down.`);
        NI.stage.fadeOut(ev.uid);
        break;

      case 'victory':
        logLine('lg-ally', `<b>Victory.</b>`);
        break;

      case 'defeat':
        logLine('lg-foe', `<b>Party defeated.</b>`);
        break;
    }
  }

  function sideOf(uid) {
    const u = B.unitByUid(uid);
    return u && u.side === 'party' ? 'ally' : 'foe';
  }

  function logLine(cls, html) {
    const p = document.createElement('p');
    p.className = cls.startsWith('lg-') ? cls : 'lg-' + cls;
    p.innerHTML = html;
    el.log.appendChild(p);
    el.log.scrollTop = el.log.scrollHeight;
  }

  /** Floating number anchored to a unit — canvas position for foes, card for allies. */
  function floatText(uid, text, cls) {
    let pos = NI.stage.screenPos(uid, el.canvas);

    if (!pos) {
      const card = el.foes.querySelector(`[data-uid="${uid}"]`) ||
                   el.party.querySelector(`[data-uid="${uid}"]`);
      if (!card) return;
      const r = card.getBoundingClientRect();
      pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    const node = document.createElement('div');
    node.className = cls;
    node.textContent = text;
    node.style.left = (pos.x + (Math.random() * 26 - 13)) + 'px';
    node.style.top = pos.y + 'px';
    el.popups.appendChild(node);
    setTimeout(() => node.remove(), 1300);
  }

  /* ============================================================
     Result
     ============================================================ */

  function finish() {
    busy = true;
    hideTip();
    el.actions.innerHTML = '';
    setTimeout(showResult, 500);
  }

  function showResult() {
    const won = B.won;
    const card = document.createElement('div');
    card.className = 'bt-result';
    card.innerHTML = `
      <div class="bt-result-card ${won ? 'win' : 'lose'}">
        <h3>${won ? 'VICTORY' : 'DEFEATED'}</h3>
        <div class="bt-rewards">
          ${won
            ? `<div class="bt-reward"><span>EXP GAINED</span><b>${B.xpEarned}</b></div>`
            : `<div class="bt-reward"><span>SYSTEM</span><b>RESPAWN</b></div>`}
          <div class="bt-reward"><span>ROUNDS</span><b>${B.round}</b></div>
        </div>
        <button class="btn btn-primary" id="bt-continue">CONTINUE</button>
      </div>`;
    document.body.appendChild(card);
    card.querySelector('#bt-continue').addEventListener('click', () => {
      card.remove();
      if (cb.onEnd) cb.onEnd({ won: B.won, xp: B.xpEarned, battle: B });
    });
  }

  /* keyboard: 1-6 pick actions */
  document.addEventListener('keydown', e => {
    const screen = document.querySelector('.screen.active');
    if (!screen || screen.id !== 'screen-battle' || busy) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) {
      const btns = document.querySelectorAll('#bt-actions .act');
      const b = btns[n - 1];
      if (b && !b.classList.contains('off')) b.click();
    }
    if (e.key === 'Escape' && pending) cancelTargeting();
  });

  return { start, debugState };
})();
