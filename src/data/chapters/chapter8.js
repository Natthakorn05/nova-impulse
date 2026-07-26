/* ============================================================
   chapter8.js — "A HUNDRED AND ELEVEN"

   The chapter that gives the game its title. Nova Impulse is not
   the name of a world, it is the name of an attempt, and there
   have been a hundred and eleven of them.

   Everything the first act set up as a character quirk is
   mechanism here: Airi remembers because her wipe failed, Yuji
   glows because he was a design document before he was a person,
   Chizuru's four hundred unresolved discrepancies are the drift
   between iterations, Mati's file says DID NOT FINISH a hundred
   and eleven times, and Kazuma reached the hatch in eighty-four
   of them.

   Reads: c6_stitches (what the seals were).
   Sets:  c8_read_self — whether you read your own record.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter8 = {
  id: 8,
  title: 'A HUNDRED AND ELEVEN',
  subtitle: 'You have done this before. You were better at it last time.',
  start: 'c8_open',

  beats: {

    c8_open: {
      scene: 'scene_spire',
      cast: [],
      title: 'The archive',
      text: `<p class="nar">The shelving runs back further than the building is wide, which everybody
             notices and nobody mentions, because there is a more urgent problem at the front of the
             room.</p>
             <p class="nar">The front of the room is a wall of dates.</p>
             <p class="nar">They start four years ago. They are not version numbers for a game that
             was patched a hundred and eleven times. Each one is a <i>run</i> — a complete pass, world
             created, accounts seeded, forty thousand people, ending.</p>
             <p class="nar">The most recent entry is dated eleven months ago and is not finished.</p>
             <span class="sysmsg">ITERATION 111 — IN PROGRESS</span>`,
      next: 'c8_stitchcheck'
    },

    c8_stitchcheck: {
      branch: [
        { flag: 'c6_stitches', goto: 'c8_stitch_known' }
      ],
      fallback: 'c8_stitch_new'
    },

    c8_stitch_known: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">Chizuru finds the seal specification in under four minutes, because she has
             been looking for it for eleven weeks and knew what shape it would be.</p>
             <p>"Stitches," she says. "I said stitches. I was being metaphorical." She turns the page
             round. "It is the engineering term. They are load-bearing. Five of them holding the seam
             between a live world and a staging world shut, because the two were never meant to touch
             and a hundred and eleven runs of proof say what happens when they do."</p>
             <p>"And we cut all five."</p>
             <p>"You cut all five," she agrees, "having been told, by an administrator, that they were
             locks. I would like to know who wrote that string."</p>`,
      next: 'c8_fight1'
    },

    c8_stitch_new: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">Chizuru finds the seal specification in under four minutes and goes
             completely quiet, which from her is a shout.</p>
             <p>"They were not locks," she says. "They were structural. Five of them, holding the seam
             between a live world and a staging world shut." She sets the page down. "The Warden told
             you they were locks. The Warden was not lying either; it is reading from the same string
             we are. Somebody wrote that string four years ago and everything since has been
             downstream of it."</p>`,
      next: 'c8_fight1'
    },

    c8_fight1: {
      scene: 'scene_spire',
      cast: [],
      title: 'Iteration Echo',
      text: `<p class="nar">The thing that comes down the stacks is made of dark violet glass and moves
             like a duellist, and etched glowing across its chest is a number.</p>
             <p class="nar">The number is 107.</p>`,
      battle: 'c8_echo',
      onWin: 'c8_after1',
      onLose: 'c8_after1'
    },

    c8_after1: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">It knew the opening. That is what nobody wants to say on the way back down
             the stack, so Mati says it, because Mati says things.</p>
             <p>"It knew what we were going to do."</p>
             <p>"It knew what a party of our shape <i>has always done,</i>" Chizuru says. "A hundred
             and six times. We are not being read. We are being remembered."</p>
             <p class="nar">Kazuma laughs, once, with no humour in it at all.</p>
             <p>"So we're the predictable ones," he says. "Great. I've spent six months being told I'm
             difficult."</p>`,
      mateNote: {
        mage: `<p class="nar">{mate} does not put the staff down for the rest of the descent. Something
               about a thing that already knew which spell was coming has taken the pleasure out of
               having options.</p>`,
        ranger: `<p class="nar">{mate} spends the walk back counting sight lines that are already
                 counted, on a stair that has been walked a hundred and six times, and knows it, and
                 does it anyway.</p>`,
        fighter: `<p class="nar">{mate} keeps replaying the third strike. It landed. It landed exactly
                  as hard as it should have, into a guard that was already there for it.</p>`,
        tank: `<p class="nar">{mate} stayed in front the whole fight, and the thing came around, every
               time, without hesitating — as though it had learned that this particular wall can be
               walked around by somebody who has done it before.</p>`
      },
      next: 'c8_names'
    },

    c8_names: {
      scene: 'scene_spire',
      cast: [],
      title: 'Everyone is in it',
      text: `<p class="nar">The account records are the largest part of the archive, and they are
             searchable, and by the third hour everyone has found themselves.</p>
             <p class="nar">Airi is account 0031. WIPE FAILED (3 ATTEMPTS). FLAGGED FOR MANUAL. NEVER
             ACTIONED. She has read it eleven times and has not moved.</p>
             <p class="nar">Mati is 0409, and in every iteration the same automated three words: DID
             NOT FINISH.</p>
             <p class="nar">Kazuma reached the hatch in eighty-four runs and came back in nine.</p>
             <p class="nar">Uzui's safe house is in ninety-three of them. In the other eighteen there
             is a note about the food running out in week two.</p>
             <p class="nar">Yuji's record is not an account at all. It is filed under ASSET, and in the
             first eleven iterations it sits under a heading that reads WHO THE GAME IS ABOUT.</p>`,
      next: 'c8_choice_self'
    },

    c8_choice_self: {
      scene: 'scene_spire',
      cast: [],
      title: 'Your own file',
      text: `<p class="nar">Yours is on the shelf too. It is thicker than most.</p>`,
      choices: [
        { text: 'Read it. All hundred and eleven entries.',
          tag: 'READ', sets: 'c8_read_self', trust: 1, goto: 'c8_read' },
        { text: 'Read only the last one. What this run has done so far.',
          tag: 'LAST ONLY', sets: 'c8_read_last', trust: 1, goto: 'c8_read_last_b' },
        { text: 'Put it back. Whoever those were, they are not the one standing here.',
          tag: 'LEAVE IT', sets: 'c8_left_file', trust: 2, goto: 'c8_leave' }
      ]
    },

    c8_read: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">A hundred and eleven of you.</p>
             <p class="nar">Forty-two got as far as the spire. Nineteen got through the door. Six
             reached this archive and read this shelf, and there is a note against each of those six,
             appended later, by the system, in the flat tone of a process recording an outcome.</p>
             <p class="nar">DID NOT PROCEED.</p>
             <p class="nar">Six times somebody with your name stood exactly here, learned exactly this,
             and stopped.</p>
             <p class="nar">You can see why. It is on the shelf. It is on the next shelf too.</p>`,
      next: 'rt8_hub'
    },

    c8_read_last_b: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">Iteration 111. Eleven months. Your account, seeded on day one, with the
             same class you picked and the same partner assigned by the same randomiser.</p>
             <p class="nar">And then, from about the fourth month, the entries stop matching the
             pattern in the hundred and ten files behind it. Small things. A field cleared in the wrong
             order. A person kept alive who is not usually kept alive. A choice at a fountain that
             nobody has made before.</p>
             <p class="nar">There is a flag against this run that is not on any of the others. It reads
             DIVERGENT.</p>`,
      next: 'rt8_hub'
    },

    c8_leave: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">You put it back on the shelf.</p>
             <p class="nar">Airi watches you do it and does not say anything for a moment, which from
             her is a considerable statement.</p>
             <p>"I could not do that," she says finally. "I want you to know that I noticed, and that I
             have written it down, and that it is the only entry in eleven months where somebody chose
             not to know something."</p>
             <p class="nar">She closes the notebook.</p>
             <p>"A hundred and ten of them read it," she says. "I have checked."</p>`,
      next: 'rt8_hub'
    },

    c8_mirror_intro: {
      scene: 'scene_spire',
      cast: [],
      title: 'Two of you',
      text: `<p class="nar">They come down the stack together, and this time there are two, and the
             numbers on their chests are 109 and 110.</p>
             <p class="nar">They move exactly like each other. That is the horrible part. They move
             exactly like each other and one of them is left-handed, and so is Masha, and nobody says
             anything about that at all.</p>`,
      battle: 'c8_pair',
      onWin: 'c8_after2',
      onLose: 'c8_after2'
    },

    c8_after2: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Afterwards Kirito sits on the archive floor with his back to a shelf and
                 does the thing he does, which is arithmetic, out loud, because there is nowhere else
                 to put it.</p>
                 <p>"A hundred and nine of the runs log us adjacent," he says. "Adjacent is the
                 system's word for a pair. It's an operational flag. It means the scheduler expected
                 us to be in the same place."</p>
                 <p>"That's not romantic, Kirito."</p>
                 <p>"No." He looks up at her. "It's better than romantic. It's <i>load-bearing.</i>
                 A hundred and nine times, the thing that ran this world assumed you'd be where I
                 was, and it was right, and it built around it."</p>`,
        masha:  `<p class="nar">Masha finds him on the archive floor doing arithmetic at a shelf, which
                 is his version of falling apart.</p>
                 <p>"A hundred and nine of them log us adjacent," he says. "It's a scheduler flag. It
                 means the system expected us in the same place."</p>
                 <p>"And the other two?"</p>
                 <p class="nar">He does not answer. She reads it over his shoulder, because she always
                 does and he has never once actually stopped her, and in two of the hundred and eleven
                 her record ends four months early.</p>
                 <p>"Huh," she says, and sits down on the floor, and is not fine, and says so, because
                 that is what she does.</p>`
      },
      next: 'c8_why'
    },

    c8_why: {
      scene: 'scene_spire',
      cast: [],
      title: 'Why it keeps happening',
      text: `<p class="nar">It is Airi who finds the reason, at four in the morning, eleven shelves in,
             in a document that is not hidden and has simply never been read.</p>
             <p>"They are not testing us," she says. "They are testing <i>the ending.</i>"</p>
             <p class="nar">She turns it round.</p>
             <p class="nar">A hundred and eleven attempts to finish a game. Each one seeded from the
             last, run at full scale with real people, watched to the point where it fails — and every
             single one fails in the same place, which is the last ten per cent, which is the part
             nobody ever built.</p>
             <p>"They kept starting it over," Kazuma says slowly, "because they couldn't finish it."</p>
             <p>"Yes."</p>
             <p>"With people in it."</p>
             <p>"Yes," Airi says. "That is the part I have been trying to make sound like an accident
             for twenty minutes, and I cannot."</p>`,
      next: 'c8_fight3'
    },

    c8_fight3: {
      scene: 'scene_spire',
      cast: [],
      title: 'Archived Attempt',
      text: `<p class="nar">The archive has stopped being a room you are reading in and started being
             a room that is responding. Things are coming down off the shelves — a duellist with a
             number on its chest, and a grey unfinished walker that was never given a face because it
             belonged to a run that ended before anyone got to it.</p>`,
      battle: 'c8_archive',
      onWin: 'c8_before_boss',
      onLose: 'c8_before_boss'
    },

    c8_before_boss: {
      scene: 'scene_spire',
      cast: [],
      title: 'The one that got furthest',
      text: `<p class="nar">At the back of the archive, where the shelving finally stops, there is a
             figure standing in cracked white and gold ceremonial plate, and it has been standing there
             for a very long time.</p>
             <p class="nar">The number on it is 96.</p>
             <p class="nar">Ninety-six got further than any other run. Ninety-six reached the core.
             Ninety-six is why there is a hundred and eleven, and it has been archived standing up,
             holding a broken banner, in the position it was in when somebody decided that attempt was
             over.</p>
             <p class="nar">It lifts its head.</p>
             <span class="sysmsg">PRIOR BUILD — RESTORED. YOU ARE LATE.</span>`,
      battle: 'c8_prior',
      onWin: 'c8_win',
      onLose: 'c8_lose'
    },

    c8_win: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">It goes down the way something goes down when it has been standing for
             fifteen years, and the faceplate cracks, and behind the static there is nothing at all —
             not a person, not a face, not even a placeholder. Just the shape a person would go in.</p>
             <p class="nar">The broken banner falls last.</p>
             <p>"It said we were late," Mati says. "It was <i>waiting.</i> For fifteen years, it was —"</p>
             <p>"For us specifically," Airi says. "Run one hundred and eleven is flagged DIVERGENT. It
             is the only one that is." She is writing very fast. "Ninety-six did not lose to the core.
             Ninety-six was <i>stopped,</i> and then left where it stood, in case somebody came who was
             doing something new."</p>`,
      next: 'c8_close'
    },

    c8_lose: {
      scene: 'scene_spire',
      cast: [],
      speaker: 'system',
      text: `<span class="sysmsg">HP CRITICAL. EMERGENCY RESPAWN ENGAGED.</span>
             <p class="nar">You come back on the archive floor, whole, eleven metres from where you
             fell, and the thing in the cracked plate has not moved to follow.</p>
             <p class="nar">It is watching. It has all the time in the world and it knows it, and it
             has been in this room for fifteen years learning that nobody who gets this far gets
             through on the first attempt.</p>
             <span class="sysmsg">RECORDED. YOU ARE STILL LATE.</span>
             <p class="nar">Airi writes down the exact wording. It is the first thing in this archive
             that has spoken to you as though it expected you back.</p>`,
      next: 'c8_close'
    },

    c8_close: {
      scene: 'scene_spire',
      cast: [],
      title: 'The last shelf',
      text: `<p class="nar">On the last shelf, past everything, there is one document that is not a
             changelog and not an account record.</p>
             <p class="nar">It is a staff list. Eleven names, a studio address, and a date four years
             ago against a line that reads FINAL BUILD — TARGET.</p>
             <p class="nar">And under it, in the same hand, dated three weeks later:</p>
             <p class="nar">WE ARE NOT GOING TO MAKE IT. PROPOSAL ATTACHED.</p>
             <p class="nar">The proposal is eleven pages long. The first line of it is a question about
             whether a sufficiently detailed model of a person could be trusted to finish the work
             their original could not.</p>
             <p class="nar">Nobody speaks. Somewhere below the archive, something very large begins,
             unhurried, to come online.</p>`,
      goChapter: 9
    }
  }
};
