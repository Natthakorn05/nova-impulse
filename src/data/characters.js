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

  return { LEADS, lead, companionOf, resolve, trustStage, addressPlayer, TRUST_STAGES };
})();
