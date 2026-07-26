/* ============================================================
   talk.js — the conversation screen (§11).

   Renders a transcript and posts lines through NI.companion.

   One rule runs through this file: model output is inserted with
   textContent, never innerHTML. The reply is text from a remote
   service shaped partly by whatever the player typed, which makes
   it the least trustworthy string in the codebase. Paragraph
   breaks are rebuilt by splitting on blank lines and creating
   real <p> nodes, so formatting survives without ever handing the
   parser a string it did not write.
   ============================================================ */

window.NI = window.NI || {};

NI.talk = (function () {

  const $ = id => document.getElementById(id);

  let state = null;
  let host = null;
  let who = 'masha';

  /* Who is reachable, in the order they matter to the player. The two leads
     are always there; the romance cast appears once the chapter that
     introduces them has been reached. */
  function cast() {
    const C = NI.characters;
    const out = [];

    for (const id of ['kirito', 'masha']) {
      const lead = C.lead(id);
      out.push({ id, name: lead.name, color: lead.color, open: true });
    }

    for (const id of C.ROMANCE_IDS) {
      const r = C.romance(id);
      out.push({
        id,
        name: r.short || r.name,
        color: r.color,
        /* Introduced in chapter 6. Talking to someone you have not met would
           spoil them and would give the model no shared history to draw on. */
        open: (state.chapter || 1) >= 6,
        why: 'Not met yet'
      });
    }
    return out;
  }

  function open(gameState, hostApi) {
    state = gameState;
    host = hostApi || {};
    /* Default to whoever you are not playing — your actual partner. */
    who = NI.characters.companionOf(state.path || 'kirito');
    render();
    NI.screens.show('talk');
  }

  function colorOf(id) {
    const c = NI.characters.anyone(id);
    return (c && c.color) || 'var(--cyan)';
  }

  function nameOf(id) {
    const c = NI.characters.anyone(id);
    return (c && (c.short || c.name)) || id;
  }

  function render() {
    renderCast();
    renderLog();
    $('tk-who').textContent = nameOf(who);
    $('tk-text').disabled = NI.companion.isBusy();
    $('tk-send').disabled = NI.companion.isBusy();
  }

  function renderCast() {
    const list = cast();
    $('tk-cast').innerHTML = list.map(c => `
      <button class="tk-who ${c.id === who ? 'on' : ''} ${c.open ? '' : 'locked'}"
              style="--c:${c.color}" data-id="${c.id}"
              ${c.open ? '' : `title="${c.why}"`}>${c.name}</button>`).join('');

    $('tk-cast').querySelectorAll('.tk-who').forEach(b => {
      b.addEventListener('click', () => {
        if (b.classList.contains('locked')) return;
        who = b.dataset.id;
        render();
        $('tk-text').focus();
      });
    });
  }

  /** Build message nodes without ever parsing model output as HTML. */
  function messageNode(role, name, text, color) {
    const wrap = document.createElement('div');
    wrap.className = 'tk-msg ' + role;
    if (color) wrap.style.setProperty('--c', color);

    const label = document.createElement('span');
    label.className = 'tk-name';
    label.textContent = name;
    wrap.appendChild(label);

    for (const para of String(text).split(/\n\s*\n/)) {
      const p = document.createElement('p');
      p.textContent = para.replace(/\s*\n\s*/g, ' ').trim();
      if (p.textContent) wrap.appendChild(p);
    }
    return wrap;
  }

  function renderLog() {
    const log = $('tk-log');
    log.innerHTML = '';

    const t = NI.companion.thread(who);
    if (!t.length) {
      const c = NI.characters.anyone(who);
      log.appendChild(messageNode('sys', 'RELAY',
        NI.companion.isAvailable()
          ? `Channel open to ${nameOf(who)}. ${c && c.hook ? c.hook : ''}`
          : 'The relay is unreachable from here. This needs the deployed site — ' +
            'it will not work opened straight from a file.'));
      return;
    }

    const meName = (state.party && state.party[0] && state.party[0].name) || 'You';
    for (const m of t) {
      log.appendChild(m.role === 'assistant'
        ? messageNode('them', nameOf(who), m.content, colorOf(who))
        : messageNode('me', meName, m.content));
    }
    log.scrollTop = log.scrollHeight;
  }

  async function send() {
    const box = $('tk-text');
    const text = box.value.trim();
    if (!text || NI.companion.isBusy()) return;

    box.value = '';
    /* Show the player's line immediately. NI.companion only commits it to the
       transcript on success, so an error does not leave a half-exchange. */
    const log = $('tk-log');
    if (!NI.companion.thread(who).length) log.innerHTML = '';
    const meName = (state.party && state.party[0] && state.party[0].name) || 'You';
    log.appendChild(messageNode('me', meName, text));

    const pending = messageNode('them', nameOf(who), '…', colorOf(who));
    pending.classList.add('tk-typing');
    log.appendChild(pending);
    log.scrollTop = log.scrollHeight;

    box.disabled = true; $('tk-send').disabled = true;
    const res = await NI.companion.say(who, text, state);
    box.disabled = false; $('tk-send').disabled = false;

    pending.remove();
    if (res.ok) {
      renderLog();
      NI.sfx.play('ui');
    } else {
      log.appendChild(messageNode('sys', 'RELAY', res.error));
      log.scrollTop = log.scrollHeight;
    }
    box.focus();
  }

  function bind() {
    $('tk-send').addEventListener('click', send);
    $('tk-text').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); send(); }
    });
    $('tk-clear').addEventListener('click', () => { NI.companion.clear(who); renderLog(); });
    $('tk-back').addEventListener('click', () => { if (host.back) host.back(); });
  }

  return { open, bind };
})();
