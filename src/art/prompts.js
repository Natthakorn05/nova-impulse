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

  /* ------------------------------------------------------------
     Style contract.

     Concrete and production-flavoured — vague "high quality,
     masterpiece" tag soup is what produces generic output.

     THE TARGET LOOK (set from reference, 2026-07-27)
     ------------------------------------------------
     Soft modern light-novel-adaptation anime — the KonoSuba /
     Bunny Girl Senpai family. Specifically:

       - THIN, delicate line art. Not bold black outlines.
       - Soft cel shading, gentle gradient transitions, light blush.
       - Large rounded eyes, gradient irises, several highlights.
       - Soft rounded jaw, small nose, small mouth.
       - Layered hair with soft internal highlight bands.
       - Pale skin, muted and slightly desaturated palette.
       - Teenage to young-adult, never rugged or middle-aged.

     An earlier pass asked for "bold clean black outlines, vibrant
     saturated colours, sharp angular stylised features" to escape
     a set of drawings that read as western cartoons. It escaped
     them in the wrong direction — heavy shonen poster art, which
     is a different genre from the rest of this game's cast. Both
     failures came from steering the RENDERING when the problem was
     the rendering; the fix is to name the target family instead of
     naming an axis and pushing along it.

     tools/qa-art.mjs measures saturation and outline weight against
     this contract so drift shows up as a number, not as taste.
     ------------------------------------------------------------ */
  const STYLE =
    'official anime key visual from a modern light novel adaptation, ' +
    'soft delicate thin line art, gentle cel shading with soft gradient transitions, ' +
    'large rounded expressive eyes with detailed gradient irises and several bright highlights, ' +
    'soft rounded jawline, small nose, small mouth, pale clear skin with light blush, ' +
    'layered hair with soft internal highlight bands, ' +
    'muted gentle pastel-leaning palette, soft diffuse lighting, ' +
    'clean and calm, correct anatomy, detailed hands';

  /* Things the models reliably get wrong if not steered away from. */
  /* "not chibi" has to be stated explicitly and more than once. Asked for a
     full body at a tall aspect ratio, these models reliably shrink the torso
     and inflate the head until the character reads as a small child. */
  const AVOID =
    'not chibi, not super-deformed, not a small child, no oversized head, ' +
    'no text, no watermark, no signature, no border, no frame, ' +
    'no floating objects, no extra limbs, no malformed hands, ' +
    'no duplicate characters, no motion blur, no photorealism, no 3d render, ' +
    /* Added after a pass came back as heavy shonen poster art: these are the
       specific renderings that read as a different show from the rest of the
       cast, and the models reach for them the moment "anime" is unqualified. */
    'exactly two arms and two hands, exactly five fingers on each hand, ' +
    'no thick black outlines, no heavy ink, no harsh angular faces, ' +
    'no oversaturated colours, no comic book style, no western cartoon style';

  /* The trailing clause is load-bearing and was added after a real failure.
     STYLE asks for a "muted pastel-leaning palette", and the model applied
     that to the BACKDROP as well — Yuji came back on soft sage green instead
     of #00b140, and cutout.mjs removed 3.3% of it. The palette instruction
     has to be explicitly scoped to the subject or it eats the key. */
  const PURE = ', the background colour is pure fully-saturated flat colour, ' +
               'unaffected by the subject\'s palette, lighting or mood';

  const CHROMA = {
    green:   'isolated on a completely flat solid chroma-green background (#00b140), ' +
             'uniform background with no gradient, no shadow cast on the background' + PURE,
    magenta: 'isolated on a completely flat solid magenta background (#ff00d0), ' +
             'uniform background with no gradient, no shadow cast on the background' + PURE,
    orange:  'isolated on a completely flat solid orange background (#ff7a00), ' +
             'uniform background with no gradient, no shadow cast on the background' + PURE,
    /* Added for Matikanetannhauser, whose palette defeated all three of the
       others at once: blonde and gold sit next to green, amber sits next to
       orange, and warm skin with a blush sits next to magenta. Every key ate
       part of her. She has no blue anywhere, so blue is the only colour that
       is far from all of it. */
    blue:    'isolated on a completely flat solid pure blue background (#0040ff), ' +
             'uniform background with no gradient, no shadow cast on the background' + PURE
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
    /* Echoes are the same creatures shrunk into companions, so the framing
       has to fight the "imposing" read the enemy sheet is built around —
       hence small, friendly, and low to the ground. Stated positively:
       asking for "not menacing" produces something menacing. */
    echo:     'full body creature companion design sheet, small pet-sized creature, ' +
              'head to feet inside the frame with a margin, ' +
              'alert friendly stance close to the ground, rounded appealing silhouette, ' +
              'mascot proportions, nothing cropped',
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

  /* ------------------------------------------------------------
     The six romance leads (§11).

     Each description is written to carry the character's ONE
     readable idea, because a route card is 76 pixels wide and the
     player picks from it before reading a word of prose: Kazuma
     is unbothered, Yuji is hurt and hiding it, Uzui is enormous
     and lit, Chizuru is mid-task, Airi is holding a notebook,
     Mati is already moving.

     Chroma is per-asset and deliberately far from anything the
     subject is allowed to be — Airi is teal so she keys on
     magenta; Uzui is violet so he keys on green. Picking a chroma
     "different from the base colour" is not enough, it has to be
     different from every colour the model might reach for.
     ------------------------------------------------------------ */

  /* Every cast member goes through STYLE alone. There used to be a
     CAST_STYLE suffix here and then a second, heavier ANIME suffix bolted
     onto two of them, which is how half the cast ended up in a different
     rendering from the other half. One style contract, applied once. */

  /* No age words anywhere in these — see the note above buildPrompt. A first
     draft of this block said "late teens" and would have been rejected
     wholesale by Cloudflare's classifier. Age lives in the prose. */

  const KAZUMA =
    'a slim young man, soft rounded face, ' +
    'messy dark brown hair falling over one eye, ' +
    'narrow half-lidded green eyes, flat unimpressed expression, ' +
    'a worn olive-brown coat with a turned-up collar over a black shirt, ' +
    'arms folded, shoulders relaxed';

  /* Four poses, and the first three were all fighting the framing rather
     than the model. FRAMING.portrait is "bust-up crop, face fills much of
     the frame" — a forearm is out of shot by construction, so every attempt
     to show the glowing arm either mangled a hand reaching into frame or
     produced a jacket sleeve with a stripe painted on it. The character's
     idea is "something is lit under his skin", not "his arm specifically",
     so it moves to the neck, which a bust crop always contains.

     Colours are stated flatly too: an earlier draft said "crimson" and came
     back pink with gold eyes. */
  const YUJI =
    'a young man, warm open face, soft jaw, ' +
    'spiky dark red hair with soft highlight bands, large warm brown eyes, ' +
    'tired friendly half-smile, an open scuffed dark red jacket over a grey shirt ' +
    'with a loose open collar, ' +
    'a soft glowing pale gold line running up one side of his neck from under the collar';

  const UZUI =
    'a very tall broad-shouldered young man, striking handsome face, ' +
    'long white hair tied back high, bright violet eyes, ' +
    'wide confident theatrical smile, ' +
    'an ornate sleeveless dark tunic with gold trim and layered bead jewellery, ' +
    'both arms opened outward in a welcoming gesture';

  /* HANDS HOLDING THINGS ARE WHERE THESE MODELS FAIL.
     Four separate failures in one session, all of them a hand interacting
     with an object: Yuji's hand mangled twice reaching for his own forearm,
     Chizuru given six fingers around a rolled map, and Airi's second arm
     omitted entirely while both hands were supposed to hold a notebook.
     Arms folded or at rest come back correct essentially every time.
     Props belong in the prose, not in a bust-up portrait. */
  const CHIZURU =
    'a composed young woman, calm refined face, ' +
    'long straight dark red hair, sharp pink eyes, ' +
    'faintly exasperated patient expression, ' +
    'a fitted charcoal work coat over a white collared shirt, ' +
    'arms folded, empty hands';

  const AIRI =
    'a quiet slight young woman, gentle rounded face, ' +
    'short pale teal bob-cut hair with a soft fringe, large calm grey eyes, ' +
    'neutral thoughtful expression, ' +
    'a soft oversized cream cardigan over a dark dress, ' +
    'both arms relaxed down at her sides, empty hands';

  const MATIKANE =
    'an energetic young woman, bright open face, ' +
    'long golden-blonde hair streaming backwards with a single stray strand, ' +
    'huge bright orange eyes, enormous delighted open smile, ' +
    'a light athletic running jacket in white and amber over shorts, ' +
    'leaning forward mid-stride';

  const MANIFEST = [
    { key: 'kirito_portrait', kind: 'portrait', ratio: '1:1', chroma: 'green',
      subject: KIRITO },
    { key: 'kirito_sprite',   kind: 'sprite',   ratio: '3:4', chroma: 'green',
      subject: KIRITO },

    { key: 'masha_portrait',  kind: 'portrait', ratio: '1:1', chroma: 'magenta',
      subject: MASHA },
    { key: 'masha_sprite',    kind: 'sprite',   ratio: '3:4', chroma: 'magenta',
      subject: MASHA },

    /* --- the six routes. Portraits only: they appear on the route cards and
       in scene casts, never as battle sprites, so a sprite each would be six
       generations nothing renders. --- */
    { key: 'kazuma_portrait',   kind: 'portrait', ratio: '1:1', chroma: 'magenta',
      subject: KAZUMA },
    { key: 'yuji_portrait',     kind: 'portrait', ratio: '1:1', chroma: 'green',
      subject: YUJI },
    { key: 'uzui_portrait',     kind: 'portrait', ratio: '1:1', chroma: 'green',
      subject: UZUI },
    { key: 'chizuru_portrait',  kind: 'portrait', ratio: '1:1', chroma: 'green',
      subject: CHIZURU },
    { key: 'airi_portrait',     kind: 'portrait', ratio: '1:1', chroma: 'magenta',
      subject: AIRI },
    /* Was magenta, which the key then could not distinguish from her — warm
       skin, pink blush and a white-and-amber kit are all close enough to a
       magenta backdrop that the cutout punched holes through her face and
       jacket. Nothing about her palette is green. */
    { key: 'matikane_portrait', kind: 'portrait', ratio: '1:1', chroma: 'blue',
      subject: MATIKANE },

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

  /* Echoes get their own art rather than reusing the source enemy's sprite.
     A Warden Prime at pet scale is a different drawing, not the same one
     shown smaller, and a gacha whose rewards are recoloured enemies reads
     as placeholder work. */
  function echoManifest(echoDefs) {
    return Object.values(echoDefs).map(e => ({
      key: 'echo_' + e.id,
      /* `artKind` lets a non-creature Echo opt out of the mascot framing. */
      kind: e.artKind || 'echo',
      ratio: '1:1',
      chroma: e.chroma || 'green',
      subject: e.art
    }));
  }

  return {
    STYLE, AVOID, CHROMA, FRAMING, buildPrompt,
    MANIFEST, enemyManifest, echoManifest, KIRITO, MASHA
  };
});
