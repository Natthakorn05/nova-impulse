/* ============================================================
   chapter3.js — "THE OVERGROWN"

   Tiers 2-3 come into reach, a tougher enemy type (Hollow Knight),
   and the first romance-driving choice scene (§8).
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.story.chapter3 = {
  id: 3,
  title: 'THE OVERGROWN',
  subtitle: 'Three weeks in. Long enough for this to stop being an emergency and start being a life.',
  start: 'c3_open',

  beats: {

    c3_open: {
      scene: 'scene_forest',
      cast: [],
      title: 'Three weeks in',
      text: `<p class="nar">Three weeks. The number stops meaning anything around day nine, when
             you realise you have started thinking of the respawn point as <em>home</em> and the
             logout screen as <em>a rumour.</em></p>
             <p class="nar">You are level six. You have killed roughly four hundred things. You
             are better at this than you have ever been at anything, and that is its own quiet
             horror.</p>`,
      next: 'c3_bodies'
    },

    /* Payoff for the Chapter 1 boulder conversation. If you answered her
       honestly then, she has been carrying that answer for three weeks. */
    c3_bodies: {
      branch: [
        { flag: 'c1_opened', goto: 'c3_bodies_kept' }
      ],
      fallback: 'c3_fountain'
    },

    c3_bodies_kept: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">Masha has a habit Kirito has been pretending not to notice. When it
                 gets bad — when something goes wrong at range and there is nothing to do about it
                 — she says a sentence under her breath, always the same one, always too quiet to
                 be meant for him.</p>
                 <p class="nar">Tonight he finally makes it out.</p>
                 <p>"<em>You don't do that to a corpse,</em>" she says, to the fire.</p>
                 <p class="nar">He said that to her on the first night, at a boulder, because it was
                 true and because lying to her would have cost more than it was worth. He has
                 thought about it perhaps twice since.</p>
                 <p class="nar">She has apparently been living in it for three weeks.</p>`,
        masha:  `<p class="nar">Masha has been using the same sentence as a handrail for three weeks,
                 which is a slightly humiliating thing to admit about a sentence.</p>
                 <p><em>You don't do that to a corpse.</em></p>
                 <p class="nar">He said it once, at a boulder, on the first night, in the flat voice
                 he uses for load-bearing facts. She has taken it out and checked it roughly nine
                 hundred times since. It has never stopped holding.</p>
                 <p>"You said a thing to me on day one," she says.</p>
                 <p>"I said several."</p>
                 <p>"Yeah, well." She pokes the fire. "One of them's still working."</p>`
      },
      next: 'c3_fountain'
    },

    /* Payoff for the Aldenmoor fountain choice in Chapter 2. */
    c3_fountain: {
      branch: [
        { flag: 'c2_taught', goto: 'c3_fountain_taught' },
        { flag: 'c2_quiet_help', goto: 'c3_fountain_quiet' },
        { flag: 'c2_left', goto: 'c3_fountain_left' }
      ],
      fallback: 'c3_wardens'
    },

    c3_fountain_taught: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">Word comes east with a supply runner: the fountain group at Aldenmoor
             is still alive. All thirty of them. They clear the near field in rotating pairs now,
             the way they were shown, and they have started teaching it to other people.</p>
             <p class="nar">They call the formation "the two-step". Nobody out there knows where
             it came from.</p>
             <p>"Thirty people," says the voice beside you, reading over your shoulder.
             "That's not nothing. That's <em>thirty.</em>"</p>`,
      next: 'c3_wardens'
    },

    c3_fountain_quiet: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">A supply runner heading east mentions, in passing, that somebody pinned
             a set of field notes to the Aldenmoor board a few weeks back. Unsigned. Very precise.
             Damage numbers, safe timings, which things to never fight alone.</p>
             <p class="nar">Roughly twenty of the fountain group are still alive because of it.
             They have no idea who to thank, and have taken to arguing about it.</p>
             <p>"You never said," says the voice beside you.</p>
             <p>"It wasn't a conversation."</p>`,
      next: 'c3_wardens'
    },

    c3_fountain_left: {
      scene: 'scene_town',
      cast: [],
      text: `<p class="nar">A supply runner heading east has news from Aldenmoor, and gives it the
             way people give news that has stopped being surprising: the group that camped by the
             fountain went out to the near field in one large body, about three weeks ago.</p>
             <p class="nar">Eleven came back.</p>
             <p class="nar">Neither of you says anything for about a kilometre.</p>
             <p>"We couldn't have carried thirty people," says the voice beside you, eventually.</p>
             <p>"No," you agree. Which is true, and is not the same as it being all right.</p>`,
      next: 'c3_wardens'
    },

    c3_wardens: {
      scene: 'scene_forest',
      cast: [],
      text: `<p class="nar">The Overgrown starts where the road gives up. Thorn-vines as thick as
             a torso, luminous spore-drifts, and things woven out of bark that turn their heads
             to track you without having anything to track you with.</p>`,
      next: 'c3_fight1'
    },

    c3_fight1: { battle: 'c3_wardens', onWin: 'c3_after1', onLose: 'c3_after1' },

    c3_after1: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      speaker: 'system',
      text: `<span class="sysmsg">SKILL MATRIX: TIER 2 UNSEALED. TIER 3 APPROACHING.</span>
             <p class="nar">The lattice opens wider than it ever has. Two whole tiers of new nodes
             light up — and above them, tiers four and five sit dark and enormous, drawn in
             enough detail that you can see exactly what you are not allowed to have yet.</p>
             <p>"It's showing us the ceiling," comes the voice beside you. "On purpose. Why show
             someone a locked door unless you want them thinking about the key?"</p>`,
      /* The top tier is where the class choice stops being a build and starts
         being a statement about what the world expects you to fight. */
      classNote: {
        mage:    `<p class="nar">The three sealed nodes at the top of {me}'s lattice are labelled
                  <em>Ruin</em>, <em>Eclipse</em> and <em>Ascendance</em>, and you do not name a
                  fireball <em>Ruin</em> unless you have something in mind for it.</p>`,
        ranger:  `<p class="nar">At the very top of {me}'s lattice, sealed: <em>World's End Shot.</em>
                  <em>Stormfall.</em> <em>Unseen.</em> Somebody sat down and named those, for a
                  target that has not turned up yet.</p>`,
        fighter: `<p class="nar">The sealed tier at the top of {me}'s lattice reads <em>Endless Edge</em>,
                  <em>Worldbreaker</em>, <em>Peerless</em> — three names that are less like skills
                  than like a claim about how a particular fight is supposed to end.</p>`,
        tank:    `<p class="nar">The three sealed nodes above {me}'s reach are called <em>The Last
                  Wall</em>, <em>World Anchor</em> and <em>Titan.</em> They are not defensive names.
                  They are the names you give the thing that is left when everything else is gone.</p>`
      },
      next: 'c3_moths'
    },

    c3_moths: {
      scene: 'scene_forest',
      cast: [],
      text: `<p class="nar">The moths come down through the canopy in a slow burning spiral, and
             for a moment — genuinely, stupidly — it is one of the most beautiful things either
             of you has ever seen.</p>
             <p class="nar">Then the first one lands, and the grass goes up.</p>`,
      next: 'c3_fight2'
    },

    c3_fight2: { battle: 'c3_moths', onWin: 'c3_after2', onLose: 'c3_after2' },

    /* ---- the first real romance beat (§8) ---- */
    c3_after2: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">They put the fire out with dirt and jackets and end up sitting in
                 the black circle of it, filthy, breathing hard, absolutely fine.</p>
                 <p class="nar">Masha starts laughing first. It's not funny. That's not the point.</p>
                 <p>"We're going to die out here," she says, delighted, "and I've never felt more
                 awake in my <em>life,</em> and I don't know what that says about me."</p>
                 <p class="nar">Kirito looks at her — soot on her jaw, hair coming out of its tie,
                 grinning at a burnt clearing at the end of the world — and something in his chest
                 does something he has no system panel for.</p>`,
        masha:  `<p class="nar">They beat the fire out with dirt and jackets and collapse in the
                 black circle of it, and Masha starts laughing because the alternative is the
                 other thing.</p>
                 <p>"We're going to die out here," she says, "and I have never felt more awake."</p>
                 <p class="nar">And Kirito — who has not laughed once in three weeks, who treats his
                 own face like a security risk — <em>smiles.</em> A real one. It changes his entire
                 face and it lasts about a second and a half.</p>
                 <p class="nar">Masha thinks: <em>oh no.</em></p>`
      },
      next: 'c3_choice_romance'
    },

    c3_choice_romance: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">She catches him looking. She doesn't say anything about it. She just
                 waits, eyebrows up, letting the silence be his problem.</p>`,
        masha:  `<p class="nar">He catches her looking, and to his credit he doesn't look away.
                 The silence goes long enough to become a question.</p>`
      },
      choices: [
        { text: {
            kirito: '"I\'m glad it was you. In the Nexus. Out of forty thousand people."',
            masha:  '"Out of forty thousand people, I\'m glad I found the one counting doors."'
          },
          trust: 3, tag: 'HONEST', sets: 'c3_confessed', goto: 'c3_romance_open' },
        { text: {
            kirito: '"Your guard drops when you laugh. Fix that." — deflect into training',
            masha:  '"You smiled. I\'m putting that in the log." — deflect into a joke'
          },
          trust: 1, tag: 'DEFLECT', goto: 'c3_romance_deflect' },
        { text: {
            kirito: 'Look away. Check the treeline. Say nothing at all.',
            masha:  'Look away. Check the treeline. Say nothing at all.'
          },
          tag: 'CLOSED', sets: 'c3_closed', goto: 'c3_romance_closed' }
      ]
    },

    c3_romance_open: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">It costs him more to say than the last three boss fights combined.</p>
                 <p>Masha goes very still. Then she leans over — slowly, giving him the whole
                 distance to move away in — and rests her forehead against his shoulder.</p>
                 <p>"Say that again in a month," she says, "when it's harder. And I'll believe you."</p>
                 <p>"I'll say it in a month."</p>
                 <p>"Okay." She doesn't move. "Okay."</p>`,
        masha:  `<p class="nar">Kirito doesn't answer for long enough that she starts drafting an
                 exit. Then:</p>
                 <p>"I count doors because I've never been in a room I wasn't planning to leave,"
                 he says. "I've stopped counting them when you're in the room. I noticed about a
                 week ago and I've been trying to decide if that's a problem."</p>
                 <p>"Is it?"</p>
                 <p>"It's the opposite of a problem." He still won't look at her. "That's the
                 problem."</p>`
      },
      next: 'c3_hollow_intro'
    },

    c3_romance_deflect: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p>Masha laughs and lets him have it, because she is kind, and because she has
                 decided to be patient with him for exactly as long as it takes.</p>
                 <p>"Sure," she says. "Training. Whatever you need to call it."</p>`,
        masha:  `<p>Kirito's ears go faintly red, which she files away as the single most useful
                 tactical discovery of the entire chapter.</p>
                 <p>"Don't put it in the log," he says.</p>
                 <p>"It's already in the log."</p>`
      },
      next: 'c3_hollow_intro'
    },

    c3_romance_closed: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The moment closes like a door. Masha stands, brushes ash off her
                 knees, and is entirely normal for the rest of the day in a way that is worse
                 than if she'd been angry.</p>`,
        masha:  `<p class="nar">He checks the treeline. He keeps checking it. Masha stands up,
                 brushes the ash off, and decides she is not going to be the one who asks twice.</p>`
      },
      next: 'c3_hollow_intro'
    },

    c3_hollow_intro: {
      scene: 'scene_forest',
      cast: [],
      text: `<p class="nar">The structure from the last chapter is at the centre of the Overgrown,
             and it is not a building. It is a <em>door</em> — freestanding, white, thirty feet
             high, with nothing on either side of it.</p>
             <p class="nar">Something is standing in front of it. Empty armour, violet light pouring
             out of every joint, a greatsword point-down in the dirt. It has been waiting.</p>
             <span class="sysmsg">WARNING: ENTITY LEVEL EXCEEDS ZONE PARAMETERS.</span>`,
      next: 'c3_fight3'
    },

    c3_fight3: { battle: 'c3_hollow', onWin: 'c3_win', onLose: 'c3_lose' },

    c3_win: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: `<p class="nar">The armour comes apart at the seams and the violet light goes out of it
             all at once, like something being switched off rather than something dying.</p>
             <p class="nar">The door behind it does not open. But a line of text scrolls across its
             surface, once, in a font neither of you has seen the system use before:</p>
             <span class="sysmsg">FOUR OF FIVE SEALS REMAIN. YOU ARE AHEAD OF SCHEDULE.</span>
             <p class="nar">Ahead of <em>whose</em> schedule, it does not say.</p>`,
      goChapter: 4
    },

    /* The party surviving a defeat past the ridge BREAKS the rule Chapter 2
       established, and they have to notice that — it is the thread the
       Chapter 5 reveal pays off. Previously this beat said "the respawn works
       here", which quietly contradicted the premise and threw away the hook. */
    c3_lose: {
      scene: 'scene_forest',
      cast: { kirito: ['masha'], masha: ['kirito'] },
      text: {
        kirito: `<p class="nar">The greatsword takes Kirito off his feet and the world goes white —
                 and then grey — and then he is on his knees in the dirt twenty metres back,
                 alive, with Masha's hands fisted in his collar and her face far too close.</p>
                 <p>"You went to zero," she says. Her voice has no air in it. "Kirito. You went
                 to <em>zero.</em> We are four hours past the ridge."</p>
                 <p class="nar">Past the ridge there is no respawn. Two hundred people have proved
                 that. He is kneeling in the dirt anyway, whole, with all his HP quietly refilling
                 like a tap someone left running.</p>
                 <p class="nar">The Hollow Knight does not pursue. It returns to the door, plants
                 the sword, and resumes waiting. It was never trying to kill him.</p>
                 <p class="nar">It was taking a measurement. And something, somewhere, decided the
                 measurement was worth preserving.</p>`,
        masha:  `<p class="nar">Masha goes down hard, and the world goes white, and then she is
                 twenty metres back on her knees with grass in her hands and every point of health
                 she owns filling quietly back in.</p>
                 <p class="nar">Kirito arrives at a dead sprint and skids into the dirt beside her
                 with none of his usual composure at all.</p>
                 <p>"You hit zero," he says. "Masha. There is no respawn out here. There <em>is
                 no respawn out here.</em>"</p>
                 <p>"I know what I felt."</p>
                 <p>"Then somebody made an exception for you." He is very pale. "Somebody is
                 <em>allowed</em> to make exceptions."</p>
                 <p class="nar">Behind them the Hollow Knight returns to the door, plants its sword,
                 and resumes waiting. It never followed. It wasn't trying to kill her.</p>
                 <p class="nar">It was taking a measurement.</p>`
      },
      sets: 'survivedTheImpossible',
      goChapter: 4
    }

  }
};
