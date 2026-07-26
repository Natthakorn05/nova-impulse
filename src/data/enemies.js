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
      art: 'a will-o-wisp: a single floating orb of brilliant cyan light with a white-hot core, ' +
           'trailing long ribbons of glowing code fragments and sparks behind it like a comet tail, ' +
           'formless drifting energy, entirely cyan and white',
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
      chroma: 'magenta',
      art: 'a large moth with burning ember wings trailing orange sparks and ash, charcoal black ' +
           'body, glowing amber compound eyes, wings edged in live fire',
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
      hp: 510, atk: 24, def: 23, mag: 22, spd: 16, crit: 11, evade: 5, xp: 400,
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
          selfHeal: 32 }
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
    c6_leak:     { name: 'Breach Leak',         foes: ['voidStalker', 'dataWisp'], scale: 1.15 },
    c6_choir:    { name: 'Broken Choir',        foes: ['nullSeraph', 'cinderMoth'], scale: 1.15 },
    c6_pair:     { name: 'Sealed Pair',         foes: ['hollowKnight', 'echoDuelist'], scale: 1.2 },
    c6_gate:     { name: 'THE GATE',            foes: ['siegeGolem', 'voidStalker'], scale: 1.3, boss: true }
  };

  function get(id) { return ENEMIES[id]; }
  function encounter(id) { return ENCOUNTERS[id]; }

  /** Deep-ish copy so a battle instance can mutate freely. */
  function spawn(id) {
    const def = ENEMIES[id];
    if (!def) throw new Error('Unknown enemy: ' + id);
    return JSON.parse(JSON.stringify(def));
  }

  return { ENEMIES, ENCOUNTERS, get, encounter, spawn };
})();
