/* ============================================================
   chapter2.js — "THE FIRST TOWN"

   Companion introduced properly on both paths, 4 encounters,
   the party's first real fight as a unit (§8).
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter2 = {
  id: 2,
  title: 'THE FIRST TOWN',
  subtitle: 'Forty thousand people, and every one of them wants to know the same thing.',
  start: 'c2_open',

  beats: {

    c2_open: {
      scene: 'scene_town',
      cast: [],
      title: 'Aldenmoor',
      text: `<p class="nar">Aldenmoor was built to be a tutorial town. White stone, teal roofs, a
             fountain, a notice board with three quests pinned to it about missing goats.</p>
             <p class="nar">It is currently holding nine thousand terrified people, and the goat
             quests are still pinned to the board, which somehow is the saddest thing in it.</p>`,
      next: 'c2_travel'
    },

    /* Pays off the Nexus choice. Every flag the story sets should be readable
       somewhere later, or the choice was decoration. */
    c2_travel: {
      branch: [
        { flag: 'c1_alone', goto: 'c2_travel_apart' },
        { flag: 'c1_together', goto: 'c2_travel_together' }
      ],
      fallback: 'c2_crowd'
    },

    c2_travel_together: {
      scene: 'scene_town',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Four days of walking has done something to the shape of them.
                 They no longer discuss which way to go; one of them drifts and the other
                 corrects, and the argument happens entirely in footsteps.</p>
                 <p>"You do the thing where you walk on the road side," Masha says, out of nowhere,
                 at the gate.</p>
                 <p>"I don't."</p>
                 <p>"You've done it for four days." She goes through the gate ahead of him,
                 entirely pleased with herself. "I'm just saying I noticed."</p>`,
        masha:  `<p class="nar">Four days in and they've stopped negotiating the route out loud.
                 Masha drifts, Kirito corrects, and neither of them mentions it.</p>
                 <p class="nar">She has also worked out that he always ends up between her and
                 the road, and that he will deny it if asked, so she saves it.</p>
                 <p>"What," he says.</p>
                 <p>"Nothing," says Masha, and goes through the gate first.</p>`
      },
      next: 'c2_crowd'
    },

    c2_travel_apart: {
      scene: 'scene_town',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Four days of walking eight steps apart. Not together, not
                 separately — a fixed distance, maintained with the precision of something
                 measured.</p>
                 <p class="nar">Kirito has had a great deal of time to consider that he could
                 close it at any point by saying one sentence, and has spent the entire four days
                 not selecting which sentence.</p>
                 <p>"Gate's open," Masha says, from eight steps ahead.</p>
                 <p>"I see it."</p>`,
        masha:  `<p class="nar">Four days at a fixed distance. Masha has counted it more than once
                 and it is always eight steps, which means one of them is maintaining it, and she
                 is fairly sure it isn't her.</p>
                 <p class="nar">She could close it. She has decided, with some heat, that she is
                 not going to be the one who closes it.</p>
                 <p>"Gate's open," she says.</p>
                 <p>"I see it," says Kirito, eight steps back.</p>`
      },
      next: 'c2_crowd'
    },

    c2_crowd: {
      scene: 'scene_town',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Masha is in the crowd within ninety seconds, and Kirito watches her
                 work with something close to admiration — she doesn't ask <em>what's happening.</em>
                 She asks small specific things. How long have you been here. Did anyone see the
                 gate close. Has anyone actually died.</p>
                 <p class="nar">She comes back with more in ten minutes than he got in a day.</p>
                 <p>"Two hundred dead," she says quietly. "Confirmed. HP to zero and they don't
                 come back. The respawn only catches you in the starter zones."</p>`,
        masha:  `<p class="nar">Masha asks eleven people small specific questions and assembles the
                 answer out of the overlap, because that is how you find out anything true in a
                 panicking crowd.</p>
                 <p class="nar">Kirito trails her the whole time, saying nothing, watching the exits.</p>
                 <p>"Two hundred dead," she tells him. "Confirmed. Zero HP is permanent. The respawn
                 only works in the starter zones — past the ridge, it stops."</p>
                 <p>"Then we don't go past the ridge until we're ready."</p>
                 <p>"No," she agrees. "We don't."</p>`
      },
      next: 'c2_choice_help'
    },

    c2_choice_help: {
      scene: 'scene_town',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: `<p class="nar">There is a group by the fountain — maybe thirty people, none of them
             past level two, arguing about whether to leave the walls at all. One of them is
             crying. Several of them keep looking at your gear.</p>`,
      choices: [
        { text: {
            kirito: '"We can take them out in groups. Teach them the field."',
            masha:  '"We teach them. Thirty people who can fight beats thirty who can\'t."'
          },
          trust: 2, tag: 'HELP', sets: 'c2_taught', goto: 'c2_teach' },
        { text: {
            kirito: '"We move east. We can\'t carry thirty people."',
            masha:  '"We can\'t save them by dying with them. East."'
          },
          tag: 'PRAGMATIC', sets: 'c2_left', goto: 'c2_leave' },
        { text: {
            kirito: 'Say nothing — but leave your map open on the board where they\'ll find it.',
            masha:  'Say nothing — but pin your field notes to the board on the way out.'
          },
          trust: 1, tag: 'QUIET', sets: 'c2_quiet_help', goto: 'c2_leave' }
      ]
    },

    c2_teach: {
      scene: 'scene_town',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">It takes four hours and it is deeply, grindingly unglamorous. Kirito
                 discovers he is a bad teacher and Masha is a spectacular one, and that the
                 combination works because she explains the why and he demonstrates the how.</p>
                 <p>"You're good at this," he admits.</p>
                 <p>"I'm good at people. You're good at systems." She bumps his shoulder.
                 "Between us that's a whole functional adult."</p>`,
        masha:  `<p class="nar">Masha does the talking. Kirito does the demonstrating — and to her
                 genuine surprise he is patient with them, endlessly patient, right up until
                 someone asks him a question about feelings and he goes back to being furniture.</p>
                 <p>"You're better with them than you think," she says afterward.</p>
                 <p>"I'm better with the parts that have rules."</p>
                 <p>"Yeah," Masha says. "I noticed."</p>`
      },
      next: 'c2_hounds'
    },

    c2_leave: {
      scene: 'scene_town',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">They leave through the east gate at midday. Neither of them looks
                 back at the fountain, which takes effort, and both of them notice the other
                 not looking.</p>
                 <p>"That was the right call," Masha says, in the voice of someone talking herself
                 into it.</p>`,
        masha:  `<p class="nar">They leave through the east gate at midday, and Masha spends the
                 first kilometre building an argument for why it was correct, and the second
                 kilometre being angry that she needed one.</p>
                 <p>"It was the right call," Kirito says, without being asked.</p>
                 <p>"Don't."</p>`
      },
      next: 'c2_hounds'
    },

    c2_hounds: {
      scene: 'scene_forest',
      cast: [],
      text: `<p class="nar">The east road runs through a treeline, and the treeline has teeth —
             something mechanical and lean detaches from the shadow of a trunk and is joined,
             immediately, by a second.</p>
             <p class="nar">They move like they've done this before. They probably have.</p>`,
      next: 'c2_fight1'
    },

    c2_fight1: { battle: 'c2_hounds', onWin: 'c2_after1', onLose: 'c2_after1' },

    c2_after1: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: `<p class="nar">The hounds break into scrap and light. Whatever this world runs on,
             it is generous with spectacle and stingy with explanation.</p>
             <span class="sysmsg">ZONE 02 CLEARED. HOSTILE DENSITY INCREASING EASTWARD.</span>`,
      classNote: {
        mage:    `<p class="nar">{me} checks the mana bar afterwards out of habit and finds it at a
                  third, which for two hounds is a genuinely worrying exchange rate. There is a
                  version of the next fight that ends with nothing left to spend.</p>`,
        ranger:  `<p class="nar">The first hound died at twenty metres. The second one covered that
                  twenty metres in under three seconds, and {me} has been thinking about that
                  number ever since — because the bow has no answer to it at all.</p>`,
        fighter: `<p class="nar">{me} got four strikes into the second hound before it fell, and the
                  fourth hit roughly twice as hard as the first. Whatever this world is, it pays
                  out for not stopping.</p>`,
        tank:    `<p class="nar">Both hounds went for {me} and neither of them chose to. That is the
                  part {me} keeps turning over: it wasn't a decision they made. It's a decision
                  something made <em>for</em> them, and it worked perfectly.</p>`
      },
      next: 'rt2_hub'
    },

    c2_fight2: { battle: 'c2_patrol', onWin: 'c2_after2', onLose: 'c2_after2' },

    c2_patrol: {
      scene: 'scene_forest',
      cast: [],
      text: `<p class="nar">Deeper in, the trees give way to a clearing that is very obviously
             patrolled — the grass is worn in a circuit, and something with a single red lens
             is walking it, slowly, with a hound at heel.</p>`,
      next: 'c2_fight2'
    },

    c2_after2: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"They're guarding something," Masha says, turning a piece of the drone over.
                 "You don't patrol a circuit unless there's a middle."</p>
                 <p class="nar">Kirito is already looking at the middle. There's a structure through
                 the trees — low, white, wrong for this zone.</p>`,
        masha:  `<p class="nar">Masha turns the drone's lens over in her hand and thinks about
                 circuits. You don't walk a circle unless the circle has a centre.</p>
                 <p>"There's something in the middle of this," she says.</p>
                 <p>"There's a structure through the trees," Kirito says, who has apparently
                 been looking at it for some time and not mentioning it. "White. Wrong period
                 for this zone."</p>
                 <p>"You could <em>lead</em> with that."</p>`
      },
      next: 'c2_boar'
    },

    c2_boar: {
      scene: 'scene_forest',
      cast: [],
      text: `<p class="nar">They don't reach the structure. Something else reaches them first —
             enormous, armoured, its hide crawling with textures that keep failing to render.
             Where the corruption spreads, the world under it flickers.</p>
             <p class="nar">It is not supposed to be here. Even the game seems to think so.</p>`,
      next: 'c2_fight3'
    },

    c2_fight3: { battle: 'c2_boar', onWin: 'c2_after3', onLose: 'c2_after3' },

    c2_after3: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The boar comes apart, and for a half-second before the light takes
                 it, Kirito sees straight through the corrupted patch on its flank — through the
                 hide, through the world, into a flat white nothing behind it.</p>
                 <p>"Tell me you saw that," he says.</p>
                 <p>"I saw it." Masha's voice is very level, which is how he's learned to tell
                 she's frightened. "There's a hole in it, Kirito. There's a hole in the world."</p>`,
        masha:  `<p class="nar">For half a second before the light takes it, Masha sees <em>through</em>
                 the corrupted patch — past the hide, past the trees behind it, into a flat white
                 nothing with no depth at all.</p>
                 <p>"There's a hole in the world," she says.</p>
                 <p>"I saw."</p>
                 <p>"No, I mean — " She turns to him and her hands are doing the shaking thing again.
                 "Something is <em>eating</em> it. That's not corruption, that's a bite."</p>`
      },
      next: 'c2_close'
    },

    c2_close: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      speaker: 'system',
      text: `<span class="sysmsg">ANOMALY LOGGED. THIS INCIDENT HAS BEEN REPORTED.</span>
             <span class="sysmsg">REPORTED TO WHOM IS NOT AVAILABLE AT YOUR ACCESS LEVEL.</span>
             <p class="nar">The panel hangs in the air a moment longer than it needs to, and then
             folds itself away, and the forest is extremely quiet.</p>`,
      goChapter: 3
    }

  }
};
