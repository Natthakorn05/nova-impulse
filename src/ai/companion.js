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
          battlesWon: state.battlesWon || 0
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

  return { say, thread, clear, isAvailable, isBusy, MAX_INPUT };
})();
