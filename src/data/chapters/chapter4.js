/* ============================================================
   chapter4.js — "THE BREACH"

   An encounter chain: multiple battles back to back with no rest
   between, which is where the combo mechanic stops being a bonus
   and becomes the only way through (§8).
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter4 = {
  id: 4,
  title: 'THE BREACH',
  subtitle: 'The hole in the world got bigger. Something is coming through it.',
  start: 'c4_open',

  beats: {

    c4_open: {
      scene: 'scene_breach',
      cast: [],
      title: 'The Breach',
      text: `<p class="nar">The plateau east of the Overgrown has split. Not collapsed — <em>split</em>,
             the way a file does when it fails to save, and through the split there is no rock
             and no sky, only a flat white that hurts to look at directly.</p>
             <p class="nar">Things are coming out of it. They have been coming out of it for some
             time, and they are not stopping to look around.</p>`,
      next: 'c4_brief'
    },

    c4_brief: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"We can't clear this," Masha says, counting. "There's — that's a wave. That's an
                 actual wave, that's not a patrol."</p>
                 <p>"We can't clear it apart," Kirito says. "Together we might."</p>
                 <p class="nar">He's already reading the field the way he reads everything: as a
                 problem with an order of operations. She moves, he follows. He opens, she closes.
                 The link.</p>`,
        masha:  `<p class="nar">Masha counts eleven of them before she stops counting, because past
                 a point the number is just a way of not acting.</p>
                 <p>"That's a wave," she says. "Not a patrol. A wave."</p>
                 <p>"Then we don't fight it as two people." Kirito's voice has gone flat and certain,
                 which is what he sounds like when he's stopped being afraid. "You open. I close.
                 Every time. No exceptions."</p>
                 <p>"And if you're down?"</p>
                 <p>"Then you don't stop to check."</p>`
      },
      next: 'c4_choice_order'
    },

    c4_choice_order: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: `<p class="nar">There is about forty seconds before the first of them reaches the ridge.
             Enough time for exactly one conversation.</p>`,
      choices: [
        { text: {
            kirito: '"If I go down, you keep going. Promise me."',
            masha:  '"If I go down, you keep going. Say it."'
          },
          tag: 'HARD', sets: 'c4_promise', goto: 'c4_promise_made' },
        { text: {
            kirito: '"Neither of us goes down. That\'s the plan."',
            masha:  '"Nobody goes down. That\'s the whole plan."'
          },
          trust: 3, tag: 'TOGETHER', sets: 'c4_neither', goto: 'c4_neither_falls' },
        { text: {
            kirito: 'No conversation. Draw and move.',
            masha:  'No conversation. Draw and move.'
          },
          tag: 'SILENT', goto: 'c4_silent' }
      ]
    },

    c4_promise_made: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"No," Masha says.</p>
                 <p>"Masha — "</p>
                 <p>"I said <em>no.</em> Ask me for anything else." She sets her feet. "Ask me to be
                 fast. Ask me to be smart. Don't ask me to leave you, because I'll say yes to
                 shut you up and then I won't do it, and then we'll both be liars."</p>`,
        masha:  `<p>"No," Kirito says.</p>
                 <p>She stares at him. "You don't get to be the sentimental one. That's my job."</p>
                 <p>"Then it's a bad job and I'm taking it." He draws. "Ask me for anything else."</p>`
      },
      next: 'c4_chain1'
    },

    c4_neither_falls: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Masha looks at him for a second and a half, and then she grins —
                 the reckless one, the one that means she's about to do something excellent
                 and ill-advised.</p>
                 <p>"Now you're talking," she says.</p>`,
        masha:  `<p class="nar">Kirito doesn't argue. That's how she knows it landed.</p>
                 <p>"Okay," he says. "Nobody goes down."</p>
                 <p>He says it like a specification rather than a hope, which from him is
                 practically a vow.</p>`
      },
      next: 'c4_chain1'
    },

    c4_silent: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: `<p class="nar">No speech. No plan spoken aloud. You both move at the same moment and
             discover, somewhere in the first exchange, that after three weeks you no longer
             need the words — which is either the most efficient thing that has ever happened
             to you, or the loneliest.</p>`,
      next: 'c4_chain1'
    },

    /* ---------------- ENCOUNTER CHAIN — no rest between ---------------- */

    c4_chain1: { battle: 'c4_stalkers', onWin: 'c4_link1', onLose: 'c4_link1' },

    c4_link1: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">No pause. The second group is already on the ridge before the first
             has finished dissolving — sleek, fast, masked, moving in a spread that is
             unmistakably a <em>formation.</em></p>
             <span class="sysmsg">HOSTILE WAVE 2 OF 3.</span>`,
      next: 'c4_chain2'
    },

    c4_chain2: { battle: 'c4_mixed', onWin: 'c4_link2', onLose: 'c4_link2' },

    c4_link2: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Kirito's hands are shaking. Masha is bleeding light from a gash on
                 her forearm that the system is very slowly closing. Neither of them says the
                 word <em>tired</em> because saying it makes it real.</p>
                 <p>"Third wave," she says.</p>
                 <p>"Third wave."</p>
                 <span class="sysmsg">HOSTILE WAVE 3 OF 3. WARNING: ELITE SIGNATURE.</span>`,
        masha:  `<p class="nar">Masha's arms have gone past burning into a kind of distant numbness.
                 Kirito's guard has dropped four inches and he hasn't noticed, which frightens
                 her more than the wave does.</p>
                 <p>"Last one," she says. "Then we sit down for a week."</p>
                 <p>"Deal."</p>
                 <span class="sysmsg">HOSTILE WAVE 3 OF 3. WARNING: ELITE SIGNATURE.</span>`
      },
      mateNote: {
        mage:    `<p class="nar">{mate}'s mana is at a tenth and there is a wave left. Nobody says
                  this out loud. Both of you have been watching the same bar for two fights.</p>`,
        ranger:  `<p class="nar">{mate} has four clear lines left on this ridge and has already walked
                  all four of them once. A third wave means fighting from a position the enemy has
                  now seen, which is the one thing {mate} was built never to do.</p>`,
        fighter: `<p class="nar">{mate} has not stopped moving since wave one, because stopping is the
                  thing that breaks the chain — and a third wave means starting the count over from
                  nothing, tired, with the good openings already spent.</p>`,
        tank:    `<p class="nar">{mate} has eaten most of two waves on purpose and it shows: the guard
                  is lower, the shield comes up later. A third wave asks {mate} to be the wall again,
                  and walls are not a renewable resource.</p>`
      },
      next: 'c4_chain3'
    },

    c4_chain3: { battle: 'c4_duelist', onWin: 'c4_after_chain', onLose: 'c4_after_chain' },

    c4_after_chain: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The Echo Duelist shatters into a thousand reflective fragments, and
                 in every single one of them, for a fraction of a second, Kirito sees himself
                 fighting — the same stance, the same timing, copied perfectly.</p>
                 <p>"It was learning us," he says. "That's what it was for. It wasn't sent to kill
                 us, it was sent to <em>record</em> us."</p>`,
        masha:  `<p class="nar">The Duelist bursts into mirror-shards, and in each shard Masha sees
                 herself mid-swing — her exact form, her exact timing, played back at her.</p>
                 <p>"It copied me," she says. "It was copying me the whole fight."</p>
                 <p>"It was recording," Kirito says quietly. "Both of us. That's what it was for."</p>`
      },
      next: 'c4_golem'
    },

    c4_golem: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">And then the ground moves, and it turns out the third wave was not
             the third wave. It was the escort.</p>
             <p class="nar">The thing that comes through the breach has to fold to fit. Stone and
             iron, rune-seams glowing white, tall enough that the sky is briefly a smaller
             thing than it is.</p>
             <span class="sysmsg">CORRECTION: WAVE 4 OF 3.</span>`,
      next: 'c4_fight_golem'
    },

    c4_fight_golem: { battle: 'c4_golem', onWin: 'c4_win', onLose: 'c4_lose' },

    /* "Say that again in a month" is a promise made only on the HONEST path
       in Chapter 3. Everything downstream of it has to check first, or the
       game cashes a cheque the player never wrote. */
    c4_win: {
      branch: [
        { flag: 'c3_confessed', goto: 'c4_win_month' }
      ],
      fallback: 'c4_win_quiet'
    },

    c4_win_month: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The golem goes down on one knee, then two, and stops. It does not
                 dissolve. It simply becomes furniture — a very large statue kneeling at the edge
                 of a hole in the world.</p>
                 <p class="nar">Masha sits down where she stood, hard, and after a moment Kirito sits
                 down next to her, and their shoulders touch, and neither of them moves away.</p>
                 <p>"Say the thing," she says, eyes shut. "The month thing. It's been a month."</p>`,
        masha:  `<p class="nar">The golem kneels and stops and does not dissolve, and Masha sits
                 down in the dirt because her legs have finished having opinions.</p>
                 <p class="nar">Kirito sits down beside her. Close enough that their shoulders touch.
                 He doesn't move away and neither does she.</p>
                 <p>"It's been a month," she says.</p>
                 <p>"I know."</p>
                 <p>"You said you'd say it in a month."</p>`
      },
      next: 'c4_close'
    },

    c4_win_quiet: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The golem goes down on one knee, then two, and stops. It does not
                 dissolve. It simply becomes furniture — a very large statue kneeling at the edge
                 of a hole in the world.</p>
                 <p class="nar">Masha sits down where she stood, hard, and after a moment Kirito sits
                 down next to her, and their shoulders touch, and neither of them moves away.</p>
                 <p class="nar">A month ago he would have counted the exits. He notices, with mild
                 alarm, that he has not looked for one since the fight ended.</p>`,
        masha:  `<p class="nar">The golem kneels and stops and does not dissolve, and Masha sits
                 down in the dirt because her legs have finished having opinions.</p>
                 <p class="nar">Kirito sits down beside her. Close enough that their shoulders touch.
                 He doesn't move away and neither does she.</p>
                 <p class="nar">Neither of them says anything, which is fine, which is genuinely
                 fine, and Masha only has to tell herself that twice.</p>`
      },
      next: 'c4_close'
    },

    c4_lose: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      speaker: 'system',
      text: `<span class="sysmsg">PARTY INCAPACITATED.</span>
             <span class="sysmsg">EMERGENCY EXTRACTION — AUTHORISATION: [REDACTED]</span>
             <p class="nar">There is no such thing as emergency extraction. It is not in the manual,
             it was not in the beta, and nobody in nine thousand people at Aldenmoor has ever
             heard of it.</p>
             <p class="nar">The world takes you anyway and puts you down four kilometres west, both
             of you breathing, neither of you dead.</p>
             <p class="nar">The golem did not finish you. It stopped at the exact point where
             finishing became possible, and then it stood there and waited for something to come
             and collect you.</p>
             <p>"That is not a feature," says the voice beside you, very evenly. "Whatever did
             that, it did it <em>on purpose</em> — and it had an authorisation code."</p>
             <p class="nar">Being hunted would be simpler. Being <em>kept</em> is much worse.</p>`,
      sets: 'survivedTheImpossible',
      next: 'c4_close'
    },

    /* Order matters: what was said in the Overgrown outranks a trust number,
       because trust can be earned in a dozen places and the confession only
       happened in one. */
    c4_close: {
      branch: [
        { flag: 'c3_confessed', goto: 'c4_close_month' },
        { flag: 'c3_closed',    goto: 'c4_close_shut' },
        { trustAtLeast: 8,      goto: 'c4_close_warm' }
      ],
      fallback: 'c4_close_cool'
    },

    c4_close_month: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"I'm glad it was you," Kirito says. "In the Nexus. Out of forty thousand people.
                 It's a month later and it's harder and I'm still glad."</p>
                 <p class="nar">Masha doesn't open her eyes. She just finds his hand in the dirt
                 between them and holds onto it, and they sit like that while the light off the
                 breach turns the whole plateau white.</p>
                 <p>"Okay," she says. "Now I believe you."</p>`,
        masha:  `<p>"I stopped counting doors a month ago," Kirito says. "I've stopped needing to
                 know where the exits are. That's — " He stops. Starts again. "That's you. That's
                 what you did."</p>
                 <p class="nar">Masha finds his hand in the dirt between them and holds onto it, and
                 they stay like that while the breach-light turns the plateau white.</p>
                 <p>"Took you long enough," she says.</p>`
      },
      goChapter: 5
    },

    /* High trust, nothing ever said out loud. */
    c4_close_warm: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Her hand is in the dirt between them. Kirito looks at it for what he
                 estimates is four seconds and knows is closer to eleven, and then puts his own
                 down beside it — not touching, near.</p>
                 <p class="nar">Masha doesn't move hers. That is the entire conversation, and both
                 sides hear it perfectly.</p>
                 <p>"We should move," he says eventually, and does not move.</p>
                 <p>"Yeah," Masha says, and doesn't either.</p>`,
        masha:  `<p class="nar">He puts his hand down in the dirt next to hers. Not on it. Next to it,
                 with about a centimetre of the end of the world in between.</p>
                 <p class="nar">Masha leaves hers exactly where it is, and understands that this is
                 the most Kirito has ever said to anybody.</p>
                 <p>"We should move," he says.</p>
                 <p>"In a minute," says Masha.</p>`
      },
      goChapter: 5
    },

    /* You looked at the treeline in the Overgrown. She has not asked twice. */
    c4_close_shut: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">There is a gap of about a metre between them, and Kirito is aware of
                 every centimetre of it, and it is a metre he put there himself in a burnt clearing
                 three weeks ago by checking the treeline.</p>
                 <p class="nar">Masha has been perfectly, professionally pleasant ever since. She
                 covers his flank. She laughs at the right places. She does not sit close.</p>
                 <p>"Good fight," she says, and gets up first.</p>`,
        masha:  `<p class="nar">Masha sits down a metre away, which is a distance she has been
                 maintaining since the burnt clearing, and which she could close at any time, and
                 has decided — with the full force of her considerable stubbornness — that she is
                 not going to be the one to close.</p>
                 <p class="nar">He doesn't close it either. He never does. That is the whole problem
                 and she is tired of being the only one holding it.</p>
                 <p>"Good fight," she says, and gets up first.</p>`
      },
      goChapter: 5
    },

    c4_close_cool: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">They sit a while without talking. There is a version of this moment
                 where something gets said, and Kirito can see the shape of it clearly, and lets
                 it go past.</p>
                 <p>"We should move," he says eventually.</p>
                 <p>"Yeah," says Masha. "We should."</p>`,
        masha:  `<p class="nar">They sit a while. There's a version of this where one of them says
                 the thing, and Masha can feel it sitting there between them, and she has decided
                 she is not going to be the one who reaches for it first.</p>
                 <p>"We should move," Kirito says.</p>
                 <p>"Yeah."</p>`
      },
      goChapter: 5
    }

  }
};
