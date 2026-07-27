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

  /* ============================================================
     Summon

     The old screen was three stat boxes and a button, which made a pull
     read as a transaction. This version is built around the one thing a
     gacha screen has to do: make the moment BEFORE the result matter more
     than the result. Everything below — the featured signal, the pity
     bar, the tiered anticipation — exists to buy anticipation, and the
     pull maths underneath is untouched.

     Framed in the game's own fiction rather than as a shop. You are not
     buying a creature; you are reaching into the system that trapped you
     and pulling something out of it, and the interface behaves like
     something that is not entirely pleased about being used.
     ============================================================ */

  let sequencing = false;   // a reveal is playing; ignore further input
  let skipWanted = false;
  let bannerId = 'signal';  // which pull table the screen is showing

  function showSummon() {
    renderSummon();
    NI.screens.show('summon');
  }

  function fmtCountdown(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  function renderSummon() {
    const p = NI.collection.progress(state);
    const cost = NI.breach.PULL_COST;
    const b = NI.echoes.banner(bannerId);

    /* --- banner tabs --- */
    $('sm-tabs').innerHTML = NI.echoes.BANNER_IDS.map(id => {
      const bn = NI.echoes.banner(id);
      const pool = NI.echoes.poolFor(id);
      const have = pool.filter(x => NI.collection.owned(state, x)).length;
      return `<button class="sm-tab${id === bannerId ? ' on' : ''}" data-banner="${id}">
                <span class="sm-tab-name">${bn.name}</span>
                <span class="sm-tab-sub">${have} / ${pool.length} bound</span>
              </button>`;
    }).join('');
    $('sm-tabs').querySelectorAll('.sm-tab').forEach(t => {
      t.addEventListener('click', () => {
        if (sequencing || t.dataset.banner === bannerId) return;
        bannerId = t.dataset.banner;
        renderSummon();
      });
    });

    /* --- the headline Echo ---
       On a featured banner that is the current signal. On one without a
       featured slot it is the rarest thing the pool can give you, because
       a banner still has to be ABOUT something — an empty hero panel is
       the plain screen this redesign replaced. */
    let headId, tagLine, rateLine;
    if (b.hasFeatured) {
      headId = NI.echoes.featured();
      tagLine = `SIGNAL FOCUS · ROTATES IN ${fmtCountdown(NI.echoes.featuredEndsIn())}`;
      rateLine = `Half of all 5★ results resolve to this one while the signal holds.`;
    } else {
      const pool = NI.echoes.poolFor(b.id);
      headId = pool.slice().sort((x, y) => NI.echoes.get(y).star - NI.echoes.get(x).star)[0];
      tagLine = `${b.name} · ${pool.length} ECHOES · NOT FOUND IN THE WORLD`;
      rateLine = `Double the usual 5★ rate, and a guarantee at ${b.pityAt} instead of ${NI.collection.PITY_AT}.`;
    }

    const feat = NI.echoes.get(headId);
    const fr = NI.echoes.rarity(feat.star);
    const own = NI.collection.owned(state, headId);

    $('sm-banner').innerHTML = `
      <div class="sm-feat" style="--rar:${fr.color}">
        <div class="sm-feat-art">${NI.art.figure('echo_' + feat.id, feat.name)}</div>
        <div class="sm-feat-info">
          <div class="sm-feat-tag">${tagLine}</div>
          <div class="sm-feat-rar" style="color:${fr.color}">${fr.label} · ${feat.role.toUpperCase()}</div>
          <h2 class="sm-feat-name">${feat.name}</h2>
          <p class="sm-feat-blurb">${feat.blurb}</p>
          <div class="sm-feat-rate">
            ${b.hasFeatured ? rateLine : b.tagline + ' ' + rateLine}
            ${own ? `<b>Bound · bond ${own.bond}</b>` : '<b>Not yet bound</b>'}
          </div>
        </div>
      </div>`;

    /* --- pity, per banner --- */
    const pp = NI.collection.pityOf(state, b.id);
    const pity = pp.at, soft = pp.soft, hard = pp.hard;
    const pct = Math.min(100, (pity / hard) * 100);
    $('sm-pity').innerHTML = `
      <div class="sm-res"><span>RESONANCE</span><b>${p.shards}</b></div>
      <div class="sm-pity-bar">
        <div class="sm-pity-head">
          <span>LEGENDARY GUARANTEE</span>
          <b>${pity} / ${hard}</b>
        </div>
        <div class="sm-pity-track">
          <div class="sm-pity-fill${pity >= soft ? ' hot' : ''}" style="width:${pct}%"></div>
          <div class="sm-pity-soft" style="left:${(soft / hard) * 100}%"></div>
        </div>
        <div class="sm-pity-note">${
          pity >= soft
            ? 'Signal already unstable — legendary odds are climbing every pull.'
            : `Odds begin climbing at ${soft}. Guaranteed at ${hard}.`
        }</div>
      </div>`;

    /* --- buttons --- */
    const can1 = NI.collection.canPull(state);
    const can10 = NI.collection.canPullTen(state);
    $('sm-cost1').textContent = `${cost} RESONANCE`;
    $('sm-cost10').textContent = `${cost * 10} RESONANCE`;
    $('sm-pull').disabled = !can1 || sequencing;
    $('sm-pull10').disabled = !can10 || sequencing;
    $('sm-pull').classList.toggle('broke', !can1);
    $('sm-pull10').classList.toggle('broke', !can10);
  }

  /* ---- the reveal ------------------------------------------------------ */

  /* Waits have to be cancellable, not merely skippable.

     The first version just checked the flag when each wait STARTED, which
     meant pressing SKIP during a timer already in flight did nothing until
     that timer expired — up to 1.5s of a button that visibly does not
     work, on the one screen where the player is pressing it because they
     are impatient. Now skip resolves every pending wait immediately. */
  let pendingWaits = [];

  function wait(ms) {
    if (skipWanted) return Promise.resolve();
    return new Promise(res => {
      const finish = () => {
        clearTimeout(timer);
        pendingWaits = pendingWaits.filter(f => f !== finish);
        res();
      };
      const timer = setTimeout(finish, ms);
      pendingWaits.push(finish);
    });
  }

  function skipNow() {
    skipWanted = true;
    const waiting = pendingWaits;
    pendingWaits = [];
    for (const finish of waiting) finish();
  }

  /** Anticipation tier from the best thing in the batch. */
  function tierOf(reports) {
    const best = reports.reduce((n, r) => Math.max(n, r.star), 3);
    return best === 5 ? 'anomaly' : best === 4 ? 'unstable' : 'stable';
  }

  const TIER_TEXT = {
    stable:   ['SIGNAL STABLE',      'The archive answers immediately. It has done this many times.'],
    unstable: ['SIGNAL UNSTABLE',    'Something in the index is resisting. The read is taking longer than it should.'],
    anomaly:  ['SYSTEM ANOMALY',     'This is not an index entry. Something older is answering.']
  };

  async function runSequence(reports) {
    sequencing = true;
    skipWanted = false;

    const seq = $('sm-seq');
    const fx = $('sm-seq-fx');
    const body = $('sm-seq-body');
    const tier = tierOf(reports);

    seq.hidden = false;
    seq.className = 'sm-seq tier-' + tier;
    body.innerHTML = '';
    fx.className = 'sm-seq-fx phase-open';

    /* 1 — reaching in */
    body.innerHTML = `<div class="sm-phase"><span class="sm-phase-line">ACCESSING SEALED INDEX</span></div>`;
    NI.sfx.play('status');
    await wait(900);

    /* 2 — anticipation. The tier is the tell, and it is honest: an anomaly
       reading really does mean a five-star is in the batch. A fake-out
       would work exactly once and be resented forever after. */
    const [title, note] = TIER_TEXT[tier];
    fx.className = 'sm-seq-fx phase-tense';
    body.innerHTML = `
      <div class="sm-phase">
        <span class="sm-phase-title">${title}</span>
        <span class="sm-phase-note">${note}</span>
      </div>`;
    NI.sfx.play(tier === 'anomaly' ? 'victory' : tier === 'unstable' ? 'buff' : 'hit');
    await wait(tier === 'anomaly' ? 1500 : tier === 'unstable' ? 1050 : 650);

    /* 3 — results */
    fx.className = 'sm-seq-fx phase-reveal';
    body.innerHTML = `<div class="sm-grid ${reports.length > 1 ? 'many' : 'one'}"></div>`;
    const grid = body.querySelector('.sm-grid');

    for (const rep of reports) {
      const def = NI.echoes.get(rep.id);
      const r = NI.echoes.rarity(def.star);
      const line = rep.isNew ? 'NEW ECHO'
                 : rep.maxed ? `BOND MAXED · +${rep.shards} RESONANCE`
                 : `BOND ${rep.bond}`;

      const card = document.createElement('div');
      card.className = `sm-card star-${def.star}${rep.featured ? ' featured' : ''}`;
      card.style.setProperty('--rar', r.color);
      card.innerHTML = `
        <div class="sm-card-art">${NI.art.figure('echo_' + def.id, def.name)}</div>
        <div class="sm-card-rar">${r.label}</div>
        <div class="sm-card-name">${def.name}</div>
        <div class="sm-card-line">${line}</div>
        ${rep.featured ? '<div class="sm-card-flag">SIGNAL FOCUS</div>' : ''}`;
      grid.appendChild(card);

      /* Stagger so a ten-pull reads as ten events rather than one grid,
         and pause longer on the ones worth pausing on. */
      requestAnimationFrame(() => card.classList.add('in'));
      if (def.star === 5) NI.sfx.play('victory');
      else if (def.star === 4) NI.sfx.play('buff');
      await wait(def.star === 5 ? 700 : def.star === 4 ? 300 : 150);
    }

    /* 4 — done */
    const done = document.createElement('button');
    done.className = 'btn btn-primary sm-done';
    done.textContent = 'CONTINUE';
    done.addEventListener('click', endSequence);
    body.appendChild(done);
    sequencing = false;
  }

  function endSequence() {
    $('sm-seq').hidden = true;
    sequencing = false;
    skipWanted = false;
    pendingWaits = [];
    renderSummon();
  }

  async function doPull(count) {
    if (sequencing) return;
    const reports = count === 10
      ? NI.collection.pullTen(state, null, null, bannerId)
      : [NI.collection.pull(state, null, null, bannerId)].filter(Boolean);
    if (!reports.length) return;

    save();
    await runSequence(reports);
  }

  /* ---- rates / history sheets ------------------------------------------ */

  function openSheet(title, html) {
    $('sm-sheet-title').textContent = title;
    $('sm-sheet-body').innerHTML = html;
    $('sm-sheet').hidden = false;
  }

  function showRates() {
    const b = NI.echoes.banner(bannerId);
    const pool = NI.echoes.poolFor(b.id);
    const rows = [5, 4, 3].map(star => {
      const r = NI.echoes.rarity(star);
      const n = pool.filter(id => NI.echoes.get(id).star === star).length;
      const base = star === 5 ? `${(b.base5 * 100).toFixed(1)}%`
                 : star === 4 ? `${(NI.collection.BASE_4 * 100).toFixed(0)}%`
                 : 'remainder';
      return `<tr>
        <td style="color:${r.color}">${r.label}</td>
        <td>${base}</td>
        <td>${n} Echo${n === 1 ? '' : 'es'}</td></tr>`;
    }).join('');

    openSheet(`RATES · ${b.name}`, `
      <table class="sm-rates">
        <thead><tr><th>TIER</th><th>BASE RATE</th><th>POOL</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <ul class="sm-notes">
        <li>Legendary odds begin climbing after <b>${b.softAt}</b> pulls without one,
            and are <b>guaranteed</b> at <b>${b.pityAt}</b>.</li>
        <li>Pity is tracked <b>separately for each banner</b>. Progress you build here
            stays here.</li>
        <li>A <b>${NI.echoes.rarity(4).label}</b> or better is guaranteed at least once every
            <b>${NI.collection.PITY_4}</b> pulls, across both banners.</li>
        ${b.hasFeatured
          ? `<li><b>${(NI.echoes.FEATURED_RATE * 100).toFixed(0)}%</b> of legendary results resolve to the
               current signal focus, <b>${NI.echoes.get(NI.echoes.featured()).name}</b>. This does not
               change how often a legendary arrives — only which one it is.</li>`
          : `<li>No featured Echo here. Every result comes from the same
               ${pool.length}, and none of them can be found anywhere else in the game.</li>`}
        <li>A duplicate raises bond. Past maximum bond it converts to resonance instead.</li>
        <li>Ten-pulls are exactly ten single pulls. Nothing is held back for them.</li>
      </ul>`);
  }

  function showHistory() {
    const log = NI.collection.history(state);
    if (!log.length) {
      return openSheet('HISTORY', '<p class="nx-empty">Nothing drawn from the index yet.</p>');
    }
    const rows = log.map(e => {
      const def = NI.echoes.get(e.id);
      const r = NI.echoes.rarity(e.star || (def && def.star) || 3);
      const when = new Date(e.at);
      return `<tr class="star-${e.star}">
        <td style="color:${r.color}">${r.label}</td>
        <td>${def ? def.name : e.id}</td>
        <td>${when.toLocaleDateString()} ${when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>`;
    }).join('');
    openSheet('HISTORY', `
      <p class="sm-hist-note">Last ${log.length} results, newest first.</p>
      <table class="sm-rates sm-hist"><tbody>${rows}</tbody></table>`);
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
    $('sm-pull').addEventListener('click', () => doPull(1));
    $('sm-pull10').addEventListener('click', () => doPull(10));
    $('sm-rates').addEventListener('click', showRates);
    $('sm-history').addEventListener('click', showHistory);
    $('sm-sheet-close').addEventListener('click', () => { $('sm-sheet').hidden = true; });
    /* Skip collapses every remaining wait to zero rather than jumping to the
       end, so the results still arrive in order and nothing is missed —
       important on a ten-pull, where the whole point is seeing what came. */
    $('sm-skip').addEventListener('click', skipNow);
    $('br-back').addEventListener('click', showHub);
  }

  return { open, bind, showHub };
})();
