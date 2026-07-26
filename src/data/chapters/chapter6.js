/* ============================================================
   chapter6.js — "THE OPEN DOOR"

   The hinge chapter. Six new people, and the choice that decides
   who the rest of the story is about.

   STRUCTURE (§11)
   ---------------
   Nova Impulse uses the shape every visual novel with multiple
   routes uses, for the reason they all use it: a COMMON ROUTE
   that everyone plays, and route content that splits late.
   Chapters 1-5 are the common route and are not touched. Chapter
   6 introduces all six and ends on the lock; chapters 7-10 run a
   shared spine with route-specific beats hung off it.

   The alternative — six genuinely separate chapter sets — would
   be six times the prose for content 5/6 of which any given
   player never sees, and would mean chapters 1-5 had to be
   rewritten to seed all six. This way every route gets scenes
   that could not belong to any other route, and the spine keeps
   the plot moving.

   `state.route` is set here and read from chapter 7 onward.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter6 = {
  id: 6,
  title: 'THE OPEN DOOR',
  subtitle: 'The Warden is gone. Nothing has closed. Someone else was already here.',
  start: 'c6_open',

  beats: {

    c6_open: {
      scene: 'scene_nexus',
      cast: [],
      title: 'After',
      text: `<p class="nar">Warden Prime does not fall so much as stop. One moment there is a thing
             holding the world's shape from the inside, and the next there is a spire with nothing
             in it and a silence that goes on too long.</p>
             <p class="nar">Everyone waits for the log-out prompt.</p>
             <p class="nar">It does not come. What comes instead, four days later, is the Breach —
             a tear across the sky above the Nexus that does not spawn anything new, only more, and
             more, and more of what you have already killed.</p>`,
      next: 'c6_survivors'
    },

    c6_survivors: {
      scene: 'scene_nexus',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The spawn hall fills up. That is the part nobody predicted — kill
                 the thing that trapped everyone, and everyone comes out of hiding.</p>
                 <p>"Two hundred and six," Masha says, coming back down the steps. "That we can
                 count. There were eleven thousand at launch."</p>
                 <p>"Some of them are still hiding."</p>
                 <p>"Some of them are." She sits down next to him, hard. "Say the rest."</p>
                 <p class="nar">He doesn't. She already knows the rest; she wanted to see whether
                 he would make her carry it alone.</p>`,
        masha:  `<p class="nar">Two hundred and six people, in a hall built for eleven thousand.
                 Masha counted them herself, twice, because the first number seemed like a mistake.</p>
                 <p>"Some are still hiding," Kirito says, before she can say it.</p>
                 <p>"And the rest?"</p>
                 <p class="nar">He looks at her the way he does when he has already run the numbers
                 and would rather not read them out. She lets him not say it. It is the closest
                 thing to a kindness available in a room this size.</p>`
      },
      next: 'c6_kazuma'
    },

    /* --- introductions. One beat each, each one showing the character doing
       the thing that makes them themselves, not describing it. --- */

    c6_kazuma: {
      scene: 'scene_town',
      cast: [],
      title: 'Kazuma',
      text: `<p class="nar">The man on the crate has been watching the recruitment queue for an hour
             without joining it.</p>
             <p>"You're the ones who killed the admin," he says. Not a question. "Congratulations.
             Door's still shut."</p>
             <p class="nar">He does not get up.</p>
             <p>"I found the exit in the second month. Northeast, past the drowned town, a
             maintenance hatch the patch notes forgot. Walked right up to it."</p>
             <p>"And?"</p>
             <p>"And I came back." He turns the empty cup over. "Ask me why and I'll lie to you,
             so don't."</p>`,
      next: 'c6_yuji'
    },

    c6_yuji: {
      scene: 'scene_breach',
      cast: [],
      title: 'Yuji',
      text: `<p class="nar">The first thing you see of him is his back, because he is between a
             Void Stalker and four people who cannot fight, and he has been there a while.</p>
             <p class="nar">He wins. He should not have — his health bar is a rumour by the end —
             and when it is over he turns around and asks whether everyone else is alright.</p>
             <p>"You're bleeding," Masha tells him.</p>
             <p>"Am I?" He looks down with mild interest, as if at someone else's arm. "It'll
             respawn."</p>
             <p class="nar">Something under his skin is glowing faintly through the tear, the same
             colour as the Breach. He pulls his sleeve down over it before anyone can ask.</p>`,
      next: 'c6_uzui'
    },

    c6_uzui: {
      scene: 'scene_town',
      cast: [],
      title: 'Uzui',
      text: `<p class="nar">The safe house announces itself from three streets away: strung lanterns,
             a painted sign, and music, which in a city this quiet is either very brave or very
             stupid.</p>
             <p>"FLASHY," says the enormous man in the doorway, with his arms out, as though the
             word were a greeting and also his entire philosophy. "You made it. I had a wager on
             you. I won it."</p>
             <p class="nar">Inside there are sixty people eating a hot meal, which is sixty more
             than anywhere else in the Nexus.</p>
             <p>"Six of them haven't spoken in a week," he says, still smiling, quieter, without
             turning his head. "Third table. Don't look now."</p>`,
      next: 'c6_chizuru'
    },

    c6_chizuru: {
      scene: 'scene_spire',
      cast: [],
      title: 'Chizuru',
      text: `<p class="nar">The map covers an entire wall of the spire's lower archive, and it is
             wrong in a very specific way: it is a map of a world with more in it than this one has.</p>
             <p>"You're standing on the legend," says the woman with the pins, without looking up.</p>
             <p class="nar">She has been mapping the Breach since before the spire opened. She has
             the dates. She has the spread rates. She has, it becomes clear over the next twenty
             minutes, considerably more than she has told anybody.</p>
             <p>"You could have shared this."</p>
             <p>"I could have." She moves a pin two centimetres north. "And then two hundred and six
             frightened people would know exactly how fast it is growing. Would that have helped
             them?"</p>`,
      next: 'c6_airi'
    },

    c6_airi: {
      scene: 'scene_forest',
      cast: [],
      title: 'Airi',
      text: `<p class="nar">She is sitting where the forest used to end, writing.</p>
             <p>"There was a fence here," she says. "Version 1.4. They took it out in a patch and
             everyone forgot within a day. I didn't."</p>
             <p class="nar">The notebook is nearly full. Small handwriting, no crossings-out.</p>
             <p>"I remember versions of this place that aren't in it any more." A pause that is
             thinking, not hesitation. "I remember some that had you in them, and this one doesn't
             match."</p>
             <p class="nar">She turns a page and shows you a date four months before the servers
             locked. Your name is on it, in a list of people who were somewhere you have never
             been.</p>`,
      next: 'c6_matikane'
    },

    c6_matikane: {
      scene: 'scene_field',
      cast: [],
      title: 'Matikanetannhauser',
      text: `<p class="nar">Something is coming across the grassland very fast and shouting.</p>
             <p>"IS THIS THE WAY TO THE BREACH?"</p>
             <p class="nar">She does not slow down to ask. She circles back, still moving, and
             arrives at a stop that takes another twenty metres to complete.</p>
             <p>"Matikanetannhauser," she says, and then, seeing the expression, "Mati is fine.
             Everyone does it. I don't mind."</p>
             <p class="nar">She has been running the perimeter every day for eleven weeks. Nobody
             asked her to. Her map of where the Breach has spread is, Chizuru will later admit
             with visible irritation, better than the official one.</p>
             <p>"I've never finished a race in this world," she says, already jogging on the spot.
             "Not once. Something always interrupts. This time I'd like to finish."</p>`,
      next: 'c6_first_fight'
    },

    /* --- the chapter's own business --- */

    c6_first_fight: {
      scene: 'scene_breach',
      cast: [],
      title: 'The Leak',
      text: `<p class="nar">The Breach does not send anything new. That is the part that unsettles
             Chizuru, and once she says it out loud it unsettles everyone: new would mean design.
             More just means the seal is failing.</p>`,
      battle: 'c6_leak',
      onWin: 'c6_after_first'
    },

    c6_after_first: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: `<p class="nar">Two of them, and both were things you have killed before, and both took
             longer than they should have.</p>
             <p>"They're getting harder," Masha says.</p>
             <p>"No," Chizuru says, arriving at the worst possible moment with the worst possible
             correction. "They're getting <i>older</i>. That Stalker has been alive for eleven weeks.
             Things in here keep what happens to them."</p>`,
      classNote: {
        mage: `<p class="nar">Something in the way the arcane moved tonight was different — looser,
               as if the rules holding it had stopped being enforced by anyone in particular.</p>`,
        ranger: `<p class="nar">The shot that should have been impossible landed. Not skill. The
                 world simply agreed with it, which is worse.</p>`,
        fighter: `<p class="nar">The chain came easier tonight, and kept coming, and did not want
                  to stop. That has never happened before.</p>`,
        tank: `<p class="nar">Nothing that hit the guard tonight hit as hard as the numbers said it
               should. The wall is holding better than the wall was built to hold.</p>`
      },
      next: 'c6_choir'
    },

    c6_choir: {
      scene: 'scene_breach',
      cast: [],
      title: 'Broken Choir',
      text: `<p class="nar">The seraph that comes out of the tear is missing most of one wing and
             is still singing. Yuji is already moving before anyone has decided anything.</p>`,
      battle: 'c6_choir',
      onWin: 'c6_seal_talk'
    },

    c6_seal_talk: {
      scene: 'scene_spire',
      cast: [],
      title: 'What the seals were for',
      text: `<p class="nar">Chizuru puts the last pin in and steps back so everyone can see the
             shape of it, and the shape of it is a circle, and the spire is not at the centre.</p>
             <p>"Five seals," she says. "You broke four getting to the Warden. The Warden was the
             fifth."</p>
             <p>"They weren't locks," Kazuma says from the back, arms folded. "Were they."</p>
             <p>"No. They were stitches."</p>
             <p class="nar">Nobody says anything for a while. Airi writes it down.</p>`,
      sets: 'c6_stitches',
      next: 'c6_pair_fight'
    },

    c6_pair_fight: {
      scene: 'scene_breach',
      cast: [],
      title: 'Sealed Pair',
      text: `<p class="nar">Two of the things you killed to get here are standing in the gap
             together, and neither of them is bothering to guard anything any more.</p>`,
      battle: 'c6_pair',
      onWin: 'c6_gate_talk'
    },

    c6_gate_talk: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      title: 'The Gate',
      text: {
        kirito: `<p class="nar">There is a door in the Breach. Not a metaphor — an actual doorway,
                 standing on nothing, with something on the other side that is not the Nexus.</p>
                 <p>"That's the exit," Masha says.</p>
                 <p>"That's <i>an</i> exit."</p>
                 <p>"Kirito."</p>
                 <p>"I know." He does not look away from it. "I know what it is. I'm asking what it
                 costs, because everything in here costs, and nobody has told us the price of that
                 one yet."</p>`,
        masha:  `<p class="nar">There is a door standing in the middle of the tear, on nothing, and
                 through it Masha can see something that is not this world.</p>
                 <p>"That's the exit," she says.</p>
                 <p>"That's an exit," Kirito says.</p>
                 <p class="nar">She wants to argue. She has wanted this door for six months. What
                 stops her is that he is not being careful — he is being frightened, and she has
                 seen him frightened exactly twice before, and both times he was right.</p>`
      },
      next: 'c6_gate_fight'
    },

    c6_gate_fight: {
      scene: 'scene_breach',
      cast: [],
      title: 'THE GATE',
      text: `<p class="nar">Something has been standing guard on the near side of the door the whole
             time, patient as furniture, waiting to find out whether anyone would actually try.</p>`,
      battle: 'c6_gate',
      onWin: 'c6_lock_intro'
    },

    c6_lock_intro: {
      scene: 'scene_breach',
      cast: [],
      title: 'Who goes with you',
      text: `<p class="nar">The door does not close. It has no intention of closing. Chizuru's
             estimate is nine days before the Breach reaches the spawn hall, and her estimates have
             not been wrong yet.</p>
             <p class="nar">Two hundred and six people cannot go through a door that leads somewhere
             nobody has surveyed. Someone has to go first, and someone has to go with them, and it
             is going to be a small number.</p>
             <p class="nar">Everyone in the room has already decided. They are waiting to be asked.</p>`,
      next: 'c6_lock'
    },

    /* ============================================================
       THE ROUTE LOCK

       Seven options: the six newcomers, and staying with the
       partner you have had since chapter 1. That last one is not a
       "no romance" option — it is the seventh route, and the
       chapters after this treat it as one.
       ============================================================ */

    c6_lock: {
      scene: 'scene_breach',
      cast: [],
      title: 'Nine days',
      text: `<p class="nar">So: who walks through first.</p>`,
      choices: [
        { text: 'Kazuma. He has been through a door before.',
          route: 'kazuma', trust: 1, goto: 'c6_lock_kazuma' },
        { text: 'Yuji. Whatever is under his sleeve answers to that thing.',
          route: 'yuji', trust: 1, goto: 'c6_lock_yuji' },
        { text: 'Uzui. Sixty people eat because of him. He can carry the rest.',
          route: 'uzui', trust: 1, goto: 'c6_lock_uzui' },
        { text: 'Chizuru. She has the only map that matters.',
          route: 'chizuru', trust: 1, goto: 'c6_lock_chizuru' },
        { text: 'Airi. She remembers worlds that stopped existing.',
          route: 'airi', trust: 1, goto: 'c6_lock_airi' },
        { text: 'Mati. She has never finished. She will not stop.',
          route: 'matikane', trust: 1, goto: 'c6_lock_matikane' },
        { text: 'Neither. You go with the person you arrived with.',
          route: 'partner', trust: 2, goto: 'c6_lock_partner' }
      ]
    },

    c6_lock_kazuma: {
      scene: 'scene_breach', cast: [],
      text: `<p class="nar">Kazuma looks at the door for a long moment.</p>
             <p>"You know I walked away from one of these."</p>
             <p>"I know."</p>
             <p>"Right." He picks up his coat. "Then you know I'm the only one here who's found out
             what's on the other side of a door like that and decided to come back and tell people."
             A beat. "That's not a boast. That's a warning about my judgement."</p>`,
      next: 'c6_close'
    },

    c6_lock_yuji: {
      scene: 'scene_breach', cast: [],
      text: `<p class="nar">Yuji pushes his sleeve up before anyone asks him to, which is the first
             time he has done that.</p>
             <p class="nar">The light under his skin is the same colour as the door.</p>
             <p>"I was going anyway," he says, apologetically, as though volunteering to die were a
             social imposition. "I'd just rather not go alone."</p>`,
      next: 'c6_close'
    },

    c6_lock_uzui: {
      scene: 'scene_breach', cast: [],
      text: `<p>"OBVIOUSLY," Uzui says, at a volume that makes two people flinch.</p>
             <p class="nar">Then he crouches down to eye level with the smallest person in the room,
             says something to her too quietly for anyone else to hear, and waits until she nods
             before he stands up again.</p>
             <p>"Right," he says, at normal volume. "Let's go be magnificent."</p>`,
      next: 'c6_close'
    },

    c6_lock_chizuru: {
      scene: 'scene_breach', cast: [],
      text: `<p class="nar">Chizuru is already rolling the map.</p>
             <p>"I assumed," she says, "and I have been assuming for four days, and I packed
             accordingly, and if you had chosen someone else I would have gone anyway and simply
             not told you." She tucks the map under her arm. "I would like that on the record before
             we start being polite to each other."</p>`,
      next: 'c6_close'
    },

    c6_lock_airi: {
      scene: 'scene_breach', cast: [],
      text: `<p class="nar">Airi closes the notebook.</p>
             <p>"In two of them, you asked me this," she says. "In one, I said no."</p>
             <p class="nar">She waits, to see whether that will be asked about. It is not.</p>
             <p>"Good," she says quietly, and stands up.</p>`,
      next: 'c6_close'
    },

    c6_lock_matikane: {
      scene: 'scene_breach', cast: [],
      text: `<p>"YES."</p>
             <p class="nar">She is through the first three steps before the word has finished, and
             has to come back, and does not appear remotely embarrassed about it.</p>
             <p>"Sorry. Sorry. I've been waiting eleven weeks for someone to say a distance to me
             instead of a reason not to go." She bounces once. "How far is it?"</p>
             <p>"Nobody knows."</p>
             <p>"PERFECT."</p>`,
      next: 'c6_close'
    },

    c6_lock_partner: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Kirito does not announce it. He simply stops considering the other
                 options, which for him is the same gesture.</p>
                 <p>"You didn't even look at them," Masha says.</p>
                 <p>"I looked."</p>
                 <p>"You looked for about a second."</p>
                 <p>"That was enough time." He shoulders his pack. "I've walked into four of these
                 with you and come out of four of these with you. I'm not going to start
                 experimenting on the fifth."</p>`,
        masha:  `<p class="nar">Masha does not bother with the ceremony of deciding.</p>
                 <p>"Us," she says. "Obviously us."</p>
                 <p>"You could take someone who's been through a door before."</p>
                 <p>"I could." She is already walking. "But then I'd spend the whole time on the
                 other side wondering where you were, and I'd be no use to anyone, and you'd have
                 been right about that too, and I'd never hear the end of it."</p>`
      },
      next: 'c6_close'
    },

    /* Chapter 7 is not written yet, so this is the end of the current
       content and it closes the way chapter 5 does — on a hook, not a
       resolution. When chapter 7 lands this becomes `goChapter: 7` and the
       hook text moves to the end of chapter 10. */
    c6_close: {
      branch: [
        { flag: 'c6_stitches', goto: 'c6_hook_stitches' }
      ],
      fallback: 'c6_hook_plain'
    },

    c6_hook_stitches: {
      hook: true,
      scene: 'scene_breach',
      cast: [],
      title: 'Nine days',
      text: `<p class="nar">Nine days. A door standing on nothing. A world on the other side that
             nobody has surveyed.</p>
             <p class="nar">And the thing Chizuru said, which nobody has been able to put down since:
             they were not locks. They were <i>stitches</i>. Five of them, holding something closed
             that was never a door in the first place.</p>
             <p class="nar">You cut every one of them yourself. You were told you were escaping.</p>
             <p class="nar">You go through anyway. There are two hundred and six people behind you
             and nine days, and being right about the danger has never once been the same thing as
             having a choice.</p>`
    },

    c6_hook_plain: {
      hook: true,
      scene: 'scene_breach',
      cast: [],
      title: 'Nine days',
      text: `<p class="nar">Nine days. A door standing on nothing. A world on the other side that
             nobody has surveyed.</p>
             <p class="nar">Two hundred and six people behind you, and a tear in the sky that is
             getting wider at a rate somebody has already written down.</p>
             <p class="nar">You go through.</p>`
    }
  }
};
