/* ============================================================
   characters.js — the two leads and the path system (§2).

   The player picks a gender, which decides who they CONTROL:
     male   -> plays Kirito, Masha is companion/romance
     female -> plays Masha, Kirito is companion/romance

   `path` is therefore 'kirito' or 'masha' — the id of the
   controlled lead. Story data keys its variants off this, so a
   beat can read completely differently depending on who you are
   rather than swapping pronouns (§2).
   ============================================================ */

window.NI = window.NI || {};

NI.characters = (function () {

  const LEADS = {
    kirito: {
      id: 'kirito',
      name: 'Kirito',
      pronouns: { subj: 'he', obj: 'him', poss: 'his' },
      /* Voice notes drive how narration is written on each path. */
      voice: 'Understated, dry, thinks three moves ahead and says one of them. ' +
             'Copes by handling logistics instead of feelings.',
      portraitPrompt:
        'anime style character portrait, teenage male swordsman, messy black hair, ' +
        'sharp dark eyes, black high-collar coat with silver trim, calm guarded expression',
      battlePrompt:
        'anime style full body battle sprite, teenage male swordsman, messy black hair, ' +
        'black high-collar coat with silver trim, sword drawn in ready stance',
      color: '#5b8dff',
      /* How the OTHER character refers to them, by relationship stage */
      calledBy: { low: 'Kirito', mid: 'Kirito', high: 'Kiri' }
    },

    masha: {
      id: 'masha',
      name: 'Masha',
      pronouns: { subj: 'she', obj: 'her', poss: 'her' },
      voice: 'Direct, warm, asks the question everyone else is avoiding. ' +
             'Copes by naming the problem out loud immediately.',
      portraitPrompt:
        'anime style character portrait, teenage girl, long ash-blonde hair tied back, ' +
        'bright amber eyes, white and teal combat jacket, confident open expression',
      battlePrompt:
        'anime style full body battle sprite, teenage girl, long ash-blonde hair tied back, ' +
        'white and teal combat jacket, weapon raised in ready stance',
      color: '#ff6fae',
      calledBy: { low: 'Masha', mid: 'Masha', high: 'Mash' }
    }
  };

  /* ============================================================
     Romance cast (§11) — the six who arrive after Chapter 5.

     These are NOT leads. The player always plays Kirito or Masha;
     these six are people you can end up with instead of your
     starting partner, and each one is written to pull the story a
     different direction rather than to be a different flavour of
     the same scene.

     `voice` drives both the written prose and the AI companion
     chat, which is why it is specific about how they cope rather
     than just how they sound — a voice note that says "friendly"
     produces a chatbot; one that says "deflects with logistics"
     produces a character.

     `route` is the flag prefix owned by that character, so route
     content can be found and audited by tools/qa-story.mjs.
     ============================================================ */

  const ROMANCE = {
    kazuma: {
      id: 'kazuma', name: 'Kazuma', route: 'r_kazuma', gender: 'm',
      title: 'The one who logged out and came back',
      voice: 'Blunt, unimpressed, allergic to ceremony. Says the cynical thing ' +
             'first and the kind thing second, quietly, as if hoping you missed it. ' +
             'Copes by refusing to treat anything as sacred.',
      color: '#e0803a',
      hook: 'He found the exit in Chapter 2. He came back anyway, and will not ' +
            'say why.'
    },
    yuji: {
      id: 'yuji', name: 'Yuji', route: 'r_yuji', gender: 'm',
      title: 'The one carrying something else',
      voice: 'Warm, direct, relentlessly decent, and visibly running on empty. ' +
             'Reassures other people as a way of not being asked how he is. ' +
             'Copes by volunteering for whatever costs the most.',
      color: '#d94f4f',
      hook: 'Something in him answers when the Breach opens. He has stopped ' +
            'pretending it does not.'
    },
    uzui: {
      id: 'uzui', name: 'Uzui', route: 'r_uzui', gender: 'm',
      title: 'The one who makes an entrance',
      voice: 'Loud, theatrical, extravagantly confident, and far more observant ' +
             'than the performance suggests. Notices the thing nobody said. ' +
             'Copes by being too large to look past.',
      color: '#c77dff',
      hook: 'He runs the only safe house in the Nexus and treats it like a stage.'
    },
    chizuru: {
      id: 'chizuru', name: 'Chizuru', route: 'r_chizuru', gender: 'f',
      title: 'The one who is always working',
      voice: 'Composed, precise, faintly exasperated. Answers the question you ' +
             'should have asked instead of the one you did. Copes by being ' +
             'competent at something adjacent to the problem.',
      color: '#ff6f91',
      hook: 'She has been mapping the Breach since before you arrived and has ' +
            'told nobody what she found.'
    },
    airi: {
      id: 'airi', name: 'Airi', route: 'r_airi', gender: 'f',
      title: 'The one who remembers the patches',
      voice: 'Quiet, watchful, speaks in short complete sentences and means all ' +
             'of them. Long pauses that are thinking, not hesitation. Copes by ' +
             'recording everything.',
      color: '#5fd1c9',
      hook: 'She remembers versions of the world that no longer exist, including ' +
            'ones you were in.'
    },
    matikane: {
      id: 'matikane', name: 'Matikanetannhauser', route: 'r_matikane', gender: 'f',
      title: 'The one who will not stop running',
      voice: 'Earnest to the point of alarming, enormous enthusiasm, no volume ' +
             'control, and a streak of real stubbornness under it. Copes by ' +
             'setting off before anyone can argue.',
      color: '#ffd166',
      /* Everyone shortens it. She has never once objected, and has never once
         used the short form herself. */
      short: 'Mati',
      hook: 'She has never finished a race in this world. She intends to.'
    }
  };

  const ROMANCE_IDS = Object.keys(ROMANCE);

  /* ------------------------------------------------------------
     Routes

     Seven, not six: staying with the lead you arrived with is a
     route in its own right and every chapter writes it as one. It
     is not the "no romance" option and it is not a fallback — it
     is the only route whose person has been beside you since the
     first screen, and the writing leans on that.

     The route is chosen during registration rather than at a
     mid-game lock. That is the whole reason chapters 1-5 can carry
     it: a choice made in chapter 6 cannot change chapter 2, so
     under the old shape the first five chapters had to pretend
     none of these people existed.
     ------------------------------------------------------------ */

  const ROUTE_IDS = ROMANCE_IDS.concat(['partner']);

  /** The actual person a route points at, given who you control. */
  function routePerson(route, path) {
    if (route === 'partner') return LEADS[companionOf(path)];
    return ROMANCE[route] || null;
  }

  /** Display name, honouring the short form everyone actually uses. */
  function routeName(route, path, short) {
    const p = routePerson(route, path);
    if (!p) return '';
    return (short && p.short) ? p.short : p.name;
  }

  function romance(id) { return ROMANCE[id] || null; }

  /** Everyone the player can be in a scene with, leads included. */
  function anyone(id) { return LEADS[id] || ROMANCE[id] || null; }

  /** Given the controlled path, who is the companion? */
  function companionOf(path) {
    return path === 'kirito' ? 'masha' : 'kirito';
  }

  function lead(id) { return LEADS[id]; }

  /**
   * Resolve a text field that may be path-specific.
   *
   *   'shared text'                       -> used on both paths
   *   { kirito: '...', masha: '...' }     -> per-path variant
   *
   * Keeping this in one place is what lets chapter files stay
   * readable while still carrying two genuinely different scripts.
   */
  function resolve(field, path) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
      if (field[path] != null) return field[path];
      if (field.shared != null) return field.shared;
    }
    return '';
  }

  /** Romance stage from accumulated trust (§2). */
  const TRUST_STAGES = [
    { at: 0,  key: 'low',  label: 'Wary' },
    { at: 4,  key: 'mid',  label: 'Trusting' },
    { at: 9,  key: 'high', label: 'Close' },
    { at: 15, key: 'bond', label: 'Bonded' }
  ];

  function trustStage(trust) {
    let out = TRUST_STAGES[0];
    for (const s of TRUST_STAGES) if (trust >= s.at) out = s;
    return out;
  }

  /** What the companion calls the player, given current trust. */
  function addressPlayer(path, trust) {
    const stage = trustStage(trust).key;
    const me = LEADS[path];
    return me.calledBy[stage] || me.calledBy.low || me.name;
  }

  return {
    LEADS, ROMANCE, ROMANCE_IDS, ROUTE_IDS,
    lead, romance, anyone, companionOf, resolve, routePerson, routeName,
    trustStage, addressPlayer, TRUST_STAGES
  };
})();
