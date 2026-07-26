/* ============================================================
   prompts.js — one shared anime style contract (§7).

   Every asset routes through buildPrompt() so the whole cast reads
   as one production. Editing STYLE re-skins the entire game.

   Two things here are load-bearing and easy to get wrong:

   1. CHROMA — subjects are generated on a flat chroma backdrop that
      is then keyed out by tools/cutout.mjs. The colour is chosen
      PER ASSET to be far from that subject's own palette. A white
      backdrop behind Masha's white jacket, or black behind Kirito's
      black coat, cannot be keyed without eating the character.

   2. The leads carry NO class weapon. Class is chosen by the player
      at runtime, so a sword in Kirito's portrait is wrong three
      times out of four.
   ============================================================ */

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NI = root.NI || {};
  root.NI.prompts = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /* Style contract. Concrete and production-flavoured — vague "high quality,
     masterpiece" tag soup is what produces generic output. */
  const STYLE =
    'official anime key visual, modern TV anime production, ' +
    'clean confident linework, crisp cel shading with two-tone shadows, ' +
    'expressive detailed face, sharp well-drawn eyes with highlights, ' +
    'correct anatomy, detailed hands, vivid but controlled palette, ' +
    'soft rim light from upper left';

  /* Things the models reliably get wrong if not steered away from. */
  /* "not chibi" has to be stated explicitly and more than once. Asked for a
     full body at a tall aspect ratio, these models reliably shrink the torso
     and inflate the head until the character reads as a small child. */
  const AVOID =
    'not chibi, not super-deformed, not a small child, no oversized head, ' +
    'no text, no watermark, no signature, no border, no frame, ' +
    'no floating objects, no extra limbs, no malformed hands, ' +
    'no duplicate characters, no motion blur, no photorealism, no 3d render';

  const CHROMA = {
    green:   'isolated on a completely flat solid chroma-green background (#00b140), ' +
             'uniform background with no gradient, no shadow cast on the background',
    magenta: 'isolated on a completely flat solid magenta background (#ff00d0), ' +
             'uniform background with no gradient, no shadow cast on the background',
    orange:  'isolated on a completely flat solid orange background (#ff7a00), ' +
             'uniform background with no gradient, no shadow cast on the background'
  };

  const FRAMING = {
    /* "head and shoulders" + an age reads as an NSFW prompt to some content
       classifiers and gets the whole request rejected. Framing is described
       by crop instead of by body part. */
    portrait: 'bust-up character portrait crop, face fills much of the frame, ' +
              'facing viewer, centred, calm neutral studio lighting',
    sprite:   'full body character reference sheet, standing upright facing the viewer, ' +
              'front view, both arms visible at the sides, feet flat on the ground, ' +
              'head to feet entirely inside the frame with a margin, nothing cropped, ' +
              'tall figure with long legs, ' +
              'realistic shonen anime proportions, head is small relative to the body',
    enemy:    'full body creature design sheet, head to feet inside the frame, ' +
              'imposing three-quarter stance, nothing cropped',
    scene:    'detailed anime background painting, environment only, ' +
              'absolutely no people and no characters, cinematic wide establishing shot, ' +
              'strong atmospheric perspective and depth'
  };

  /**
   * @param {string} subject  what to draw
   * @param {string} kind     portrait | sprite | enemy | scene
   * @param {string} chroma   key colour name (subjects only)
   */
  function buildPrompt(subject, kind = 'portrait', chroma) {
    const parts = [subject, FRAMING[kind] || FRAMING.portrait];
    if (kind !== 'scene') parts.push(CHROMA[chroma] || CHROMA.green);
    parts.push(STYLE, AVOID);
    return parts.join(', ');
  }

  /* ------------------------------------------------------------
     Character sheets — one description reused across a character's
     assets so the portrait and the sprite are the same person.
     ------------------------------------------------------------ */

  /* NO age words at all — not "17 year old", not "teenage", not
     "high-school-age". Any age marker sitting near a body descriptor
     ("shoulders", "build", "body") gets the whole request rejected as NSFW
     by Cloudflare's classifier. "young man / young woman" passes cleanly.
     Their actual age lives in the story text, where it belongs.

     "tall, lean, long-limbed" is doing real work too: without it the models
     produce short, big-headed, near-chibi figures that read about twelve. */
  const KIRITO =
    'a tall lean young man in anime style, long limbs, ' +
    'messy dark charcoal hair with a loose fringe falling over one eye, ' +
    'narrow deep crimson eyes, sharp jawline, pale skin, quietly guarded expression, ' +
    'wearing a fitted black high-collar coat with slate grey panels and thin silver piping, ' +
    'dark trousers, black fingerless gloves';

  const MASHA =
    'a tall slender young woman in anime style, long limbs, ' +
    'long pale lavender-silver hair in a high ponytail with loose side strands, ' +
    'large bright amber eyes, warm open confident expression, ' +
    'wearing a white and deep teal fitted technical jacket with a high collar, ' +
    'dark navy trousers, brown belt';

  const MANIFEST = [
    { key: 'kirito_portrait', kind: 'portrait', ratio: '1:1', chroma: 'green',
      subject: KIRITO },
    { key: 'kirito_sprite',   kind: 'sprite',   ratio: '3:4', chroma: 'green',
      subject: KIRITO },

    { key: 'masha_portrait',  kind: 'portrait', ratio: '1:1', chroma: 'magenta',
      subject: MASHA },
    { key: 'masha_sprite',    kind: 'sprite',   ratio: '3:4', chroma: 'magenta',
      subject: MASHA },

    /* --- scenes keep their backgrounds --- */
    { key: 'scene_nexus', kind: 'scene', ratio: '16:9',
      subject: 'the vast interior of a cathedral-like spawn hall in a fantasy MMO, ' +
               'towering pale stone arches, floating translucent blue interface panels, ' +
               'shafts of cold blue and violet light, polished reflective floor' },
    { key: 'scene_field', kind: 'scene', ratio: '16:9',
      subject: 'wide rolling grassland at golden hour, tall seed-heads catching low sun, ' +
               'enormous floating islands stacked into a pale sky, ' +
               'a distant crystalline spire on the horizon' },
    { key: 'scene_town', kind: 'scene', ratio: '16:9',
      subject: 'a fantasy market town of white stone buildings with teal tiled roofs, ' +
               'narrow crooked streets, hanging lanterns and cloth banners, ' +
               'warm evening light, chimney smoke' },
    { key: 'scene_forest', kind: 'scene', ratio: '16:9',
      subject: 'a dark overgrown forest of enormous thorned vines and twisted trunks, ' +
               'luminous green spores drifting in the air, shafts of sickly green light, ' +
               'eerie oppressive atmosphere' },
    { key: 'scene_breach', kind: 'scene', ratio: '16:9',
      subject: 'a shattered rocky plateau split by a jagged tear of blinding white void light, ' +
               'floating debris, dark storm sky, reality visibly breaking apart at the edges' },
    { key: 'scene_spire', kind: 'scene', ratio: '16:9',
      subject: 'the interior of a colossal white and gold administrative spire, ' +
               'concentric floating rings of light rising into darkness far above, ' +
               'immense scale, cold and imposing' }
  ];

  /** Enemy entries derive from enemies.js so the two never drift apart. */
  function enemyManifest(enemyDefs) {
    return Object.values(enemyDefs).map(e => ({
      key: 'enemy_' + e.id,
      kind: 'enemy',
      ratio: '1:1',
      chroma: e.chroma || 'green',
      subject: e.art
    }));
  }

  return { STYLE, AVOID, CHROMA, FRAMING, buildPrompt, MANIFEST, enemyManifest, KIRITO, MASHA };
});
