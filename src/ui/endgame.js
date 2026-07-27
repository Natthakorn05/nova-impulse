/* ============================================================
   endgame.js — the Nexus hub, the Echo roster, summoning, and
   the Breach run loop (§10).

   Unlocks at the Chapter 5 hook. Everything here sits AFTER the
   story, which is the point: chapters 1-5 were balanced for a
   two-person party and adding a third body to them would undo
   that tuning.

   This module owns three screens and one loop. It talks to the
   battle system through NI.battle.create and to the save through
   a small host interface passed to open(), so it never touches
   localStorage or the story state machine directly.
   ============================================================ */

window.NI = window.NI || {};

NI.endgame = (function () {

  const $ = id => document.getElementById(id);

  let state = null;
  let host = null;          // { save(), toTitle() }
  let run = null;           // active Breach run

  /* ------------------------------------------------------------
     Entry
     ------------------------------------------------------------ */

  function open(gameState, hostApi) {
    state = gameState;
    host = hostApi || {};
    ensureFields(state);
    showHub();
  }

  /* Saves made before the endgame existed have none of these fields.
     Defaulting them here rather than in freshState means an old save can
     walk straight into the Nexus without a migration step. */
  function ensureFields(s) {
    if (!Array.isArray(s.echoes)) s.echoes = [];
    if (typeof s.shards !== 'number') s.shards = 0;
    if (typeof s.breachBest !== 'number') s.breachBest = 0;
    if (typeof s.pity !== 'number') s.pity = 0;
    if (s.equipped === undefined) s.equipped = null;
  }

  /* ------------------------------------------------------------
     Hub
     ------------------------------------------------------------ */

  function showHub() {
    const p = NI.collection.progress(state);
    const eq = NI.collection.equipped(state);
    const eqDef = eq && NI.echoes.get(eq.id);

    $('nx-stats').innerHTML = `
      <div class="nx-stat"><span>RESONANCE</span><b>${p.shards}</b></div>
      <div class="nx-stat"><span>ECHOES</span><b>${p.have} / ${p.total}</b></div>
      <div class="nx-stat"><span>DEEPEST BREACH</span><b>${p.best || '—'}</b></div>`;

    /* Breach is endgame-only; the rest of the hub is not. */
    const post = (state.chapter || 1) >= 6 || state.breachBest > 0;
    $('nx-breach').disabled = !post;
    $('nx-breach').textContent = post ? 'ENTER BREACH' : 'BREACH — AFTER CH.5';
    $('nx-leave').textContent = host.back ? 'BACK' : 'TITLE';

    $('nx-equipped').innerHTML = eqDef
      ? `<div class="nx-eq">
           <div class="nx-eq-art">${NI.art.figure('echo_' + eqDef.id, eqDef.name)}</div>
           <div class="nx-eq-body">
             <span class="nx-eq-name" style="color:${NI.echoes.rarity(eqDef.star).color}">${eqDef.name}</span>
             <span class="nx-eq-sub">${NI.echoes.rarity(eqDef.star).label} · ${eqDef.role.toUpperCase()} · BOND ${eq.bond}</span>
             <span class="nx-eq-blurb">${eqDef.blurb}</span>
           </div>
         </div>`
      : `<p class="nx-empty">No Echo bound. You can enter a Breach alone —
         people have. They did not get far.</p>`;

    NI.screens.show('nexus');
  }

  /* ------------------------------------------------------------
     Roster
     ------------------------------------------------------------ */

  function showRoster() {
    const eqId = state.equipped;

    /* Unowned Echoes are listed, not hidden. A collection you cannot see the
       shape of is not a collection, it is a surprise — and the whole appeal
       of the roster screen is the gaps. */
    $('ec-grid').innerHTML = NI.echoes.ALL_IDS.map(id => {
      const def = NI.echoes.get(id);
      const own = NI.collection.owned(state, id);
      const r = NI.echoes.rarity(def.star);
      const isEq = eqId === id;

      return `
        <div class="ec-card ${own ? '' : 'locked'} ${isEq ? 'equipped' : ''}"
             style="--rar:${r.color}" data-id="${id}">
          <div class="ec-art">${own
            ? NI.art.figure('echo_' + def.id, def.name)
            : '<span class="ec-unknown">?</span>'}</div>
          <div class="ec-name">${own ? def.name : '???'}</div>
          <div class="ec-rar">${r.label}</div>
          ${own ? `<div class="ec-bond">${
            Array.from({ length: NI.echoes.BOND_MAX }, (_, i) =>
              `<i class="${i < own.bond ? 'on' : ''}"></i>`).join('')
          }</div>` : ''}
          ${own ? `<div class="ec-role">${def.role.toUpperCase()}</div>` : ''}
          ${isEq ? '<div class="ec-flag">BOUND</div>' : ''}
        </div>`;
    }).join('');

    $('ec-detail').innerHTML = '<p class="nx-empty">Select an Echo.</p>';

    $('ec-grid').querySelectorAll('.ec-card').forEach(c => {
      c.addEventListener('click', () => selectEcho(c.dataset.id));
    });

    NI.screens.show('echoes');
  }

  function selectEcho(id) {
    const def = NI.echoes.get(id);
    const own = NI.collection.owned(state, id);
    const r = NI.echoes.rarity(def.star);

    if (!own) {
      $('ec-detail').innerHTML = `
        <div class="ec-det">
          <h4 style="color:${r.color}">UNBOUND · ${r.label}</h4>
          <p>${def.from
            ? `Bind one by defeating a <b>${NI.enemies.get(def.from).name}</b> in a Breach, or by summoning.`
            : 'Summon only. Nothing in the world drops this one.'}</p>
        </div>`;
      return;
    }

    const stats = NI.echoes.stats(own, avgLevel());
    const aura = NI.echoes.auraOf(own);
    const auraText = Object.entries(aura)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
    const isEq = state.equipped === id;

    $('ec-detail').innerHTML = `
      <div class="ec-det">
        <h4 style="color:${r.color}">${def.name}</h4>
        <p class="ec-blurb">${def.blurb}</p>
        <div class="tip-tags">
          <span class="tip-tag">${r.label}</span>
          <span class="tip-tag">${def.role.toUpperCase()}</span>
          <span class="tip-tag">BOND ${own.bond}/${NI.echoes.BOND_MAX}</span>
          <span class="tip-tag">CAUGHT ${own.caught || 1}</span>
        </div>
        <div class="ec-statline">
          HP ${stats.hp} · ATK ${stats.atk} · MAG ${stats.mag} ·
          DEF ${stats.def} · SPD ${stats.spd}
        </div>
        ${auraText ? `<p class="ec-aura">Party aura: <b>${auraText}</b></p>` : ''}
        ${def.skills.map(s => `
          <div class="ec-skill">
            <span class="ec-skill-name">${s.name}</span>
            <span class="tip-tags">${
              NI.battle.skillTags(s).map(t => `<span class="tip-tag">${t}</span>`).join('')
            }</span>
          </div>`).join('')}
        <div class="ec-actions">
          <button class="btn ${isEq ? '' : 'btn-primary'}" id="ec-equip" ${isEq ? 'disabled' : ''}>
            ${isEq ? 'BOUND' : 'BIND'}
          </button>
          <button class="btn btn-danger" id="ec-release" ${isEq ? 'disabled' : ''}>
            RELEASE · +${NI.breach.RELEASE_REFUND * own.bond}
          </button>
        </div>
        ${isEq ? '<p class="ec-note">Release the bond before letting this one go.</p>' : ''}
      </div>`;

    $('ec-equip').addEventListener('click', () => {
      NI.collection.equip(state, id);
      NI.sfx.play('buff');
      save();
      showRoster();
      selectEcho(id);
    });
    $('ec-release').addEventListener('click', () => {
      const res = NI.collection.release(state, id);
      if (!res.ok) return NI.screens.toast('Cannot release a bound Echo', 'amber');
      NI.sfx.play('status');
      NI.screens.toast(`Released — +${res.shards} resonance`, 'cyan');
      save();
      showRoster();
    });
  }

  /* ------------------------------------------------------------
     Summon
     ------------------------------------------------------------ */

  function showSummon() {
    renderSummon('<p class="nx-empty">The shard reader is idle.</p>');
    NI.screens.show('summon');
  }

  function renderSummon(resultHtml) {
    const p = NI.collection.progress(state);
    const can = NI.collection.canPull(state);
    const toPity = NI.collection.PITY_AT - (state.pity || 0);

    $('sm-meta').innerHTML = `
      <div class="nx-stat"><span>RESONANCE</span><b>${p.shards}</b></div>
      <div class="nx-stat"><span>PER SUMMON</span><b>${NI.breach.PULL_COST}</b></div>
      <div class="nx-stat"><span>GUARANTEED LEGENDARY IN</span><b>${Math.max(0, toPity)}</b></div>`;

    $('sm-result').innerHTML = resultHtml;
    const btn = $('sm-pull');
    btn.disabled = !can;
    btn.textContent = can ? 'SUMMON' : 'NOT ENOUGH RESONANCE';
  }

  function doPull() {
    const report = NI.collection.pull(state);
    if (!report) return;

    const def = NI.echoes.get(report.id);
    const r = NI.echoes.rarity(def.star);
    const big = def.star === 5;
    NI.sfx.play(big ? 'victory' : 'buff');

    const line = report.isNew ? 'NEW ECHO'
               : report.maxed ? `BOND MAXED · +${report.shards} RESONANCE`
               : `BOND ${report.bond}`;

    renderSummon(`
      <div class="sm-card ${big ? 'big' : ''}" style="--rar:${r.color}">
        <div class="sm-art">${NI.art.figure('echo_' + def.id, def.name)}</div>
        <div class="sm-rar" style="color:${r.color}">${r.label}</div>
        <div class="sm-name">${def.name}</div>
        <div class="sm-line">${line}</div>
        <p class="sm-blurb">${def.blurb}</p>
      </div>`);

    save();
  }

  /* ------------------------------------------------------------
     Breach run
     ------------------------------------------------------------ */

  function startBreach() {
    /* Snapshot the party so a Breach never damages the story save. The run
       is a side trip; dying in it must not cost the player their campaign
       HP or force them to grind it back before the next chapter. */
    run = {
      wave: 1,
      shards: 0,
      caught: [],
      pending: null,      // the next floor, rolled and named in advance
      party: state.party.map(m => ({ ...m, unlocked: (m.unlocked || []).slice() }))
    };
    for (const m of run.party) {
      const s = NI.battle.buildStats(m);
      m.hp = s.hp; m.mp = s.mp;
    }
    nextWave();
  }

  /* ---- generated floor names ----
     The Breach is endless and its floors were called "Breach 7" forever,
     which is the whole reason the endgame felt like a spreadsheet. Each
     floor now gets a name and a line of arrival text.

     The encounter for the NEXT wave is rolled and named while the player is
     still fighting the current one, so a wave transition never waits on the
     network — and because the encounter is rolled up front, the text
     describes the enemies you actually meet rather than a second roll of
     the dice. If the relay is slow or absent the static name is used and
     nothing about the run changes. */

  function rollFloor(waveNo) {
    const slot = { wave: waveNo, enc: NI.breach.wave(waveNo), name: null, line: null };
    const names = slot.enc.foes
      .map(id => (NI.enemies.get(id) || {}).name)
      .filter(Boolean);

    NI.companion.breachFloor(waveNo, names, slot.enc.boss, state.breachBest)
      .then(res => {
        /* The run may have ended, or the player may have left, between the
           request and the reply. Only fill in the slot still waiting. */
        if (!res.ok || !run || run.pending !== slot) return;
        const lines = res.text.split('\n').map(s => s.trim()).filter(Boolean);
        slot.name = (lines[0] || '').slice(0, 40) || null;
        slot.line = (lines[1] || '').slice(0, 160) || null;
      });

    return slot;
  }

  function nextWave() {
    const slot = (run.pending && run.pending.wave === run.wave)
      ? run.pending
      : { wave: run.wave, enc: NI.breach.wave(run.wave), name: null, line: null };
    run.pending = null;

    const enc = slot.enc;
    if (slot.name) enc.name = slot.name;

    const battle = NI.battle.create(run.party, enc, NI.collection.equipped(state));
    NI.screens.show('battle');
    NI.hud.start(battle, { onEnd: onWaveEnd });

    if (slot.line) NI.screens.toast(slot.line, 'cyan');

    /* Name the floor below while this one is being fought. */
    run.pending = rollFloor(run.wave + 1);
  }

  function onWaveEnd(result) {
    const B = result.battle;

    /* Carry damage forward — attrition is the whole mode. */
    for (let i = 0; i < run.party.length; i++) {
      const unit = B.allies[i];
      if (!unit) continue;
      run.party[i].hp = Math.max(0, unit.hp);
      run.party[i].mp = unit.mp;
    }

    if (!result.won) return endRun();

    run.shards += NI.breach.shardsFor(run.wave);
    const got = NI.collection.rollCatches(state, B.foes, run.wave);
    for (const g of got) {
      run.caught.push(g);
      NI.screens.toast(
        g.isNew ? `BOUND — ${g.name}` : `${g.name} bond ${g.bond}`,
        g.isNew ? 'mag' : 'cyan');
    }

    const heal = NI.breach.recoveryAfter(run.wave);
    for (let i = 0; i < run.party.length; i++) {
      const m = run.party[i];
      const s = NI.battle.buildStats(m);
      m.hp = Math.min(s.hp, Math.max(1, Math.round(m.hp + s.hp * heal)));
      m.mp = Math.min(s.mp, Math.round(m.mp + s.mp * heal));
    }

    run.wave++;
    save();
    setTimeout(nextWave, 260);
  }

  function endRun() {
    const cleared = run.wave - 1;
    state.shards = (state.shards || 0) + run.shards;
    if (cleared > (state.breachBest || 0)) state.breachBest = cleared;

    const newOnes = run.caught.filter(c => c.isNew);
    NI.sfx.play(cleared > 0 ? 'victory' : 'defeat');

    $('br-summary').innerHTML = `
      <div class="br-line"><span>WAVES CLEARED</span><b>${cleared}</b></div>
      <div class="br-line"><span>DEEPEST EVER</span><b>${state.breachBest}</b></div>
      <div class="br-line"><span>RESONANCE EARNED</span><b>+${run.shards}</b></div>
      <div class="br-line"><span>ECHOES BOUND</span><b>${run.caught.length}</b></div>
      ${newOnes.length ? `<p class="br-new">New: ${newOnes.map(c => c.name).join(', ')}</p>` : ''}`;

    run = null;
    save();
    NI.screens.show('breachend');
  }

  /* ------------------------------------------------------------
     Plumbing
     ------------------------------------------------------------ */

  function avgLevel() {
    const p = state.party || [];
    if (!p.length) return 1;
    return Math.round(p.reduce((n, m) => n + (m.level || 1), 0) / p.length);
  }

  function save() { if (host.save) host.save(); }

  function bind() {
    $('nx-breach').addEventListener('click', startBreach);
    $('nx-echoes').addEventListener('click', showRoster);
    $('nx-summon').addEventListener('click', showSummon);
    $('nx-talk').addEventListener('click', () => NI.talk.open(state, { back: showHub }));
    NI.talk.bind();
    /* "BACK" when the hub was opened mid-story, "TITLE" when it is the
       endgame hub proper. Same button, because it is the same hub. */
    $('nx-leave').addEventListener('click', () => {
      if (host.back) return host.back();
      if (host.toTitle) host.toTitle();
    });

    $('ec-back').addEventListener('click', showHub);
    $('sm-back').addEventListener('click', showHub);
    $('sm-pull').addEventListener('click', doPull);
    $('br-back').addEventListener('click', showHub);
  }

  return { open, bind, showHub };
})();
