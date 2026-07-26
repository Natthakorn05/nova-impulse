/* ============================================================
   artLoader.js — resolves generated art at runtime, with a
   procedural fallback so the game is fully playable before any
   art exists (§7 treats generation as a build step, not a
   runtime dependency).

   Lookup order for a key:
     1. assets/generated/index.json entry  (real AI art)
     2. procedural SVG placeholder         (always available)
   ============================================================ */

window.NI = window.NI || {};

NI.art = (function () {

  let index = {};
  let version = '';
  let loaded = false;

  /** Load the generated-art index once at boot. Never fatal. */
  async function init() {
    if (loaded) return index;
    try {
      const res = await fetch('assets/generated/index.json', { cache: 'no-cache' });
      if (res.ok) index = await res.json();
    } catch (err) {
      /* No generated art yet — placeholders carry the game. */
      index = {};
    }
    version = index._v || '';
    delete index._v;
    loaded = true;
    return index;
  }

  function has(key) { return !!index[key]; }

  /**
   * Asset URL, stamped with the generation version.
   * Regenerated art keeps the same filename, so without this the browser
   * serves the previous image from cache indefinitely — a re-cut portrait
   * kept rendering at its old crop long after the file on disk changed.
   */
  function url(key) {
    const path = index[key];
    if (!path) return null;
    return version ? `${path}?v=${version}` : path;
  }

  /* ------------------------------------------------------------
     Procedural placeholders — deterministic per key so a character
     keeps the same look between screens and sessions.
     ------------------------------------------------------------ */

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  const PALETTES = [
    ['#5b8dff', '#243a6b'], ['#ff6fae', '#5c2444'], ['#3fd07a', '#1d4d33'],
    ['#ff8a3d', '#5e3316'], ['#7c6cff', '#2e2760'], ['#4aa8ff', '#1c3f61'],
    ['#ff5f6d', '#5a1f26'], ['#ffd166', '#5c4a17']
  ];

  /**
   * A stylised silhouette card. Not pretending to be anime art —
   * it reads as an intentional "asset pending" frame rather than
   * a broken image.
   */
  function placeholder(key, label) {
    const h = hash(key);
    const [c1, c2] = PALETTES[h % PALETTES.length];
    const initials = (label || key).replace(/[^a-zA-Z ]/g, '').split(/[\s_]+/)
      .filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';

    /* a few deterministic angular shards for texture */
    const shards = Array.from({ length: 5 }, (_, i) => {
      const s = (h >> (i * 3)) % 100;
      const x = 10 + (s % 80), y = 12 + ((s * 7) % 70);
      const w = 6 + (s % 16), r = (s % 60) - 30;
      return `<rect x="${x}" y="${y}" width="${w}" height="${w * 2.2}" rx="2"
                fill="${c1}" opacity="${0.10 + (i % 3) * 0.05}"
                transform="rotate(${r} ${x} ${y})"/>`;
    }).join('');

    return `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pg_${h}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${c2}"/><stop offset="100%" stop-color="#0a0e18"/>
        </linearGradient>
      </defs>
      <rect width="100" height="130" fill="url(#pg_${h})"/>
      ${shards}
      <circle cx="50" cy="46" r="19" fill="${c1}" opacity=".28"/>
      <path d="M22 128 C22 96 34 82 50 82 C66 82 78 96 78 128 Z" fill="${c1}" opacity=".34"/>
      <text x="50" y="53" text-anchor="middle" font-family="ui-monospace,monospace"
            font-size="17" font-weight="700" fill="${c1}" opacity=".95">${initials}</text>
      <rect x="1" y="1" width="98" height="128" fill="none" stroke="${c1}" stroke-width="1" opacity=".5"/>
    </svg>`;
  }

  /**
   * Returns markup for a portrait/sprite slot: an <img> when real art
   * exists, otherwise the procedural SVG.
   */
  function figure(key, label, cls = '') {
    const src = url(key);
    if (src) {
      return `<img class="art-img ${cls}" src="${src}" alt="${label || key}" loading="lazy">`;
    }
    return `<div class="art-ph ${cls}" role="img" aria-label="${label || key}">${placeholder(key, label)}</div>`;
  }

  /* ------------------------------------------------------------
     Per-scene colour grade for the cast.

     A neutrally-lit sprite dropped on a warm sunset background still
     reads as a sticker no matter how clean the cutout is — the light
     doesn't match. Tinting the sprite toward the scene's dominant
     light is what actually sells "standing in it".
     ------------------------------------------------------------ */

  const GRADES = {
    scene_field:  'saturate(1.05) sepia(.20) hue-rotate(-12deg) brightness(.97)',
    scene_town:   'saturate(1.04) sepia(.16) hue-rotate(-10deg) brightness(.95)',
    scene_nexus:  'saturate(1.02) sepia(.10) hue-rotate(170deg) brightness(.94)',
    scene_forest: 'saturate(.95) sepia(.14) hue-rotate(55deg) brightness(.88)',
    scene_breach: 'saturate(.92) contrast(1.06) brightness(1.02)',
    scene_spire:  'saturate(.98) sepia(.08) brightness(1.02) contrast(1.03)'
  };

  function castGrade(sceneKey) {
    return GRADES[sceneKey] || 'none';
  }

  /** Background scene: real art as a CSS image, else a gradient field. */
  function sceneStyle(key) {
    const src = url(key);
    if (src) return `background-image:url('${src}');background-size:cover;background-position:center;`;
    const h = hash(key);
    const [c1, c2] = PALETTES[h % PALETTES.length];
    return `background:radial-gradient(ellipse at 50% 0%, ${c1}33, transparent 60%),` +
           `linear-gradient(160deg, ${c2}, #070a12 70%);`;
  }

  return { init, has, url, figure, placeholder, sceneStyle, castGrade };
})();
