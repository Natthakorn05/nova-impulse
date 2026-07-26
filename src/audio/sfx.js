/* ============================================================
   sfx.js — procedural battle audio.

   Every sound here is SYNTHESISED at runtime with the Web Audio
   API. Nothing is downloaded and nothing is bundled.

   That is a deliberate choice, not a limitation:
     - the CSP is `default-src 'self'` and the deploy allow-lists
       files, so shipping audio would mean new assets through the
       whole art pipeline for something nobody would look at;
     - the game is already 12MB of art, and a boss loop long
       enough not to feel repetitive is another megabyte;
     - sample libraries carry licences this project cannot audit.

   Oscillators cost nothing and never 404.

   Autoplay policy: browsers refuse to start an AudioContext until
   the user has interacted with the page. unlock() is wired to the
   first click, and every entry point is a no-op before then, so a
   muted first battle is impossible rather than merely unlikely.
   ============================================================ */

window.NI = window.NI || {};

NI.sfx = (function () {

  let ctx = null;
  let master = null;
  let muted = false;
  let boss = null;          // handle for the running boss loop
  let bossWanted = false;   // a boss fight is in progress, muted or not

  const STORE_KEY = 'ni_muted';

  /* ------------------------------------------------------------
     Context
     ------------------------------------------------------------ */

  function unlock() {
    if (ctx) {
      /* Suspended is the normal state after a tab has been backgrounded. */
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;                       // no Web Audio: stay silent
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
    } catch (err) {
      console.warn('audio unavailable, running silent:', err);
      ctx = null;
    }
    return ctx;
  }

  function ready() { return !!ctx && !!master && ctx.state === 'running'; }

  function init() {
    try { muted = localStorage.getItem(STORE_KEY) === '1'; } catch (e) { muted = false; }
    /* One-shot: the first gesture anywhere in the page opens the context. */
    const kick = () => { unlock(); document.removeEventListener('pointerdown', kick); };
    document.addEventListener('pointerdown', kick);
  }

  function setMuted(on) {
    muted = !!on;
    try { localStorage.setItem(STORE_KEY, muted ? '1' : '0'); } catch (e) { /* private mode */ }
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.5, ctx.currentTime, 0.02);

    /* Muting tears the boss loop down rather than turning it to zero gain, so
       unmuting has to rebuild it — otherwise muting once during a boss fight
       silences the music for the rest of that fight even after you turn sound
       back on. */
    if (muted) stopBoss(true);
    else if (bossWanted) startBoss();

    return muted;
  }

  function isMuted() { return muted; }
  function toggle() { unlock(); return setMuted(!muted); }

  /* ------------------------------------------------------------
     Primitives
     ------------------------------------------------------------ */

  /** One enveloped oscillator. Everything tonal is built from these. */
  function tone(opts) {
    if (!ready()) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const dur = opts.dur || 0.15;

    const osc = ctx.createOscillator();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t0 + dur);

    const gain = ctx.createGain();
    const peak = opts.gain != null ? opts.gain : 0.3;
    /* Ramps rather than instant sets: a square wave that starts at full
       amplitude clicks, and the click is louder than the note. */
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.02, dur * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    let node = osc;
    if (opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(opts.filter, t0);
      node.connect(f); node = f;
    }
    node.connect(gain).connect(opts.dest || master);

    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Filtered noise — impacts, whooshes, anything percussive. */
  function noise(opts) {
    if (!ready()) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const dur = opts.dur || 0.12;

    const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const f = ctx.createBiquadFilter();
    f.type = opts.type || 'bandpass';
    f.frequency.setValueAtTime(opts.freq || 1200, t0);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t0 + dur);
    f.Q.value = opts.q != null ? opts.q : 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(opts.gain != null ? opts.gain : 0.25, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(f).connect(gain).connect(opts.dest || master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /* ------------------------------------------------------------
     The battle vocabulary
     ------------------------------------------------------------ */

  /* Keyed to the event names battleHud already emits, so wiring a new
     event up is a one-line addition here rather than a change there. */
  const CUES = {
    hit()   { noise({ freq: 1600, to: 300, dur: 0.14, gain: 0.22 });
              tone({ type: 'triangle', freq: 180, to: 70, dur: 0.12, gain: 0.18 }); },

    crit()  { noise({ freq: 2600, to: 400, dur: 0.2, gain: 0.3 });
              tone({ type: 'square', freq: 880, to: 240, dur: 0.18, gain: 0.16, filter: 2600 });
              tone({ type: 'triangle', freq: 160, to: 60, dur: 0.22, gain: 0.24, delay: 0.02 }); },

    miss()  { noise({ freq: 900, to: 2400, dur: 0.16, gain: 0.12, type: 'highpass' }); },

    cast()  { tone({ type: 'sine', freq: 420, to: 900, dur: 0.22, gain: 0.14 });
              tone({ type: 'sine', freq: 630, to: 1350, dur: 0.22, gain: 0.08, delay: 0.03 }); },

    heal()  { [523.25, 659.25, 783.99].forEach((f, i) =>
                tone({ type: 'sine', freq: f, dur: 0.3, gain: 0.13, delay: i * 0.06 })); },

    shield(){ tone({ type: 'triangle', freq: 300, to: 600, dur: 0.28, gain: 0.16, filter: 1800 }); },

    buff()  { [392, 523.25].forEach((f, i) =>
                tone({ type: 'triangle', freq: f, dur: 0.22, gain: 0.12, delay: i * 0.07 })); },

    status(){ tone({ type: 'sawtooth', freq: 260, to: 150, dur: 0.26, gain: 0.1, filter: 900 }); },

    guard() { noise({ freq: 400, dur: 0.18, gain: 0.18, q: 3 });
              tone({ type: 'triangle', freq: 140, dur: 0.2, gain: 0.14 }); },

    down()  { tone({ type: 'sawtooth', freq: 300, to: 45, dur: 0.7, gain: 0.2, filter: 1200 });
              noise({ freq: 700, to: 120, dur: 0.6, gain: 0.14 }); },

    /* Boss enrage: the one cue allowed to be loud. */
    enrage(){ tone({ type: 'sawtooth', freq: 120, to: 55, dur: 1.1, gain: 0.3, filter: 700 });
              tone({ type: 'square', freq: 240, to: 110, dur: 0.9, gain: 0.12, filter: 900 });
              noise({ freq: 300, to: 80, dur: 1.0, gain: 0.2 }); },

    victory() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
                  tone({ type: 'triangle', freq: f, dur: 0.42, gain: 0.17, delay: i * 0.1 })); },

    defeat()  { [392, 349.23, 293.66, 220].forEach((f, i) =>
                  tone({ type: 'sine', freq: f, dur: 0.6, gain: 0.16, delay: i * 0.16 })); },

    ui()    { tone({ type: 'square', freq: 660, dur: 0.05, gain: 0.05, filter: 2200 }); }
  };

  function play(name) {
    const cue = CUES[name];
    if (!cue || muted) return;
    unlock();
    if (!ready()) return;
    try { cue(); } catch (err) { /* never let a sound break a battle */ }
  }

  /* ------------------------------------------------------------
     Boss loop
     ------------------------------------------------------------ */

  /* D minor, because it is the saddest of all keys, and because a drone
     plus a rising four-note figure is enough to read as "this fight is
     different" without becoming a song anyone has to listen to twice. */
  const BOSS_ROOT = 73.42;                       // D2
  const BOSS_FIGURE = [0, 3, 7, 10, 7, 3];       // minor 7th arpeggio, up and back
  const STEP = 0.34;                             // seconds per note

  function semis(root, n) { return root * Math.pow(2, n / 12); }

  /**
   * Start the boss bed. Safe to call twice; the second call is ignored.
   * Returns silently when audio is unavailable or muted.
   */
  function startBoss() {
    bossWanted = true;
    if (boss || muted) return;
    unlock();
    if (!ready()) return;

    const bus = ctx.createGain();
    bus.gain.value = 0.0001;
    bus.connect(master);
    /* Fade in over a bar — a boss theme that snaps on is a jump scare. */
    bus.gain.exponentialRampToValueAtTime(0.42, ctx.currentTime + 1.6);

    /* Sustained drone, detuned against itself for movement. */
    const drone = [];
    for (const cents of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = BOSS_ROOT;
      o.detune.value = cents;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 260;
      const g = ctx.createGain();
      g.gain.value = 0.1;
      o.connect(f).connect(g).connect(bus);
      o.start();
      drone.push(o);
    }

    let i = 0;
    const timer = setInterval(() => {
      if (!ready()) return;
      const n = BOSS_FIGURE[i % BOSS_FIGURE.length];
      tone({ type: 'triangle', freq: semis(BOSS_ROOT * 4, n), dur: STEP * 0.9,
             gain: 0.09, filter: 2000, dest: bus });
      /* Pulse on the downbeat only, so the loop has a shape. */
      if (i % BOSS_FIGURE.length === 0) {
        tone({ type: 'sine', freq: 110, to: 44, dur: 0.24, gain: 0.22, dest: bus });
      }
      i++;
    }, STEP * 1000);

    boss = { bus, drone, timer };
  }

  /**
   * Fade out and tear down. Safe to call when nothing is playing.
   * @param {boolean} keepWanted true when muting mid-fight, so unmuting
   *        knows to bring the loop back rather than staying silent.
   */
  function stopBoss(keepWanted) {
    if (!keepWanted) bossWanted = false;
    if (!boss) return;
    const b = boss;
    boss = null;
    clearInterval(b.timer);
    if (!ctx) return;
    const t = ctx.currentTime;
    try {
      b.bus.gain.cancelScheduledValues(t);
      b.bus.gain.setValueAtTime(Math.max(0.0001, b.bus.gain.value), t);
      b.bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      for (const o of b.drone) o.stop(t + 0.8);
      setTimeout(() => { try { b.bus.disconnect(); } catch (e) {} }, 1000);
    } catch (err) { /* context already gone */ }
  }

  return { init, unlock, play, startBoss, stopBoss, toggle, setMuted, isMuted };
})();
