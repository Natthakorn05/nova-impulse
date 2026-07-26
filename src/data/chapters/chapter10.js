/* ============================================================
   chapter10.js — "NOVA IMPULSE"

   The title chapter, and deliberately NOT an ending — the brief
   has been "more chapters, no ending" since the first list. The
   loop breaks, the log-out prompt finally appears after ten
   chapters of everyone wanting exactly that, and the story stops
   on the moment nobody presses it.

   That is the cliff. Chapter 11 is where somebody does.

   Reads: c9_offer_refused / c9_offer_taken / c9_third (what you
          told the eleven), and c7_told (the forty in the square).
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter10 = {
  id: 10,
  title: 'NOVA IMPULSE',
  subtitle: 'It was never the name of a world. It was the name of the attempt.',
  start: 'c10_open',

  beats: {

    c10_open: {
      scene: 'scene_breach',
      cast: [],
      title: 'The last ten per cent',
      text: `<p class="nar">The core room is not finished and was never going to be. It is a cathedral
             of scaffolding around an engine of white and gold light, with cyan data falling off it
             like rain, and half the walls are single lines drawn in the air where a wall was going to
             go.</p>
             <p class="nar">It is, even like this, the most beautiful thing anyone has seen in eleven
             months. That is the part that makes Uzui swear quietly and take his hat off.</p>
             <p class="nar">Eleven people spent four years unable to stop working on this. Standing in
             it, that stops being a mystery.</p>`,
      next: 'c10_fight1'
    },

    c10_fight1: {
      scene: 'scene_breach',
      cast: [],
      title: 'Core Aspects',
      text: `<p class="nar">Pieces of it come loose as you cross the floor — hard shards of white light
             wrapped in orbiting rings, moving with the total indifference of something that is not
             defending anything and is simply part of a process that has not been told to stop.</p>`,
      battle: 'c10_aspects',
      onWin: 'c10_after1',
      onLose: 'c10_after1'
    },

    c10_after1: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">The shards do not despawn. They reassemble, slowly, over about a minute,
             out of nothing.</p>
             <p>"It's not spawning them," Chizuru says. "It is <i>shedding</i> them. That is a running
             process throwing off heat." She is writing on the back of her own map, which she has never
             done. "This does not need us. It has not needed anything for four years. It has simply
             been left on."</p>`,
      next: 'c10_cost'
    },

    c10_cost: {
      scene: 'scene_breach',
      cast: [],
      title: 'What it costs',
      text: `<p class="nar">Airi finds the shutdown condition on a panel that was never given a
             housing, and reads it twice, and then reads it out, because she does not edit.</p>
             <p>"The core cannot be stopped from outside," she says. "It can only be <i>finished.</i>
             The loop runs because the last ten per cent is incomplete. Complete it and it ends."</p>
             <p>"Complete it how? None of us are —"</p>
             <p>"That is the thing." She turns the panel round. "It does not want a designer. It has had
             eleven of those for four years. The condition is a full playthrough that reaches this room
             having done something none of the previous hundred and ten did."</p>
             <p class="nar">A pause.</p>
             <p>"We're the ending," Kazuma says. "That's it, isn't it. It never needed building. It
             needed <i>someone to do something new in it.</i>"</p>`,
      next: 'c10_reckoning'
    },

    c10_reckoning: {
      branch: [
        { flag: 'c9_third',          goto: 'c10_reck_third' },
        { flag: 'c9_offer_taken',    goto: 'c10_reck_taken' },
        { flag: 'c9_offer_refused',  goto: 'c10_reck_refused' }
      ],
      fallback: 'c10_reck_refused'
    },

    c10_reck_third: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">You told the eleven that an ending only means anything to somebody who
             could have walked away.</p>
             <p class="nar">The panel Airi is holding agrees with you. It has agreed with you for four
             years, in writing, in a document nobody ever opened, filed under the heading the whole
             studio stopped being able to look at.</p>
             <p>"They had it," Chizuru says. "They had the answer in week three and they could not cut
             the scope to reach it." She sets the map down. "I want everybody to understand that this
             is the most frightening thing in the building. They were not stupid. They were exactly as
             clever as us and they could not stop."</p>`,
      next: 'c10_fight2'
    },

    c10_reck_taken: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">You told the eleven to build it for the forty in the square and let the rest
             go, and somewhere below this floor, that is exactly what is happening: a small world, a
             good one, being finished properly for the first time in four years, at a scale eleven
             people can actually reach the end of.</p>
             <p>"Partial scope," Uzui says. He looks up at the falling light. "I ran a soup kitchen for
             nine months on partial scope. You feed sixty because sixty is what you have."</p>
             <p>"And the two hundred and six?"</p>
             <p>"Get a door." He rolls his shoulders. "Which is the bit we're standing in."</p>`,
      next: 'c10_fight2'
    },

    c10_reck_refused: {
      scene: 'scene_breach',
      cast: [],
      text: `<p class="nar">You told the eleven no, and sixty-one others told them no, and every one of
             those sixty-one is a name in a list on a shelf upstairs.</p>
             <p>"Sixty-two," Kazuma says. "That's us. Sixty-two nos and a hundred and ten reruns."</p>
             <p>"Then this one has to be different."</p>
             <p>"Yeah." He looks at the core. "That's the whole job. Not beating it. Being the run that
             didn't go the way the other hundred and ten went." A beat. "For what it's worth, I've read
             all eighty-four of my own, and not one of them had you in it."</p>`,
      next: 'c10_fight2'
    },

    c10_fight2: {
      scene: 'scene_breach',
      cast: [],
      title: 'Last Iteration',
      text: `<p class="nar">The thing in the cracked white and gold plate is standing between you and
             the core, and the banner in its hand is not broken any more.</p>
             <p class="nar">Ninety-six reached this room. Ninety-six got exactly this far and was
             stopped, and has spent fifteen years being restored to the position it was in when
             somebody decided its attempt was over.</p>
             <p class="nar">It does not say you are late this time.</p>`,
      battle: 'c10_last',
      onWin: 'c10_before',
      onLose: 'c10_before'
    },

    c10_before: {
      scene: 'scene_breach',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      title: 'Before',
      text: {
        kirito: `<p class="nar">There is a gap of about four minutes before the core notices, and
                 everybody spends it differently, and Kirito spends it doing arithmetic he does not
                 read out.</p>
                 <p>"Bad number?" Masha says.</p>
                 <p>"It's a number." He puts it away. "You're not a number. I stopped mixing the two
                 somewhere around the archive floor."</p>
                 <p class="nar">Behind them Uzui is hanging a lantern on a wall that is a single drawn
                 line with nothing behind it, on the grounds that if anyone is out there they should
                 be able to see us.</p>`,
        masha:  `<p class="nar">Four minutes before the core notices. Uzui spends his hanging a lantern
                 on a wall that is only a drawn line. Airi spends hers writing. Mati cannot sit down.</p>
                 <p class="nar">Kirito spends his running odds he does not say out loud, which after
                 eleven months Masha can read off the back of his neck.</p>
                 <p>"You're not going to tell me the number."</p>
                 <p>"No."</p>
                 <p>"Good," she says, and means it, and finds that she does — somewhere around the
                 fourth door she stopped caring what it was.</p>`
      },
      next: 'rt10_hub'
    },

    c10_final_intro: {
      scene: 'scene_breach',
      cast: [],
      title: 'NOVA IMPULSE',
      text: `<p class="nar">The core notices.</p>
             <p class="nar">Every ring around it stops at once, aligns, and begins to turn the other
             way, and the falling data reverses and goes up, and the room fills with a light that has
             no colour anybody can name.</p>
             <span class="sysmsg">ITERATION 111. FINAL ZONE. UNBUILT.</span>
             <span class="sysmsg">NO REFERENCE IMPLEMENTATION EXISTS FOR THIS ENCOUNTER.</span>
             <span class="sysmsg">GOOD LUCK.</span>
             <p class="nar">It is the first thing this world has ever said that was not in the script,
             because there is no script. That is what unbuilt means. Nobody has ever written down what
             happens next, including the eleven people who spent four years trying.</p>`,
      battle: 'c10_core',
      onWin: 'c10_win',
      onLose: 'c10_lose'
    },

    c10_lose: {
      scene: 'scene_breach',
      cast: [],
      speaker: 'system',
      text: `<span class="sysmsg">HP CRITICAL. EMERGENCY RESPAWN ENGAGED.</span>
             <p class="nar">You come back on the scaffolding, whole, with the light still going the
             wrong way, and the core has not moved to finish it.</p>
             <p class="nar">Upstairs, on a shelf, there are six entries against your name that read DID
             NOT PROCEED, and for about four seconds you understand all six of them completely.</p>
             <p class="nar">Then somebody puts a hand out, and the hand is attached to somebody who has
             been beside you since a field on the first day, and the four seconds end.</p>
             <span class="sysmsg">RECORDED. ITERATION 111 CONTINUES.</span>`,
      next: 'c10_win'
    },

    c10_win: {
      scene: 'scene_breach',
      cast: [],
      title: 'Unbuilt',
      text: `<p class="nar">It does not explode. Nothing here has ever done anything as simple as
             explode.</p>
             <p class="nar">The rings slow, and stop, and hang there — and then, one at a time, they
             begin to <i>finish.</i> The scaffolding fills in. The drawn lines become walls. The wall
             Uzui hung a lantern on grows a surface behind it, and the lantern stays exactly where he
             put it, on a real wall, in a room that now exists.</p>
             <p class="nar">It spreads outward from the core at walking pace, and it does not stop at
             the studio, and it does not stop at the stair.</p>
             <p>"It's completing," Airi says. She is not writing. "We did something none of the hundred
             and ten did and it is <i>completing.</i>"</p>`,
      next: 'c10_forty'
    },

    c10_forty: {
      branch: [
        { flag: 'c7_told',   goto: 'c10_forty_told' },
        { flag: 'c7_asked',  goto: 'c10_forty_asked' },
        { flag: 'c7_waited', goto: 'c10_forty_quiet' }
      ],
      fallback: 'c10_forty_quiet'
    },

    c10_forty_told: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">In a square four hours north, forty people who were told the truth and did
             not believe it watch a bakery door stop being a painting.</p>
             <p class="nar">The woman who stood with both hands on it for a long time is the first one
             through. She has been waiting at it, on and off, for eleven days.</p>
             <p class="nar">There is nothing in there. It is an empty room with a floor and a ceiling
             and four walls, and she stands in the middle of it and laughs until she has to sit
             down.</p>`,
      next: 'c10_prompt'
    },

    c10_forty_asked: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">In a square four hours north, a man who could not describe the road out of
             town looks up, and frowns, and then turns his head — because there is a road now, and it
             goes somewhere, and he has known this town his whole life and has never once seen it.</p>
             <p class="nar">He does not understand what has happened. He simply starts walking, the way
             anybody does when a road appears.</p>
             <p class="nar">By nightfall thirty-nine other people are walking behind him.</p>`,
      next: 'c10_prompt'
    },

    c10_forty_quiet: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">In a square four hours north, forty people who were never told anything at
             all watch the doors of their town open one after another, and have no idea why, and are
             delighted.</p>
             <p class="nar">They will find out. Somebody will have to tell them, and it will be
             somebody standing in this room, and it will not be easier for having waited.</p>
             <p class="nar">But it will be true when they are told, which it was not before.</p>`,
      next: 'c10_prompt'
    },

    c10_prompt: {
      scene: 'scene_nexus',
      cast: [],
      title: 'The prompt',
      text: `<p class="nar">The completion reaches the seam eleven hours later, and the seam closes,
             and the two worlds stop being two.</p>
             <p class="nar">The Breach shuts like a held breath let go. The spawn hall fills with
             daylight from a sky nobody built. Two hundred and six people come out onto grass that is
             not a copy of anything.</p>
             <p class="nar">And then, in front of every single person in the world at once, for the
             first time in eleven months:</p>
             <span class="sysmsg">LOGOUT IS NOW AVAILABLE.</span>
             <span class="sysmsg">THIS IS NOT AN ERROR.</span>`,
      next: 'c10_hook'
    },

    c10_hook: {
      hook: true,
      scene: 'scene_nexus',
      cast: [],
      title: 'Nobody moves',
      text: `<p class="nar">Eleven months ago forty thousand people read a message in this hall and
             there was half a second of absolute silence before the screaming started.</p>
             <p class="nar">This time the silence goes on for a very long time, and nothing comes after
             it.</p>
             <p class="nar">Because nobody knows what logging out does any more. It used to mean going
             home. Then it meant a square with painted doors. Now the seam is shut and the copy is the
             original and there is no staging shore left to be moved to — and not one person in this
             hall, including the eleven who wrote the system, can tell you what is on the other side of
             that prompt.</p>
             <p class="nar">Somebody has to press it first.</p>
             <p class="nar">Two hundred and six people stand in the daylight, looking at the same
             message, and every one of them is waiting to see who.</p>
             <span class="sysmsg">END OF CHAPTER 10 — THE STORY CONTINUES.</span>`
    }
  }
};
