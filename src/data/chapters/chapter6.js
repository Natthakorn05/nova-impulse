/* ============================================================
   chapter6.js — "THE OPEN DOOR"

   The hinge. The Warden is dead, nothing has closed, and the
   Breach opens four days later.

   WHAT CHANGED, AND WHY
   ---------------------
   This chapter used to introduce all six romance characters as
   strangers and then end on a lock that chose between them. That
   only worked if chapters 1-5 had never mentioned them — which is
   exactly the problem, because it made six of the seven leads
   appear from nowhere in the second half and instantly matter.

   The route is now chosen at registration and carried by every
   chapter (see routes.js). So the seven are people the settlement
   has had all along, and this chapter can do the thing the lock
   was pretending to do: put all of them in one room, under a
   deadline, and let the player watch their own person behave
   differently from the other six.

   `sets: 'c6_stitches'` is read by c6_close and again in
   chapter 8, where what the seals actually were stops being a
   theory.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter6 = {
  id: 6,
  title: 'THE OPEN DOOR',
  subtitle: 'The Warden is gone. Nothing has closed. The sky has started to.',
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
             <p class="nar">It does not come. What comes instead, four days later, is the Breach — a
             tear across the sky above the Nexus that does not spawn anything new, only more, and
             more, and more of what you have already killed.</p>`,
      next: 'c6_survivors'
    },

    c6_survivors: {
      scene: 'scene_nexus',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The spawn hall fills up. That is the part nobody predicted — kill the
                 thing that trapped everyone, and everyone comes out of hiding.</p>
                 <p>"Two hundred and six," Masha says, coming back down the steps. "That we can count.
                 There were eleven thousand at launch."</p>
                 <p>"Some of them are still hiding."</p>
                 <p>"Some of them are." She sits down next to him, hard. "Say the rest."</p>
                 <p class="nar">He doesn't. She already knows the rest; she wanted to see whether he
                 would make her carry it alone.</p>`,
        masha:  `<p class="nar">Two hundred and six people, in a hall built for eleven thousand. Masha
                 counted them herself, twice, because the first number seemed like a mistake.</p>
                 <p>"Some are still hiding," Kirito says, before she can say it.</p>
                 <p>"And the rest?"</p>
                 <p class="nar">He looks at her the way he does when he has already run the numbers and
                 would rather not read them out. She lets him not say it. It is the closest thing to a
                 kindness available in a room this size.</p>`
      },
      next: 'c6_council'
    },

    /* --- The seven, in one room, on the record. Deliberately not
       introductions: these are people the settlement has had since the
       first month, and the scene works by contrast rather than exposition. --- */

    c6_council: {
      scene: 'scene_town',
      cast: [],
      title: 'What two hundred and six people do next',
      text: `<p class="nar">There is a table, because Uzui built one, and there are seven people at it,
             because those are the seven who came when it was carried into the hall.</p>
             <p>"We hold the spawn hall," says Chizuru, without preamble. "It is defensible, it is
             mapped, and I can tell you to the day when that stops being true."</p>
             <p>"Then say the day," says Kazuma.</p>
             <p>"Nine."</p>
             <p class="nar">Nobody says anything for a moment.</p>
             <p>"Then we go and find the edge," says Mati, who has been on her feet the whole time.</p>
             <p>"We go and find the edge <i>with soup,</i>" Uzui corrects, "and lanterns, and about
             forty people who can carry a stretcher, and I want that written down before anyone gets
             heroic."</p>
             <p class="nar">Airi is already writing it down.</p>
             <p>"I'll go first," Yuji says, into the pause, in the tone other people use to volunteer
             for washing up.</p>`,
      next: 'c6_first_fight'
    },

    c6_first_fight: {
      scene: 'scene_breach',
      cast: [],
      title: 'The Leak',
      text: `<p class="nar">The Breach does not send anything new. That is the part that unsettles
             Chizuru, and once she says it out loud it unsettles everyone: new would mean design.
             More just means the seal is failing.</p>`,
      battle: 'c6_leak',
      onWin: 'c6_after_first',
      onLose: 'c6_after_first'
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
        mage: `<p class="nar">Something in the way the arcane moved tonight was different — looser, as
               if the rules holding it had stopped being enforced by anyone in particular.</p>`,
        ranger: `<p class="nar">The shot that should have been impossible landed. Not skill. The world
                 simply agreed with it, which is worse.</p>`,
        fighter: `<p class="nar">The chain came easier tonight, and kept coming, and did not want to
                  stop. That has never happened before.</p>`,
        tank: `<p class="nar">Nothing that hit the guard tonight hit as hard as the numbers said it
               should. The wall is holding better than the wall was built to hold.</p>`
      },
      next: 'c6_choir'
    },

    c6_choir: {
      scene: 'scene_breach',
      cast: [],
      title: 'Broken Choir',
      text: `<p class="nar">The seraph that comes out of the tear is missing most of one wing and is
             still singing. Yuji is already moving before anyone has decided anything.</p>`,
      battle: 'c6_choir',
      onWin: 'c6_seal_talk',
      onLose: 'c6_seal_talk'
    },

    c6_seal_talk: {
      scene: 'scene_spire',
      cast: [],
      title: 'What the seals were for',
      text: `<p class="nar">Chizuru puts the last pin in and steps back so everyone can see the shape
             of it, and the shape of it is a circle, and the spire is not at the centre.</p>
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
      text: `<p class="nar">Two of the things you killed to get here are standing in the gap together,
             and neither of them is bothering to guard anything any more.</p>`,
      battle: 'c6_pair',
      /* Hands off to the route beat, which returns to c6_gate_talk. */
      onWin: 'rt6_hub',
      onLose: 'rt6_hub'
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
                 <p class="nar">She wants to argue. She has wanted this door for six months. What stops
                 her is that he is not being careful — he is being frightened, and she has seen him
                 frightened exactly twice before, and both times he was right.</p>`
      },
      next: 'c6_who_goes'
    },

    c6_who_goes: {
      scene: 'scene_breach',
      cast: [],
      title: 'Nine days',
      text: `<p class="nar">Two hundred and six people cannot go through a door that leads somewhere
             nobody has surveyed. A small number goes first, and finds out, and comes back — or
             does not, and that is information too.</p>
             <p class="nar">Everyone in the hall has already decided. They are waiting to be asked.</p>`,
      choices: [
        { text: 'Take everyone who volunteers. Numbers are the only advantage we have.',
          tag: 'ALL IN', sets: 'c6_all_in', trust: 1, goto: 'c6_gate_fight' },
        { text: 'Small party. Fast, and small enough that failing does not cost the hall.',
          tag: 'SMALL', sets: 'c6_small', trust: 1, goto: 'c6_gate_fight' },
        { text: 'Nine days is nine days. Fortify the hall first, then go.',
          tag: 'FORTIFY', sets: 'c6_fortify', trust: 2, goto: 'c6_gate_fight' }
      ]
    },

    c6_gate_fight: {
      scene: 'scene_breach',
      cast: [],
      title: 'THE GATE',
      text: `<p class="nar">Something has been standing guard on the near side of the door the whole
             time, patient as furniture, waiting to find out whether anyone would actually try.</p>`,
      battle: 'c6_gate',
      onWin: 'c6_close',
      onLose: 'c6_close'
    },

    c6_close: {
      branch: [
        { flag: 'c6_stitches', goto: 'c6_close_stitches' }
      ],
      fallback: 'c6_close_plain'
    },

    c6_close_stitches: {
      scene: 'scene_breach',
      cast: [],
      title: 'Through',
      text: `<p class="nar">Nine days. A door standing on nothing. A world on the other side that
             nobody has surveyed.</p>
             <p class="nar">And the thing Chizuru said, which nobody has been able to put down since:
             they were not locks. They were <i>stitches</i>. Five of them, holding something closed
             that was never a door in the first place.</p>
             <p class="nar">You cut every one of them yourself. You were told you were escaping.</p>
             <p class="nar">You go through anyway. There are two hundred and six people behind you and
             nine days, and being right about the danger has never once been the same thing as having
             a choice.</p>`,
      goChapter: 7
    },

    c6_close_plain: {
      scene: 'scene_breach',
      cast: [],
      title: 'Through',
      text: `<p class="nar">Nine days. A door standing on nothing. A world on the other side that
             nobody has surveyed.</p>
             <p class="nar">Two hundred and six people behind you, and a tear in the sky that is
             getting wider at a rate somebody has already written down.</p>
             <p class="nar">You go through.</p>`,
      goChapter: 7
    }
  }
};
