/* ============================================================
   echoes.js — creature companions (§10, endgame).

   An Echo is a defeated enemy bound into a resonance shard and
   fought alongside. Every Echo is derived from an enemy that
   already exists, which means:

     - the art is already generated, cut out and QA'd;
     - the player recognises what they just caught;
     - adding an enemy in a future chapter adds a catchable Echo
       for free.

   Echoes are ENDGAME content. They do not appear during chapters
   1-5, and that is a balance decision as much as a story one: a
   third body in a two-body party raises every win rate in the
   game, and chapters 1-5 were just tuned without one. They unlock
   at the Chapter 5 hook.

   STAT MODEL
   ----------
   An Echo has no class and no skill tree. It has:

     base    stats at bond 1
     growth  per bond level
     bond    1-5, raised by catching duplicates

   Effective level is the PARTY's level, not the Echo's — a
   creature caught in the first Breach should not be dead weight
   twenty runs later. Bond is the progression axis; party level
   is just how the numbers keep pace.
   ============================================================ */

window.NI = window.NI || {};

NI.echoes = (function () {

  /* ------------------------------------------------------------
     Star tiers
     ------------------------------------------------------------ */

  /* Three tiers, gacha-standard. 5★ is the banner prize: the only tier that
     cannot be caught in the field at all, so summoning is the sole route to
     one. New 5★ Echoes get added over time — that is the whole shape of the
     mode, and adding one is a single entry in ECHOES plus its art prompt.

     `catchRate` is the chance of binding when the source enemy is defeated.
     `pull` is the gacha weight.

     Earlier weights (100/58/30/12 across four tiers) made a specific top
     Echo one pull in 196 and put the full roster 313 pulls away — roughly
     174 Breach runs, which is a joke at the player's expense rather than a
     collection goal. NI.collection.pull also carries a pity counter so the
     unlucky tail cannot run away. */
  const STARS = {
    3: { star: 3, label: '3★', color: '#9fb2c9', mult: 1.00, catchRate: 0.34, pull: 100 },
    4: { star: 4, label: '4★', color: '#b06cff', mult: 1.30, catchRate: 0.11, pull: 42 },
    /* Uncatchable by design — catchRate 0 and no `from`.
       Weight 19 was tuned when the only way to pull was to finish the story.
       With ten pulls granted at the start it meant 69% of players opened with
       a 5★ and owned 7 of 16 Echoes before chapter 1 — the collection was
       half over before it began. */
    5: { star: 5, label: '5★', color: '#ffc44a', mult: 1.62, catchRate: 0,    pull: 7 }
  };

  const BOND_MAX = 5;

  /* ------------------------------------------------------------
     The roster
     ------------------------------------------------------------ */

  /* Roles exist so a player picking an Echo is making a real decision rather
     than reading for the biggest number. A striker adds damage, a warden adds
     survivability, a seer adds tempo — and only one Echo can be carried. */
  const ECHOES = {

    /* ---------------- 3★ ---------------- */
    shardling: {
      id: 'shardling', name: 'Shardling', from: 'shardSlime',
      star: 3, role: 'striker', element: 'arcane',
      /* Magenta put a 24% pink tint through this one. A pale-blue-and-white
         subject has nowhere to hide from a warm key, so it goes on orange:
         the complement of its own palette, which is the largest separation
         available. The source enemy keys fine on magenta because it is a
         deeper blue with far less white. */
      chroma: 'orange',
      art: 'a tiny crystalline slime companion made of pale ice-blue faceted glass ' +
           'shards, glowing softly from within, two simple dark dot eyes, rounded ' +
           'wobbling gelatinous body, small and cute, entirely pale blue and white',
      blurb: 'The first thing that ever tried to kill you, now following you ' +
             'around. It has not gotten any smarter.',
      base:   { hp: 46, atk: 9,  mag: 5,  def: 5, spd: 8,  crit: 4, evade: 2 },
      growth: { hp: 11, atk: 2.2, mag: 1.1, def: 1.2, spd: 0.9 },
      aura:   { atk: 1 },
      skills: [
        { name: 'Shard Volley', icon: 'ice', power: 11, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 3 },
        { name: 'Splinter', icon: 'slash', power: 8, scaling: 'atk',
          target: 'allEnemies', element: 'arcane', weight: 1 }
      ]
    },

    wispling: {
      id: 'wispling', name: 'Wispling', from: 'dataWisp',
      star: 3, role: 'seer', element: 'storm',
      chroma: 'orange',
      /* Three draws to get this one right, and the lesson is about framing.
         The 'echo' mascot framing turned a ball of light into a blue cat with
         ears — the model follows framing over subject. A purpose-built
         'effect' framing then went too far the other way and made the entire
         image a glow field with no hard edge, which chroma-keyed at 26% tint
         on orange and 26% tint PLUS 8% leftover backdrop on magenta: a
         subject that is nothing but soft glow has nothing for the key to cut
         against. The enemy framing already produces a correct wisp for
         dataWisp and keys cleanly, so this borrows it.

         The tint only went away once the DESIGN changed: an opaque crystal
         core gives the key a hard edge to cut against, where a ball of pure
         light gave it nothing and every backdrop colour bled into the halo.
         Four draws to learn that no chroma choice fixes a subject with no
         edges — the subject has to have one. */
      artKind: 'enemy',
      art: 'a small floating lantern-spirit, a solid faceted crystal shard core of ' +
           'opaque pale blue glass at the centre, wrapped in a tight halo of ' +
           'brilliant cyan light, short ribbons of glowing code fragments trailing ' +
           'behind it, entirely cyan and white',
      blurb: 'A fragment of loose code that decided it liked you. It arrives ' +
             'before you do and leaves before anything can hit it.',
      base:   { hp: 36, atk: 5,  mag: 11, def: 3, spd: 16, crit: 7, evade: 12 },
      growth: { hp: 8,  atk: 0.8, mag: 2.4, def: 0.8, spd: 1.6 },
      aura:   { spd: 1 },
      skills: [
        { name: 'Arc Flicker', icon: 'bolt', power: 12, scaling: 'mag',
          target: 'enemy', element: 'storm', weight: 3 },
        { name: 'Jam Signal', icon: 'stun', power: 5, scaling: 'mag',
          target: 'enemy', element: 'storm', weight: 2,
          status: { type: 'slow', chance: 0.55, turns: 2 } }
      ]
    },

    houndling: {
      id: 'houndling', name: 'Houndling', from: 'rustHound',
      star: 3, role: 'striker', element: 'physical',
      chroma: 'green',
      art: 'a small mechanical wolf pup built from burnished rust-red iron plates and ' +
           'exposed cabling, glowing amber eyes and jaw seams, perked ears, eager ' +
           'alert stance, sparks at the joints',
      blurb: 'Rebuilt from a scrapped patrol frame. Loyal in the way that ' +
             'machines are loyal, which is to say absolutely.',
      base:   { hp: 52, atk: 12, mag: 3, def: 6, spd: 15, crit: 10, evade: 6 },
      growth: { hp: 12, atk: 2.6, mag: 0.5, def: 1.3, spd: 1.4 },
      aura:   { crit: 2 },
      skills: [
        { name: 'Snap', icon: 'fist', power: 13, scaling: 'atk',
          target: 'enemy', element: 'physical', weight: 3 },
        { name: 'Worry', icon: 'slash', power: 9, scaling: 'atk',
          target: 'enemy', element: 'physical', weight: 2,
          status: { type: 'bleed', chance: 0.5, turns: 3, power: 4 } }
      ]
    },

    sentryling: {
      id: 'sentryling', name: 'Sentryling', from: 'sentryDrone',
      star: 3, role: 'warden', element: 'storm',
      chroma: 'green',
      art: 'a small hovering security drone of white and gunmetal panels, one large ' +
           'glowing red lens eye, tiny detached armour plates orbiting its core, soft ' +
           'blue thruster glow beneath',
      blurb: 'Still runs its old patrol routine. It has simply decided that ' +
             'the thing it is patrolling is you.',
      base:   { hp: 58, atk: 7, mag: 9, def: 11, spd: 9, crit: 3, evade: 3 },
      growth: { hp: 14, atk: 1.2, mag: 1.6, def: 2.2, spd: 0.7 },
      aura:   { def: 2 },
      skills: [
        { name: 'Suppress', icon: 'bolt', power: 10, scaling: 'mag',
          target: 'enemy', element: 'storm', weight: 3 },
        { name: 'Escort Field', icon: 'barrier', power: 0, scaling: 'def',
          target: 'allAllies', element: 'none', weight: 2, shield: 0.8 }
      ]
    },

    /* ---------------- 4★ ---------------- */
    thornling: {
      id: 'thornling', name: 'Thornling', from: 'brambleWarden',
      star: 4, role: 'warden', element: 'nature',
      chroma: 'magenta',
      art: 'a small guardian sprout woven from thorned vines and dark bark, glowing ' +
           'green sap running through the seams like veins, stubby clawed branch arms, ' +
           'moss and lichen, smooth blank bark face',
      blurb: 'A cutting from something much older. It grows toward whoever ' +
             'is bleeding and puts itself in the way.',
      base:   { hp: 74, atk: 10, mag: 8, def: 14, spd: 7, crit: 3, evade: 2 },
      growth: { hp: 17, atk: 1.7, mag: 1.4, def: 2.6, spd: 0.6 },
      aura:   { hp: 8 },
      skills: [
        { name: 'Bramble Lash', icon: 'poison', power: 12, scaling: 'atk',
          target: 'enemy', element: 'nature', weight: 3,
          status: { type: 'poison', chance: 0.5, turns: 3, power: 5 } },
        { name: 'Rootbind', icon: 'trap', power: 7, scaling: 'mag',
          target: 'enemy', element: 'nature', weight: 2,
          status: { type: 'stun', chance: 0.35, turns: 1 } }
      ]
    },

    emberling: {
      id: 'emberling', name: 'Emberling', from: 'cinderMoth',
      star: 4, role: 'striker', element: 'fire',
      chroma: 'magenta',
      art: 'a small moth companion with a solid opaque charcoal body and solid opaque wings ' +
           'patterned deep orange and black with a hard clean outline, ' +
           'charcoal black fuzzy body, glowing amber compound eyes, wings edged in ' +
           'live fire',
      blurb: 'Burns through its own wings and regrows them nightly. Nobody ' +
             'has worked out what it is using for fuel.',
      base:   { hp: 54, atk: 8, mag: 15, def: 6, spd: 16, crit: 8, evade: 14 },
      growth: { hp: 11, atk: 1.1, mag: 2.9, def: 1.1, spd: 1.5 },
      aura:   { mag: 2 },
      skills: [
        { name: 'Ashfall', icon: 'flame', power: 11, scaling: 'mag',
          target: 'allEnemies', element: 'fire', weight: 2,
          status: { type: 'burn', chance: 0.4, turns: 2, power: 4 } },
        { name: 'Cinder Dive', icon: 'flame', power: 16, scaling: 'mag',
          target: 'enemy', element: 'fire', weight: 3 }
      ]
    },

    stalkerling: {
      id: 'stalkerling', name: 'Stalkerling', from: 'voidStalker',
      star: 4, role: 'striker', element: 'dark',
      chroma: 'green',
      art: 'a small sleek shadow predator with a smooth featureless white mask, body ' +
           'made of coiling dark smoke, low crouched stance, short claws of condensed ' +
           'shadow, long thin tail',
      blurb: 'It was already following you for three chapters. Binding it ' +
             'only made the arrangement official.',
      base:   { hp: 60, atk: 16, mag: 7, def: 7, spd: 19, crit: 16, evade: 14 },
      growth: { hp: 12, atk: 3.0, mag: 0.9, def: 1.1, spd: 1.7 },
      aura:   { crit: 3 },
      skills: [
        { name: 'Cutpurse', icon: 'slash', power: 15, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 3, critBonus: 15 },
        { name: 'Nightmark', icon: 'mark', power: 6, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 2,
          status: { type: 'mark', chance: 1, turns: 3, power: 0.25 } }
      ]
    },

    
    boarling: {
      id: 'boarling', name: 'Boarling', from: 'glitchBoar',
      star: 4, role: 'striker', element: 'physical',
      chroma: 'green',
      art: 'a small armoured boar piglet with thick dark hide, short curved tusks ' +
           'glowing magenta, corrupted pixelated glitch artifacts tearing across its ' +
           'flank revealing white void beneath, stubby legs, lowered stance',
      blurb: 'Still half-corrupted, still charging at things. The glitch is ' +
             'load-bearing now; cleaning it up would kill it.',
      base:   { hp: 92, atk: 19, mag: 5, def: 12, spd: 10, crit: 8, evade: 2 },
      growth: { hp: 20, atk: 3.3, mag: 0.6, def: 2.0, spd: 0.8 },
      aura:   { atk: 3 },
      skills: [
        { name: 'Overrun', icon: 'quake', power: 14, scaling: 'atk',
          target: 'allEnemies', element: 'physical', weight: 2 },
        { name: 'Tusk', icon: 'thrust', power: 20, scaling: 'atk',
          target: 'enemy', element: 'physical', weight: 3 }
      ]
    },

    knightling: {
      id: 'knightling', name: 'Knightling', from: 'hollowKnight',
      star: 4, role: 'warden', element: 'dark',
      chroma: 'green',
      /* "nobody inside" is a negation and this model ignores negations — the
         first draw was a hooded child with a visible face, which is both the
         wrong character and the chibi failure mode. Filling the helm with
         something concrete (smoke and two eye-lights) gives the model a
         positive thing to draw where the face would go. */
      art: 'a small suit of ornate dark iron armour standing by itself, the open helm ' +
           'filled with swirling violet smoke and two floating violet eye-lights ' +
           'where a face would be, hollow dark gaps at every joint leaking violet ' +
           'light, short tattered cape, gripping a short broad sword point-down',
      blurb: 'An empty helm that stands where you tell it to and does not ' +
             'move again. There was never anyone inside to argue.',
      base:   { hp: 104, atk: 15, mag: 6, def: 16, spd: 9, crit: 6, evade: 3 },
      growth: { hp: 21, atk: 2.4, mag: 0.7, def: 2.2, spd: 0.7 },
      aura:   { def: 2, hp: 4 },
      skills: [
        { name: 'Interpose', icon: 'guard', power: 0, scaling: 'def',
          target: 'allAllies', element: 'none', weight: 2,
          allyBuff: { damageTaken: 0.82, turns: 2 } },
        { name: 'Grave Cut', icon: 'cleave', power: 17, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 3, defPierce: 0.2 }
      ]
    },

    golemling: {
      id: 'golemling', name: 'Golemling', from: 'siegeGolem',
      star: 4, role: 'warden', element: 'physical',
      chroma: 'magenta',
      art: 'a small stocky war golem of dark stone slabs and riveted iron, glowing ' +
           'white rune seams across its chest, oversized piston fists resting on the ' +
           'ground, short thick legs, heavy stance',
      blurb: 'A siege engine scaled down until it fits through a door. It ' +
             'has not been told, and still walks through the wall.',
      /* Wardens were dominant far beyond their rarity: at bond 5 this one
         added 11.6 waves of Breach depth against a base of 6.6, nearly
         tripling a run and beating both legendaries. Mitigation compounds in
         an attrition mode in a way raw damage does not — every point of DEF
         and every shield buys turns, and turns are the resource the mode
         actually spends. The shield and the DEF aura are where that came
         from, so that is where it is taken back out. */
      base:   { hp: 118, atk: 17, mag: 4, def: 18, spd: 5, crit: 4, evade: 1 },
      growth: { hp: 22, atk: 2.5, mag: 0.5, def: 2.4, spd: 0.4 },
      aura:   { def: 2 },
      skills: [
        { name: 'Bulwark Slam', icon: 'hammer', power: 18, scaling: 'def',
          target: 'enemy', element: 'physical', weight: 3,
          status: { type: 'stun', chance: 0.25, turns: 1 } },
        { name: 'Aegis Plate', icon: 'barrier', power: 0, scaling: 'def',
          target: 'allAllies', element: 'none', weight: 2, shield: 0.85 }
      ]
    },

    duelling: {
      id: 'duelling', name: 'Duelling', from: 'echoDuelist',
      star: 4, role: 'seer', element: 'arcane',
      chroma: 'magenta',
      art: 'a small humanoid formed entirely of fractured mirror glass in silver and ' +
           'cold white, polished chrome surfaces reflecting broken fragments of light, ' +
           'twin thin needle blades, poised elegant stance, no colour tint',
      blurb: 'A reflection that kept moving after you walked away. It fights ' +
             'exactly the way you do, one beat earlier.',
      base:   { hp: 84, atk: 18, mag: 12, def: 11, spd: 20, crit: 14, evade: 11 },
      growth: { hp: 18, atk: 3.0, mag: 2.0, def: 1.8, spd: 2.0 },
      aura:   { spd: 2, crit: 2 },
      skills: [
        { name: 'Mirror Pass', icon: 'slash', power: 13, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 3, hits: 2 },
        { name: 'Refract', icon: 'nova', power: 14, scaling: 'mag',
          target: 'allEnemies', element: 'arcane', weight: 2 }
      ]
    },

    /* ---------------- 5★ ----------------
       Banner exclusives have no `from`: they are not derived from any enemy,
       so there is nothing in the world to defeat and bind. Summoning is the
       only route, which is what makes them the prize rather than a rarer
       version of something you already fight.

       Adding a new one later is this and an art prompt — nothing else in the
       system needs to know. */

    kagura: {
      id: 'kagura', name: 'Kagura', star: 5, role: 'seer', element: 'light',
      chroma: 'green',
      art: 'a small white shrine-fox construct with sleek porcelain plating, ' +
           'nine long flowing ribbon tails made of pale luminous light, ' +
           'delicate gold filigree along its back, calm narrow glowing eyes, ' +
           'red shrine cord around its neck, standing lightly on all fours',
      blurb: 'Something older than the system, wearing the system\'s shape. ' +
             'It answers summons it was never bound by, and leaves when it likes.',
      /* Healing compounds hardest of all in a gauntlet — at heal 16 this was
         adding 8 waves to a 6.7-wave base, i.e. carrying the run. */
      base:   { hp: 98, atk: 15, mag: 23, def: 13, spd: 21, crit: 12, evade: 12 },
      growth: { hp: 19, atk: 2.2, mag: 3.4, def: 1.9, spd: 1.9 },
      aura:   { mag: 2, spd: 2 },
      skills: [
        { name: 'Ninefold Blessing', icon: 'regen', power: 0, scaling: 'mag',
          target: 'allAllies', element: 'light', weight: 2, heal: 12, cleanse: true },
        { name: 'Foxfire', icon: 'flame', power: 19, scaling: 'mag',
          target: 'allEnemies', element: 'light', weight: 3 }
      ]
    },

    ouros: {
      id: 'ouros', name: 'Ouros', star: 5, role: 'striker', element: 'dark',
      chroma: 'orange',
      art: 'a small serpent coiled into a ring biting its own tail, its body made ' +
           'of dense glowing cyan code glyphs over black scales, no legs, ' +
           'a single bright violet eye, thin trailing data motes around the coil',
      blurb: 'A loop that never terminated. Everything it eats becomes more of ' +
             'the loop, including, eventually, whatever you point it at.',
      base:   { hp: 110, atk: 28, mag: 19, def: 15, spd: 19, crit: 20, evade: 8 },
      growth: { hp: 23, atk: 5.4, mag: 3.2, def: 2.2, spd: 1.6 },
      aura:   { atk: 5, crit: 4 },
      skills: [
        { name: 'Devour', icon: 'drain', power: 30, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 4, lifesteal: 0.5, defPierce: 0.3 },
        { name: 'Recursion', icon: 'link', power: 12, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 2, hits: 4, lifesteal: 0.2 }
      ]
    },

    sovereign: {
      id: 'sovereign', name: 'Sovereign', star: 5, role: 'warden', element: 'arcane',
      chroma: 'magenta',
      art: 'a small crowned construct of interlocking dark blue plates and brass ' +
           'joints, a tall thin crown of floating geometric shards above its head, ' +
           'a heavy tower shield larger than itself planted on the ground, ' +
           'glowing teal seams, immovable braced stance',
      blurb: 'It outranks the Warden Prime and always did. Nobody has explained ' +
             'why it spent the whole war standing in an empty room.',
      /* Wardens compound in an attrition mode in a way strikers do not, and
         this one landed at +12.5 waves on a base of 6.3 — carrying the run
         outright, exactly as the epic Golemling did before it was trimmed.
         Same fix, same reason: the shield and the DEF aura are the levers. */
      base:   { hp: 128, atk: 18, mag: 14, def: 19, spd: 8, crit: 6, evade: 3 },
      growth: { hp: 24, atk: 2.8, mag: 2.2, def: 2.3, spd: 0.6 },
      aura:   { def: 2, hp: 5 },
      skills: [
        { name: 'Bastion', icon: 'barrier', power: 0, scaling: 'def',
          target: 'allAllies', element: 'none', weight: 2, shield: 0.78 },
        { name: 'Writ of Silence', icon: 'hammer', power: 21, scaling: 'def',
          target: 'enemy', element: 'arcane', weight: 3, defPierce: 0.3,
          status: { type: 'stun', chance: 0.3, turns: 1 } }
      ]
    },

    seraphling: {
      id: 'seraphling', name: 'Seraphling', from: 'nullSeraph',
      star: 5, role: 'seer', element: 'light',
      chroma: 'green',
      /* 16% green cast on the first draw. Negations do not work on this
         model, so the fix is to state what the light IS — warm white and
         amber — rather than what it must not be. */
      art: 'a small angelic companion in solid opaque polished cream and pale gold ceramic plating, a smooth featureless faceplate, four solid opaque geometric wings of hard cream and gold plate with clean edges, a thin gold ring above its head, rounded appealing silhouette',
      blurb: 'It has no face and will not explain itself. It heals you ' +
             'anyway, on a schedule, whether or not you asked.',
      base:   { hp: 96, atk: 14, mag: 22, def: 13, spd: 15, crit: 9, evade: 8 },
      growth: { hp: 19, atk: 2.0, mag: 3.6, def: 1.9, spd: 1.3 },
      aura:   { mag: 2, hp: 4 },
      skills: [
        /* A party-wide heal is the strongest thing an Echo can do in a mode
           scored on attrition, so it is priced accordingly. */
        { name: 'Absolution', icon: 'regen', power: 0, scaling: 'mag',
          target: 'allAllies', element: 'light', weight: 2, heal: 15, cleanse: true },
        { name: 'Judgement', icon: 'nova', power: 21, scaling: 'mag',
          target: 'enemy', element: 'light', weight: 3, defPierce: 0.2 }
      ]
    },

    wardenling: {
      id: 'wardenling', name: 'Wardenling', from: 'wardenPrime',
      star: 5, role: 'striker', element: 'arcane',
      chroma: 'magenta',
      art: 'a small administrator construct in white and gold ceremonial armour, a ' +
           'mirrored faceplate reflecting nothing, short formal mantle, one small hand ' +
           'raised in judgement, stiff formal posture',
      blurb: 'The thing that sentenced you, reduced to something that fits ' +
             'in a shard. It still raises one hand before it strikes.',
      /* A legendary striker that lands below an epic warden is a broken
         promise — rarity has to track how much the thing changes a run. */
      /* Pure damage converts to Breach depth far worse than mitigation or
         healing does, so a striker needs bigger raw numbers to land in the
         same place. At atk 4.1 this legendary sat below an epic warden. */
      base:   { hp: 112, atk: 25, mag: 22, def: 16, spd: 16, crit: 15, evade: 5 },
      growth: { hp: 24, atk: 4.6, mag: 3.6, def: 2.4, spd: 1.2 },
      aura:   { atk: 4, mag: 4 },
      skills: [
        /* Lifesteal rather than more damage. A striker's problem in Breach is
           not that it hits softly, it is that dealing damage does nothing to
           keep the run alive — so the sustain is what makes the numbers
           convert into depth, and "the Warden takes what it judges" is a
           better reason for it than a bigger number would have been. */
        { name: 'Sanction', icon: 'hammer', power: 27, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 3, defPierce: 0.3, lifesteal: 0.35 },
        { name: 'Purge', icon: 'nova', power: 20, scaling: 'mag',
          target: 'allEnemies', element: 'arcane', weight: 2 }
      ]
    },

    /* ============================================================
       The second-act catches (chapters 7-10).

       The Breach now runs past wave 15 into the staging bestiary,
       so these exist for the same reason the first thirteen do:
       an enemy the player meets and cannot ever bind reads as an
       oversight, and tools/qa-echoes.mjs treats it as one.

       The four late bosses deliberately have no Echo. Continuity
       Warden, Prior Build, the Architect and the Core are story
       fights that never appear in a Breach pool, and a pet version
       of the thing the whole plot is about would cheapen it.
       ============================================================ */

    greyling: {
      id: 'greyling', name: 'Greyling', from: 'greyboxWalker',
      star: 3, role: 'guard', element: 'physical',
      chroma: 'magenta',
      art: 'a small squat companion creature built from flat untextured grey development ' +
           'blocks, plain matte grey slabs with visible seams, a checkerboard placeholder ' +
           'square where its face would be, stubby limbs, rounded blocky silhouette',
      blurb: 'Nobody ever finished it. It does not appear to have noticed, ' +
             'and it has been extremely helpful ever since.',
      base:   { hp: 92, atk: 11, mag: 5, def: 15, spd: 8, crit: 3, evade: 2 },
      growth: { hp: 17, atk: 1.5, mag: 0.5, def: 2.0, spd: 0.7 },
      aura:   { def: 2 },
      skills: [
        { name: 'Blunt Instance', icon: 'fist', power: 13, scaling: 'atk',
          target: 'enemy', element: 'physical', weight: 3 },
        { name: 'Placeholder', icon: 'guard', power: 0, scaling: 'def',
          target: 'self', element: 'none', weight: 1,
          selfBuff: { def: 10, turns: 2 } }
      ]
    },

    strayling: {
      id: 'strayling', name: 'Strayling', from: 'strayInstance',
      star: 4, role: 'striker', element: 'arcane',
      chroma: 'green',
      art: 'a small translucent companion creature of pale blue light with a soft glowing ' +
           'outline and no interior detail, trailing two faint duplicate afterimages of ' +
           'itself half a step behind, rounded friendly silhouette, drifting just above the ground',
      blurb: 'It has been repeating the same four seconds for four years. ' +
             'It seems glad of the change.',
      base:   { hp: 58, atk: 13, mag: 16, def: 6, spd: 21, crit: 15, evade: 17 },
      growth: { hp: 11, atk: 2.2, mag: 2.6, def: 0.9, spd: 1.8 },
      aura:   { spd: 2 },
      skills: [
        { name: 'Repeat Action', icon: 'link', power: 11, scaling: 'mag',
          target: 'enemy', element: 'arcane', weight: 3, hits: 2 },
        { name: 'Desync', icon: 'stun', power: 9, scaling: 'mag',
          target: 'enemy', element: 'arcane', weight: 2,
          status: { type: 'slow', chance: 0.5, turns: 2 } }
      ]
    },

    iterling: {
      id: 'iterling', name: 'Iterling', from: 'iterationEcho',
      star: 4, role: 'striker', element: 'arcane',
      chroma: 'green',
      /* Was "a small companion creature ... rounded face" and the model heard
         "mascot": it returned a cute purple cartoon cat with a number on its
         belly and no blades at all. "Creature" plus "rounded" is a request
         for a Pokemon. It is a miniature of the Iteration Echo — a small
         duellist, a person-shape — so it is described as one, and the animal
         reading is refused outright. */
      /* Third attempt, and the first two both came back as a purple cartoon
         cat — the second one wearing armour, because flux-1-schnell has no
         negative prompt and reads "no cat features, no ears, no tail" as
         three more mentions of cats. Negation does not subtract here, it
         emphasises. So every negative is gone and the description is purely
         what the thing IS: the same armoured duellist as its parent enemy,
         built at half height. The words creature, companion, small and
         rounded are all avoided too — those are what asked for a mascot in
         the first place. */
      art: 'a short slender armoured swordsman standing in a fighting stance, ' +
           'human proportions with a narrow waist and long legs, dark desaturated ' +
           'violet plate armour with visible panel seams, a full helmet with a smooth ' +
           'blank faceplate and no features, a dull gold number stencilled on the ' +
           'breastplate, one thin straight sword held low in the right hand, ' +
           'muted palette, clean anime line art, soft cel shading, ' +
           'grim and quietly unsettling',
      blurb: 'A draft of something. It will not say which attempt it came ' +
             'from and gets visibly uncomfortable when asked.',
      base:   { hp: 66, atk: 15, mag: 13, def: 9, spd: 17, crit: 18, evade: 11 },
      growth: { hp: 12, atk: 2.7, mag: 2.0, def: 1.2, spd: 1.5 },
      aura:   { crit: 3 },
      skills: [
        { name: 'Same Opening', icon: 'slash', power: 14, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 3, critBonus: 12 },
        { name: 'Known Answer', icon: 'mark', power: 7, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 2,
          status: { type: 'mark', chance: 1, turns: 3, power: 0.25 } }
      ]
    },

    scribeling: {
      id: 'scribeling', name: 'Scribeling', from: 'archivistShell',
      star: 4, role: 'guard', element: 'light',
      chroma: 'magenta',
      art: 'a small hunched robed companion creature of pale bone-white ceramic with no face, ' +
           'carrying an open ledger of glowing amber pages almost too big for it, ' +
           'thin gold filaments trailing from its shoulders, rounded appealing silhouette',
      blurb: 'It writes down everything you do. You have read some of it. ' +
             'It is kinder about you than you are.',
      base:   { hp: 100, atk: 10, mag: 14, def: 17, spd: 9, crit: 4, evade: 3 },
      growth: { hp: 18, atk: 1.4, mag: 2.1, def: 2.1, spd: 0.8 },
      aura:   { def: 2 },
      skills: [
        { name: 'File Away', icon: 'trap', power: 12, scaling: 'mag',
          target: 'enemy', element: 'light', weight: 3,
          status: { type: 'stun', chance: 0.22, turns: 1 } },
        { name: 'Seal Record', icon: 'barrier', power: 0, scaling: 'def',
          target: 'self', element: 'none', weight: 1,
          selfBuff: { def: 12, turns: 2 } }
      ]
    },

    coreling: {
      id: 'coreling', name: 'Coreling', from: 'coreAspect',
      star: 5, role: 'striker', element: 'storm',
      chroma: 'orange',
      art: 'a small floating shard of solid opaque white stone with hard-cut facets, ' +
           'held inside two small dark gunmetal rings with visible bolts, ' +
           'a thin slot of cyan light glowing between them, ' +
           'compact rounded silhouette, matte solid surfaces',
      blurb: 'A piece of the thing eleven people could not finish. ' +
             'It hums when it is pleased, which is most of the time.',
      base:   { hp: 74, atk: 15, mag: 21, def: 9, spd: 22, crit: 17, evade: 12 },
      growth: { hp: 13, atk: 2.4, mag: 3.1, def: 1.2, spd: 1.7 },
      aura:   { spd: 2, crit: 2 },
      skills: [
        { name: 'Impulse', icon: 'bolt', power: 17, scaling: 'mag',
          target: 'enemy', element: 'storm', weight: 3, hits: 2, lifesteal: 0.25 },
        { name: 'Cascade', icon: 'nova', power: 16, scaling: 'mag',
          target: 'allEnemies', element: 'storm', weight: 2 }
      ]
    },

    /* ================================================================
       THE DEEP INDEX

       Six Echoes that are not bound from anything you fight. They are
       what the archive is made OF: drafts, cached copies, versions that
       were never shipped. Nothing in the world drops them, which is why
       they exist as their own banner rather than being folded into the
       main pool.

       They also carry the art guide's rarity progression (§9) rather
       than all being cute: the three-stars are odd but approachable, the
       four-stars are wrong in a way you notice, and the five-stars use
       the `echoDeep` framing and are meant to be unsettling to look at.
       `artKind` is what selects that framing.
       ================================================================ */

    stubling: {
      id: 'stubling', name: 'Stubling', deep: true,
      star: 3, role: 'guard', element: 'physical',
      chroma: 'magenta',
      art: 'a small four-legged creature that is only half finished, ' +
           'the front half fully rendered in soft grey-green plating, ' +
           'the back half plain untextured flat grey with visible flat polygon edges, ' +
           'two calm dark dot eyes, standing patiently',
      blurb: 'Nobody ever came back to finish it. It does not appear to ' +
             'mind, and follows you at exactly the speed you walk.',
      base:   { hp: 92, atk: 8,  mag: 5,  def: 14, spd: 7,  crit: 3, evade: 2 },
      growth: { hp: 17, atk: 1.5, mag: 0.9, def: 2.0, spd: 0.7 },
      aura:   { def: 2 },
      skills: [
        { name: 'Placeholder', icon: 'barrier', power: 0, scaling: 'def',
          target: 'self', element: 'none', weight: 2,
          selfBuff: { def: 14, turns: 2 } },
        { name: 'Blunt Pass', icon: 'hammer', power: 10, scaling: 'atk',
          target: 'enemy', element: 'physical', weight: 3 }
      ]
    },

    cacheling: {
      id: 'cacheling', name: 'Cacheling', deep: true,
      star: 3, role: 'seer', element: 'arcane',
      chroma: 'orange',
      art: 'a small rounded creature of dull slate-blue plating with a wide flat head, ' +
           'a single horizontal band of pale cyan light across the face where eyes ' +
           'would be, short stubby limbs, a faint grid pattern etched into its back',
      blurb: 'It remembers three things that have already been deleted and ' +
             'will show you all of them, repeatedly, unprompted.',
      base:   { hp: 60, atk: 7,  mag: 13, def: 7, spd: 14, crit: 6, evade: 7 },
      growth: { hp: 12, atk: 1.2, mag: 2.3, def: 1.1, spd: 1.3 },
      aura:   { mag: 2 },
      skills: [
        { name: 'Recall', icon: 'mark', power: 9, scaling: 'mag',
          target: 'enemy', element: 'arcane', weight: 3,
          status: { type: 'mark', chance: 0.7, turns: 2, power: 0.22 } },
        { name: 'Stale Read', icon: 'drain', power: 12, scaling: 'mag',
          target: 'enemy', element: 'arcane', weight: 2, lifesteal: 0.3 }
      ]
    },

    draftling: {
      id: 'draftling', name: 'Draftling', deep: true,
      star: 4, role: 'striker', element: 'arcane',
      /* Green left a pool of residue under it: the model drew a cast shadow
         on the backdrop, and a shadow made of the key colour is exactly what
         the key cannot tell from backdrop. Orange sits opposite violet and
         the ground contact is now described as absent rather than left to
         the model's instincts. */
      chroma: 'orange',
      /* No-shadow has to come FIRST. Buried at the end of a long prompt it
         was either ignored or truncated, and the model painted a maroon
         ellipse under the feet — a shadow that is not the key colour, so
         the cutout keeps it and the sprite ships with a blob attached. */
      art: 'floating in empty space with no ground and no shadow, ' +
           'a lean quadruped creature of translucent violet drawn as clean pale ' +
           'line work, the interior never coloured in, ' +
           'one solid faceted shoulder plate, long thin legs, head lowered',
      blurb: 'A sketch of something that was going to be dangerous. The ' +
             'sketch is dangerous enough.',
      base:   { hp: 70, atk: 17, mag: 11, def: 8, spd: 19, crit: 16, evade: 12 },
      growth: { hp: 13, atk: 2.9, mag: 1.7, def: 1.2, spd: 1.6 },
      aura:   { atk: 2, crit: 2 },
      skills: [
        { name: 'Rough Cut', icon: 'slash', power: 14, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 3, hits: 2 },
        { name: 'Unfinished', icon: 'thrust', power: 18, scaling: 'atk',
          target: 'enemy', element: 'arcane', weight: 2, defPierce: 0.25 }
      ]
    },

    patchling: {
      id: 'patchling', name: 'Patchling', deep: true,
      star: 4, role: 'warden', element: 'light',
      /* This one defeated three of the four chromas, which is the same
         corner Matikanetannhauser painted us into and has the same answer.
         Magenta: bone-white plating sits next to it, so the anti-aliased
         seams picked up a pink fringe and the key perforated every one of
         them. Green: bronze and tan are olive-adjacent and it came back 15%
         tinted. Orange would be worse still, since bronze IS orange. The
         palette is warm end to end and has no blue anywhere in it, so blue
         is the only key that is far from all of it. */
      chroma: 'blue',
      /* "three slightly different versions of itself standing in the same
         place" produced three separate animals side by side — a litter, not
         an Echo. The model counts nouns; it does not do conceptual overlay.
         Described now as ONE body with doubled edges, which is the same idea
         expressed as a drawing instruction instead of a concept. */
      /* Third attempt, and the lesson is to stop describing the CONCEPT.
         "Three versions of itself" drew three animals; "ghosted duplicate
         outline, fading" drew a white halo; "hard-edged duplicate outline
         like a misprint" drew speckled erosion that reads as damaged art.
         The model cannot render an abstract idea about versioning — it can
         only render surfaces. So the idea of three unmerged revisions is
         now expressed as something physically drawable: mismatched armour
         panels in three shades that do not line up. Same meaning, and it
         renders clean every time. */
      art: 'floating in empty space with no ground and no shadow, ' +
           'one small sturdy four-legged creature, exactly one animal, ' +
           'its body plated in mismatched armour panels of three different ' +
           'shades of bronze and bone-white, the panel edges not lining up, ' +
           'clear visible seams between panels, a seam of cyan light along ' +
           'one mismatch, smooth clean silhouette',
      blurb: 'Three revisions that were never merged. They disagree about ' +
             'small things and have learned to work around it.',
      base:   { hp: 108, atk: 11, mag: 12, def: 19, spd: 8, crit: 4, evade: 3 },
      growth: { hp: 19, atk: 1.7, mag: 1.9, def: 2.3, spd: 0.8 },
      aura:   { hp: 8, def: 2 },
      skills: [
        { name: 'Merge Conflict', icon: 'quake', power: 12, scaling: 'mag',
          target: 'allEnemies', element: 'light', weight: 2,
          status: { type: 'slow', chance: 0.4, turns: 2 } },
        { name: 'Roll Forward', icon: 'regen', power: 0, scaling: 'def',
          target: 'self', element: 'none', weight: 2, selfHeal: 22 }
      ]
    },

    authorling: {
      id: 'authorling', name: 'Authorling', deep: true, artKind: 'echoDeep',
      star: 5, role: 'seer', element: 'light',
      chroma: 'blue',
      art: 'a small robed figure barely knee high, face entirely hidden inside a ' +
           'deep hood, dust-coloured layered cloth, one pale hand holding a stylus ' +
           'far too large for it, a narrow seam of cyan light down the front of the ' +
           'robe, standing completely still',
      blurb: 'One of the eleven, or a copy of one, scaled down to something ' +
             'portable. It writes down everything you do and never shows you.',
      base:   { hp: 82, atk: 11, mag: 24, def: 12, spd: 17, crit: 11, evade: 8 },
      growth: { hp: 14, atk: 1.6, mag: 3.4, def: 1.6, spd: 1.4 },
      aura:   { mag: 4, mp: 6 },
      skills: [
        { name: 'Revise', icon: 'nova', power: 18, scaling: 'mag',
          target: 'allEnemies', element: 'light', weight: 3, defPierce: 0.2 },
        { name: 'Footnote', icon: 'trap', power: 13, scaling: 'mag',
          target: 'enemy', element: 'light', weight: 2,
          status: { type: 'stun', chance: 0.3, turns: 1 } }
      ]
    },

    endling: {
      id: 'endling', name: 'Endling', deep: true, artKind: 'echoDeep',
      star: 5, role: 'striker', element: 'dark',
      /* First pass came back a thin grey humanoid — a generic alien — and the
         key ate 93% of the frame because there was barely a subject there to
         keep. Thin limbs and neutral grey are the two things a chroma key
         handles worst. Rebuilt with bulk and a stated dark colour so there is
         something solid to cut around, on magenta because charcoal is far
         from it in a way it is not far from green. */
      chroma: 'magenta',
      art: 'a stocky armoured creature standing upright on two thick legs, ' +
           'heavy matte charcoal-black plating, broad shoulders, barrel chest, ' +
           'a smooth blank faceplate with no features, one arm longer and ' +
           'heavier than the other, thick limbs, solid opaque silhouette',
      blurb: 'The last instance of something that was removed in a patch. It ' +
             'is not angry about it. It simply has nowhere else to be.',
      base:   { hp: 78, atk: 25, mag: 13, def: 10, spd: 21, crit: 20, evade: 14 },
      growth: { hp: 13, atk: 3.6, mag: 1.8, def: 1.3, spd: 1.7 },
      aura:   { atk: 4, crit: 3 },
      skills: [
        { name: 'Deprecated', icon: 'thrust', power: 21, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 3, defPierce: 0.3 },
        { name: 'Last Of', icon: 'drain', power: 17, scaling: 'atk',
          target: 'enemy', element: 'dark', weight: 2, lifesteal: 0.35,
          critBonus: 12 }
      ]
    }
  };

  /* ------------------------------------------------------------
     Helpers
     ------------------------------------------------------------ */

  const ALL_IDS = Object.keys(ECHOES);

  function get(id) { return ECHOES[id] || null; }

  /** Tier record for a star value, or for an Echo definition. */
  function rarity(star) { return STARS[star] || STARS[3]; }

  /** Which Echo, if any, a given enemy can be bound into. */
  const BY_ENEMY = ALL_IDS.reduce((map, id) => {
    /* 5★ banner exclusives have no `from` and must never appear here, or
       they would become catchable and stop being the prize. */
    if (ECHOES[id].from) map[ECHOES[id].from] = id;
    return map;
  }, {});

  function fromEnemy(enemyId) { return BY_ENEMY[enemyId] || null; }

  /** Summon-only Echoes — no source enemy in the world. */
  function isExclusive(id) { return !!ECHOES[id] && !ECHOES[id].from; }

  /**
   * Effective stats for an owned Echo.
   *
   * @param {object} owned      { id, bond }
   * @param {number} partyLevel average party level — Echoes ride along with
   *                            it so an early catch stays usable
   */
  function stats(owned, partyLevel) {
    const def = ECHOES[owned.id];
    if (!def) return null;
    const r = rarity(def.star);
    const bond = Math.max(1, Math.min(BOND_MAX, owned.bond || 1));
    const lv = Math.max(1, partyLevel || 1);

    /* Bond is worth more than a level: it is the axis the player controls.
       An Echo lands around 45-60% of a party member's numbers, which is a
       real contribution without turning a trio into a walkover. */
    const g = def.growth;
    const scale = r.mult * (1 + (bond - 1) * 0.14);

    return {
      hp:    Math.round((def.base.hp  + g.hp  * (lv - 1)) * scale),
      mp:    0,
      atk:   Math.round((def.base.atk + g.atk * (lv - 1)) * scale),
      mag:   Math.round((def.base.mag + g.mag * (lv - 1)) * scale),
      def:   Math.round((def.base.def + g.def * (lv - 1)) * scale),
      spd:   Math.round((def.base.spd + g.spd * (lv - 1)) * scale),
      crit:  def.base.crit,
      evade: def.base.evade,
      critMult: 0, comboBonus: 0, hpRegen: 0, mpRegen: 0, thorns: 0
    };
  }

  /** The passive party bonus an equipped Echo contributes, scaled by bond. */
  function auraOf(owned) {
    const def = ECHOES[owned.id];
    if (!def || !def.aura) return {};
    const bond = Math.max(1, Math.min(BOND_MAX, owned.bond || 1));
    const out = {};
    for (const [k, v] of Object.entries(def.aura)) {
      out[k] = Math.round(v * (1 + (bond - 1) * 0.5));
    }
    return out;
  }

  /** Gacha table — every Echo, weighted by rarity. */
  function pullTable() {
    return ALL_IDS.map(id => ({ id, weight: rarity(ECHOES[id].star).pull }));
  }

  /* ------------------------------------------------------------
     Featured signal

     A banner needs something to be ABOUT. Without one the summon screen
     is a slot machine with a lore skin: nothing on it answers "what am I
     pulling for", which is the question the whole screen exists to make
     the player ask.

     The rotation is derived from the date rather than stored, so it needs
     no server, no live-ops and no save migration, and two players on the
     same day see the same signal. A fixed featured Echo would have been
     simpler, but then the banner never changes and "featured" stops
     meaning anything by the second session.

     Only the five-stars rotate. Featuring a common would be a banner
     nobody wants, and the rate-up below only touches WHICH five-star you
     get — never how often you get one — so the pity curve and the
     economy are untouched by design.
     ------------------------------------------------------------ */

  /* Only the open-index Echoes rotate as the featured signal — the deep
     ones have their own banner and are not obtainable on this one. */
  const FEATURED_POOL = ALL_IDS.filter(id => ECHOES[id].star === 5 && !ECHOES[id].deep);
  const ROTATE_HOURS = 24;

  /** Days since epoch — the rotation index. */
  function cycleIndex(now) {
    return Math.floor((now || Date.now()) / (ROTATE_HOURS * 3600 * 1000));
  }

  function featured(now) {
    return FEATURED_POOL[cycleIndex(now) % FEATURED_POOL.length];
  }

  /** Milliseconds until the signal rotates, for the banner countdown. */
  function featuredEndsIn(now) {
    const t = now || Date.now();
    const period = ROTATE_HOURS * 3600 * 1000;
    return period - (t % period);
  }

  /** Chance that a 5-star roll resolves to the featured Echo. */
  const FEATURED_RATE = 0.5;

  /* ------------------------------------------------------------
     Banners

     Two real pull tables, not two tabs over one. Cosmetic banner
     navigation would be four buttons pretending to be a decision, and a
     player who works out that every banner draws from the same pool has
     been lied to by the interface.

     They differ on the axis players actually care about — what is IN
     there and how long the guarantee takes — so choosing between them is
     a real decision:

       OPEN INDEX  large pool, a rotating featured five-star, standard
                   80-pull guarantee. The one you use to fill the roster.
       DEEP INDEX  six Echoes only, no featured, double the base
                   five-star rate and a guarantee at 60. Far more likely
                   to give you something you do not have, and far less
                   useful once you have all six.

     Pity is tracked PER BANNER (`pityKey`), which is the behaviour every
     gacha player expects and checks for. Sharing one counter would let a
     player build 79 pulls of pity on one banner and cash it in on the
     other, which is both exploitable and not what the screen implies.
     ------------------------------------------------------------ */

  const BANNERS = {
    signal: {
      id: 'signal',
      name: 'OPEN INDEX',
      tagline: 'Everything the archive will admit to holding.',
      pityKey: 'pity',
      hasFeatured: true,
      /* null pool = every non-deep Echo */
      pool: null,
      base5: 0.005,
      softAt: 65,
      pityAt: 80
    },
    deep: {
      id: 'deep',
      name: 'DEEP INDEX',
      tagline: 'Drafts, caches and versions that were never shipped. ' +
               'Nothing in the world drops these.',
      pityKey: 'pityDeep',
      hasFeatured: false,
      pool: ALL_IDS.filter(id => ECHOES[id].deep),
      base5: 0.010,
      softAt: 45,
      pityAt: 60
    }
  };

  const BANNER_IDS = Object.keys(BANNERS);

  function banner(id) { return BANNERS[id] || BANNERS.signal; }

  /** The ids a given banner can actually produce. */
  function poolFor(bannerId) {
    const b = banner(bannerId);
    return b.pool || ALL_IDS.filter(id => !ECHOES[id].deep);
  }

  return {
    ECHOES, STARS, ALL_IDS, BOND_MAX,
    get, rarity, fromEnemy, isExclusive, stats, auraOf, pullTable,
    featured, featuredEndsIn, FEATURED_POOL, FEATURED_RATE,
    BANNERS, BANNER_IDS, banner, poolFor
  };
})();
