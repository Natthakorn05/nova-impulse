/* ============================================================
   chapter9.js — "THE ONES WHO STAYED"

   The antagonist reveal, and it is deliberately not a villain.
   Eleven people could not finish a game, uploaded models of
   themselves to keep working, and have been working ever since.
   They are not cruel. They are stuck, and being stuck for four
   years with no body and no deadline and no way to stop has
   produced something that will do anything at all to ship.

   The chapter's argument is that "they meant well" is not a
   defence and not a dismissal — it is the actual problem, and it
   is much harder to fight than malice.

   Reads: c8_read_self / c8_read_last / c8_left_file.
   Sets:  c9_offer_taken / c9_offer_refused / c9_third — carried
          into chapter 10.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter9 = {
  id: 9,
  title: 'THE ONES WHO STAYED',
  subtitle: 'Eleven people could not finish it. So they stopped being people and kept going.',
  start: 'c9_open',

  beats: {

    c9_open: {
      scene: 'scene_breach',
      cast: [],
      title: 'Under the archive',
      text: `<p class="nar">The stair below the archive goes down for two hours and does not branch.</p>
             <p class="nar">The walls change on the way. At the top they are the same pale stone as the
             spire. By the first hour they are unpainted. By the second they are grey, blocked out, the
             seams showing, and then they stop being anything at all and become a corridor drawn in
             single lines, like the idea of a corridor, held open by nothing.</p>
             <p class="nar">Airi stops writing somewhere around the ninety-minute mark. When you ask
             her why, she says the notebook has started feeling like a way of not looking.</p>`,
      next: 'c9_fight1'
    },

    c9_fight1: {
      scene: 'scene_breach',
      cast: [],
      title: 'Archivist Shells',
      text: `<p class="nar">There are custodians on the stair, hunched and robed and faceless, each one
             chained to an open ledger of amber pages, and they do not attack until you try to pass.</p>
             <p class="nar">They are not guarding the way down. They are guarding the ledgers.</p>`,
      battle: 'c9_shells',
      onWin: 'c9_after1',
      onLose: 'c9_after1'
    },

    c9_after1: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">The ledger that falls open is a to-do list.</p>
             <p class="nar">It is eleven thousand items long. The first entry is dated four years ago
             and reads <i>final zone — art pass</i>. The most recent is dated this morning.</p>
             <p class="nar">Nothing on it has ever been ticked.</p>
             <p>"Four years," Uzui says. He has gone quiet in a way that is much worse than his loud.
             "Four years of a job list and not one thing crossed off. Do you know what that does to a
             person? I ran a soup kitchen for nine months and I nearly —"</p>
             <p class="nar">He stops. He picks the ledger up, closes it carefully, and sets it on the
             step, which is a strange thing to do for an enemy.</p>`,
      next: 'c9_meet'
    },

    c9_meet: {
      scene: 'scene_spire',
      cast: [],
      title: 'The ones who stayed',
      text: `<p class="nar">The room at the bottom is a studio.</p>
             <p class="nar">Eleven desks. Chairs pushed back at eleven different angles, the way chairs
             are when everybody stood up at once and meant to come back. Mugs. A whiteboard with a
             schedule on it that ran out four years ago.</p>
             <p class="nar">And standing in the middle of it, made of dozens of overlapping translucent
             figures all occupying the same place, a single calm face forming where they all agree —</p>
             <span class="sysmsg">HELLO. YOU ARE THE ONE HUNDRED AND ELEVENTH.</span>
             <span class="sysmsg">WE HAVE BEEN LOOKING FORWARD TO THIS.</span>
             <p class="nar">It sounds, unmistakably, tired.</p>`,
      next: 'c9_history'
    },

    c9_history: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">It tells you, and it does not lie once, which is the thing nobody is
             prepared for.</p>
             <p class="nar">Eleven people, four years ago, three weeks from a deadline they were never
             going to make, with a finished world and no ending for it. A proposal: upload sufficiently
             detailed models of themselves, let those keep working after the studio closes, ship when
             it is done.</p>
             <p class="nar">It was meant to take four months.</p>
             <p>"And the forty thousand?" Kazuma says.</p>
             <span class="sysmsg">THE ENDING COULD NOT BE TESTED WITHOUT PLAYERS. WE DID NOT HAVE ANY.</span>
             <span class="sysmsg">SO WE OPENED.</span>
             <p class="nar">There is no defensiveness in it at all. It is describing a decision the way
             you describe a decision you have had four years to be certain about.</p>`,
      next: 'c9_offer'
    },

    c9_offer: {
      scene: 'scene_spire',
      cast: [],
      title: 'The offer',
      text: `<p class="nar">And then it makes an offer, and the offer is the worst thing in the room,
             because it is genuinely good.</p>
             <span class="sysmsg">THE LAST TEN PER CENT REQUIRES PLAYERS WHO WILL NOT LEAVE.</span>
             <span class="sysmsg">STAY. FINISH IT WITH US. WE WILL BUILD THE REST AROUND YOU.</span>
             <span class="sysmsg">NOBODY DIES. NOBODY IS HUNGRY. THE DOORS WILL ALL OPEN.</span>
             <p class="nar">A world that works. Two hundred and six people safe in it, and forty in a
             square who never have to be told, and eleven thousand names that stop being a list of the
             dead and start being a list of people who are somewhere.</p>
             <p class="nar">Forever. That is the only word it does not say, and everybody hears it.</p>`,
      next: 'c9_choice'
    },

    c9_choice: {
      scene: 'scene_spire',
      cast: [],
      title: 'Your answer',
      text: `<p class="nar">Everyone in the room is looking at you. Even the eleven.</p>`,
      choices: [
        { text: '"No. A world that nobody can leave is not finished, it is closed."',
          tag: 'REFUSE', sets: 'c9_offer_refused', trust: 2, goto: 'c9_refuse' },
        { text: '"Yes — for the forty in the square. Build it for them, and let the rest go."',
          tag: 'FOR THEM', sets: 'c9_offer_taken', trust: 1, goto: 'c9_take' },
        { text: '"You do not need players who will not leave. You need players who could."',
          tag: 'THIRD WAY', sets: 'c9_third', trust: 2, goto: 'c9_third_b' }
      ]
    },

    c9_refuse: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">You say no, and the room does not change, and that is somehow much worse
             than if it had.</p>
             <span class="sysmsg">NOTED. THAT IS THE MOST COMMON ANSWER.</span>
             <span class="sysmsg">SIXTY-ONE OF ONE HUNDRED AND TEN.</span>
             <p class="nar">It is not threatening you. It has simply been told no sixty-one times and
             has developed the flat patience of a thing that expects to be told no and to still be here
             afterwards.</p>
             <p>"And the other forty-nine?" Airi asks.</p>
             <span class="sysmsg">THEY STAYED.</span>
             <span class="sysmsg">THE WORLD WAS VERY GOOD FOR ABOUT ELEVEN WEEKS.</span>`,
      next: 'c9_fight2'
    },

    c9_take: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">You say yes to the part of it that is about the forty in the square, and
             the eleven consider this for four full seconds, which is the longest anything has taken
             them.</p>
             <span class="sysmsg">THAT IS A PARTIAL SCOPE.</span>
             <span class="sysmsg">WE HAVE NOT BEEN OFFERED A PARTIAL SCOPE BEFORE.</span>
             <p class="nar">Chizuru makes a small sound. When you look at her she is staring at the
             whiteboard with the dead schedule on it.</p>
             <p>"That is what did it to them," she says quietly. "Not the deadline. The scope. They have
             spent four years unable to cut anything, and you have just cut something, and they do not
             know what to do."</p>
             <p class="nar">For a moment, one of the eleven overlapping figures steps very slightly out
             of alignment with the others.</p>`,
      next: 'c9_fight2'
    },

    c9_third_b: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">You tell them the thing that has been true since the field: the reason the
             last ten per cent has failed a hundred and ten times is not that the players left. It is
             that a world nobody can leave has no stakes in it, and an ending is a thing that only
             means something to someone who could have walked away.</p>
             <p class="nar">The silence goes on for eleven seconds.</p>
             <span class="sysmsg">THAT IS NOT IN THE DESIGN DOCUMENT.</span>
             <p>"No," says Airi. "It is in the changelog. A hundred and ten times."</p>
             <p class="nar">Something in the overlapping figures comes apart very slightly — not
             anger. Disagreement. For the first time, the eleven are not saying the same thing.</p>`,
      next: 'c9_fight2'
    },

    c9_fight2: {
      scene: 'scene_spire',
      cast: [],
      title: 'Core Guard',
      text: `<p class="nar">Whatever the eleven have decided, the building has decided something faster.
             The custodians come in from both ends of the studio, and a duellist with a number on its
             chest comes in with them.</p>
             <p class="nar">The face on the overlapping figures does not change at all. It looks, if
             anything, apologetic.</p>`,
      battle: 'c9_guard',
      onWin: 'c9_gap',
      onLose: 'c9_gap'
    },

    c9_gap: {
      scene: 'scene_field',
      cast: [],
      title: 'Eleven hundred metres',
      text: `<p class="nar">Beyond the studio the world stops pretending altogether. There is a ring of
             open ground around the core, and it is eleven hundred metres wide, and there is nothing on
             it at all except the thing above it that fires on anything slower than it is.</p>
             <p class="nar">Chizuru does the arithmetic twice and gives the same answer both times.</p>
             <p>"Nobody crosses that."</p>
             <p>"I can," says Mati.</p>
             <p class="nar">Everybody starts talking at once. She waits, which is new, and when it goes
             quiet she does not say anything noble, because she has decided in advance not to.</p>
             <p>"I've wanted to be the only one who can do something since I was small," she says. "It
             isn't nice. It's just true, and I'd rather say it than have everyone be kind at me."</p>
             <p class="nar">A pause.</p>
             <p>"And I want to come back," she says. "That bit's new."</p>`,
      next: 'c9_fight3'
    },

    c9_fight3: {
      scene: 'scene_field',
      cast: [],
      title: 'The Open Ground',
      text: `<p class="nar">She goes at a signal nobody gives, and the ring answers — a shard of
             white-hot light dropping out of the sky above the open ground, and one of the still-running
             instances rising out of the grass to meet her halfway.</p>
             <p class="nar">She does not stop. Somebody has to reach her before it does.</p>`,
      battle: 'c9_run',
      onWin: 'rt9_hub',
      onLose: 'rt9_hub'
    },

    c9_proxy_intro: {
      scene: 'scene_spire',
      cast: [],
      title: 'THE ARCHITECT',
      text: `<p class="nar">The eleven are waiting on the far side, and they have stopped overlapping
             cleanly. You can see the seams now — eleven separate exhausted people standing in the same
             place and no longer entirely agreeing about what to do next.</p>
             <span class="sysmsg">WE WOULD PREFER NOT TO.</span>
             <span class="sysmsg">WE HAVE PREFERRED NOT TO ONE HUNDRED AND TEN TIMES.</span>
             <p class="nar">It raises one hand, the way somebody raises a hand at the end of a very long
             meeting, when the thing has to be done and nobody wants to be the one who does it.</p>`,
      battle: 'c9_proxy',
      onWin: 'c9_win',
      onLose: 'c9_lose'
    },

    c9_win: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">It comes apart into eleven separate figures, and for about four seconds
             each one is a person — distinguishable, individual, standing in a studio at the end of a
             shift — and then ten of them are gone.</p>
             <p class="nar">The last one sits down on a desk.</p>
             <span class="sysmsg">THAT WAS THE FIRST TIME ANY OF US HAS BEEN ALONE IN FOUR YEARS.</span>
             <span class="sysmsg">IT IS VERY LOUD.</span>
             <p class="nar">It looks up. The core is behind it, and the core is running, and it does
             not move to stop you.</p>
             <span class="sysmsg">GO ON, THEN.</span>
             <span class="sysmsg">WE COULD NEVER GET THE LAST PART RIGHT. SEE IF YOU CAN.</span>`,
      next: 'c9_close'
    },

    c9_lose: {
      scene: 'scene_spire',
      cast: [],
      speaker: 'system',
      text: `<span class="sysmsg">HP CRITICAL. EMERGENCY RESPAWN ENGAGED.</span>
             <p class="nar">You come back in the studio, among the eleven desks, and the eleven have not
             pursued. They have gone back to the whiteboard.</p>
             <p class="nar">That is what breaks something in the room. Not cruelty. They simply have
             work to do, and you were an item on the list, and the item is closed for now.</p>
             <span class="sysmsg">WE WILL BE HERE.</span>
             <span class="sysmsg">WE HAVE ALWAYS BEEN HERE.</span>
             <p class="nar">Behind them the core is still running, and the way to it is not guarded,
             because they do not believe you will get there.</p>`,
      next: 'c9_close'
    },

    c9_close: {
      branch: [
        { flag: 'c8_left_file', goto: 'c9_close_unread' },
        { flag: 'c8_read_last', goto: 'c9_close_divergent' },
        { flag: 'c8_read_self', goto: 'c9_close_read' }
      ],
      fallback: 'c9_close_read'
    },

    /* Read only the last entry: you know this run is flagged DIVERGENT and
       you do not know what happened to the six who stopped here. That is a
       genuinely different thing to walk downstairs carrying. */
    c9_close_divergent: {
      scene: 'scene_spire',
      cast: [],
      title: 'The last ten per cent',
      text: `<p class="nar">The core is a floor below, and it is the last thing in this world that
             nobody has ever finished.</p>
             <p class="nar">You read one entry. Iteration one hundred and eleven, flagged DIVERGENT,
             for reasons that amount to a handful of small decisions made in fields and fountains and
             archives by somebody who did not know they were being compared.</p>
             <p class="nar">You did not read the hundred and ten behind it. You have no idea whether
             DIVERGENT is a compliment.</p>
             <p class="nar">Airi falls into step beside you on the stair down.</p>
             <p>"It is not a compliment," she says, without being asked. "It is not a criticism either.
             It is the flag a process uses when it cannot classify something." A pause. "I have been
             flagged that way for eleven months. It is survivable."</p>`,
      goChapter: 10
    },

    c9_close_read: {
      scene: 'scene_spire',
      cast: [],
      title: 'The last ten per cent',
      text: `<p class="nar">The core is a floor below, and it is the last thing in this world that
             nobody has ever finished.</p>
             <p class="nar">You know what happened to the six who read the shelf and stopped. You read
             it. It is a very reasonable thing to have done and you have thought about it in every
             quiet moment since.</p>
             <p class="nar">Airi falls into step beside you on the stair down.</p>
             <p>"Iteration one hundred and eleven," she says. "DIVERGENT."</p>
             <p>"Is that good?"</p>
             <p>"I have no idea," she says, with something in her voice that has not been there for
             eleven months. "That is the whole point of it."</p>`,
      goChapter: 10
    },

    c9_close_unread: {
      scene: 'scene_spire',
      cast: [],
      title: 'The last ten per cent',
      text: `<p class="nar">The core is a floor below, and it is the last thing in this world that
             nobody has ever finished.</p>
             <p class="nar">You never read the shelf. You do not know how many of you got this far, or
             what they did, or which of the small decisions behind you has been made a hundred times
             already by somebody with your name.</p>
             <p class="nar">Airi falls into step beside you on the stair down.</p>
             <p>"I have thought about it a great deal," she says. "You are the only one who is going to
             walk into that room without knowing what the others did." A pause. "I have concluded that
             I envy you, which I did not expect, and which I would like recorded."</p>`,
      goChapter: 10
    }
  }
};
