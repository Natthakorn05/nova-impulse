/* ============================================================
   chapter7.js — "THE SECOND SHORE"

   The reveal the whole first act was built to earn: the door
   does not lead out. It leads one room further in.

   What is on the other side is the same world, unfinished — the
   staging build the live one was copied from. Every scene here
   reuses a chapter 1-5 background on purpose. The player should
   recognise the field and the town and feel the wrongness before
   anybody explains it, and reusing the art is not a saving, it is
   the point being made in the only channel that can make it
   without dialogue.

   Reads: c6_all_in / c6_small / c6_fortify (who came through).
   Sets:  c7_told (what you told the people who logged out) —
          paid off in chapters 9 and 10.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter7 = {
  id: 7,
  title: 'THE SECOND SHORE',
  subtitle: 'It is the same world. Somebody just never finished it.',
  start: 'c7_open',

  beats: {

    c7_open: {
      scene: 'scene_field',
      cast: [],
      title: 'The other side',
      text: `<p class="nar">There is grass, and wind in the seed-heads, and floating islands stacked up
             the sky like someone shuffled a deck of continents.</p>
             <p class="nar">It takes eleven seconds for the first person to say it out loud, and when
             they do, everyone else stops walking at the same time.</p>
             <p class="nar">It is the same field. Not similar. The <i>same</i> — the same boulder, the
             same three ridges, the same seed-heads bending the same direction in wind that is coming
             from somewhere else entirely.</p>
             <span class="sysmsg">FIELD ZONE 01 — "THE SHALLOWS". RECOMMENDED LEVEL 1.</span>
             <p class="nar">The sign is wrong. Everything about the sign is wrong. The sign is
             perfectly, precisely, identically correct.</p>`,
      next: 'c7_headcount'
    },

    /* Pays off the chapter 6 decision. Three genuinely different openings
       rather than three labels on the same paragraph. */
    c7_headcount: {
      /* Every arm is listed even though the last one duplicates the
         fallback. The fallback is there for saves that predate the choice;
         the explicit arm is there so the flag is demonstrably read, which is
         what tools/qa-story.mjs checks for and what stops a choice quietly
         becoming decorative. */
      branch: [
        { flag: 'c6_all_in',  goto: 'c7_head_all' },
        { flag: 'c6_fortify', goto: 'c7_head_fort' },
        { flag: 'c6_small',   goto: 'c7_head_small' }
      ],
      fallback: 'c7_head_small'
    },

    c7_head_all: {
      scene: 'scene_field',
      cast: [],
      text: `<p class="nar">Ninety-one people came through, which is ninety-one people standing in a
             field that is a copy of a field, and about eighty of them have worked that out.</p>
             <p>"This was the right call," Uzui says, hauling a crate, "and I want you to notice that
             I'm saying it while it still feels like the wrong one."</p>
             <p>"It is the wrong one if we cannot feed them," says Chizuru.</p>
             <p>"Then we find out fast." He does not slow down. "Ninety-one people can search a
             continent. Six people can search a hill."</p>`,
      next: 'c7_town'
    },

    c7_head_small: {
      scene: 'scene_field',
      cast: [],
      text: `<p class="nar">Eleven people came through. It is a very small number to be standing in a
             very large copy of somewhere you used to live.</p>
             <p>"Eleven," says Kazuma, counting again in case it improves. "If this goes wrong, the
             hall loses eleven and keeps the rest."</p>
             <p>"And if it goes right?"</p>
             <p>"Then eleven of us have to be enough to bring back something worth two hundred and six
             people walking through a hole in the sky." He shoulders his pack. "So let's be enough."</p>`,
      next: 'c7_town'
    },

    c7_head_fort: {
      scene: 'scene_field',
      cast: [],
      text: `<p class="nar">Nineteen people came through, four days late, over a wall the hall spent
             those four days building.</p>
             <p>"Four days," Chizuru says. "Which leaves five. I want that stated out loud by somebody
             who is not me, because I have been the only person saying numbers for a week and it is
             making me the villain."</p>
             <p>"Five days," Mati says obligingly, and then, with genuine cheer: "That's loads. I can
             do five days."</p>
             <p class="nar">Behind them the wall is still standing. It is the first thing anyone has
             built in this world that was not there when they arrived.</p>`,
      next: 'c7_town'
    },

    c7_town: {
      scene: 'scene_town',
      cast: [],
      title: 'Aldenmoor, again',
      text: `<p class="nar">The town is there. The fountain is there. The hall with the back room is
             there, and the roof over the square is there, and there is nobody in any of it.</p>
             <p class="nar">Kazuma walks to the second house on the left and puts his hand flat on the
             door, and the door does not open, because it is not a door. It is a picture of one,
             eleven centimetres deep, with nothing behind it.</p>
             <p class="nar">There are marks in the paint at hand height. Dozens of them. Somebody spent
             a long time trying.</p>
             <p>"Right," he says, to nobody. "So it wasn't just me."</p>`,
      next: 'c7_fight1'
    },

    c7_fight1: {
      scene: 'scene_town',
      cast: [],
      title: 'Unfinished Ground',
      text: `<p class="nar">The things that come out of the side street have the right number of arms
             and the right number of legs and no faces, no colour, no detail of any kind — grey
             blocked-out shapes with the seams still showing, walking with the confidence of something
             that was never told it was a draft.</p>`,
      battle: 'c7_grey',
      onWin: 'c7_after1',
      onLose: 'c7_after1'
    },

    c7_after1: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">The one Airi kneels beside does not dissolve. It lies in the square coming
             apart slowly, and it is grey all the way through, and where its face should be there is a
             flat plane with a checkerboard on it.</p>
             <p>"Placeholder," she says. "That is a placeholder pattern. It means <i>art goes here
             later</i>."</p>
             <p>"Later never came," says Chizuru.</p>
             <p>"No." Airi writes. "Later came a hundred and eleven times. It just never came
             <i>here.</i>"</p>
             <p class="nar">Nobody knows yet what she means by a hundred and eleven. She has not
             worked out that she said it out loud.</p>`,
      classNote: {
        mage: `<p class="nar">The fire behaves. That is the wrong verb and it is the correct one. In the
               live world the arcane resists, always, a little — here it simply does what the number
               says, exactly, with nothing left over.</p>`,
        ranger: `<p class="nar">Every shot lands where it was aimed. Not close. <i>Where it was aimed.</i>
                 There is no wind in this world at all; there is only a sound like wind.</p>`,
        fighter: `<p class="nar">The chain does not build. Each strike is worth precisely what it is worth
                  and the third does not care that the first two happened. Something here has not been
                  wired up yet.</p>`,
        tank: `<p class="nar">Nothing tries to go around. Everything that can reach the guard walks into
               it, patiently, the way a thing does when nobody has written the part where it thinks
               of something else.</p>`
      },
      next: 'c7_logged'
    },

    /* --- the chapter's gut-punch --- */

    c7_logged: {
      scene: 'scene_town',
      cast: [],
      title: 'The ones who got out',
      text: `<p class="nar">There are people in the next square.</p>
             <p class="nar">Forty of them, maybe more, sitting in the sun outside a bakery with no
             bread in it. They are calm. They are unhurt. Several of them wave.</p>
             <p class="nar">You know four of their names. All four logged out successfully, in the
             second month, before the system disabled it — everyone watched them go. Everyone was
             glad.</p>
             <p>"You made it out too!" one of them calls, delighted. "When? We've been home for
             <i>ages.</i>"</p>
             <p class="nar">Behind her, the bakery door is painted on.</p>`,
      next: 'c7_choice_tell'
    },

    c7_choice_tell: {
      scene: 'scene_town',
      cast: [],
      title: 'What you tell them',
      text: `<p class="nar">Forty people are looking at you, and they are happy, and every single one
             of them believes they are standing in their own town on their own street on an ordinary
             afternoon.</p>`,
      choices: [
        { text: 'Tell them. All of it. They are owed the truth even if it takes everything.',
          tag: 'TRUTH', sets: 'c7_told', trust: 2, goto: 'c7_tell_truth' },
        { text: 'Say nothing yet. Find out what this place is first, then come back for them.',
          tag: 'WAIT', sets: 'c7_waited', trust: 1, goto: 'c7_tell_wait' },
        { text: 'Ask them questions instead. They have been here longer than anyone.',
          tag: 'ASK', sets: 'c7_asked', trust: 1, goto: 'c7_tell_ask' }
      ]
    },

    c7_tell_truth: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">You tell them.</p>
             <p class="nar">It takes four minutes and it goes exactly as badly as it deserves to. Two
             people laugh. One woman stands up very slowly and walks to the bakery door and puts her
             hand on it, and then puts her other hand on it, and then does not turn round for a long
             time.</p>
             <p class="nar">The rest simply do not believe you, and are kind about it, which is worse
             than anger.</p>
             <p>"They'll get there," Uzui says quietly, afterwards. "Not today. But you've put the
             crack in, and cracks do the rest of the work on their own." He is already counting how
             many stretchers forty people would need.</p>`,
      next: 'rt7_hub'
    },

    c7_tell_wait: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">You say nothing, and the conversation is warm and ordinary and about the
             weather, and it is the single hardest thing anyone does that day.</p>
             <p>"That was the right call," Chizuru says, on the road out, and then, after eleven paces:
             "I want to be honest with you. I have made that call before, about a density map, and I
             was also right that time."</p>
             <p>"And?"</p>
             <p>"And I have not slept properly since." She does not slow down. "Being right is not the
             same as being able to live in the room afterwards. I would like somebody to have told me
             that at your age."</p>`,
      next: 'rt7_hub'
    },

    c7_tell_ask: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">You ask instead, and the answers are worse than anything you could have
             told them.</p>
             <p class="nar">They have been here four months. Nobody has been hungry. Nobody has aged.
             Nobody has left the square, because there has never been a reason to, and when Airi asks
             one of them to describe the road out of town he opens his mouth and stops and looks
             genuinely puzzled, the way you do at a word you have known your whole life.</p>
             <p>"He can't," Airi says, writing fast. "It isn't that he won't. There is no road. They
             have been sitting in the only finished part of the map."</p>`,
      next: 'rt7_hub'
    },

    c7_shore_fight2: {
      scene: 'scene_field',
      cast: [],
      title: 'Stray Instances',
      text: `<p class="nar">On the road out there are player-shaped things standing in the grass,
             perfectly still, and when you come near them they begin doing the last thing they were
             ever asked to do.</p>
             <p class="nar">One of them is swinging at nothing. One is walking into a rock. One is
             waving.</p>`,
      battle: 'c7_stray',
      onWin: 'c7_after2',
      onLose: 'c7_after2'
    },

    c7_after2: {
      scene: 'scene_field',
      cast: [],
      text: `<p class="nar">Nobody says anything for about a kilometre.</p>
             <p>"They were test accounts," Chizuru says eventually. "That is my read. Automated. Left
             running to check that the world did not fall over, and then not switched off, for four
             years."</p>
             <p>"And the forty in the square?"</p>
             <p class="nar">She does not answer that one. Neither does anybody else. It is not that the
             answer is unclear. It is that saying it out loud would mean agreeing to it.</p>`,
      next: 'c7_warden_intro'
    },

    c7_warden_intro: {
      scene: 'scene_spire',
      cast: [],
      title: 'The spire, again',
      text: `<p class="nar">There is a spire here too, and it is finished, and it is the only building
             in this world that is.</p>
             <p class="nar">Chizuru stops dead at the treeline and takes out her map, and her hands are
             not steady.</p>
             <p>"The drowned town is nine hundred metres too far east on every survey I have ever
             taken," she says. "For nine months I assumed I had an error I could not find." She looks
             up at the spire. "Here it is nine hundred metres <i>west</i>. Which is correct."</p>
             <p>"So your map was wrong."</p>
             <p>"No. My map was <i>right about the copy.</i>" She rolls it up. "I have spent nine
             months measuring accumulated error and calling it geography, and I am about to find out
             how much of it accumulated."</p>`,
      next: 'c7_fight3'
    },

    c7_fight3: {
      scene: 'scene_spire',
      cast: [],
      title: 'Test Harness',
      text: `<p class="nar">The approach is guarded, in the sense that things are standing on it — a
             grey walker with no face and one of the still-running instances, moving together with the
             perfect coordination of two processes that share a clock.</p>`,
      battle: 'c7_mixed',
      onWin: 'c7_before_boss',
      onLose: 'c7_before_boss'
    },

    c7_before_boss: {
      scene: 'scene_spire',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      title: 'The last flight of stairs',
      text: {
        kirito: `<p class="nar">Kirito stops on the last landing, which he does not do.</p>
                 <p>"I've been running it since the field," he says. "The arithmetic. If logging out
                 puts you here, and here is a copy, then the thing everyone has been trying to do for
                 nine months was never an exit. It was a <i>transfer.</i>"</p>
                 <p>"You've known that since the field."</p>
                 <p>"I've suspected it since the field. I've known it since the bakery door." He starts
                 climbing again. "I'd have told you either way. That's new. I want it noticed."</p>`,
        masha:  `<p class="nar">Kirito stops on the last landing and tells her the whole of it, unasked,
                 in one go, which he has never once done.</p>
                 <p>"Logging out isn't an exit," he says. "It's a transfer. Everyone who got out is in
                 that square. I've been sure since the bakery door and I didn't want to say it on a
                 road where forty people could hear."</p>
                 <p class="nar">Masha, who has spent nine months excavating ten per cent out of this
                 man a sentence at a time, discovers she has no idea what to do with all of it at
                 once.</p>
                 <p>"Noticed," she says.</p>`
      },
      next: 'c7_boss'
    },

    c7_boss: {
      scene: 'scene_spire',
      cast: [],
      title: 'CONTINUITY WARDEN',
      text: `<p class="nar">The thing at the top of the spire is not sitting on a throne. It is
             <i>working</i> — a tall custodian of steel and green signal light, surrounded by floating
             panels, moving them with the unhurried competence of somebody four hours into a shift.</p>
             <p class="nar">It looks up. It does not seem angry. It seems interrupted.</p>
             <span class="sysmsg">UNSCHEDULED INSTANCE DETECTED. RECONCILING.</span>`,
      battle: 'c7_warden',
      onWin: 'c7_win',
      onLose: 'c7_lose'
    },

    c7_win: {
      scene: 'scene_spire',
      cast: [],
      text: `<p class="nar">It comes apart into panels, and the panels keep displaying for a few
             seconds after there is nothing holding them, and what they display is a list.</p>
             <p class="nar">It is a list of differences between two worlds. Ten thousand entries.
             Every one of them is something the live world has that this one does not, and beside each
             one is a column headed RECONCILE, and every box in it is ticked.</p>
             <p>"It wasn't guarding anything," Airi says. "It was <i>syncing</i>. It has been making
             this world match ours."</p>
             <p>"Or," says Kazuma, "making ours match this one. Which way round is that list?"</p>
             <p class="nar">Nobody can tell. That is the thing about a list of differences.</p>`,
      next: 'c7_close'
    },

    c7_lose: {
      scene: 'scene_spire',
      cast: [],
      speaker: 'system',
      text: `<span class="sysmsg">HP CRITICAL. EMERGENCY RESPAWN ENGAGED.</span>
             <p class="nar">The world goes white, then grey, then back — and you are on the spire
             steps, whole, with the taste of copper at the back of your throat.</p>
             <p class="nar">The respawn works here. That is the discovery, and it is worse than
             winning would have been, because the respawn is a system, and a system means somebody is
             still administering this place.</p>
             <p class="nar">Above you, unhurried, the Warden goes back to its panels. It was never
             trying to kill you. It was clearing an inconsistency, and you have simply become a
             recurring one.</p>`,
      next: 'c7_close'
    },

    c7_close: {
      scene: 'scene_spire',
      cast: [],
      title: 'The archive door',
      text: `<p class="nar">Behind where the Warden was working there is a door, and this one is real,
             and behind it is a room with no furniture in it at all except shelving, and the shelving
             runs back further than the spire is wide.</p>
             <p class="nar">Airi is through it before anybody else has taken a step.</p>
             <p>"It's a changelog," she says, from somewhere in the dark. Her voice has gone very
             strange. "It's — this is a changelog. For the world."</p>
             <p class="nar">A pause.</p>
             <p>"How far back does it go?" Chizuru calls.</p>
             <p class="nar">The pause goes on much too long.</p>`,
      goChapter: 8
    }
  }
};
