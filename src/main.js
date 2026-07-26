/* ============================================================
   main.js — game state, screen flow, save system.

   Owns "what happens next". screens.js / battleHud.js own how it
   looks. Chapters are pure data, so adding chapter 6 means adding
   one file and one line in CHAPTERS.
   ============================================================ */

(function () {

  const S  = () => NI.screens;
  const C  = () => NI.characters;

  const CHAPTERS = {
    1: NI.story.chapter1,
    2: NI.story.chapter2,
    3: NI.story.chapter3,
    4: NI.story.chapter4,
    5: NI.story.chapter5
  };

  const SAVE_KEY = 'novaImpulse.save.v1';

  let state = null;
  let pendingBattleBeat = null;

  /* ============================================================
     State
     ============================================================ */

  function freshState(gender, path, classId) {
    const mateId = C().companionOf(path);
    /* Companion class is randomised (§3) — the player never picks it. */
    const mateClass = NI.classes.randomClassId(null);

    const mk = (id, cid) => {
      const stats = NI.battle.buildStats({ classId: cid, level: 1, unlocked: [] });
      return {
        id, name: C().lead(id).name, classId: cid,
        level: 1, xp: 0, points: 1, unlocked: [],
        hp: stats.hp, mp: stats.mp
      };
    };

    return {
      gender, path,
      party: [mk(path, classId), mk(mateId, mateClass)],
      chapter: 1, beat: null,
      trust: 0, flags: {},
      battlesWon: 0, battlesLost: 0,
      version: 1
    };
  }

  function me()   { return state.party[0]; }
  function mate() { return state.party[1]; }

  /* ============================================================
     Save / load
     ============================================================ */

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); return true; }
    catch (err) { console.warn('save failed', err); return false; }
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!p || !p.party || !p.path || !p.chapter) return null;
      return p;
    } catch (err) { return null; }
  }

  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
  function hasSave() { return !!loadSave(); }

  /* ============================================================
     Story flow
     ============================================================ */

  function chapter() { return CHAPTERS[state.chapter]; }

  function beatById(id) {
    const ch = chapter();
    return ch && ch.beats[id];
  }

  function goTo(beatId) {
    const beat = beatById(beatId);
    if (!beat) { console.error('missing beat', beatId, 'ch', state.chapter); return toTitle(); }

    state.beat = beatId;

    /* branch beats are routers with no content of their own */
    if (beat.branch) {
      const hit = beat.branch.find(b => {
        if (b.flag) return !!state.flags[b.flag];
        if (b.trustAtLeast != null) return state.trust >= b.trustAtLeast;
        if (b.path) return state.path === b.path;
        return false;
      });
      return goTo(hit ? hit.goto : beat.fallback);
    }

    /* one-shot beat-level effects, guarded so resume doesn't re-apply */
    const guard = '_seen_' + beatId;
    if ((beat.effects || beat.sets) && !state.flags[guard]) {
      applyEffects(beat.effects);
      if (beat.sets) state.flags[beat.sets] = true;
      state.flags[guard] = true;
    }

    if (beat.battle) { save(); return startBattle(beat); }
    if (beat.hook)   { save(); return showHook(beat); }

    S().setChapterLabel(chapter(), C().resolve(beat.title, state.path));
    S().show('story');
    S().renderStory(beat, state, { onChoice: takeChoice, onAdvance: () => advanceFrom(beat) });
    save();
  }

  function applyEffects(fx) {
    if (!fx) return;
    if (fx.trust) {
      state.trust += fx.trust;
      S().toast(`Trust +${fx.trust} — ${C().trustStage(state.trust).label}`, 'mag');
    }
    if (fx.xp) awardXp(fx.xp);
  }

  function advanceFrom(beat) {
    if (beat.goChapter) return enterChapter(beat.goChapter);
    if (beat.next) return goTo(beat.next);
    console.warn('beat has no exit:', state.beat);
  }

  function takeChoice(choice) {
    if (choice.sets) state.flags[choice.sets] = true;
    applyEffects({ trust: choice.trust });
    setTimeout(() => goTo(choice.goto), choice.trust ? 380 : 0);
  }

  function enterChapter(n) {
    const ch = CHAPTERS[n];
    if (!ch) return toTitle();
    state.chapter = n;
    state.beat = null;
    /* Chapters are the game's rest points — start each one whole. */
    for (const m of state.party) {
      const stats = NI.battle.buildStats(m);
      m.hp = stats.hp;
      m.mp = stats.mp;
    }
    save();
    S().renderChapterCard(ch, () => goTo(ch.start));
    S().show('chapter');
  }

  /* ============================================================
     Battle
     ============================================================ */

  function startBattle(beat) {
    pendingBattleBeat = beat;
    const battle = NI.battle.create(state.party, beat.battle);

    S().show('battle');
    NI.hud.start(battle, { onEnd: onBattleEnd });
  }

  function onBattleEnd(result) {
    const beat = pendingBattleBeat;
    pendingBattleBeat = null;

    /* persist post-battle HP/MP so attrition carries between fights */
    for (const unit of result.battle.allies) {
      const m = state.party.find(p => p.id === unit.uid);
      if (!m) continue;
      m.hp = Math.max(1, unit.hp);
      m.mp = unit.mp;
    }

    if (result.won) {
      state.battlesWon++;
      awardXp(result.xp);
      /* Post-battle recovery. Without this, HP carries between 3-5 fights
         per chapter with no way back up, and one hard fight cascades into
         losing every subsequent one — a death spiral that also starves the
         party of the XP it needs to climb out. */
      recover(0.30, 0.25);
    } else {
      state.battlesLost++;
      /* Defeat is a story branch, never a game over — the system
         respawns you, which is itself a plot point. Partial XP keeps a
         losing run progressing instead of stalling permanently. */
      awardXp(Math.round(result.battle.foes.reduce((n, f) => n + (f.xp || 0), 0) * 0.4));
      for (const m of state.party) {
        const stats = NI.battle.buildStats(m);
        m.hp = Math.max(1, Math.round(stats.hp * 0.55));
        m.mp = Math.round(stats.mp * 0.5);
      }
      S().toast('Respawn protocol engaged', 'mag');
    }

    save();
    goTo(result.won ? beat.onWin : (beat.onLose || beat.onWin));
  }

  /** Restore a fraction of each member's max HP/MP. */
  function recover(hpFrac, mpFrac) {
    for (const m of state.party) {
      const stats = NI.battle.buildStats(m);
      m.hp = Math.min(stats.hp, Math.round((m.hp || 0) + stats.hp * hpFrac));
      m.mp = Math.min(stats.mp, Math.round((m.mp || 0) + stats.mp * mpFrac));
    }
  }

  function awardXp(amount) {
    if (!amount) return;
    const ups = NI.tree.awardXp(state, amount);
    S().toast(`+${amount} EXP`, 'cyan');
    for (const up of ups) {
      S().toast(`${up.name} reached LEVEL ${up.level} — +1 skill point`, '');
    }
  }

  /* ============================================================
     Hook (Chapter 5 close — explicitly not an ending)
     ============================================================ */

  function showHook(beat) {
    S().renderHook(C().resolve(beat.text, state.path), state);
    S().show('hook');
  }

  /* ============================================================
     Entry points
     ============================================================ */

  function toTitle() {
    S().renderTitle(hasSave());
    S().show('title');
  }

  function newGame() {
    S().renderGenderSelect((gender, path) => {
      S().renderClassSelect(path, classId => {
        state = freshState(gender, path, classId);

        const mateCls = NI.classes.get(mate().classId);
        S().toast(`${mate().name} assigned: ${mateCls.name.toUpperCase()}`, 'mag');
        S().toast('Skill point available', '');

        clearSave();
        enterChapter(1);
      });
      S().show('class');
    });
    S().show('gender');
  }

  function continueGame() {
    const loaded = loadSave();
    if (!loaded) return toTitle();
    state = loaded;

    /* a save written at a battle beat resumes into that battle */
    if (state.beat && beatById(state.beat)) goTo(state.beat);
    else enterChapter(state.chapter);
  }

  /* ============================================================
     Wiring
     ============================================================ */

  document.getElementById('btn-new').addEventListener('click', newGame);
  document.getElementById('btn-continue').addEventListener('click', continueGame);
  document.getElementById('btn-hook-title').addEventListener('click', toTitle);

  /* The hook is where the endgame opens. Chapters 1-5 are balanced for a
     two-person party, so Echoes deliberately do not exist before this point. */
  document.getElementById('btn-hook-nexus').addEventListener('click', openNexus);
  NI.endgame.bind();

  function openNexus() {
    NI.endgame.open(state, { save, toTitle });
  }

  document.getElementById('btn-tree').addEventListener('click', () => {
    NI.tree.open(state, () => { save(); S().renderPartyStrip(state); });
    S().show('tree');
  });
  document.getElementById('btn-tree-close').addEventListener('click', () => {
    S().show('story');
    if (state.beat) S().renderPartyStrip(state);
  });

  document.getElementById('btn-menu').addEventListener('click', () => {
    const stage = C().trustStage(state.trust);
    document.getElementById('overlay-info').innerHTML =
      `CHAPTER ${state.chapter}<br>` +
      `${me().name} · ${NI.classes.get(me().classId).name.toUpperCase()} LV ${me().level}<br>` +
      `${mate().name} · ${NI.classes.get(mate().classId).name.toUpperCase()} LV ${mate().level}<br>` +
      `TRUST: ${stage.label}<br>BATTLES WON: ${state.battlesWon}`;
    syncSoundLabel();
    document.getElementById('overlay').hidden = false;
  });

  /* Audio preference lives in localStorage, not the save file — it belongs to
     the device you are playing on, not to the run. */
  function syncSoundLabel() {
    document.getElementById('btn-sound').textContent =
      'SOUND: ' + (NI.sfx.isMuted() ? 'OFF' : 'ON');
  }
  document.getElementById('btn-sound').addEventListener('click', () => {
    NI.sfx.toggle();
    syncSoundLabel();
    if (!NI.sfx.isMuted()) NI.sfx.play('ui');
  });

  document.getElementById('btn-resume').addEventListener('click', () => {
    document.getElementById('overlay').hidden = true;
  });
  document.getElementById('btn-save').addEventListener('click', () => {
    S().toast(save() ? 'Session saved' : 'Save failed', 'cyan');
  });
  document.getElementById('btn-quit').addEventListener('click', () => {
    save();
    document.getElementById('overlay').hidden = true;
    toTitle();
  });

  /* keyboard: space/enter advances, 1-4 pick choices */
  document.addEventListener('keydown', e => {
    if (!document.getElementById('overlay').hidden) return;
    if (S().currentScreen() !== 'story') return;

    if (e.key === ' ' || e.key === 'Enter') {
      const next = document.getElementById('vn-next');
      if (!next.hidden) { e.preventDefault(); next.click(); }
      return;
    }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) {
      const btn = document.querySelectorAll('#vn-choices .choice')[n - 1];
      if (btn && !btn.disabled) btn.click();
    }
  });

  /* ============================================================
     Boot — art index first so portraits resolve on the very first paint
     ============================================================ */

  NI.sfx.init();
  NI.art.init().then(toTitle).catch(toTitle);

})();
