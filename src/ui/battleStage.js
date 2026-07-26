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
        width: DESIGN_W,
        height: DESIGN_H,
        transparent: true,
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
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
    if (!isReady()) return;
    clear();

    const n = foes.length;
    foes.forEach((foe, i) => {
      const x = DESIGN_W * ((i + 1) / (n + 1));
      const y = DESIGN_H * 0.58;
      const key = 'art_' + foe.uid;
      const src = NI.art.url('enemy_' + foe.enemyId);

      if (src) {
        /* real generated art */
        scene.load.image(key, src);
        scene.load.once('complete', () => {
          if (!scene.textures.exists(key)) return;
          const img = scene.add.image(x, y, key);
          const scale = Math.min(170 / img.height, 190 / img.width);
          img.setScale(scale);
          register(foe.uid, img, y, i);
        });
        scene.load.start();
      } else {
        /* procedural stand-in so battles are legible before art exists */
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
    });
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

  return {
    init, isReady, setFoes, clear,
    flashHit, lunge, elementFlash, fadeOut, burst, screenPos,
    DESIGN_W, DESIGN_H
  };
})();
