/* ============================================================
   classes.js — the four classes and their 5-tier skill trees (§3, §4).

   NODE SCHEMA
   -----------
   {
     id:    unique across the whole game
     name:  display name
     icon:  key into NI.icons
     type:  'active' | 'passive'
     desc:  player-facing text
     mods:  (passive) flat stat adds — { hp, mp, atk, mag, def, spd, crit, evade }
     skill: (active) battle skill definition, see below
     needs: (optional) node id that must be taken first — intra-tier prereq
   }

   SKILL SCHEMA
   ------------
   {
     mp:       mana cost
     power:    base power before stat scaling
     scaling:  'atk' | 'mag' | 'def'  — which stat multiplies it
     target:   'enemy' | 'allEnemies' | 'ally' | 'allAllies' | 'self'
     element:  flavour + resistance hook
     hits:     multi-hit count (default 1)
     combo:    damage multiplier when the partner already acted this turn (§5)
     status:   { type, chance, turns, power }
     heal / shield / cleanse / taunt / cooldown ... as needed
   }

   Tier gating: tier N unlocks at character level TIER_LEVEL[N]. Tiers 4-5
   are deliberately out of reach by Chapter 5 (§4) so there is real tree
   left for future chapters.
   ============================================================ */

window.NI = window.NI || {};

NI.classes = (function () {

  /* Character level required before a tier's nodes can be bought. */
  /* Gates are spread across the ten-chapter arc, not the first five.
     Chapters 1-5 land the party around level 9-10, which is tiers 1-3 fully
     in play and tier 4 visible but shut — the sealed upper tree is a plot
     point. Tier 4 sits at 11 rather than 10 specifically because a level-10
     finish is now common after the XP curve was softened, and letting tier 4
     crack open in the last fight of chapter 5 took boss clears to 99% (see
     tools/qa-balance.mjs). It opens in chapter 6, where the story unseals it. */
  const TIER_LEVEL = { 1: 1, 2: 3, 3: 5, 4: 11, 5: 16 };

  const CLASSES = {

    /* ============================================================
       MAGE — elemental burst, AoE, status pressure. Low HP.
       ============================================================ */
    mage: {
      id: 'mage',
      name: 'Mage',
      role: 'Elemental burst · AoE · status',
      color: '#7c6cff',
      accent: '#b3a6ff',
      icon: 'flame',
      blurb: 'Highest damage ceiling in the game and the lowest health pool. ' +
             'Mages end fights before fights end them.',
      /* Glass cannon, but it has to survive long enough to be a cannon.
         At the original 76/+6 a Mage died in ~4 turns to a 10-turn boss,
         making the class unviable in the fight it is meant to carry. */
      /* Easing chapters 4-5 lifted every other class's boss clear by 7-11
         points and left the Mage flat at 54%, because its losses are not to
         the boss's damage output — they are to dying before its own damage
         lands. Softening the boss further would have made the Tank trivial
         to fix a problem the Tank does not have. +6 base HP and +1 HP/level
         is worth about 14 HP by the final fight: one extra survived hit. */
      base:   { hp: 100, mp: 62, atk: 7,  mag: 22, def: 10, spd: 12, crit: 5,  evade: 4 },
      growth: { hp: 9,  mp: 7,  atk: 0.7, mag: 3.1, def: 1.1, spd: 1.0 },
      basic:  { name: 'Arcane Bolt', icon: 'bolt', power: 9, scaling: 'mag', element: 'arcane' },

      tiers: [
        { tier: 1, nodes: [
          { id: 'mg_ember', name: 'Ember', icon: 'flame', type: 'active',
            desc: 'Fire damage to one enemy. Good chance to inflict Burn.',
            skill: { mp: 7, power: 15, scaling: 'mag', target: 'enemy', element: 'fire',
                     combo: 1.25, status: { type: 'burn', chance: 0.55, turns: 3, power: 5 } } },
          { id: 'mg_frost', name: 'Frost Needle', icon: 'ice', type: 'active',
            desc: 'Ice damage to one enemy. May Slow, reducing their speed.',
            skill: { mp: 7, power: 13, scaling: 'mag', target: 'enemy', element: 'ice',
                     combo: 1.25, status: { type: 'slow', chance: 0.5, turns: 2 } } },
          { id: 'mg_mind', name: 'Focused Mind', icon: 'mp', type: 'passive',
            desc: '+14 Max MP, +2 MAG. The basics, held properly.',
            mods: { mp: 14, mag: 2 } }
        ]},

        { tier: 2, nodes: [
          { id: 'mg_scorch', name: 'Scorchline', icon: 'nova', type: 'active',
            desc: 'Fire damage to ALL enemies. The signature Mage answer to a crowd.',
            skill: { mp: 16, power: 13, scaling: 'mag', target: 'allEnemies', element: 'fire',
                     combo: 1.3, status: { type: 'burn', chance: 0.35, turns: 2, power: 4 } } },
          { id: 'mg_shatter', name: 'Shatterfrost', icon: 'ice', type: 'active',
            desc: 'Heavy ice damage. Deals +60% to targets already Slowed or Frozen.',
            skill: { mp: 14, power: 22, scaling: 'mag', target: 'enemy', element: 'ice',
                     combo: 1.3, bonusVs: { status: ['slow', 'freeze'], mult: 1.6 },
                     status: { type: 'freeze', chance: 0.3, turns: 1 } } },
          { id: 'mg_font', name: 'Manafont', icon: 'mp', type: 'passive',
            desc: '+18 Max MP. Restore 4 MP at the start of each turn.',
            mods: { mp: 18, mpRegen: 4 } },
          { id: 'mg_wards', name: 'Woven Wards', icon: 'barrier', type: 'passive',
            desc: '+10 Max HP, +4 DEF. Mages who survive tier 2 tend to survive tier 5.',
            mods: { hp: 10, def: 4 } }
        ]},

        { tier: 3, nodes: [
          { id: 'mg_chain', name: 'Chain Lightning', icon: 'bolt', type: 'active',
            desc: 'Three arcing hits split across the enemy side.',
            skill: { mp: 20, power: 11, scaling: 'mag', target: 'allEnemies', element: 'storm',
                     hits: 3, combo: 1.35 } },
          { id: 'mg_drain', name: 'Siphon', icon: 'drain', type: 'active',
            desc: 'Dark damage that heals you for 60% of the damage dealt.',
            skill: { mp: 15, power: 19, scaling: 'mag', target: 'enemy', element: 'dark',
                     combo: 1.3, lifesteal: 0.6 } },
          { id: 'mg_overload', name: 'Overload', icon: 'crit', type: 'passive',
            desc: '+5 MAG, +8% critical chance. Spells crit for 1.9x instead of 1.6x.',
            mods: { mag: 5, crit: 8, critMult: 0.3 } },
          { id: 'mg_conduit', name: 'Conduit', icon: 'link', type: 'passive',
            desc: 'Combo bonus on your skills increased by +15%. Fight beside your partner.',
            mods: { comboBonus: 0.15 } }
        ]},

        { tier: 4, nodes: [
          { id: 'mg_meteor', name: 'Meteor', icon: 'quake', type: 'active',
            desc: 'Enormous fire damage to all enemies. Two-turn cooldown.',
            skill: { mp: 30, power: 26, scaling: 'mag', target: 'allEnemies', element: 'fire',
                     combo: 1.4, cooldown: 2, status: { type: 'burn', chance: 0.6, turns: 3, power: 6 } } },
          { id: 'mg_zero', name: 'Absolute Zero', icon: 'ice', type: 'active',
            desc: 'Freezes a single target outright and deals heavy ice damage.',
            skill: { mp: 26, power: 30, scaling: 'mag', target: 'enemy', element: 'ice',
                     combo: 1.35, cooldown: 2, status: { type: 'freeze', chance: 0.85, turns: 2 } } },
          { id: 'mg_arcanum', name: 'Arcanum', icon: 'nova', type: 'passive',
            desc: '+8 MAG, +20 Max MP. The point where theory becomes weather.',
            mods: { mag: 8, mp: 20 } }
        ]},

        { tier: 5, nodes: [
          { id: 'mg_ruin', name: 'Ruin', icon: 'nova', type: 'active',
            desc: 'Single-target annihilation. Ignores 40% of the target\'s defence.',
            skill: { mp: 38, power: 44, scaling: 'mag', target: 'enemy', element: 'arcane',
                     combo: 1.5, cooldown: 3, defPierce: 0.4 } },
          { id: 'mg_eclipse', name: 'Eclipse', icon: 'drain', type: 'active',
            desc: 'Dark AoE that drains life from every enemy it touches.',
            skill: { mp: 36, power: 24, scaling: 'mag', target: 'allEnemies', element: 'dark',
                     combo: 1.45, cooldown: 3, lifesteal: 0.45 } },
          { id: 'mg_ascend', name: 'Ascendance', icon: 'up', type: 'passive',
            desc: '+12 MAG, +12% crit. There is not much left to teach you.',
            mods: { mag: 12, crit: 12 } }
        ]}
      ]
    },

    /* ============================================================
       RANGER — precision, crits, evasion, single-target deletion.
       ============================================================ */
    ranger: {
      id: 'ranger',
      name: 'Ranger',
      role: 'Precision · crit · evasion',
      color: '#3fd07a',
      accent: '#93e8b6',
      icon: 'arrow',
      blurb: 'Picks one target and removes it. Fragile in a brawl, ' +
             'untouchable if it keeps its distance.',
      base:   { hp: 92,  mp: 40, atk: 17, mag: 9,  def: 10, spd: 20, crit: 16, evade: 14 },
      /* Lowest HP pool in the game AND less ATK than the Fighter is not a
         trade-off, it is just being worse. Most of the correction is in
         evasion (see rg_step) because that is what the class is about; this
         is the small part of it that HP has to carry. */
      growth: { hp: 7.9, mp: 4,  atk: 2.4, mag: 0.8, def: 1.1, spd: 2.0 },
      basic:  { name: 'Quick Shot', icon: 'arrow', power: 10, scaling: 'atk', element: 'physical' },

      tiers: [
        { tier: 1, nodes: [
          { id: 'rg_aimed', name: 'Aimed Shot', icon: 'snipe', type: 'active',
            desc: 'A deliberate shot with +25% critical chance.',
            skill: { mp: 6, power: 17, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.25, critBonus: 25 } },
          { id: 'rg_twin', name: 'Twin Loose', icon: 'multishot', type: 'active',
            desc: 'Two quick arrows at one target. Each can crit independently.',
            skill: { mp: 8, power: 9, scaling: 'atk', target: 'enemy', element: 'physical',
                     hits: 2, combo: 1.2 } },
          /* Evasion is the Ranger's entire defensive budget — neither crit nor
             evade grows with level, so whatever the nodes give is what the
             class has for the whole game. At +6 it was paying for a health
             pool it didn't get. */
          { id: 'rg_step', name: 'Light Step', icon: 'haste', type: 'passive',
            desc: '+3 SPD, +10% evasion. Distance is a resource.',
            mods: { spd: 3, evade: 10 } }
        ]},

        { tier: 2, nodes: [
          { id: 'rg_volley', name: 'Volley', icon: 'multishot', type: 'active',
            desc: 'Arrows across the whole enemy side.',
            skill: { mp: 14, power: 12, scaling: 'atk', target: 'allEnemies', element: 'physical',
                     combo: 1.3 } },
          { id: 'rg_mark', name: 'Hunter\'s Mark', icon: 'mark', type: 'active',
            desc: 'Marks a target: everyone deals +30% damage to it for 3 turns.',
            skill: { mp: 10, power: 8, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.2, status: { type: 'mark', chance: 1, turns: 3, power: 0.3 } } },
          /* A 5-chapter run ends around level 7 with 7 skill points, which is
             exactly tiers 1-2 — tier 3 is barely reachable. Parking the only
             crit-DAMAGE node up at tier 3 meant the Ranger spent the entire
             game stacking crit chance that was worth 1.6x, same as everyone
             else's. The payoff has to exist inside the tiers people play. */
          { id: 'rg_keen', name: 'Keen Edge', icon: 'crit', type: 'passive',
            desc: '+10% critical chance, +20% critical damage, +2 ATK.',
            mods: { crit: 10, critMult: 0.20, atk: 2 } },
          { id: 'rg_snare', name: 'Snare Trap', icon: 'trap', type: 'active',
            desc: 'Damages and Slows a target, and can Stun outright.',
            skill: { mp: 12, power: 13, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.25, status: { type: 'slow', chance: 0.8, turns: 3 },
                     status2: { type: 'stun', chance: 0.25, turns: 1 } } }
        ]},

        { tier: 3, nodes: [
          { id: 'rg_pierce', name: 'Piercing Bolt', icon: 'pierce', type: 'active',
            desc: 'Ignores 45% of the target\'s defence. For things wearing walls.',
            skill: { mp: 14, power: 24, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.3, defPierce: 0.45 } },
          { id: 'rg_rain', name: 'Arrow Rain', icon: 'multishot', type: 'active',
            desc: 'Four arrows scattered across the enemy side.',
            skill: { mp: 20, power: 10, scaling: 'atk', target: 'allEnemies', element: 'physical',
                     hits: 4, combo: 1.35 } },
          /* The Ranger stacks crit CHANCE all the way up the tree and had no
             node anywhere that raised crit DAMAGE, so a 38% crit rate was
             worth less than the Fighter's flat ATK — it was the weakest class
             in the game by a wide margin (23% boss clear vs the Tank's 49%).
             Crit damage is where its identity actually lives. */
          { id: 'rg_predator', name: 'Predator', icon: 'crit', type: 'passive',
            desc: '+12% crit, +25% critical damage. Critical hits restore 5 MP.',
            mods: { crit: 12, critMult: 0.25, critMp: 5 } },
          { id: 'rg_tandem', name: 'Tandem Fire', icon: 'link', type: 'passive',
            desc: 'Combo bonus increased by +18%. Shoot on your partner\'s opening.',
            mods: { comboBonus: 0.18 } }
        ]},

        { tier: 4, nodes: [
          { id: 'rg_deadeye', name: 'Deadeye', icon: 'snipe', type: 'active',
            desc: 'Guaranteed critical hit. Two-turn cooldown.',
            skill: { mp: 24, power: 30, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.4, cooldown: 2, alwaysCrit: true } },
          { id: 'rg_phantom', name: 'Phantom Step', icon: 'haste', type: 'active',
            desc: 'Greatly raises your evasion and speed for 3 turns.',
            skill: { mp: 18, power: 0, scaling: 'atk', target: 'self', element: 'none',
                     cooldown: 3, selfBuff: { evade: 30, spd: 6, turns: 3 } } },
          { id: 'rg_apex', name: 'Apex Predator', icon: 'up', type: 'passive',
            desc: '+6 ATK, +4 SPD, +8% crit.',
            mods: { atk: 6, spd: 4, crit: 8 } }
        ]},

        { tier: 5, nodes: [
          { id: 'rg_worldend', name: 'World\'s End Shot', icon: 'snipe', type: 'active',
            desc: 'One arrow. Massive damage, guaranteed crit, pierces defence.',
            skill: { mp: 36, power: 46, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.5, cooldown: 3, alwaysCrit: true, defPierce: 0.35 } },
          { id: 'rg_storm', name: 'Stormfall', icon: 'multishot', type: 'active',
            desc: 'Six arrows across every enemy on the field.',
            skill: { mp: 34, power: 12, scaling: 'atk', target: 'allEnemies', element: 'physical',
                     hits: 6, combo: 1.45, cooldown: 3 } },
          { id: 'rg_unseen', name: 'Unseen', icon: 'up', type: 'passive',
            desc: '+20% evasion, +10 ATK. They stop being able to find you.',
            mods: { evade: 20, atk: 10 } }
        ]}
      ]
    },

    /* ============================================================
       FIGHTER — balanced melee, combo chains, self-sustain.
       ============================================================ */
    fighter: {
      id: 'fighter',
      name: 'Fighter',
      role: 'Melee all-rounder · combo chains',
      color: '#ff8a3d',
      accent: '#ffbb85',
      icon: 'sword',
      blurb: 'No single stat wins the fight. The chain does — every skill ' +
             'is built to follow another one.',
      base:   { hp: 110, mp: 42, atk: 18, mag: 8,  def: 13, spd: 15, crit: 10, evade: 7 },
      growth: { hp: 10,  mp: 4,  atk: 2.5, mag: 0.7, def: 1.6, spd: 1.4 },
      basic:  { name: 'Slash', icon: 'slash', power: 11, scaling: 'atk', element: 'physical' },

      tiers: [
        { tier: 1, nodes: [
          { id: 'ft_double', name: 'Double Strike', icon: 'slash', type: 'active',
            desc: 'Two fast cuts at one enemy.',
            skill: { mp: 6, power: 10, scaling: 'atk', target: 'enemy', element: 'physical',
                     hits: 2, combo: 1.3 } },
          { id: 'ft_guard', name: 'Guard Stance', icon: 'guard', type: 'active',
            desc: 'Raise your defence sharply for 2 turns and restore 6 MP.',
            skill: { mp: 0, power: 0, scaling: 'atk', target: 'self', element: 'none',
                     selfBuff: { def: 14, turns: 2 }, restoreMp: 6 } },
          { id: 'ft_grit', name: 'Grit', icon: 'hp', type: 'passive',
            desc: '+16 Max HP, +2 DEF.',
            mods: { hp: 16, def: 2 } }
        ]},

        { tier: 2, nodes: [
          { id: 'ft_rising', name: 'Rising Cut', icon: 'thrust', type: 'active',
            desc: 'Strong upward cut. Deals +50% if you acted after your partner.',
            skill: { mp: 10, power: 20, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.5 } },
          { id: 'ft_sweep', name: 'Sweeping Blow', icon: 'cleave', type: 'active',
            desc: 'Hits every enemy and can knock them off balance.',
            skill: { mp: 14, power: 13, scaling: 'atk', target: 'allEnemies', element: 'physical',
                     combo: 1.3, status: { type: 'slow', chance: 0.4, turns: 2 } } },
          { id: 'ft_second', name: 'Second Wind', icon: 'regen', type: 'passive',
            desc: 'Recover 6 HP at the start of each of your turns.',
            mods: { hpRegen: 6 } },
          { id: 'ft_momentum', name: 'Momentum', icon: 'haste', type: 'passive',
            desc: '+3 SPD, +3 ATK. Keep moving and it keeps working.',
            mods: { spd: 3, atk: 3 } }
        ]},

        { tier: 3, nodes: [
          { id: 'ft_chain', name: 'Chain Combo', icon: 'link', type: 'active',
            desc: 'Three strikes. Enormous combo scaling if your partner set it up.',
            skill: { mp: 18, power: 11, scaling: 'atk', target: 'enemy', element: 'physical',
                     hits: 3, combo: 1.6 } },
          { id: 'ft_break', name: 'Armor Break', icon: 'hammer', type: 'active',
            desc: 'Shatters defence — the target takes +35% damage for 3 turns.',
            skill: { mp: 14, power: 17, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.3, defPierce: 0.3,
                     status: { type: 'mark', chance: 1, turns: 3, power: 0.35 } } },
          { id: 'ft_ferocity', name: 'Ferocity', icon: 'crit', type: 'passive',
            desc: '+5 ATK, +8% crit.',
            mods: { atk: 5, crit: 8 } },
          { id: 'ft_bond', name: 'Battle Bond', icon: 'link', type: 'passive',
            desc: 'Combo bonus increased by +20%. The whole point of a party.',
            mods: { comboBonus: 0.2 } }
        ]},

        { tier: 4, nodes: [
          { id: 'ft_blade', name: 'Bladestorm', icon: 'cleave', type: 'active',
            desc: 'Five cuts scattered across every enemy. Two-turn cooldown.',
            skill: { mp: 26, power: 12, scaling: 'atk', target: 'allEnemies', element: 'physical',
                     hits: 5, combo: 1.45, cooldown: 2 } },
          { id: 'ft_execute', name: 'Execute', icon: 'thrust', type: 'active',
            desc: 'Deals double damage to enemies below 35% health.',
            skill: { mp: 22, power: 28, scaling: 'atk', target: 'enemy', element: 'physical',
                     combo: 1.4, cooldown: 2, executeBelow: 0.35, executeMult: 2 } },
          { id: 'ft_unbroken', name: 'Unbroken', icon: 'shield', type: 'passive',
            desc: '+30 Max HP, +6 DEF.',
            mods: { hp: 30, def: 6 } }
        ]},

        { tier: 5, nodes: [
          { id: 'ft_endless', name: 'Endless Edge', icon: 'link', type: 'active',
            desc: 'Eight strikes. The chain, finished.',
            skill: { mp: 38, power: 10, scaling: 'atk', target: 'enemy', element: 'physical',
                     hits: 8, combo: 1.6, cooldown: 3 } },
          { id: 'ft_worldbreak', name: 'Worldbreaker', icon: 'quake', type: 'active',
            desc: 'Devastates the enemy side and ignores half their defence.',
            skill: { mp: 36, power: 30, scaling: 'atk', target: 'allEnemies', element: 'physical',
                     combo: 1.5, cooldown: 3, defPierce: 0.5 } },
          { id: 'ft_ascend', name: 'Peerless', icon: 'up', type: 'passive',
            desc: '+12 ATK, +40 Max HP.',
            mods: { atk: 12, hp: 40 } }
        ]}
      ]
    },

    /* ============================================================
       TANK — aggro control, party protection, attrition.
       ============================================================ */
    tank: {
      id: 'tank',
      name: 'Tank',
      role: 'Aggro · protection · attrition',
      color: '#4aa8ff',
      accent: '#9ed0ff',
      icon: 'shield',
      blurb: 'Does not out-damage anything. Decides who the enemy is ' +
             'allowed to attack, which is usually better.',
      base:   { hp: 148, mp: 44, atk: 13, mag: 8,  def: 22, spd: 9,  crit: 5, evade: 3 },
      /* "Does not out-damage anything" has to be true in the numbers too. At
         +1.6 ATK/level the Tank cleared the boss 85% of the time — safest AND
         fast enough, which made it the correct pick rather than a trade. */
      growth: { hp: 14,  mp: 4,  atk: 1.25, mag: 0.6, def: 2.6, spd: 0.8 },
      basic:  { name: 'Shield Bash', icon: 'shield', power: 10, scaling: 'atk', element: 'physical' },

      tiers: [
        { tier: 1, nodes: [
          { id: 'tk_taunt', name: 'Taunt', icon: 'taunt', type: 'active',
            desc: 'Forces every enemy to target you for 2 turns.',
            skill: { mp: 6, power: 0, scaling: 'atk', target: 'allEnemies', element: 'none',
                     status: { type: 'taunt', chance: 1, turns: 2 },
                     selfBuff: { def: 8, turns: 2 } } },
          { id: 'tk_bash', name: 'Crushing Bash', icon: 'hammer', type: 'active',
            desc: 'Heavy blow that can stun. Scales off your DEFENCE, not attack.',
            skill: { mp: 8, power: 14, scaling: 'def', target: 'enemy', element: 'physical',
                     combo: 1.25, status: { type: 'stun', chance: 0.3, turns: 1 } } },
          { id: 'tk_bulwark', name: 'Bulwark', icon: 'shield', type: 'passive',
            desc: '+24 Max HP, +4 DEF.',
            mods: { hp: 24, def: 4 } }
        ]},

        { tier: 2, nodes: [
          { id: 'tk_cover', name: 'Cover', icon: 'guard', type: 'active',
            desc: 'Shields your partner: they take 50% less damage for 2 turns.',
            skill: { mp: 12, power: 0, scaling: 'def', target: 'ally', element: 'none',
                     allyBuff: { damageTaken: 0.5, turns: 2 } } },
          { id: 'tk_thorns', name: 'Iron Thorns', icon: 'barrier', type: 'passive',
            desc: 'Reflect 25% of melee damage taken back at the attacker.',
            mods: { thorns: 0.25 } },
          { id: 'tk_slam', name: 'Ground Slam', icon: 'quake', type: 'active',
            desc: 'Hits all enemies and slows them. Scales off DEFENCE.',
            skill: { mp: 14, power: 12, scaling: 'def', target: 'allEnemies', element: 'physical',
                     combo: 1.25, status: { type: 'slow', chance: 0.5, turns: 2 } } },
          { id: 'tk_resolve', name: 'Resolve', icon: 'regen', type: 'passive',
            desc: 'Recover 8 HP at the start of each of your turns.',
            mods: { hpRegen: 8 } }
        ]},

        { tier: 3, nodes: [
          { id: 'tk_fortress', name: 'Fortress', icon: 'barrier', type: 'active',
            desc: 'Halve all damage to the whole party for 2 turns.',
            skill: { mp: 20, power: 0, scaling: 'def', target: 'allAllies', element: 'none',
                     cooldown: 3, allyBuff: { damageTaken: 0.5, turns: 2 } } },
          { id: 'tk_retaliate', name: 'Retaliation', icon: 'fist', type: 'active',
            desc: 'Strike back hard — damage scales with the HP you have already lost.',
            skill: { mp: 16, power: 18, scaling: 'def', target: 'enemy', element: 'physical',
                     combo: 1.3, missingHpScale: 0.9 } },
          { id: 'tk_immovable', name: 'Immovable', icon: 'shield', type: 'passive',
            desc: '+40 Max HP, +8 DEF.',
            mods: { hp: 40, def: 8 } },
          { id: 'tk_vanguard', name: 'Vanguard', icon: 'link', type: 'passive',
            desc: 'Combo bonus +15%, and your partner gains +4 DEF while you live.',
            mods: { comboBonus: 0.15, allyDef: 4 } }
        ]},

        { tier: 4, nodes: [
          { id: 'tk_aegis', name: 'Aegis', icon: 'barrier', type: 'active',
            desc: 'Grants the party a shield that absorbs damage outright.',
            skill: { mp: 26, power: 0, scaling: 'def', target: 'allAllies', element: 'none',
                     cooldown: 3, shield: 2.2 } },
          { id: 'tk_earthshatter', name: 'Earthshatter', icon: 'quake', type: 'active',
            desc: 'Massive area damage with a high stun chance.',
            skill: { mp: 24, power: 20, scaling: 'def', target: 'allEnemies', element: 'physical',
                     combo: 1.35, cooldown: 2, status: { type: 'stun', chance: 0.45, turns: 1 } } },
          { id: 'tk_undying', name: 'Undying', icon: 'hp', type: 'passive',
            desc: '+60 Max HP, +10 DEF. Survive the first hit that should have ended it.',
            mods: { hp: 60, def: 10 } }
        ]},

        { tier: 5, nodes: [
          { id: 'tk_lastwall', name: 'The Last Wall', icon: 'shield', type: 'active',
            desc: 'The party cannot drop below 1 HP for 2 turns.',
            skill: { mp: 40, power: 0, scaling: 'def', target: 'allAllies', element: 'none',
                     cooldown: 4, guardian: 2 } },
          { id: 'tk_worldanchor', name: 'World Anchor', icon: 'quake', type: 'active',
            desc: 'Colossal area damage that ignores 40% of defence.',
            skill: { mp: 36, power: 30, scaling: 'def', target: 'allEnemies', element: 'physical',
                     combo: 1.45, cooldown: 3, defPierce: 0.4 } },
          { id: 'tk_titan', name: 'Titan', icon: 'up', type: 'passive',
            desc: '+90 Max HP, +14 DEF.',
            mods: { hp: 90, def: 14 } }
        ]}
      ]
    }
  };

  /* ------------------------------------------------------------
     Helpers
     ------------------------------------------------------------ */

  const ALL_IDS = Object.keys(CLASSES);

  function get(id) { return CLASSES[id]; }

  /** Flatten every node of a class into one array. */
  function allNodes(classId) {
    const c = CLASSES[classId];
    if (!c) return [];
    return c.tiers.reduce((acc, t) => acc.concat(t.nodes.map(n => ({ ...n, tier: t.tier }))), []);
  }

  function findNode(classId, nodeId) {
    return allNodes(classId).find(n => n.id === nodeId) || null;
  }

  /** Level at which a tier becomes purchasable. */
  function tierLevel(tier) { return TIER_LEVEL[tier] || 99; }

  /** Companion class is randomised (§3) — optionally excluding a class. */
  function randomClassId(exclude) {
    const pool = ALL_IDS.filter(id => id !== exclude);
    const list = pool.length ? pool : ALL_IDS;
    return list[Math.floor(Math.random() * list.length)];
  }

  return { CLASSES, ALL_IDS, TIER_LEVEL, get, allNodes, findNode, tierLevel, randomClassId };
})();
