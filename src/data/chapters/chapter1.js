/* ============================================================
   chapter1.js — "LOGIN"

   Entry into the game world, first battles, the companion meeting.
   Battle-heavy from the start (§8): 3 encounters in chapter one.

   TEXT FIELDS may be a string (shared) or { kirito, masha } —
   the variant is chosen by which lead the player controls, so the
   same scene is written twice from two different insides (§2).
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter1 = {
  id: 1,
  title: 'LOGIN',
  subtitle: 'Forty thousand people pressed START. None of them pressed QUIT.',
  start: 'c1_open',

  beats: {

    c1_open: {
      scene: 'scene_nexus',
      cast: [],
      title: 'The Nexus',
      text: {
        /* Launch day is stated here, once, in both variants. It was missing
           entirely, and without it the opening had no answer to "why am I
           here" — forty thousand people were simply in a room. They queued
           for this. That is what makes the door closing land. */
        kirito: `<p class="nar">Nova Impulse sold out its launch allocation in nine minutes. Kirito was
                 in the queue for six of them, which he had been quietly pleased about, and which
                 is now the single stupidest fact of his life.</p>
                 <p class="nar">The load screen doesn't fade. It <em>lands</em> — weight arriving in your knees,
                 air arriving in your lungs, a floor arriving under your boots with the specific
                 finality of a door closing.</p>
                 <p class="nar">He has played eleven of these. He knows what a login is supposed to feel like.</p>
                 <p class="nar">It is not supposed to feel like this.</p>`,
        masha:  `<p class="nar">Forty thousand people wanted to be here tonight. Masha wanted it enough to
                 set an alarm for three in the morning, and she got in, and she told everyone she
                 knew, and now she is standing in a cathedral of blue light with all forty thousand
                 of them.</p>
                 <p class="nar">Her first thought is that the air is <em>wrong.</em> Games don't do air. Games do
                 visuals and sound and a vague suggestion of wind.</p>
                 <p class="nar">This air is cold at the back of her throat. It tastes faintly of copper.</p>
                 <p class="nar">She notices it before anyone else does. She usually does.</p>`
      },
      next: 'c1_system'
    },

    c1_system: {
      scene: 'scene_nexus',
      cast: [],
      speaker: 'system',
      text: `<span class="sysmsg">WELCOME TO NOVA IMPULSE.</span>
             <span class="sysmsg">LOGOUT HAS BEEN DISABLED FOR ALL ACCOUNTS.</span>
             <span class="sysmsg">THIS IS NOT AN ERROR. PLEASE PROCEED TO THE FIELD.</span>
             <p class="nar">Forty thousand people read it at once. There is a half-second of absolute
             silence — the sound of a very large number of people deciding, individually, that
             this must be a joke.</p>
             <p class="nar">Then the screaming starts, and it does not stop for a long time.</p>`,
      next: 'c1_menu'
    },

    /* The player is told logout is disabled and then simply believes it. That
       was the weakest link in the opening: the single most important fact
       about this world arrived as an announcement nobody tested. So they
       test it. It costs one beat and it is the difference between being told
       the door is locked and putting your hand on it. */
    c1_menu: {
      scene: 'scene_nexus',
      cast: [],
      text: {
        kirito: `<p class="nar">Kirito opens the menu before he has finished reading the message.
                 Two fingers, drawn down — a gesture he has made ten thousand times in eleven
                 different worlds, so automatic that his hand starts it while the rest of him
                 is still deciding whether to be afraid.</p>
                 <p class="nar">The menu opens. It is immaculate. Inventory, party, map, settings,
                 audio, accessibility, key bindings, credits.</p>
                 <p class="nar">Where logout should be, there is nothing. Not a greyed-out line.
                 Not an error. The list simply closes over the space as though it had never
                 been allocated.</p>
                 <p class="nar">Around him, forty thousand people make the same small gesture at
                 almost the same moment, and Kirito understands two things at once: that this
                 is not a lock, because a lock admits there is a door — and that somebody
                 tidied up afterwards.</p>`,
        masha:  `<p class="nar">Masha opens the menu because everyone around her is opening the
                 menu. It is the loneliest thing she has ever seen: forty thousand strangers
                 in one room, all making the same small private gesture at the air, all
                 checking the same thing, none of them looking at each other.</p>
                 <p class="nar">Inventory. Party. Map. Settings. All of it there, all of it
                 polished, someone's careful work.</p>
                 <p class="nar">No logout. No gap where a logout used to be, either — nothing
                 crossed out, nothing broken. Just a clean list that was built without one.</p>
                 <p class="nar">"It's not broken," she says, to nobody, in a voice that carries
                 further than she means it to. "Somebody <em>finished</em> this."</p>
                 <p class="nar">A man near her starts crying. She thinks that is probably the
                 correct response and is faintly annoyed with herself for not managing it.</p>`
      },
      next: 'c1_meet'
    },

    /* --- the companion meeting, written from two different insides --- */
    c1_meet: {
      scene: 'scene_nexus',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      speaker: { kirito: 'masha', masha: 'kirito' },
      text: {
        kirito: `<p class="nar">Kirito is doing what he always does when something is wrong: moving to the
                 edge of the room and counting exits. He has found three, and confirmed that all
                 three are decorative, when someone taps his shoulder.</p>
                 <p>"You've stopped panicking already," the girl says. It isn't a question.
                 Ash-blonde, amber-eyed, absolutely no regard for personal space. "Everyone else is
                 still on the floor. You did the whole cycle in about ninety seconds."</p>
                 <p>"I've been in a lot of servers."</p>
                 <p>"Masha." She sticks out a hand. "I'm going to stay near you, if that's all right.
                 You look like someone who reads patch notes."</p>`,
        masha:  `<p class="nar">Masha has been through six clusters of crying strangers and has learned
                 exactly one useful thing: nobody knows anything. So she starts looking for the
                 person who <em>isn't</em> crying.</p>
                 <p class="nar">She finds him at the wall, counting doors. Black coat, dark eyes,
                 tapping the stone with two fingers like he's checking whether it's load-bearing.</p>
                 <p>"They're not real doors," she says.</p>
                 <p>"No," he agrees, without looking up. "But someone drew them. That means someone
                 decided a door should be there. That's information."</p>
                 <p>She decides, right there, that she is staying near this one.</p>
                 <p>"Masha."</p>
                 <p>"Kirito." He finally looks at her. "Don't go into the field alone."</p>`
      },
      next: 'c1_choice1'
    },

    c1_choice1: {
      scene: 'scene_nexus',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The crowd is starting to move — some toward the field gate, most away
                 from it. Masha is watching him, waiting to see which way he goes.</p>`,
        masha:  `<p class="nar">The crowd is splitting. Kirito hasn't moved yet, which she suspects
                 means he's already decided and is only waiting to see what she does.</p>`
      },
      choices: [
        {
          text: {
            kirito: '"Stay close. I\'d rather not have to look for you later."',
            masha:  '"We go together. I\'m not doing this next to a stranger who panics."'
          },
          trust: 2, tag: 'PARTY',
          sets: 'c1_together',
          goto: 'c1_together'
        },
        {
          text: {
            kirito: '"Do what you want. I work faster alone."',
            masha:  '"I can handle myself. Keep up or don\'t."'
          },
          tag: 'SOLO',
          sets: 'c1_alone',
          goto: 'c1_alone'
        },
        {
          text: {
            kirito: 'Say nothing. Start walking toward the field gate.',
            masha:  'Say nothing. Start walking toward the field gate.'
          },
          trust: 1, tag: 'ACT',
          /* Also flags the party as travelling together — without this the
             option led to the together beat but set nothing, so the Chapter 2
             payoff fell through to its neutral fallback. */
          sets: 'c1_together',
          goto: 'c1_together'
        }
      ]
    },

    c1_together: {
      scene: 'scene_nexus',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"Good," Masha says, and falls into step beside him like it was settled hours ago.
                 "For the record, I'm not helpless. I just think two people who are thinking clearly
                 beat one person who's thinking clearly."</p>
                 <p>"That's mathematically true."</p>
                 <p>"You're going to be exhausting, aren't you."</p>`,
        masha:  `<p>Kirito doesn't argue. He just adjusts his path half a step so she's on his
                 inside shoulder, away from the gate, and Masha notices and decides not to
                 mention it.</p>
                 <p>"You do that on purpose?"</p>
                 <p>"Do what?"</p>
                 <p>"Nothing," she says. "Nothing. Let's go."</p>`
      },
      next: 'c1_gate'
    },

    c1_alone: {
      scene: 'scene_nexus',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>Masha's face does something complicated and lands on unbothered.</p>
                 <p>"Sure," she says. "Cool. Great." She walks to the gate anyway, eight steps ahead
                 of him, which is not away and is not together either.</p>
                 <p class="nar">She stays eight steps ahead for the next four hours.</p>`,
        masha:  `<p>Kirito accepts this immediately, which is somehow worse than an argument.</p>
                 <p>"Fine," he says. "Field's east. If you go past the second ridge you'll hit a level
                 band you can't clear yet."</p>
                 <p>"How do you know that?"</p>
                 <p>"I read the patch notes," he says, and walks off before she can decide whether
                 that was a joke.</p>`
      },
      next: 'c1_gate'
    },

    c1_gate: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      speaker: 'system',
      text: `<span class="sysmsg">FIELD ZONE 01 — "THE SHALLOWS". RECOMMENDED LEVEL 1.</span>
             <p class="nar">The gate opens onto grassland, and the grassland is beautiful, and that
             is the worst part. Gold light. Wind in the seed-heads. Floating islands stacked up
             the sky like someone shuffled a deck of continents.</p>
             <p class="nar">Somewhere out in all that beauty, something small and crystalline
             notices two new arrivals and begins, without hurry, to come toward them.</p>`,
      next: 'c1_first_fight'
    },

    /* ---------------- BATTLE 1 ---------------- */
    c1_first_fight: {
      battle: 'c1_first',
      onWin: 'c1_after1',
      onLose: 'c1_after1_lost'
    },

    c1_after1: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The slime comes apart into light and a small chime, and Kirito stands
                 there breathing hard with the strange guilt of having enjoyed that.</p>
                 <p>"It hurt," Masha says. She's holding her arm. "When it hit me. It <em>hurt.</em>"</p>
                 <p>"I know."</p>
                 <p>"Games don't hurt."</p>
                 <p>"I know," he says again, and doesn't say the rest of it, which is:
                 <em>so what happens at zero?</em></p>`,
        masha:  `<p class="nar">It bursts into light and Masha's hands won't stop shaking, which is
                 annoying, because the rest of her is completely fine.</p>
                 <p>"That hurt," she says out loud, because someone should say it. "That actually hurt.
                 Games don't do that."</p>
                 <p>Kirito is quiet for a second too long.</p>
                 <p>"You've thought about what happens at zero," she says.</p>
                 <p>"I've thought about it."</p>
                 <p>"And?"</p>
                 <p>"I'd rather not test it."</p>`
      },
      next: 'c1_learn'
    },

    c1_after1_lost: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      speaker: 'system',
      text: `<span class="sysmsg">HP CRITICAL. EMERGENCY RESPAWN ENGAGED.</span>
             <p class="nar">The world goes white, then grey, then back — and you are twenty metres
             from where you fell, on your knees, entirely alive and entirely certain that you
             should not be.</p>
             <p class="nar">The system caught you. This time.</p>
             <p>"It let us live," comes the voice beside you. "That's not mercy. That's a
             <em>setting.</em> Someone chose that."</p>`,
      next: 'c1_learn'
    },

    c1_learn: {
      scene: 'scene_field',
      cast: [],
      speaker: 'system',
      text: `<span class="sysmsg">COMBAT DATA RECORDED. SKILL MATRIX AVAILABLE.</span>
             <p class="nar">A panel unfolds in the air at chest height — a lattice of nodes, most of
             them dark, five tiers deep. Only the first tier glows.</p>
             <p class="nar">Whatever this place is, it wants you to get stronger. It has built a very
             careful staircase for exactly that, and it is watching to see how fast you climb.</p>
             <span class="sysmsg">TIP: OPEN [SKILLS] TO SPEND POINTS. TIERS 4-5 REMAIN SEALED.</span>`,
      /* The player picks a class and the game never mentioned it again.
         classNote is keyed by the player's class; mateNote by the
         companion's, which is randomised and so is never assumed. */
      classNote: {
        mage:    `<p class="nar">{me}'s first tier is three nodes wide and all three of them are ways
                  to put fire somewhere it currently isn't. Underneath, in smaller text, sits the
                  health pool, and it is the lowest number on the panel by a humiliating margin.</p>`,
        ranger:  `<p class="nar">{me}'s first tier is one idea drawn four ways: hit the thing that
                  matters, once, from somewhere it isn't looking. There is nothing in it about
                  surviving being hit back, which {me} notices and files under <em>later.</em></p>`,
        fighter: `<p class="nar">{me}'s nodes are drawn joined — each one feeding an arrow into the
                  next, so the tier reads less like a list of moves than like a sentence you are
                  expected to finish. Nothing in it is worth much alone.</p>`,
        tank:    `<p class="nar">Half of {me}'s first tier isn't damage at all. Taunt. Bulwark. A node
                  whose entire description is about standing in one specific place — an entire
                  discipline built around being the answer to <em>who do they hit.</em></p>`
      },
      next: 'c1_bond1'
    },

    c1_bond1: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">They rest against a boulder while the light goes orange. Masha has
                 her jacket off and is examining the place the slime hit her — unmarked skin, no
                 bruise, nothing. Just the memory of it.</p>
                 <p>"Can I ask you something," she says, "and you answer honestly instead of
                 usefully?"</p>`,
        masha:  `<p class="nar">They rest against a boulder while the light goes orange. Kirito has
                 been silent for eleven minutes, which she is beginning to understand is not
                 the same as him being finished with a conversation.</p>
                 <p>"You're doing the thing," she says.</p>
                 <p>"What thing?"</p>
                 <p>"Solving it quietly so you don't have to say the scary part out loud."</p>`
      },
      choices: [
        {
          text: {
            kirito: '"Ask. I\'ll answer honestly." — let her in',
            masha:  '"Say the scary part. Out loud. To me."'
          },
          trust: 2, tag: 'OPEN',
          sets: 'c1_opened',
          goto: 'c1_bond_open'
        },
        {
          text: {
            kirito: '"Ask me after we\'re a few levels up."',
            masha:  '"Fine. Keep it. But I\'m not going anywhere."'
          },
          trust: 1, tag: 'GUARDED',
          goto: 'c1_bond_guard'
        },
        {
          text: {
            kirito: '"We should keep moving instead."',
            masha:  '"Later. Let\'s move."'
          },
          tag: 'DEFLECT',
          goto: 'c1_bond_guard'
        }
      ]
    },

    c1_bond_open: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"Do you think we're still in our bodies?" Masha says. "Out there. Somewhere.
                 Or is this it now."</p>
                 <p class="nar">Kirito thinks about lying. It would be kinder. It would also be the
                 first thing he'd ever said to her that wasn't true, and he finds he doesn't want
                 to spend that.</p>
                 <p>"I don't know," he says. "But whoever did this went to enormous trouble to keep
                 forty thousand people alive and conscious. You don't do that to a corpse."</p>
                 <p>Masha lets out a breath she'd clearly been holding for six hours.</p>
                 <p>"Okay," she says. "Okay. That's — okay. Thanks."</p>`,
        masha:  `<p>"Fine," Kirito says. He looks at the grass. "The scary part is that this is
                 <em>well made.</em> The damage curve is tuned. The respawn has a threshold. Someone
                 spent years on this and then locked the door."</p>
                 <p>"So it's not a bug."</p>
                 <p>"It's a design decision." He finally looks at her. "Somebody wants to see what we
                 do. And I'd rather they saw two of us than one."</p>
                 <p class="nar">It's the closest thing to <em>please stay</em> she thinks he's capable
                 of, and Masha decides that counts.</p>`
      },
      next: 'rt1_hub'
    },

    /* This branch used to end the chapter's only quiet scene with nothing in
       it but a mood. That mattered more than it looks: the open branch is
       where the game states its actual premise — that this was built on
       purpose, by someone, who is watching — and a player who chose to stay
       guarded reached chapter 2 having never been told there was a mystery
       at all. The premise is not a reward for picking the warm option. So it
       lands here too, in the shape this branch has earned: not said out loud
       by the person who won't say it, but arrived at anyway. */
    c1_bond_guard: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"Sure," Masha says, easily, and Kirito can hear exactly how much it cost her
                 to be easy about it.</p>
                 <p>She doesn't ask again that night. She also doesn't move away from the boulder.</p>
                 <p class="nar">He keeps the rest of it to himself, and the rest of it is this: the
                 damage numbers are tuned. The respawn has a threshold, and a threshold is a
                 number somebody chose. Nothing here is broken. Every single part of it is
                 working exactly as it was built to work.</p>
                 <p class="nar">Which means this is not an accident that trapped them. It is a
                 design, and designs have authors, and authors watch to see what their work
                 does.</p>
                 <p class="nar">He looks at the ridgeline for a long time and does not say any of
                 it, because saying it would make it true in the air between them, and she has
                 had enough of a day.</p>`,
        masha:  `<p>Kirito nods once and goes back to watching the ridgeline, and Masha sits with
                 the specific frustration of caring about someone who treats their own fear like
                 classified material.</p>
                 <p>She stays anyway. She's stubborn like that.</p>
                 <p class="nar">And because she is stubborn, she works at it herself, the way she
                 works at everything — out loud, in her own head, refusing to leave it alone.</p>
                 <p class="nar">The menu had no logout and no hole where one had been. The slime
                 hurt exactly enough to frighten her and not enough to stop her. She died
                 nothing like enough to find out what dying does.</p>
                 <p class="nar">Nothing here is broken. That is the part nobody in that cathedral
                 was saying. Everything is working, which means somebody built it this way, which
                 means somebody is somewhere finding out whether it worked.</p>
                 <p class="nar">She decides she would quite like to meet them.</p>`
      },
      next: 'rt1_hub'
    },

    c1_ambush: {
      scene: 'scene_field',
      cast: [],
      text: `<p class="nar">The wisps come at dusk, drawn to the light of the camp — three points of
             cyan drifting in from the long grass, then four, then a scatter of them turning in
             the air like a shoal deciding on a direction.</p>
             <p class="nar">They are, individually, almost nothing. That turns out not to matter.</p>`,
      next: 'c1_fight2'
    },

    /* ---------------- BATTLE 2 ---------------- */
    c1_fight2: {
      battle: 'c1_wisps',
      onWin: 'c1_after2',
      onLose: 'c1_after2'
    },

    c1_after2: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Afterwards Kirito notices something he'll spend the next four
                 chapters building a strategy around: when Masha moved first, his own strike
                 landed harder. Measurably. The system rewarded them for fighting <em>together.</em></p>
                 <p>"Did you feel that?" she says, already grinning. "Tell me you felt that."</p>
                 <p>"I felt it."</p>
                 <span class="sysmsg">COMBO LINK DETECTED. ACT AFTER YOUR PARTNER TO AMPLIFY SKILLS.</span>`,
        masha:  `<p class="nar">Masha notices it a half-beat before the system says it out loud —
                 she swung after Kirito moved, and it hit like something twice her level.</p>
                 <p>"That wasn't me," she says. "That was us."</p>
                 <p>"That was us," Kirito agrees, and there is something in his voice she hasn't
                 heard before, which after some thought she identifies as <em>hope.</em></p>
                 <span class="sysmsg">COMBO LINK DETECTED. ACT AFTER YOUR PARTNER TO AMPLIFY SKILLS.</span>`
      },
      mateNote: {
        mage:    `<p class="nar">{mate} has spent the whole fight ten metres back throwing light at
                  things, and arrives, every time, about half a second after the opening — close
                  enough that the fire lands in a hole that was made for it.</p>`,
        ranger:  `<p class="nar">{mate} never swings at the shoal. {mate} picks one wisp out of it,
                  waits an unbearable second, and deletes it — and the rest of them turn to look
                  at the gap, which is when the gap becomes the plan.</p>`,
        fighter: `<p class="nar">{mate} doesn't throw single strikes. Everything arrives in threes:
                  an opener that is really a setup, a second that is really a hinge, and a third
                  that lands in the space the first two spent themselves making.</p>`,
        tank:    `<p class="nar">{mate} doesn't chase anything. {mate} plants, and makes that patch of
                  grass the most interesting place in the field, and the entire shoal turns toward
                  it — which is the first time it's obvious what the shield is actually <em>for.</em></p>`
      },
      next: 'c1_night'
    },

    c1_night: {
      scene: 'scene_field',
      cast: [],
      text: `<p class="nar">They don't sleep. Nobody sleeps, that first night — the field is full of
             small fires and people sitting up in them, and the sky over the floating islands
             goes through colours that no sky has any business doing.</p>
             <p class="nar">Toward morning, something bigger moves along the ridge. It does not come
             closer. It simply passes, unhurried, the way a thing does when it has all the time
             in the world and knows it.</p>`,
      next: 'c1_dawn_fight'
    },

    /* ---------------- BATTLE 3 ---------------- */
    c1_dawn_fight: {
      battle: 'c1_pair',
      onWin: 'c1_close',
      onLose: 'c1_close'
    },

    c1_close: {
      scene: 'scene_field',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">By first light they have cleared the near field, and Kirito has a
                 working theory, a partner, and a route east toward a smudge of smoke that is
                 almost certainly a town.</p>
                 <p>"You've got a plan," Masha says. "You've had it since the gate."</p>
                 <p>"I've got a direction."</p>
                 <p>"Same thing, with you." She shoulders her pack. "Lead on, then."</p>`,
        masha:  `<p class="nar">By first light Masha has a partner, a working weapon, and a smudge of
                 smoke on the eastern horizon that is almost certainly people.</p>
                 <p>"Town," she says, pointing. "People. Information. Someone who's been here longer
                 than a day."</p>
                 <p>"You want to walk into a crowd of panicking strangers."</p>
                 <p>"I want to <em>ask them things,</em> Kirito." She's already walking. "That's how
                 you find out what's happening. You ask."</p>`
      },
      /* The chapter used to end on a direction — east, smoke, probably a town —
         and a direction is not an objective. A player closing the browser here
         could not have said what they were trying to DO. Now they can. */
      after: `<span class="sysmsg">OBJECTIVE — REACH THE EASTERN SETTLEMENT.</span>
              <span class="sysmsg">FIND SOMEONE WHO WAS HERE BEFORE TONIGHT.</span>
              <p class="nar">Nobody assigned it. No quest marker unfolded in the air, no window
              opened to be dismissed. They decided it themselves, out loud, in a field, which
              turns out to be how everything worth doing gets decided from here on.</p>`,
      goChapter: 2
    }

  }
};
