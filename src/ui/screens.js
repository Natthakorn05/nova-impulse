/* ============================================================
   screens.js — all non-battle rendering: title, registration,
   class select, the VN story screen, chapter cards, hook, toasts.

   Pure presentation. main.js decides what happens next and passes
   callbacks in; nothing here reaches back into game logic.
   ============================================================ */

window.NI = window.NI || {};

NI.screens = (function () {

  const $ = id => document.getElementById(id);
  const C = () => NI.characters;

  let current = null;

  /* ============================================================
     Screen switching
     ============================================================ */

  const SCREENS = ['title', 'gender', 'class', 'story', 'battle', 'tree', 'chapter', 'hook'];

  function show(name) {
    for (const s of SCREENS) {
      const node = $('screen-' + s);
      if (node) node.classList.toggle('active', s === name);
    }
    current = name;
    window.scrollTo(0, 0);
  }

  function currentScreen() { return current; }

  /* ============================================================
     Toasts — the diegetic [SYSTEM] channel
     ============================================================ */

  function toast(text, tone = '') {
    const node = document.createElement('div');
    node.className = 'toast ' + tone;
    node.textContent = text;
    $('sys-toasts').appendChild(node);
    setTimeout(() => node.remove(), 4200);
  }

  /* ============================================================
     Title
     ============================================================ */

  function renderTitle(hasSave) {
    $('btn-continue').disabled = !hasSave;
    $('title-foot').textContent = hasSave
      ? '// SAVED SESSION DETECTED'
      : '// NO SESSION — PROGRESS SAVES TO THIS BROWSER';
  }

  /* ============================================================
     Registration: pick your lead (§2)
     ============================================================ */

  function renderGenderSelect(onPick) {
    const opts = [
      { gender: 'male',   path: 'kirito', label: 'MALE' },
      { gender: 'female', path: 'masha',  label: 'FEMALE' }
    ];

    $('gender-grid').innerHTML = opts.map(o => {
      const me = C().lead(o.path);
      const other = C().lead(C().companionOf(o.path));
      return `
        <button class="lead-card" data-gender="${o.gender}" data-path="${o.path}">
          <span class="lc-art">${NI.art.figure(o.path + '_portrait', me.name)}</span>
          <span class="lc-body">
            <span class="lc-role">${o.label}</span>
            <span class="lc-name">${me.name}</span>
            <span class="lc-desc">${me.voice}</span>
            <span class="lc-plays">▸ You play ${me.name} · ${other.name} fights beside you</span>
          </span>
        </button>`;
    }).join('');

    $('gender-grid').querySelectorAll('.lead-card').forEach(b => {
      b.addEventListener('click', () => onPick(b.dataset.gender, b.dataset.path));
    });
  }

  /* ============================================================
     Class select (§3) — player picks, companion is randomised
     ============================================================ */

  let chosenClass = null;

  function renderClassSelect(path, onConfirm) {
    chosenClass = null;
    const me = C().lead(path);
    const mate = C().lead(C().companionOf(path));

    $('class-note').innerHTML =
      `Select a combat class for <b style="color:${me.color}">${me.name}</b>. ` +
      `<b style="color:${mate.color}">${mate.name}</b>'s class is assigned by the system — you don't get a say.`;

    $('class-grid').innerHTML = NI.classes.ALL_IDS.map(id => {
      const c = NI.classes.get(id);
      return `
        <button class="class-card" data-id="${id}" style="color:${c.color}">
          <span class="cc-ico">${NI.icons.get(c.icon)}</span>
          <span class="cc-name">${c.name.toUpperCase()}</span>
          <span class="cc-role">${c.role}</span>
        </button>`;
    }).join('');

    $('class-detail').innerHTML = '';
    $('btn-class-confirm').disabled = true;

    $('class-grid').querySelectorAll('.class-card').forEach(b => {
      b.addEventListener('click', () => {
        chosenClass = b.dataset.id;
        $('class-grid').querySelectorAll('.class-card').forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
        renderClassDetail(chosenClass);
        $('btn-class-confirm').disabled = false;
      });
    });

    $('btn-class-confirm').onclick = () => { if (chosenClass) onConfirm(chosenClass); };
  }

  function renderClassDetail(id) {
    const c = NI.classes.get(id);
    const s = c.base;
    $('class-detail').innerHTML = `
      <div class="cd-inner">
        <p class="cd-blurb">${c.blurb}</p>
        <div class="cd-stats">
          ${['hp', 'mp', 'atk', 'mag', 'def', 'spd'].map(k =>
            `<span class="cd-stat">${k.toUpperCase()}<b>${s[k]}</b></span>`).join('')}
          <span class="cd-stat">CRIT<b>${s.crit}%</b></span>
        </div>
      </div>`;
  }

  /* ============================================================
     Chapter card
     ============================================================ */

  function renderChapterCard(chapter, onGo) {
    $('cc-num').textContent = `CHAPTER ${String(chapter.id).padStart(2, '0')}`;
    $('cc-title').textContent = chapter.title;
    $('cc-sub').textContent = chapter.subtitle || '';
    $('btn-chapter-go').onclick = onGo;
  }

  /* ============================================================
     Story / VN
     ============================================================ */

  /**
   * @param beat   resolved beat data
   * @param state  game state (for path + party)
   * @param cb     { onChoice(choice), onAdvance() }
   */
  /**
   * Resolve a { mage, ranger, fighter, tank, any } note against one party
   * member's class. `{me}` / `{mate}` expand to the two leads' names so a
   * single line reads correctly on both paths.
   */
  function classNote(note, state, slot) {
    const member = note && state.party && state.party[slot];
    if (!member) return '';
    const body = note[member.classId] || note.any;
    if (!body) return '';
    return body
      .replace(/\{me\}/g,   state.party[0].name)
      .replace(/\{mate\}/g, state.party[1].name);
  }

  function renderStory(beat, state, cb) {
    const path = state.path;

    /* scene */
    const sceneKey = beat.scene || 'scene_field';
    $('vn-scene').setAttribute('style', NI.art.sceneStyle(sceneKey));
    /* light the cast with the same light as the room they're standing in */
    $('vn-cast').style.setProperty('--cast-grade', NI.art.castGrade(sceneKey));

    /* cast and speaker may both be path-specific — a scene is often
       framed from whichever lead the player is NOT controlling. */
    const cast = Array.isArray(beat.cast) ? beat.cast
               : (beat.cast ? (beat.cast[path] || beat.cast.shared || []) : []);
    const speaker = typeof beat.speaker === 'object'
      ? C().resolve(beat.speaker, path)
      : beat.speaker;

    $('vn-cast').innerHTML = cast.map(who => {
      const isSpeaking = speaker && speaker === who;
      const lead = C().lead(who);
      const label = lead ? lead.name : who;
      const key = lead ? who + '_sprite' : 'enemy_' + who;
      return `<div class="vn-actor ${speaker && !isSpeaking ? 'dim' : ''}">
                ${NI.art.figure(key, label)}
              </div>`;
    }).join('');

    /* speaker label */
    const speakerNode = $('vn-speaker');
    if (speaker === 'system') {
      speakerNode.textContent = 'SYSTEM';
      speakerNode.dataset.who = 'system';
    } else if (speaker) {
      const lead = C().lead(speaker);
      speakerNode.textContent = (lead ? lead.name : speaker).toUpperCase();
      speakerNode.dataset.who = speaker;
    } else {
      speakerNode.textContent = '';
      speakerNode.dataset.who = '';
    }

    /* body text, plus optional class-aware lines.

       The player picks a class and the companion's is randomised, and
       until these existed the prose never once acknowledged either — so
       both choices were purely mechanical. classNote is keyed by the
       player's classId, mateNote by the companion's. */
    $('vn-text').innerHTML =
        C().resolve(beat.text, path)
      + classNote(beat.classNote, state, 0)
      + classNote(beat.mateNote,  state, 1);
    revealBlocks($('vn-text'));

    /* choices vs next */
    const choices = beat.choices || [];
    const box = $('vn-choices');
    box.innerHTML = '';

    if (choices.length) {
      $('vn-next').hidden = true;
      choices.forEach((choice, i) => {
        const label = C().resolve(choice.text, path);
        const btn = document.createElement('button');
        btn.className = 'choice';
        btn.dataset.num = String(i + 1).padStart(2, '0');
        btn.style.animationDelay = (i * 0.05) + 's';

        const tags = [];
        if (choice.trust) tags.push(`<span class="ch-tag trust">TRUST +${choice.trust}</span>`);
        if (choice.tag) tags.push(`<span class="ch-tag">${choice.tag}</span>`);
        btn.innerHTML = label + tags.join('');

        btn.addEventListener('click', () => {
          box.querySelectorAll('.choice').forEach(b => { b.disabled = true; });
          cb.onChoice(choice);
        });
        box.appendChild(btn);
      });
    } else {
      $('vn-next').hidden = false;
      $('vn-next').onclick = () => { $('vn-next').hidden = true; cb.onAdvance(); };
    }

    renderPartyStrip(state);
  }

  function revealBlocks(container) {
    const blocks = container.querySelectorAll(':scope > p, :scope > .sysmsg');
    blocks.forEach((node, i) => {
      node.style.animation = `fade-in .34s ease ${i * 0.13}s both`;
    });
  }

  function setChapterLabel(chapter, beatTitle) {
    $('hud-chapter').textContent = 'CH.' + String(chapter.id).padStart(2, '0');
    $('hud-title').textContent = beatTitle || chapter.title || '';
  }

  /* ============================================================
     Party strip
     ============================================================ */

  function renderPartyStrip(state) {
    $('party-strip').innerHTML = state.party.map(m => {
      const cls = NI.classes.get(m.classId);
      const stats = NI.battle.buildStats(m);
      const hp = m.hp != null ? m.hp : stats.hp;
      const mp = m.mp != null ? m.mp : stats.mp;
      const need = NI.tree.xpForNext(m.level);
      return `
        <div class="pm-card">
          <span class="pm-ico" style="color:${cls.color}">${NI.icons.get(cls.icon)}</span>
          <span class="pm-info">
            <span class="pm-name" style="color:${cls.color}">${m.name}</span>
            <span class="pm-sub">${cls.name.toUpperCase()} · LV ${m.level}${m.points ? ` · ${m.points} SP` : ''}</span>
          </span>
          <span class="pm-bars">
            <span class="bar hp ${hp / stats.hp <= .3 ? 'low' : ''}"><i style="width:${(hp / stats.hp) * 100}%"></i></span>
            <span class="bar mp"><i style="width:${(mp / stats.mp) * 100}%"></i></span>
            <span class="bar xp"><i style="width:${((m.xp || 0) / need) * 100}%"></i></span>
          </span>
        </div>`;
    }).join('');

    const anyPoints = state.party.some(m => (m.points || 0) > 0);
    $('tree-alert').hidden = !anyPoints;
  }

  /* ============================================================
     Hook (end of Chapter 5 — a cliff, not a resolution)
     ============================================================ */

  function renderHook(html, state) {
    $('hook-body').innerHTML = html;
    revealBlocks($('hook-body'));

    const me = state.party[0], mate = state.party[1];
    $('hook-stats').innerHTML = `
      <span class="hook-stat">LEAD <b>${me.name}</b></span>
      <span class="hook-stat">${NI.classes.get(me.classId).name.toUpperCase()} <b>LV ${me.level}</b></span>
      <span class="hook-stat">${mate.name} · ${NI.classes.get(mate.classId).name.toUpperCase()} <b>LV ${mate.level}</b></span>
      <span class="hook-stat">TRUST <b>${NI.characters.trustStage(state.trust).label}</b></span>
      <span class="hook-stat">BATTLES WON <b>${state.battlesWon}</b></span>
    `;
  }

  return {
    show, currentScreen, toast,
    renderTitle, renderGenderSelect, renderClassSelect,
    renderChapterCard, renderStory, setChapterLabel, renderPartyStrip,
    renderHook
  };
})();
