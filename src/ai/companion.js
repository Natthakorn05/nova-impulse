/* ============================================================
   companion.js — client half of the AI conversation (§11).

   Talks to /.netlify/functions/companion, which holds the API
   key. This file deliberately knows nothing about providers,
   models or prompts: it sends who you are talking to and what you
   said, and renders what comes back.

   Degrades honestly. On `file://`, on a plain static host, or
   with the function down, isAvailable() goes false after the
   first failed call and the UI says so rather than presenting a
   dead text box.
   ============================================================ */

window.NI = window.NI || {};

NI.companion = (function () {

  const ENDPOINT = '/.netlify/functions/companion';
  const MAX_INPUT = 400;
  const HISTORY_KEEP = 8;

  /* One transcript per character, kept in memory for the session. Not saved:
     a conversation is a moment, and persisting it would mean the save file
     grows without bound and carries model output into the story state. */
  const threads = {};

  let available = true;
  let inFlight = false;

  function isAvailable() { return available; }
  function isBusy() { return inFlight; }

  function thread(charId) {
    return threads[charId] || (threads[charId] = []);
  }

  function clear(charId) { threads[charId] = []; }

  /**
   * Send one line and append both sides to the transcript.
   *
   * @param {string} charId  key into the server-side cast
   * @param {string} text    the player's line
   * @param {object} state   game state, for context
   * @returns {Promise<{ok:boolean, reply?:string, error?:string}>}
   */
  async function say(charId, text, state) {
    const line = String(text || '').trim().slice(0, MAX_INPUT);
    if (!line) return { ok: false, error: 'Say something first.' };
    if (inFlight) return { ok: false, error: 'Still waiting for a reply.' };

    const t = thread(charId);
    inFlight = true;

    const me = state.party && state.party[0];
    const cls = me && NI.classes.get(me.classId);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          character: charId,
          text: line,
          /* Only the last few turns travel. The server trims again — this is
             to keep the request small, not to enforce anything. */
          history: t.slice(-HISTORY_KEEP),
          playerName: me ? me.name : 'the player',
          className: cls ? cls.name : 'fighter',
          level: me ? me.level : 1,
          chapter: state.chapter || 1,
          trust: state.trust || 0,
          battlesWon: state.battlesWon || 0,
          /* What just happened to them. Without this the cast answers every
             question as if the run had no history, which is what made the
             romance routes feel weightless — Masha would discuss the Breach
             in the abstract right after you lost a fight in it. */
          recent: (state.recent || []).slice(-4)
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        /* Rate limiting is temporary and must not disable the feature for the
           rest of the session. Anything that says "there is no function here"
           is permanent for this session, and the player should be told what
           is actually wrong rather than shown a status code — 501 is what a
           plain static file server returns for a POST, which is exactly what
           happens when the game is run locally without Netlify. */
        if (res.status === 429) {
          return { ok: false, error: data.error || 'Too many messages for now. Give it a minute.' };
        }
        if (res.status === 404 || res.status === 405 || res.status === 501) {
          available = false;
          return { ok: false, error: 'No relay here. This works on the deployed site, not a local file server.' };
        }
        if (res.status >= 500) {
          return { ok: false, error: 'The relay did not answer. Try again in a moment.' };
        }
        return { ok: false, error: data.error || 'That did not go through.' };
      }

      t.push({ role: 'user', content: line });
      t.push({ role: 'assistant', content: data.reply });
      return { ok: true, reply: data.reply };

    } catch (err) {
      /* Network-level failure means there is no function here at all —
         running from file:// or a host without Netlify Functions. */
      available = false;
      return { ok: false, error: 'No connection to the Nexus relay.' };
    } finally {
      inFlight = false;
    }
  }

  /* ------------------------------------------------------------
     Flavour text: the epilogue, Breach floor names, boss lines.

     Separate from say() on purpose. A chat failure is worth telling the
     player about — they typed something and deserve to know it went nowhere.
     A flavour failure is not: the game has a perfectly good static name for
     that floor, and a player mid-Breach must never be shown an API error or
     made to wait on one. So this swallows everything and returns ok:false,
     and every caller is written to carry on without it.
     ------------------------------------------------------------ */

  /** Hard ceiling on how long the game will wait before using its own text. */
  const FLAVOUR_TIMEOUT_MS = 6000;

  async function flavour(mode, payload) {
    if (!available) return { ok: false };

    /* fetch has no default timeout, and a provider that accepts the
       connection then stalls would otherwise hang a wave transition
       indefinitely. Same lesson the art pipeline learned the hard way. */
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), FLAVOUR_TIMEOUT_MS) : null;

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode, ...payload }),
        signal: ctl ? ctl.signal : undefined
      });

      if (res.status === 404 || res.status === 405 || res.status === 501) {
        available = false;
        return { ok: false };
      }
      if (!res.ok) return { ok: false };

      const data = await res.json().catch(() => ({}));
      const text = String(data.text || '').trim();
      return text ? { ok: true, text } : { ok: false };

    } catch (err) {
      /* An abort is a timeout, not a missing endpoint — do not disable the
         feature for the rest of the session over one slow response. */
      if (!(err && err.name === 'AbortError')) available = false;
      return { ok: false };
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * The closing archive entry. One call per finished playthrough.
   * @returns {Promise<{ok:boolean, text?:string}>}
   */
  function epilogue(state) {
    const me = state.party && state.party[0];
    const cls = me && NI.classes.get(me.classId);
    return flavour('epilogue', {
      playerName: me ? me.name : 'the player',
      className: cls ? cls.name : 'fighter',
      level: me ? me.level : 1,
      lead: state.path || '',
      route: state.route || '',
      trust: state.trust || 0,
      battlesWon: state.battlesWon || 0,
      battlesLost: state.battlesLost || 0,
      echoes: (state.echoes || []).length,
      deepest: state.breachBest || 0,
      /* The flags the player actually set — the game's own record of what
         happened, already id-shaped and safe to send. */
      notes: Object.keys(state.flags || {}).filter(k => state.flags[k]).slice(0, 8)
    });
  }

  /** A name and one line of arrival text for a Breach floor. */
  function breachFloor(wave, foeNames, isBoss, deepest) {
    return flavour('breach', {
      wave, boss: !!isBoss, deepest: deepest || 0,
      foes: (foeNames || []).slice(0, 4)
    });
  }

  /** One spoken line from a boss, aimed at this player. */
  function bossLine(state, boss, attempt, moment) {
    const me = state.party && state.party[0];
    const cls = me && NI.classes.get(me.classId);
    return flavour('boss', {
      playerName: me ? me.name : 'the player',
      className: cls ? cls.name : 'fighter',
      level: me ? me.level : 1,
      bossName: boss.name,
      bossVoice: boss.voice || '',
      attempt: attempt || 1,
      moment: moment || ''
    });
  }

  return {
    say, thread, clear, isAvailable, isBusy, MAX_INPUT,
    epilogue, breachFloor, bossLine
  };
})();
