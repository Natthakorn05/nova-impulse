/* ============================================================
   battleStage.js — the Phaser half of the hybrid UI (§9).

   Phaser owns the canvas: sprites, idle bob, attack lunges, hit
   flashes and impact bursts. The DOM owns everything textual —
   bars, menus, log, turn order. That split keeps text crisp,
   selectable and responsive while Phaser does the animation work
   it is actually good at.

   Degrades safely: if Phaser fails to load or WebGL is
   unavailable, isReady() stays false and battleHud.js simply
   skips the animation calls.
   ============================================================ */

window.NI = window.NI || {};

NI.stage = (function () {

  let game = null;
  let scene = null;
  let ready = false;
  const sprites = {};      // uid -> Phaser image/container
  let waiting = [];        // work queued before the scene finished booting

  const DESIGN_W = 900;
  const DESIGN_H = 300;

  /* ------------------------------------------------------------
     Scene
     ------------------------------------------------------------ */

  function makeScene() {
    return {
      key: 'battle',

      preload() {
        scene = this;
        /* Textures are registered dynamically in setCombatants(); nothing
           to preload up front. A 1x1 white pixel backs all the FX. */
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1).fillRect(0, 0, 4, 4);
        g.generateTexture('px', 4, 4);
        g.destroy();
      },

      create() {
        ready = true;
        this.impacts = this.add.group();
        /* Anything that asked for the stage while it was still booting runs
           now, in the order it was requested. */
        const queued = waiting;
        waiting = [];
        for (const fn of queued) fn();
      },

      update() {
        /* idle bob — cheap, and makes a static sprite feel alive */
        const t = this.time.now / 1000;
        for (const uid of Object.keys(sprites)) {
          const s = sprites[uid];
          if (!s || !s.active || s.busy) continue;
          s.y = s.baseY + Math.sin(t * 1.6 + s.phase) * 4;
        }
      }
    };
  }

  /* ------------------------------------------------------------
     Boot
     ------------------------------------------------------------ */

  function init(canvas) {
    if (game || typeof Phaser === 'undefined') return;
    try {
      game = new Phaser.Game({
        /* CANVAS rather than AUTO: some embedded/headless webviews reject
           AUTO with "must set explicit renderType". The FX here are simple
           enough that the canvas renderer costs nothing. */
        type: Phaser.CANVAS,
        canvas,
        transparent: true,
        /* `parent` is not optional here. Passing an existing canvas does NOT
           tell the Scale Manager what to fit inside — without it Phaser
           measures document.body and fits the whole window, then centres
           against the window too. That produced a 1398x466 canvas with
           margin-top:402px inside a 912x280 .bt-field with overflow:hidden,
           so every sprite rendered correctly and was clipped entirely out of
           view. The stage looked broken while the renderer was fine. */
        scale: {
          parent: canvas.parentElement || undefined,
          width: DESIGN_W,
          height: DESIGN_H,
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          expandParent: false
        },
        scene: makeScene(),
        banner: false,
        audio: { noAudio: true }
      });
    } catch (err) {
      console.warn('Phaser unavailable, running DOM-only:', err);
      ready = false;
    }
  }

  function isReady() { return ready && !!scene; }

  /**
   * Run `fn` once the scene exists, or immediately if it already does.
   *
   * Callers used to guess with `setTimeout(..., 60)` and drop the work
   * silently if Phaser hadn't finished booting yet — a cold load parsing
   * 1.2MB of vendored Phaser loses that race, and nothing ever retried, so
   * the battle ran to completion against an empty canvas. If Phaser never
   * boots at all the queue simply never drains, which is the intended
   * DOM-only degradation.
   */
  function whenReady(fn) {
    if (isReady()) return fn();
    if (typeof Phaser === 'undefined') return;   // no stage, ever — drop it
    waiting.push(fn);
  }

  /* ------------------------------------------------------------
     Populating the field
     ------------------------------------------------------------ */

  function clear() {
    if (!isReady()) return;
    for (const uid of Object.keys(sprites)) {
      if (sprites[uid] && sprites[uid].destroy) sprites[uid].destroy();
      delete sprites[uid];
    }
  }

  /**
   * Place enemy sprites across the field. Party members are drawn by
   * the DOM HUD as portraits, so the canvas is the enemy side plus FX.
   * @param {Array} foes battle units
   */
  function setFoes(foes) {
    whenReady(() => placeFoes(foes));
  }

  function placeFoes(foes) {
    clear();

    const n = foes.length;
    foes.forEach((foe, i) => {
      const x = DESIGN_W * ((i + 1) / (n + 1));
      const y = DESIGN_H * 0.58;
      /* Keyed by ENEMY, not by unit. Keying on foe.uid ("foe0", "foe1") means
         slot 0 of every battle shares one texture key, and Phaser refuses to
         overwrite a key that already exists — so from the second encounter
         onward every foe wore the first encounter's art. */
      const key = 'art_' + foe.enemyId;
      const src = NI.art.url('enemy_' + foe.enemyId);

      if (!src) return placeholderFoe(foe, x, y, i);

      if (scene.textures.exists(key)) return addFoeImage(foe, key, x, y, i);

      /* Listen for THIS file rather than the loader's global 'complete'.
         Two foes sharing one enemy type queue the same key twice; a global
         handler fires for both and double-adds. */
      scene.load.once('filecomplete-image-' + key, () => addFoeImage(foe, key, x, y, i));
      scene.load.once('loaderror', (file) => {
        if (file && file.key === key) placeholderFoe(foe, x, y, i);
      });
      scene.load.image(key, src);
      scene.load.start();
    });
  }

  function addFoeImage(foe, key, x, y, i) {
    if (!isReady() || !scene.textures.exists(key)) return;
    const img = scene.add.image(x, y, key);
    img.setScale(Math.min(170 / img.height, 190 / img.width));
    register(foe.uid, img, y, i);
  }

  /** Procedural stand-in so battles stay legible when art is missing. */
  function placeholderFoe(foe, x, y, i) {
    if (!isReady()) return;
    const c = scene.add.container(x, y);
    const body = scene.add.image(0, 0, 'px')
      .setDisplaySize(78, 108).setTint(0xff5f6d).setAlpha(0.42);
    const core = scene.add.image(0, -14, 'px')
      .setDisplaySize(40, 40).setTint(0xff9aa4).setAlpha(0.85);
    const base = scene.add.image(0, 62, 'px')
      .setDisplaySize(96, 5).setTint(0x000000).setAlpha(0.5);
    c.add([base, body, core]);
    register(foe.uid, c, y, i);
  }

  function register(uid, obj, baseY, i) {
    obj.baseY = baseY;
    obj.phase = i * 1.3;
    obj.busy = false;
    sprites[uid] = obj;
  }

  /* ------------------------------------------------------------
     Animations — all no-ops when Phaser isn't running
     ------------------------------------------------------------ */

  function flashHit(uid, crit) {
    if (!isReady() || !sprites[uid]) return;
    const s = sprites[uid];

    scene.tweens.add({
      targets: s, x: s.x + (crit ? 16 : 10), duration: 60,
      yoyo: true, repeat: crit ? 2 : 1, ease: 'Quad.easeOut'
    });

    if (s.setTint) {
      s.setTint(crit ? 0xffe08a : 0xffffff);
      scene.time.delayedCall(140, () => s.clearTint && s.clearTint());
    }
    burst(s.x, s.y, crit ? 0xffd166 : 0xff6b7a, crit ? 16 : 10);
  }

  /** Small radial particle burst on impact. */
  function burst(x, y, color, count) {
    if (!isReady()) return;
    for (let i = 0; i < count; i++) {
      const p = scene.add.image(x, y, 'px')
        .setDisplaySize(5, 5).setTint(color).setAlpha(0.95);
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 30 + Math.random() * 46;
      scene.tweens.add({
        targets: p,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: 0, duration: 320 + Math.random() * 220,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  /** Attacker lunge — party members have no sprite, so this is a screen cue. */
  function lunge(uid) {
    if (!isReady() || !sprites[uid]) return;
    const s = sprites[uid];
    s.busy = true;
    scene.tweens.add({
      targets: s, y: s.baseY + 18, duration: 110, yoyo: true,
      ease: 'Quad.easeOut', onComplete: () => { s.busy = false; s.y = s.baseY; }
    });
  }

  /** Screen-wide flash for AoE / big casts. */
  function elementFlash(element) {
    if (!isReady()) return;
    const colors = {
      fire: 0xff7a3d, ice: 0x6fd8ff, storm: 0xffe066, dark: 0xa855f7,
      light: 0xfff3c4, nature: 0x4ade80, arcane: 0x8b5cf6, physical: 0xdbe6f5
    };
    const c = colors[element] || 0x35e6ff;
    const r = scene.add.image(DESIGN_W / 2, DESIGN_H / 2, 'px')
      .setDisplaySize(DESIGN_W, DESIGN_H).setTint(c).setAlpha(0.22);
    scene.tweens.add({ targets: r, alpha: 0, duration: 340, onComplete: () => r.destroy() });
  }

  function fadeOut(uid) {
    if (!isReady() || !sprites[uid]) return;
    const s = sprites[uid];
    scene.tweens.add({
      targets: s, alpha: 0, y: s.baseY + 24, duration: 460,
      ease: 'Quad.easeIn'
    });
  }

  /** Canvas position of a unit, for anchoring DOM damage numbers. */
  function screenPos(uid, canvas) {
    if (!isReady() || !sprites[uid] || !canvas) return null;
    const s = sprites[uid];
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + (s.x / DESIGN_W) * rect.width,
      y: rect.top + (s.y / DESIGN_H) * rect.height
    };
  }

  /**
   * Inspection hook for QA tooling. Rendering is driven by
   * requestAnimationFrame, which browsers pause on a hidden page — so an
   * automated check can't confirm anything is actually drawn without being
   * able to reach the game and step it by hand.
   */
  function _debug() {
    return {
      game, scene, sprites,
      spriteKeys: Object.keys(sprites),
      textureKeys: scene ? scene.textures.getTextureKeys().filter(k => k.startsWith('art_')) : [],
      /* force one update+render tick regardless of rAF */
      step() { if (game) game.step(performance.now(), 16); }
    };
  }

  return {
    init, isReady, setFoes, clear,
    flashHit, lunge, elementFlash, fadeOut, burst, screenPos,
    _debug, DESIGN_W, DESIGN_H
  };
})();
