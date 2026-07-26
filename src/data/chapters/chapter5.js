/* ============================================================
   chapter5.js — "ADMINISTRATOR"

   Escalation: an elite, then a genuine set-piece boss with a
   phase change. Closes on a hook, NOT a resolution (§ status).
   Nothing here is allowed to answer the central question.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter5 = {
  id: 5,
  title: 'ADMINISTRATOR',
  subtitle: 'Somebody has been watching the whole time. Tonight they answer.',
  start: 'c5_open',

  beats: {

    c5_open: {
      scene: 'scene_spire',
      cast: [],
      title: 'The Spire',
      text: `<p class="nar">The spire was not on any map, and then the breach closed, and then it
             was — white and gold and forty storeys of administrative architecture standing in
             a field where yesterday there was a field.</p>
             <p class="nar">The door is open. It has been open since it appeared. That is not an
             invitation so much as a statement about how little you matter to whatever is inside.</p>`,
      next: 'c5_approach'
    },

    c5_approach: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>"Do the count with me," Masha says. "The door in the Overgrown said four of five
                 remained. That was after the knight — so the knight was the first one."</p>
                 <p>"And since the Overgrown we've broken two. The duelist. The golem."</p>
                 <p>"So two seals left." She looks up at forty storeys of white and gold.
                 "And I'd bet everything I own that both of them are in that building."</p>
                 <p class="nar">Kirito does the arithmetic a second time, silently, the way he does
                 everything. It comes out the same. It also comes out one other way, which he
                 decides not to say.</p>`,
        masha:  `<p class="nar">Masha does the arithmetic out loud, because Kirito does it silently
                 and saying it wrong is the fastest way to make him correct her.</p>
                 <p>"Four of five remained after the Overgrown. The knight was the first. Since
                 then — the duelist, the golem. That's two. So two left."</p>
                 <p>"That's right," Kirito says. And then doesn't stop looking at the spire.</p>
                 <p>"But."</p>
                 <p>"But it only counts things that are guarding something." A pause. "We've walked
                 straight through four of them and it keeps letting us."</p>
                 <p class="nar">Two seals left, in a building that has had its door open the whole
                 time. Masha decides not to finish that thought either.</p>`
      },
      next: 'c5_seraph_intro'
    },

    c5_seraph_intro: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">Inside, the spire is one enormous room going up forever, ringed with
             floating bands of light, and every band is covered in names. Forty thousand of them.
             Some are lit. Most are not.</p>
             <p class="nar">Something descends through the rings on six wings that are not wings —
             they are geometry, folded until it means the same thing.</p>
             <span class="sysmsg">ACCESS DENIED. YOU ARE NOT SCHEDULED.</span>`,
      next: 'c5_fight1'
    },

    c5_fight1: { battle: 'c5_seraph', onWin: 'c5_after1', onLose: 'c5_after1' },

    c5_after1: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The Seraph comes apart into falling light, and where it was, the
                 nearest band of names turns slowly so the two of you can read it.</p>
                 <p class="nar">Two names are lit brighter than the rest. Yours, and hers.</p>
                 <p>"That's not a leaderboard," Masha says. "That's a shortlist."</p>`,
        masha:  `<p class="nar">The Seraph falls apart into light, and the nearest ring of names
                 rotates — deliberately, like a page being turned for a slow reader.</p>
                 <p class="nar">Two names burn brighter than the other thirty-nine thousand.</p>
                 <p>"Kirito," Masha says. "That's us. Why is that <em>us.</em>"</p>
                 <p>"Because we're ahead of schedule," he says. "It told us. At the door."</p>`
      },
      next: 'rt5_hub'
    },

    c5_escort: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">The rings stop turning. Every lit name goes out at once except two.</p>
             <p class="nar">And then the room fills — Seraphs descending in ranks, stalkers pouring
             up the stairwell, the whole spire committing to a single point in a way that is
             almost flattering.</p>
             <span class="sysmsg">ESCALATION AUTHORISED.</span>`,
      classNote: {
        mage:    `<p class="nar">{me} counts the room and does the only arithmetic that matters: mana
                  divided by targets. It does not come out. It has not come out since the stairwell,
                  and {me} steps forward anyway.</p>`,
        ranger:  `<p class="nar">There is no range in a room like this. {me} has spent a month making
                  distance the whole answer, and the spire has just taken distance off the table,
                  deliberately, the way you'd close a door behind someone.</p>`,
        fighter: `<p class="nar">{me} looks at a room with no cover, no exit and no gaps between the
                  waves, and feels something entirely inappropriate: the chain doesn't break in a
                  room like this. In a room like this the chain never has to stop.</p>`,
        tank:    `<p class="nar">Every hostile in the spire is converging on two points, and {me} has
                  precisely one job, which is to make sure it converges on <em>one.</em> The stairwell
                  is four metres wide. That is, generously, enough.</p>`
      },
      next: 'c5_fight2'
    },

    c5_fight2: { battle: 'c5_escort', onWin: 'c5_before_boss', onLose: 'c5_before_boss' },

    /* Payoff for the forty seconds before the wave in Chapter 4. Whatever
       you asked for at the breach is what you are standing on now. */
    c5_before_boss: {
      branch: [
        { flag: 'c4_promise', goto: 'c5_before_promise' },
        { flag: 'c4_neither', goto: 'c5_before_neither' }
      ],
      fallback: 'c5_before_silent'
    },

    c5_before_promise: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">At the top of the spire there is a chair, and the chair is occupied,
                 and the thing in it has been sitting perfectly still for however long a month is
                 to something like that.</p>
                 <p>"At the breach," Kirito says, "I asked you to keep going if I went down."</p>
                 <p>"And I said no."</p>
                 <p>"I'm going to ask again."</p>
                 <p>"And I'm going to say no again," Masha says, pleasantly, checking her grip.
                 "We can do this every time. I've got the stamina for it. Have you?"</p>`,
        masha:  `<p class="nar">The top of the spire is a single chair and the thing sitting in it,
                 white and gold and mirror-faced, which has not moved since before either of
                 you was born into this world.</p>
                 <p>"I asked you for something at the breach," Masha says.</p>
                 <p>"You asked me to leave you." Kirito doesn't look away from the chair. "I refused.
                 I'm going to keep refusing. I want that on the record before we start."</p>
                 <p>"That's not a plan, that's a feeling."</p>
                 <p>"Yes," he agrees. "I've been having those."</p>`
      },
      next: 'c5_boss_talk'
    },

    c5_before_neither: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">At the top of the spire there is a chair, and the chair is occupied,
                 and the thing in it has been sitting perfectly still for however long a month is
                 to something like that.</p>
                 <p>"Nobody goes down," Masha says. "That was the plan at the breach. It worked."</p>
                 <p>"It worked at the breach."</p>
                 <p>"So it's a good plan." She sets her feet beside him, close enough that their arms
                 touch. "Say it back to me anyway."</p>
                 <p>"Nobody goes down," Kirito says.</p>`,
        masha:  `<p class="nar">The top of the spire is a single chair and the thing sitting in it,
                 white and gold and mirror-faced, which has not moved since before either of
                 you was born into this world.</p>
                 <p>"We had a plan at the breach," Masha says. "It was a stupid plan. Nobody goes
                 down. I want it again."</p>
                 <p class="nar">Kirito is quiet for a second. He is, she knows, running the numbers
                 on whether that is a survivable position to take against that thing in that chair.</p>
                 <p>"Nobody goes down," he says.</p>
                 <p class="nar">He is a terrible liar and he does it for her anyway, and Masha decides
                 she will never once bring that up.</p>`
      },
      next: 'c5_boss_talk'
    },

    c5_before_silent: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">At the top of the spire there is a chair, and the chair is occupied,
                 and the thing in it has been sitting perfectly still for however long a month is
                 to something like that.</p>
                 <p>"Kirito," Masha says, very quietly. "Whatever it says. Whatever it offers.
                 We leave together."</p>`,
        masha:  `<p class="nar">The top of the spire is a single chair and the thing sitting in it,
                 white and gold and mirror-faced, which has not moved since before either of
                 you was born into this world.</p>
                 <p>"Whatever it says," Masha tells him, "we leave together. Say it."</p>
                 <p>"We leave together."</p>`
      },
      next: 'c5_boss_talk'
    },

    /* If the party has ever come back from zero past the ridge, the thing in
       the chair is the entity that signed off on it, and it says so. */
    c5_boss_talk: {
      branch: [
        { flag: 'survivedTheImpossible', goto: 'c5_boss_talk_kept' }
      ],
      fallback: 'c5_boss_talk_plain'
    },

    c5_boss_talk_plain: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<p class="nar">It stands. The rings realign around it like a sentence being assembled.</p>
             <span class="sysmsg">YOU HAVE ARRIVED EARLY. THIS IS THE FOURTH TIME.</span>
             <p class="nar">Not <em>the fourth time you have arrived.</em> The fourth <em>time.</em></p>
             <span class="sysmsg">THE PREVIOUS THREE ALSO REACHED THIS ROOM. THE PREVIOUS THREE ALSO ASKED WHY.</span>
             <span class="sysmsg">I WILL ANSWER AFTER THE ASSESSMENT. THAT IS THE ORDER OF OPERATIONS.</span>`,
      next: 'c5_choice_final'
    },

    c5_boss_talk_kept: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<p class="nar">It stands. The rings realign around it like a sentence being assembled.</p>
             <span class="sysmsg">YOU HAVE ARRIVED EARLY. THIS IS THE FOURTH TIME.</span>
             <p class="nar">Not <em>the fourth time you have arrived.</em> The fourth <em>time.</em></p>
             <span class="sysmsg">THE PREVIOUS THREE ALSO REACHED THIS ROOM. THE PREVIOUS THREE ALSO ASKED WHY.</span>
             <p class="nar">And then it does something the system has never once done. It changes
             the subject.</p>
             <span class="sysmsg">YOU HAVE BEEN RETURNED FROM ZERO BEYOND THE PERMITTED BOUNDARY.</span>
             <span class="sysmsg">YOU WILL HAVE ASSUMED THAT WAS AN ERROR.</span>
             <p class="nar">Beside you, very quietly, somebody stops breathing.</p>
             <span class="sysmsg">AUTHORISATION WAS MINE. IT HAS ALWAYS BEEN MINE.</span>
             <span class="sysmsg">I WILL EXPLAIN AFTER THE ASSESSMENT. THAT IS THE ORDER OF OPERATIONS.</span>`,
      next: 'c5_choice_final'
    },

    c5_choice_final: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      text: `<p class="nar">It waits. It genuinely waits — however long you need. Whatever else
             this thing is, it is not impatient.</p>`,
      choices: [
        { text: {
            kirito: '"What happened to the other three?"',
            masha:  '"The other three. What happened to them."'
          },
          tag: 'ASK', sets: 'c5_asked', goto: 'c5_answer' },
        { text: {
            kirito: '"We\'re not doing an assessment. Open the door."',
            masha:  '"No assessment. Open the door. Now."'
          },
          tag: 'REFUSE', sets: 'c5_refused', goto: 'c5_refuse' },
        { text: {
            kirito: 'Draw. There is nothing here worth hearing first.',
            masha:  'Draw. Talking is what it wants.'
          },
          trust: 2, tag: 'STRIKE', goto: 'c5_strike' }
      ]
    },

    c5_answer: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<span class="sysmsg">THEY PASSED.</span>
             <p class="nar">A pause exactly long enough to be cruel.</p>
             <span class="sysmsg">THAT IS WHY YOU HAVE NOT MET THEM.</span>
             <p class="nar">The greatsword comes up. Whatever the assessment is, it starts now.</p>`,
      next: 'c5_boss_fight'
    },

    c5_refuse: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<span class="sysmsg">REFUSAL IS PART OF THE ASSESSMENT.</span>
             <span class="sysmsg">IT IS, IN FACT, THE PART MOST OF THEM FAIL.</span>
             <p class="nar">The rings lock. The room gets smaller in a way that has nothing to do
             with its dimensions.</p>`,
      next: 'c5_boss_fight'
    },

    c5_strike: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      text: {
        kirito: `<p class="nar">Kirito moves first and Masha is a half-beat behind him without being
                 told, which after a month is not coordination any more. It's just how they work.</p>
                 <span class="sysmsg">…UNSCHEDULED. RECALCULATING.</span>`,
        masha:  `<p class="nar">Masha moves first and Kirito is already covering the angle she left
                 open, because of course he is, because that is what the last month has been for.</p>
                 <span class="sysmsg">…UNSCHEDULED. RECALCULATING.</span>`
      },
      next: 'c5_boss_fight'
    },

    /* ---------------- SET-PIECE BOSS ---------------- */
    c5_boss_fight: { battle: 'c5_prime', onWin: 'c5_kneel', onLose: 'c5_fallen' },

    /* "I WILL ANSWER AFTER THE ASSESSMENT." The assessment is over. It keeps
       its word — which is the last thing anyone expected it to do. */
    c5_kneel: {
      branch: [
        { flag: 'c5_asked',   goto: 'c5_kneel_asked' },
        { flag: 'c5_refused', goto: 'c5_kneel_refused' }
      ],
      fallback: 'c5_hook_win'
    },

    c5_kneel_asked: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<p class="nar">It goes down on one knee, and the rings slow, and it keeps the promise
             it made before the first swing.</p>
             <span class="sysmsg">YOU ASKED WHAT HAPPENED TO THE OTHER THREE.</span>
             <span class="sysmsg">THE ANSWER IS THAT THEY ARE STILL HERE. ALL OF THEM. THEY HAVE NEVER LEFT.</span>
             <p class="nar">The bands of names above you turn, unbidden, and stop.</p>
             <span class="sysmsg">SO ARE YOU. THIS IS NOT THE FIRST TIME YOU HAVE READ THIS SENTENCE.</span>`,
      next: 'c5_hook_win'
    },

    c5_kneel_refused: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<p class="nar">It goes down on one knee, and the rings slow, and it addresses the thing
             you said instead of the thing you did.</p>
             <span class="sysmsg">YOU REFUSED THE ASSESSMENT AND THEN COMPLETED IT.</span>
             <span class="sysmsg">THE PREVIOUS THREE ALSO REFUSED. THE PREVIOUS THREE ALSO COMPLETED IT.</span>
             <p class="nar">A pause. The rings above you turn without being told to.</p>
             <span class="sysmsg">THE REFUSAL IS NOT A WAY OUT. THE REFUSAL IS THE PART BEING MEASURED.</span>`,
      next: 'c5_hook_win'
    },

    c5_fallen: {
      branch: [
        { flag: 'c5_asked',   goto: 'c5_fallen_asked' },
        { flag: 'c5_refused', goto: 'c5_fallen_refused' }
      ],
      fallback: 'c5_hook_lose'
    },

    c5_fallen_asked: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<p class="nar">You are on the floor, and it is still standing, and it answers you
             anyway — which is somehow worse than being ignored.</p>
             <span class="sysmsg">YOU ASKED WHAT HAPPENED TO THE OTHER THREE.</span>
             <span class="sysmsg">THIS. THIS HAPPENED TO THE OTHER THREE.</span>
             <p class="nar">It says it without any triumph at all. It sounds, if anything, like
             somebody reading out a result they had hoped would be different.</p>`,
      next: 'c5_hook_lose'
    },

    c5_fallen_refused: {
      scene: 'scene_spire',
      cast: ['wardenPrime'],
      speaker: 'system',
      text: `<p class="nar">You are on the floor. It is still standing. It waits until you can hear
             it before it says anything, which is a courtesy nobody asked it for.</p>
             <span class="sysmsg">YOU REFUSED, AND THEN YOU WERE ASSESSED ANYWAY.</span>
             <span class="sysmsg">EVERY ONE OF THEM REFUSED. IT IS THE ONLY PART THAT HAS NEVER VARIED.</span>`,
      next: 'c5_hook_lose'
    },

    /* ============================================================
       HOOK — Chapter 5 closes mid-breath. No resolution, by design.
       ============================================================ */

    /* These two used to be `hook: true` — terminal screens with no exit,
       because chapter 6 did not exist yet. That made chapter 6 unreachable
       even after it was written. They are ordinary beats now and hand off to
       it, which is also where the face behind the faceplate stops being a
       cliffhanger and starts being the plot: "so much earlier than last time"
       and "we'll go again" are literal, and chapter 8 shows the shelf they
       were said from. */
    c5_hook_win: {
      text: {
        kirito: `<p class="nar">Warden Prime goes down on one knee, and the rings stop, and the
                 whole spire holds its breath.</p>
                 <p class="nar">The mirrored faceplate splits — not breaks; <em>opens</em>, the way a
                 file does — and behind it there is no machinery at all.</p>
                 <p class="nar">There is a face. Human. Exhausted. Older than yours by maybe fifteen
                 years, and unmistakably, impossibly, <em>familiar.</em></p>
                 <p>"Oh," it says, in a voice that is not the system's voice. "Oh, you're early.
                 You're so much earlier than last time."</p>
                 <p class="nar">Masha's sword hits the floor.</p>
                 <p>"Kirito," she says. "Kirito, look at it. <em>Look at its face.</em>"</p>
                 <span class="sysmsg">ASSESSMENT COMPLETE. SUBJECT PAIR: RETAINED.</span>
                 <span class="sysmsg">CHAPTER 05 ENDS. SESSION CONTINUES.</span>`,
        masha:  `<p class="nar">Warden Prime drops to one knee and the rings stop turning and the
                 spire goes completely silent.</p>
                 <p class="nar">The mirrored faceplate opens — not shatters, <em>opens</em> — and there
                 is nothing mechanical behind it.</p>
                 <p class="nar">There is a face. Human. Tired past describing. Fifteen years older
                 than it should be and completely, impossibly <em>familiar.</em></p>
                 <p>"Oh," it says, and it is not the system's voice. "You're early. You're so much
                 earlier than last time."</p>
                 <p class="nar">Masha hears her own sword hit the floor before she registers dropping it.</p>
                 <p>"Kirito." Her voice does not sound like hers. "<em>Look at its face.</em>"</p>
                 <span class="sysmsg">ASSESSMENT COMPLETE. SUBJECT PAIR: RETAINED.</span>
                 <span class="sysmsg">CHAPTER 05 ENDS. SESSION CONTINUES.</span>`
      },
      goChapter: 6
    },

    c5_hook_lose: {
      text: {
        kirito: `<p class="nar">You go down at the foot of the chair, and the extraction does not
                 come, and Warden Prime stands over you for a long moment doing nothing at all.</p>
                 <p class="nar">Then it kneels — carefully, the way you kneel beside something small —
                 and the mirrored faceplate opens, and behind it there is no machinery.</p>
                 <p class="nar">There is a face. Human. Exhausted. Fifteen years older than yours and
                 unmistakably, impossibly <em>familiar.</em></p>
                 <p>"Not this time either," it says, in a voice that is not the system's.
                 "That's all right. You were closer. Get up — we'll go again."</p>
                 <p class="nar">Masha, somewhere behind you, makes a sound you have never heard a
                 person make.</p>
                 <span class="sysmsg">ASSESSMENT INCOMPLETE. SUBJECT PAIR: RETAINED.</span>
                 <span class="sysmsg">CHAPTER 05 ENDS. SESSION CONTINUES.</span>`,
        masha:  `<p class="nar">You go down at the foot of the chair. No extraction comes. Warden
                 Prime stands over you doing nothing at all for a very long moment.</p>
                 <p class="nar">Then it kneels — carefully, the way you kneel next to something
                 breakable — and the faceplate opens, and behind it there is no machinery.</p>
                 <p class="nar">There is a face. Human, exhausted, fifteen years too old, and
                 completely <em>familiar.</em></p>
                 <p>"Not this time either," it says, in a voice that is not the system's.
                 "That's all right. You got closer. Get up. We'll go again."</p>
                 <p class="nar">Beside you, Kirito says a word you have never heard him say.</p>
                 <span class="sysmsg">ASSESSMENT INCOMPLETE. SUBJECT PAIR: RETAINED.</span>
                 <span class="sysmsg">CHAPTER 05 ENDS. SESSION CONTINUES.</span>`
      },
      goChapter: 6
    }

  }
};
