/* ============================================================
   enemies.js — per-chapter enemy stat blocks (§5).

   At least one new type per chapter so battle-heavy pacing does
   not go stale. Each block carries its own art prompt so the
   generator can produce a matching sprite (see src/art/prompts.js).

   AI: `pattern` is a list of action weights the enemy picks from.
   `skills` are resolved by the battle system exactly like player
   skills, so enemies and players share one damage pipeline.
   ============================================================ */

window.NI = window.NI || {};

NI.enemies = (function () {

  const ENEMIES = {

    /* ---------------- Chapter 1 ---------------- */
    shardSlime: {
      id: 'shardSlime', name: 'Shard Slime', tier: 'trash', chapter: 1,
      hp: 75, atk: 11, def: 6, mag: 5, spd: 8, crit: 3, evade: 2, xp: 22,
      element: 'arcane',
      chroma: 'magenta',
      art: 'a small translucent crystalline slime creature made of pale ice-blue faceted glass ' +
           'shards, glowing softly from within, two simple dark eye-dots, wobbling gelatinous body, ' +
           'cute but hostile',
      skills: [
        { name: 'Splitting Blow', icon: 'slash', power: 11, scaling: 'atk', target: 'enemy', weight: 3 },
        { name: 'Shard Spray',   icon: 'ice',   power: 9,  scaling: 'mag', target: 'allEnemies', weight: 1 }
      ]
    },

    dataWisp: {
      id: 'dataWisp', name: 'Data Wisp', tier: 'trash', chapter: 1,
      hp: 60, atk: 9, def: 4, mag: 14, spd: 16, crit: 6, evade: 12, xp: 20,
      element: 'storm',
      /* Was magenta, and the model duly gave the "glowing" parts a magenta
         plume — 14% of the sprite came out pink. Chroma has to be far from
         what the subject is ALLOWED to be, not just far from its base colour. */
      chroma: 'orange',
      /* "not a humanoid figure, no arms, no legs" produced a humanoid with arms
         and legs — this model does not honour negations. Say what it IS. */
      /* Rebuilt around an opaque core for the same reason echo_wispling was:
         a subject that is nothing but glow gives the chroma key no edge to cut
         against, and the cutout took bites out of it. */
      art: 'a floating spirit with a solid opaque faceted crystal core of pale blue glass ' +
           'at its centre, wrapped in a tight halo of brilliant cyan light, ' +
           'short ribbons of glowing code fragments trailing behind it, entirely cyan and white',
      skills: [
        { name: 'Static Lash', icon: 'bolt', power: 12, scaling: 'mag', target: 'enemy', weight: 3 },
        { name: 'Scramble',    icon: 'stun', power: 6,  scaling: 'mag', target: 'enemy', weight: 1,
          status: { type: 'slow', chance: 0.5, turns: 2 } }
      ]
    },

    /* ---------------- Chapter 2 ---------------- */
    rustHound: {
      id: 'rustHound', name: 'Rust Hound', tier: 'trash', chapter: 2,
      hp: 115, atk: 16, def: 9, mag: 4, spd: 18, crit: 12, evade: 8, xp: 34,
      element: 'physical',
      chroma: 'green',
      art: 'a lean mechanical wolf built from rusted iron plates and exposed cabling, glowing molten ' +
           'orange eyes and jaw seams, hunched predatory stance, sparks at the joints',
      skills: [
        { name: 'Lunge',     icon: 'fist',  power: 15, scaling: 'atk', target: 'enemy', weight: 3 },
        { name: 'Rend',      icon: 'slash', power: 12, scaling: 'atk', target: 'enemy', weight: 2,
          status: { type: 'bleed', chance: 0.5, turns: 3, power: 4 } }
      ]
    },

    sentryDrone: {
      id: 'sentryDrone', name: 'Sentry Drone', tier: 'trash', chapter: 2,
      hp: 105, atk: 12, def: 14, mag: 12, spd: 11, crit: 5, evade: 4, xp: 32,
      element: 'storm',
      chroma: 'green',
      art: 'a hovering angular security drone of white and gunmetal panels, a single large glowing ' +
           'red lens eye, floating detached armour plates orbiting its core, thruster glow beneath',
      skills: [
        { name: 'Pulse Shot', icon: 'bolt',    power: 13, scaling: 'mag', target: 'enemy', weight: 3 },
        { name: 'Lockdown',   icon: 'barrier', power: 0,  scaling: 'def', target: 'self',  weight: 1,
          selfBuff: { def: 12, turns: 2 } }
      ]
    },

    glitchBoar: {
      id: 'glitchBoar', name: 'Glitch Boar', tier: 'elite', chapter: 2,
      hp: 200, atk: 20, def: 12, mag: 5, spd: 10, crit: 8, evade: 3, xp: 60,
      element: 'physical',
      chroma: 'green',
      art: 'a massive armoured boar with thick dark hide, enormous curved tusks glowing magenta, ' +
           'corrupted pixelated glitch artifacts tearing across its flank revealing white void ' +
           'beneath, lowered charging stance',
      skills: [
        { name: 'Gore',        icon: 'thrust', power: 19, scaling: 'atk', target: 'enemy', weight: 3 },
        { name: 'Trample',     icon: 'quake',  power: 14, scaling: 'atk', target: 'allEnemies', weight: 2 },
        { name: 'Corrupt Roar',icon: 'stun',   power: 8,  scaling: 'mag', target: 'allEnemies', weight: 1,
          status: { type: 'slow', chance: 0.6, turns: 2 } }
      ]
    },

    /* ---------------- Chapter 3 ---------------- */
    brambleWarden: {
      id: 'brambleWarden', name: 'Bramble Warden', tier: 'trash', chapter: 3,
      hp: 160, atk: 15, def: 18, mag: 10, spd: 8, crit: 4, evade: 2, xp: 46,
      element: 'nature',
      chroma: 'magenta',
      art: 'a tall humanoid guardian woven from thorned vines and dark bark, glowing green sap ' +
           'running through the seams like veins, no face, long clawed branch arms, moss and lichen',
      skills: [
        { name: 'Thorn Lash', icon: 'poison', power: 14, scaling: 'atk', target: 'enemy', weight: 3,
          status: { type: 'poison', chance: 0.45, turns: 3, power: 5 } },
        { name: 'Root Snare', icon: 'trap',   power: 9,  scaling: 'mag', target: 'enemy', weight: 2,
          status: { type: 'stun', chance: 0.35, turns: 1 } }
      ]
    },

    cinderMoth: {
      id: 'cinderMoth', name: 'Cinder Moth', tier: 'trash', chapter: 3,
      hp: 125, atk: 12, def: 8, mag: 20, spd: 20, crit: 10, evade: 18, xp: 44,
      element: 'fire',
      /* Was magenta, and the key ate the pale patches the model kept painting
         onto the wings — near-white is closer to magenta in RGB than to any
         other backdrop we use, so those markings sat inside the key's reach.
         Green is the farthest chroma from white, and the moth carries no
         green of its own. The prompt now also refuses the pale markings
         outright: the cheapest hole to cut is the one never generated. */
      chroma: 'green',
      art: 'a large moth with solid opaque charcoal-black body and solid opaque wing membranes ' +
           'patterned in deep orange and black only, a hard clean wing outline, ' +
           'no white markings, no cream patches, no pale spots, every marking fully saturated, ' +
           'glowing amber compound eyes, a thin line of live fire along the wing edges only',
      skills: [
        { name: 'Ember Dust', icon: 'flame', power: 15, scaling: 'mag', target: 'allEnemies', weight: 2,
          status: { type: 'burn', chance: 0.4, turns: 2, power: 4 } },
        { name: 'Searing Dive',icon: 'flame',power: 18, scaling: 'mag', target: 'enemy', weight: 3 }
      ]
    },

    hollowKnight: {
      id: 'hollowKnight', name: 'Hollow Knight', tier: 'elite', chapter: 3,
      hp: 290, atk: 23, def: 20, mag: 8, spd: 12, crit: 10, evade: 4, xp: 88,
      element: 'dark',
      chroma: 'green',
      art: 'an empty suit of ornate dark iron armour, violet light pouring out of the visor and ' +
           'every joint gap, tattered cape, gripping a heavy greatsword point-down, nobody inside',
      skills: [
        { name: 'Grave Cleave', icon: 'cleave', power: 18, scaling: 'atk', target: 'allEnemies', weight: 2 },
        { name: 'Void Thrust',  icon: 'thrust', power: 24, scaling: 'atk', target: 'enemy', weight: 3,
          defPierce: 0.3 },
        { name: 'Hollow Guard', icon: 'guard',  power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfBuff: { def: 16, turns: 2 } }
      ]
    },

    /* ---------------- Chapter 4 ---------------- */
    /* Chapters 4-5 were the difficulty wall: a Void Stalker pair out-sped the
       whole party, dodged a fifth of everything aimed at it and crit a fifth
       of what it threw, so the fight was decided before the player acted.
       Speed and evasion are the Stalker's identity and stay high — the crit
       rate and raw ATK are what made it unfair rather than fast. */
    voidStalker: {
      id: 'voidStalker', name: 'Void Stalker', tier: 'trash', chapter: 4,
      hp: 182, atk: 22, def: 12, mag: 13, spd: 23, crit: 17, evade: 18, xp: 70,
      element: 'dark',
      chroma: 'green',
      art: 'a sleek shadowy predator with unnaturally long limbs and a smooth featureless white ' +
           'mask, body made of coiling dark smoke, crouched ready to spring, claws of condensed ' +
           'shadow',
      skills: [
        { name: 'Shadowstep',  icon: 'haste',  power: 20, scaling: 'atk', target: 'enemy', weight: 3, critBonus: 20 },
        { name: 'Throat Rake', icon: 'slash',  power: 16, scaling: 'atk', target: 'enemy', weight: 2,
          status: { type: 'bleed', chance: 0.6, turns: 3, power: 6 } }
      ]
    },

    siegeGolem: {
      id: 'siegeGolem', name: 'Siege Golem', tier: 'elite', chapter: 4,
      hp: 395, atk: 24, def: 26, mag: 6, spd: 6, crit: 5, evade: 1, xp: 120,
      element: 'physical',
      chroma: 'magenta',
      art: 'a colossal war golem of dark stone slabs and riveted iron, glowing white rune seams ' +
           'across its chest and shoulders, enormous piston fists, heavy immovable stance',
      skills: [
        { name: 'Piledriver', icon: 'hammer', power: 28, scaling: 'atk', target: 'enemy', weight: 3 },
        { name: 'Seismic Slam',icon: 'quake', power: 20, scaling: 'atk', target: 'allEnemies', weight: 2,
          status: { type: 'stun', chance: 0.3, turns: 1 } },
        { name: 'Rune Harden', icon: 'barrier',power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfBuff: { def: 20, turns: 2 } }
      ]
    },

    echoDuelist: {
      id: 'echoDuelist', name: 'Echo Duelist', tier: 'elite', chapter: 4,
      hp: 295, atk: 23, def: 15, mag: 16, spd: 21, crit: 16, evade: 13, xp: 110,
      element: 'arcane',
      /* "Prismatic highlights" on a green backdrop produced a green knight,
         which then sat 29% inside the key's own tolerance — the one thing the
         per-asset chroma rule exists to prevent. */
      chroma: 'magenta',
      art: 'a humanoid swordsman formed entirely of fractured mirror glass in silver and cold white, ' +
           'polished chrome surfaces reflecting broken fragments of light, no colour tint, ' +
           'wielding twin thin blades, elegant duelling pose',
      skills: [
        { name: 'Mirror Cut',  icon: 'slash', power: 15, scaling: 'atk', target: 'enemy', weight: 3, hits: 2 },
        { name: 'Refraction',  icon: 'nova',  power: 17, scaling: 'mag', target: 'allEnemies', weight: 2 },
        { name: 'Afterimage',  icon: 'haste', power: 0,  scaling: 'atk', target: 'self', weight: 1,
          selfBuff: { evade: 25, spd: 5, turns: 2 } }
      ]
    },

    /* ---------------- Chapter 5 ---------------- */
    nullSeraph: {
      id: 'nullSeraph', name: 'Null Seraph', tier: 'elite', chapter: 5,
      hp: 340, atk: 25, def: 20, mag: 24, spd: 17, crit: 11, evade: 9, xp: 150,
      element: 'light',
      /* Prompt avoids "faceless humanoid figure" phrasing — content filters
         read that as an unclothed person and reject the whole request. */
      /* On magenta it drew the halo and wing-light in hot pink. The subject is
         white and gold, so green is the only chroma far from every part of it. */
      chroma: 'green',
      art: 'an angelic construct in polished white and pale gold plating, a smooth featureless mask, ' +
           'six geometric wings of hard luminous white and pale gold light arranged in rings, ' +
           'a thin gold halo, no pink, hovering serenely',
      skills: [
        { name: 'Judgement Ray', icon: 'nova',  power: 22, scaling: 'mag', target: 'enemy', weight: 3, defPierce: 0.22 },
        { name: 'Silent Chorus', icon: 'nova',  power: 18, scaling: 'mag', target: 'allEnemies', weight: 2 },
        { name: 'Erase',         icon: 'drain', power: 20, scaling: 'mag', target: 'enemy', weight: 1, lifesteal: 0.5 }
      ]
    },

    wardenPrime: {
      id: 'wardenPrime', name: 'Warden Prime', tier: 'boss', chapter: 5,
      /* Recompile at 40 HP/cast undid roughly a full party turn, so the fight
         did not shorten — it just got longer until someone lost. Cutting the
         heal is what makes the boss beatable; the stat trims are secondary. */
      /* Re-hardened once the Ranger stopped being unplayable. Warden Prime
         had been trimmed to compensate for a class that could not survive it;
         with that fixed at the source, every class cleared it 87-96% of the
         time and the final fight of the common route was no longer a fight.
         The difficulty belongs here, in the boss, not in a stat line that
         punished one class four times as hard as the others. */
      hp: 545, atk: 25, def: 24, mag: 22, spd: 16, crit: 11, evade: 5, xp: 400,
      element: 'arcane',
      chroma: 'magenta',
      art: 'a towering administrator construct in white and gold ceremonial armour, a mirrored ' +
           'faceplate reflecting nothing, ' +
           'long formal mantle, one hand raised in judgement, overwhelming presence',
      skills: [
        { name: 'Purge Protocol', icon: 'nova',   power: 22, scaling: 'mag', target: 'allEnemies', weight: 2 },
        { name: 'Sanction',       icon: 'hammer', power: 28, scaling: 'atk', target: 'enemy', weight: 3, defPierce: 0.28 },
        { name: 'Restraint Lock', icon: 'stun',   power: 12, scaling: 'mag', target: 'enemy', weight: 1,
          status: { type: 'stun', chance: 0.42, turns: 1 } },
        { name: 'Recompile',      icon: 'regen',  power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfHeal: 36 }
      ]
    },

    /* ---------------- Chapter 7 — the staging shore ----------------
       The second act's whole idea is that the world you escape into is the
       same world, unfinished. So its natives are not a new bestiary, they
       are things that were never given a final pass: assets without
       textures, and player-shaped instances left running by a test harness
       nobody ever shut down. */

    greyboxWalker: {
      id: 'greyboxWalker', name: 'Untextured', tier: 'trash', chapter: 7,
      hp: 375, atk: 41, def: 28, mag: 18, spd: 15, crit: 9, evade: 6, xp: 70,
      element: 'physical',
      chroma: 'magenta',
      art: 'a humanoid figure built entirely from flat untextured grey development blocks, ' +
           'plain matte grey geometric slabs with visible seams and a checkerboard placeholder ' +
           'pattern across the chest, blank grey head with no features, unfinished asset',
      skills: [
        { name: 'Blunt Instance', icon: 'fist',  power: 26, scaling: 'atk', target: 'enemy', weight: 3 },
        { name: 'Clipping',       icon: 'quake', power: 19, scaling: 'atk', target: 'allEnemies', weight: 2,
          defPierce: 0.35 }
      ]
    },

    strayInstance: {
      id: 'strayInstance', name: 'Stray Instance', tier: 'trash', chapter: 7,
      hp: 325, atk: 39, def: 23, mag: 42, spd: 26, crit: 14, evade: 16, xp: 70,
      element: 'arcane',
      /* Pale blue on green left almost nothing but a head — the key could not
         separate frosted pale blue from chroma green. echo_shardling already
         records the rule for this palette: a pale-blue-and-white subject has
         nowhere to hide from a near key and belongs on orange, its complement. */
      chroma: 'orange',
      art: 'a person-shaped figure of solid opaque pale blue frosted glass with a clean hard ' +
           'silhouette and no facial detail, a brighter cyan light glowing inside its chest, ' +
           'one faint duplicate afterimage close behind it, ' +
           'like a mannequin of a person rather than a person',
      skills: [
        { name: 'Repeat Action', icon: 'link',  power: 17, scaling: 'mag', target: 'enemy', weight: 3, hits: 2 },
        { name: 'Desync',        icon: 'stun',  power: 14, scaling: 'mag', target: 'enemy', weight: 2,
          status: { type: 'slow', chance: 0.6, turns: 2 } },
        { name: 'Fork',          icon: 'haste', power: 0,  scaling: 'mag', target: 'self', weight: 1,
          selfBuff: { evade: 22, spd: 6, turns: 2 } }
      ]
    },

    continuityWarden: {
      id: 'continuityWarden', name: 'Continuity Warden', tier: 'boss', chapter: 7,
      hp: 1330, atk: 44, def: 33, mag: 42, spd: 18, crit: 12, evade: 6, xp: 340,
      element: 'light',
      chroma: 'magenta',
      art: 'a tall angular custodian construct of brushed steel and pale green signal light, ' +
           'a ring of floating rectangular panels orbiting its shoulders displaying scrolling ' +
           'diagnostic glyphs, one broad flat visor of green light, arms held out in a levelling gesture',
      skills: [
        { name: 'Reconcile',   icon: 'nova',   power: 25, scaling: 'mag', target: 'allEnemies', weight: 2 },
        { name: 'Rollback',    icon: 'drain',  power: 27, scaling: 'mag', target: 'enemy', weight: 3, lifesteal: 0.4 },
        { name: 'Hold State',  icon: 'stun',   power: 15, scaling: 'mag', target: 'enemy', weight: 1,
          status: { type: 'stun', chance: 0.4, turns: 1 } },
        { name: 'Revert',      icon: 'regen',  power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfHeal: 52 }
      ]
    },

    /* ---------------- Chapter 8 — a hundred and eleven ----------------
       The chapter where the game admits it has been run before. Its enemies
       are previous attempts: builds of the party that got further than this
       one and were archived anyway. */

    iterationEcho: {
      id: 'iterationEcho', name: 'Iteration Echo', tier: 'elite', chapter: 8,
      hp: 460, atk: 42, def: 28, mag: 38, spd: 24, crit: 20, evade: 14, xp: 110,
      element: 'arcane',
      chroma: 'green',
      art: 'a humanoid duellist made of dark violet glass with a faint golden version number ' +
           'etched glowing across the chest plate, smooth featureless face like a blank mask, ' +
           'a long thin blade in each hand, poised mid-step',
      skills: [
        { name: 'Same Opening', icon: 'slash', power: 21, scaling: 'atk', target: 'enemy', weight: 3, hits: 2,
          critBonus: 15 },
        { name: 'Known Answer', icon: 'mark',  power: 16, scaling: 'atk', target: 'enemy', weight: 2,
          status: { type: 'mark', chance: 1, turns: 3, power: 0.35 } },
        { name: 'Prior Draft',  icon: 'nova',  power: 22, scaling: 'mag', target: 'allEnemies', weight: 2 }
      ]
    },

    priorBuild: {
      id: 'priorBuild', name: 'PRIOR BUILD', tier: 'boss', chapter: 8,
      hp: 1275, atk: 45, def: 33, mag: 41, spd: 22, crit: 18, evade: 9, xp: 450,
      element: 'dark',
      chroma: 'green',
      art: 'a tall armoured figure in cracked white and gold ceremonial plate identical to a hero ' +
           'but corroded and archived, a mirrored faceplate showing only static, one gauntlet ' +
           'holding a broken banner, violet archive light bleeding from every seam',
      skills: [
        { name: 'Everything You Tried', icon: 'cleave', power: 26, scaling: 'atk', target: 'allEnemies', weight: 2 },
        { name: 'Deprecate',            icon: 'thrust', power: 34, scaling: 'atk', target: 'enemy', weight: 3,
          defPierce: 0.32 },
        { name: 'Overwrite',            icon: 'drain',  power: 28, scaling: 'mag', target: 'enemy', weight: 2,
          lifesteal: 0.55 },
        { name: 'Restore Point',        icon: 'regen',  power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfHeal: 60 }
      ]
    },

    /* ---------------- Chapter 9 — the ones who stayed ---------------- */

    archivistShell: {
      id: 'archivistShell', name: 'Archivist Shell', tier: 'elite', chapter: 9,
      hp: 520, atk: 43, def: 35, mag: 37, spd: 14, crit: 10, evade: 4, xp: 125,
      element: 'light',
      chroma: 'magenta',
      art: 'a hunched robed custodian of pale bone-white ceramic plating with no face, ' +
           'carrying a heavy open ledger of glowing amber pages chained to its wrist, ' +
           'thin gold filaments trailing from its shoulders like cut strings',
      skills: [
        { name: 'File Away',   icon: 'trap',    power: 24, scaling: 'mag', target: 'enemy', weight: 3,
          status: { type: 'stun', chance: 0.35, turns: 1 } },
        { name: 'Redact',      icon: 'nova',    power: 23, scaling: 'mag', target: 'allEnemies', weight: 2 },
        { name: 'Seal Record', icon: 'barrier', power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfBuff: { def: 22, turns: 2 } }
      ]
    },

    architectProxy: {
      id: 'architectProxy', name: 'THE ARCHITECT', tier: 'boss', chapter: 9,
      hp: 1600, atk: 49, def: 36, mag: 47, spd: 20, crit: 15, evade: 7, xp: 600,
      element: 'arcane',
      /* Deliberately not monstrous. The chapter's whole argument is that the
         thing in the room is a committee of exhausted people who could not
         stop working, so the sprite has to read as sad rather than evil. */
      chroma: 'green',
      art: 'a towering figure assembled from dozens of overlapping translucent amber human ' +
           'silhouettes standing in the same place, layered like exposures of a crowd, ' +
           'a single calm lit face forming where they overlap, robes of soft gold light, ' +
           'weary rather than threatening',
      skills: [
        { name: 'Design Intent',  icon: 'nova',   power: 28, scaling: 'mag', target: 'allEnemies', weight: 2,
          defPierce: 0.25 },
        { name: 'Scope Creep',    icon: 'quake',  power: 24, scaling: 'mag', target: 'allEnemies', weight: 2,
          status: { type: 'slow', chance: 0.55, turns: 2 } },
        { name: 'Ship It',        icon: 'hammer', power: 38, scaling: 'atk', target: 'enemy', weight: 3,
          defPierce: 0.3 },
        { name: 'One More Pass',  icon: 'regen',  power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfHeal: 70 }
      ]
    },

    /* ---------------- Chapter 10 — Nova Impulse ---------------- */

    coreAspect: {
      id: 'coreAspect', name: 'Core Aspect', tier: 'elite', chapter: 10,
      hp: 590, atk: 48, def: 30, mag: 46, spd: 27, crit: 18, evade: 12, xp: 155,
      element: 'storm',
      /* Third chroma for this one, and the chroma was never the problem.
         Magenta bled 33% pink through the white and gold; green bled 7% and
         left 6% of the backdrop uncut. A subject made entirely of radiating
         light has no edge for a key to cut against, so every backdrop colour
         ends up inside the halo — which is exactly what echo_wispling took
         four rerolls to teach. The fix is the DESIGN, not the backdrop: give
         it opaque machinery to be made of and let the light sit inside that. */
      chroma: 'orange',
      art: 'a floating shard of solid opaque white stone with sharp hard-cut facets, ' +
           'clamped inside two heavy dark gunmetal rings with visible bolts and panel seams, ' +
           'a narrow slot of brilliant cyan light glowing between the rings, ' +
           'matte solid surfaces, no face, no limbs',
      skills: [
        { name: 'Impulse',    icon: 'bolt',  power: 26, scaling: 'mag', target: 'enemy', weight: 3, hits: 2 },
        { name: 'Cascade',    icon: 'nova',  power: 24, scaling: 'mag', target: 'allEnemies', weight: 2 },
        { name: 'Accelerate', icon: 'haste', power: 0,  scaling: 'mag', target: 'self', weight: 1,
          selfBuff: { spd: 8, evade: 14, turns: 2 } }
      ]
    },

    impulseCore: {
      id: 'impulseCore', name: 'NOVA IMPULSE', tier: 'boss', chapter: 10,
      hp: 1620, atk: 50, def: 36, mag: 48, spd: 23, crit: 16, evade: 6, xp: 900,
      element: 'light',
      chroma: 'orange',
      art: 'an enormous suspended engine, three concentric rings of heavy dark gunmetal ' +
           'plating with rivets, panel seams and solid opaque housings, a small blinding ' +
           'white star core held at the centre, thin streamers of cyan data falling from ' +
           'the underside, matte solid machinery, cathedral scale',
      skills: [
        { name: 'Full Release',  icon: 'nova',   power: 31, scaling: 'mag', target: 'allEnemies', weight: 3,
          defPierce: 0.3 },
        { name: 'Compile',       icon: 'hammer', power: 42, scaling: 'atk', target: 'enemy', weight: 3,
          defPierce: 0.35 },
        { name: 'Halt',          icon: 'stun',   power: 20, scaling: 'mag', target: 'enemy', weight: 1,
          status: { type: 'stun', chance: 0.45, turns: 1 } },
        { name: 'Iterate',       icon: 'regen',  power: 0,  scaling: 'def', target: 'self', weight: 1,
          selfHeal: 80 }
      ]
    }
  };

  /* ------------------------------------------------------------
     Encounter groups — what a given battle actually fields.
     ------------------------------------------------------------ */

  const ENCOUNTERS = {
    c1_first:    { name: 'Corrupted Fragment',  foes: ['shardSlime'] },
    c1_pair:     { name: 'Fragment Cluster',    foes: ['shardSlime', 'dataWisp'] },
    c1_wisps:    { name: 'Wisp Swarm',          foes: ['dataWisp', 'dataWisp'] },

    c2_hounds:   { name: 'Hound Pack',          foes: ['rustHound', 'rustHound'] },
    c2_patrol:   { name: 'Security Patrol',     foes: ['sentryDrone', 'rustHound'] },
    c2_drones:   { name: 'Drone Formation',     foes: ['sentryDrone', 'sentryDrone'] },
    c2_boar:     { name: 'Glitch Boar',         foes: ['glitchBoar'] },

    c3_wardens:  { name: 'Thorn Sentries',      foes: ['brambleWarden', 'brambleWarden'] },
    c3_moths:    { name: 'Ember Flight',        foes: ['cinderMoth', 'cinderMoth'] },
    c3_mixed:    { name: 'Overgrown Patrol',    foes: ['brambleWarden', 'cinderMoth'] },
    c3_hollow:   { name: 'Hollow Knight',       foes: ['hollowKnight'] },

    c4_stalkers: { name: 'Stalker Pair',        foes: ['voidStalker', 'voidStalker'] },
    c4_duelist:  { name: 'Echo Duelist',        foes: ['echoDuelist'] },
    c4_mixed:    { name: 'Breach Force',        foes: ['voidStalker', 'sentryDrone'] },
    c4_golem:    { name: 'Siege Golem',         foes: ['siegeGolem'] },

    c5_seraph:   { name: 'Null Seraph',         foes: ['nullSeraph'] },
    c5_escort:   { name: 'Seraph Escort',       foes: ['nullSeraph', 'voidStalker'] },
    c5_prime:    { name: 'WARDEN PRIME',        foes: ['wardenPrime'], boss: true },

    /* ---------------- Chapter 6+ ----------------
       The Breach does not spawn new species, it spawns MORE — that is the
       point of the second act, and it is why these are recombinations of
       enemies the player already knows rather than a fresh bestiary. A
       Hollow Knight standing beside a Null Seraph is a sentence about the
       world, and it costs no art. The scale field hardens them without
       inventing stat blocks nobody would recognise. */
    /* Scales were set when chapter 6 was a two-person party. It is three from
       here, which measured as a 98-100% clear across every class — the whole
       chapter was a victory lap. */
    c6_leak:     { name: 'Breach Leak',         foes: ['voidStalker', 'dataWisp'], scale: 1.5 },
    c6_choir:    { name: 'Broken Choir',        foes: ['nullSeraph', 'cinderMoth'], scale: 1.5 },
    c6_pair:     { name: 'Sealed Pair',         foes: ['hollowKnight', 'echoDuelist'], scale: 1.55 },
    c6_gate:     { name: 'THE GATE',            foes: ['siegeGolem', 'voidStalker'], scale: 1.75, boss: true },

    /* ---------------- Chapters 7-10 ----------------
       Every fight from here fields three party members, because the equipped
       Echo takes the field from chapter 6 on. A third body is roughly +50%
       actions before any stat is compared, so these are not chapter-6
       numbers with a multiplier — they are built for a bigger party and
       measured that way (tools/qa-balance.mjs --late). */

    c7_grey:     { name: 'Unfinished Ground',   foes: ['greyboxWalker', 'greyboxWalker'] },
    c7_stray:    { name: 'Stray Instances',     foes: ['strayInstance', 'strayInstance'] },
    c7_mixed:    { name: 'Test Harness',        foes: ['greyboxWalker', 'strayInstance'] },
    c7_warden:   { name: 'CONTINUITY WARDEN',   foes: ['continuityWarden'], boss: true },

    c8_echo:     { name: 'Iteration Echo',      foes: ['iterationEcho'] },
    c8_pair:     { name: 'Two Of You',          foes: ['iterationEcho', 'iterationEcho'] },
    c8_archive:  { name: 'Archived Attempt',    foes: ['iterationEcho', 'greyboxWalker'], scale: 1.1 },
    c8_prior:    { name: 'PRIOR BUILD',         foes: ['priorBuild'], boss: true },

    c9_shells:   { name: 'Archivist Shells',    foes: ['archivistShell', 'archivistShell'] },
    c9_guard:    { name: 'Core Guard',          foes: ['archivistShell', 'iterationEcho'], scale: 1.1 },
    c9_run:      { name: 'The Open Ground',     foes: ['coreAspect', 'strayInstance'], scale: 1.1 },
    c9_proxy:    { name: 'THE ARCHITECT',       foes: ['architectProxy'], boss: true },

    c10_aspects: { name: 'Core Aspects',        foes: ['coreAspect', 'coreAspect'] },
    c10_last:    { name: 'Last Iteration',      foes: ['priorBuild', 'coreAspect'], scale: 1.05 },
    c10_core:    { name: 'NOVA IMPULSE',        foes: ['impulseCore'], boss: true }
  };

  /* ------------------------------------------------------------
     Boss voices — how each one speaks, for the generated line it says when
     a fight opens. Kept as one table rather than a field on each definition
     because only bosses have one, and a `voice: undefined` on forty pieces
     of trash would be noise.

     These are personality notes, not scripts. The line itself is written at
     runtime against the player's class, level and how many times this boss
     has already killed them.
     ------------------------------------------------------------ */
  const VOICES = {
    siegeGolem:
      'Siege equipment running a demolition order. Speaks in clearance ' +
      'notices and structural assessments, and regards the player as debris ' +
      'occupying a site.',
    wardenPrime:
      'The system\'s enforcement layer. Calm, procedural, faintly apologetic ' +
      'in the way of something reading a policy it did not write. Uses ' +
      'account and compliance language for acts of violence.',
    continuityWarden:
      'A custodian obsessed with keeping the world consistent. Talks about ' +
      'the player as an inconsistency to be reconciled, and is genuinely ' +
      'puzzled that they object to being corrected.',
    priorBuild:
      'A previous version of the player that got further and was archived ' +
      'anyway. Speaks with the weary certainty of someone who already tried ' +
      'exactly what the player is about to try. Not cruel — finished.',
    architectProxy:
      'Eleven exhausted developers speaking at once, in the plural, ' +
      'apologising while continuing. Sad rather than threatening. Talks ' +
      'about scope, deadlines, and what was meant to happen.',
    impulseCore:
      'The engine of the world, which has never been spoken to before and ' +
      'is not sure it is being addressed. Enormous, slow, and curious. ' +
      'Speaks in the first person plural about processes, not people.'
  };

  function get(id) { return ENEMIES[id]; }
  function encounter(id) { return ENCOUNTERS[id]; }

  /** Personality note for a boss, or '' for anything that does not speak. */
  function voiceOf(id) { return VOICES[id] || ''; }

  /** Deep-ish copy so a battle instance can mutate freely. */
  function spawn(id) {
    const def = ENEMIES[id];
    if (!def) throw new Error('Unknown enemy: ' + id);
    return JSON.parse(JSON.stringify(def));
  }

  return { ENEMIES, ENCOUNTERS, get, encounter, spawn, voiceOf };
})();
