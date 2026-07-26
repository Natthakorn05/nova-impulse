/* ============================================================
   routes.js — the seven romance routes, woven through all ten
   chapters (§11).

   WHY THIS FILE EXISTS
   --------------------
   The route used to be chosen at a lock in chapter 6. That meant
   chapters 1-5 could not refer to it, because a choice made in
   chapter 6 cannot change chapter 2 — so the first half of the
   game had to pretend six of its seven main characters did not
   exist, and then introduce them all in one chapter as strangers
   who instantly matter.

   The route is now picked during registration. Every chapter
   carries it. That is only affordable because the route content
   lives here rather than being copied into ten chapter files:
   each chapter hands control to `rt<N>_hub`, which is a router
   that sends the player to their own version of that beat and
   then returns them to the spine.

   ADDING A CHAPTER
   ----------------
   Add its return target to RETURN and one entry per route to
   ROUTE_BEATS. The builder does the rest; tools/qa-story.mjs will
   fail loudly if a route is missing a chapter.

   BEAT SHAPE
   ----------
     { scene, title, cast?, text, choices? }
   `text` and choice labels may be a string or { kirito, masha },
   exactly as in the chapter files. The six newcomers get shared
   text and address the player as "you"; the partner route needs
   variants, because on that route the person opposite you is the
   lead you are not playing.
   ============================================================ */

window.NI = window.NI || {};
NI.story = NI.story || {};

NI.routes = (function () {

  /* Where each chapter's route beat hands control back to. */
  const RETURN = {
    1:  'c1_ambush',
    2:  'c2_patrol',
    3:  'c3_choice_romance',
    4:  'c4_golem',
    5:  'c5_escort',
    6:  'c6_gate_talk',
    7:  'c7_shore_fight2',
    8:  'c8_mirror_intro',
    9:  'c9_proxy_intro',
    10: 'c10_final_intro'
  };

  /* ============================================================
     KAZUMA — the one who logged out and came back.

     Throughline: he refuses to say why he came back. Chapter 7
     answers it (he saw the staging shore and returned to warn
     people, and was not believed). Chapter 9 answers it properly.
     ============================================================ */

  const KAZUMA = {
    1: {
      scene: 'scene_field', title: 'The man who isn\'t panicking either',
      text: `<p class="nar">There is a second person on the ridge not panicking, which by now you have
             learned is the rarest thing in this world.</p>
             <p class="nar">He is sitting with his back to a rock, eating, watching forty thousand people
             discover that the sky is fake.</p>
             <p>"You want the speech?" he says, without looking up. "Everyone wants the speech. Here it
             is. Nobody's coming. The devs aren't listening. There's no secret room." He tears the bread.
             "Now you've had it, and you can stop asking people who look calm."</p>
             <p>"You looked calm."</p>
             <p>"I look like I've eaten. It's not the same thing." He holds out half. "Kazuma."</p>`,
      choices: [
        { text: '"You\'ve already worked out how bad this is."', tag: 'PRESS', bond: 2 },
        { text: 'Take the bread. Sit down. Say nothing.', tag: 'SIT', bond: 2 },
        { text: '"I don\'t need the speech."', tag: 'DECLINE', bond: 1 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'Aldenmoor, second week',
      text: `<p class="nar">Kazuma is standing at the edge of the square while a man on a crate promises
             everyone that a rescue party is coming from outside.</p>
             <p>"He believes it," Kazuma says. "That's the worst part. He's not lying. He's just wrong,
             and about ninety people are going to plan around it."</p>
             <p>"So tell them."</p>
             <p>"I did. Yesterday. In front of more people than this." He drinks. "They decided I was
             the problem. It's a very consistent result. You can set a clock by it."</p>
             <p class="nar">Later you notice he has left a full water skin beside the crate, where the
             man on it will find it, and has not mentioned this to anybody.</p>`,
      choices: [
        { text: '"You keep helping the people you insult."', tag: 'CALL IT', bond: 2 },
        { text: '"Tell them again. I\'ll stand next to you."', tag: 'BACK HIM', bond: 2 },
        { text: 'Leave the water where it is and say nothing.', tag: 'QUIET', bond: 1 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'Three weeks in',
      text: `<p class="nar">Three weeks is long enough for people to stop counting days and start keeping
             gardens. Kazuma finds this unbearable and has said so four times today.</p>
             <p>"They've planted things," he says. "Do you understand what that means? They've planted
             things that take eleven weeks."</p>
             <p>"Maybe they'll be here in eleven weeks."</p>
             <p>"Maybe they will." He is quiet a moment. "That's the part I can't do. I can't decide
             whether hoping is stupid, and I've had six months to decide, and I still get up in the
             morning and check the northeast ridge."</p>
             <p class="nar">He notices what he has just admitted. He does not take it back, which for
             him is roughly the same as saying it on purpose.</p>`,
      choices: [
        { text: '"What\'s northeast?"', tag: 'ASK', bond: 2 },
        { text: '"Checking isn\'t hoping. It\'s work."', tag: 'REFRAME', bond: 2 },
        { text: 'Let him keep it.', tag: 'ALLOW', bond: 1 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'The tear',
      text: `<p class="nar">Kazuma looks at the Breach for a long time without saying anything cynical,
             which is how you know it is bad.</p>
             <p>"I've seen an edge before," he says finally. "Not one like that. A neat one. A hatch,
             northeast, past the drowned town, where the world stops being finished."</p>
             <p>"You went through it."</p>
             <p>"I went through it."</p>
             <p>"And came back."</p>
             <p>"And came back." He turns away from the tear. "Ask me anything else. Ask me anything
             at all, and I'll answer it honestly, and I'll do it in front of witnesses. Just not that
             one. Not yet." A beat. "I'm not being mysterious. I'm being a coward. There's a
             difference and I'd like you to know which one this is."</p>`,
      choices: [
        { text: '"Then I\'ll wait. But I\'m going to ask again."', tag: 'WAIT', bond: 2 },
        { text: '"Tell me now. Before it costs someone."', tag: 'PUSH', bond: 1 },
        { text: '"Naming it as cowardice is most of the way to not being one."', tag: 'STEADY', bond: 2 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'Under the spire',
      text: `<p class="nar">The spire is the closest thing this world has to an answer, and Kazuma has
             been refusing to look up at it for an hour.</p>
             <p>"If there's an administrator in there," he says, "then somebody has been watching the
             whole time. Which means somebody watched the first month." He does look up, then. "There
             were a lot of people in the first month."</p>
             <p class="nar">He has never once talked about the first month.</p>
             <p>"I'm going in with you," he says. "Not because I think it'll work. Because if it's a
             person up there I want to be in the room, and if it isn't, I want somebody standing next
             to you who's already had every hope he owns taken off him. It's a useful thing to bring.
             It doesn't break."</p>`,
      choices: [
        { text: '"Then stand where I can see you."', tag: 'TOGETHER', bond: 2 },
        { text: '"You brought more than that and you know it."', tag: 'NAME IT', bond: 2 },
        { text: 'Nod. Start climbing.', tag: 'CLIMB', bond: 1 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'The door on nothing',
      text: `<p class="nar">Kazuma has been staring at the door in the Breach since it appeared, and
             the expression on him is not surprise. It is recognition.</p>
             <p>"That's the same edge," he says. "Bigger. Same edge."</p>
             <p>"Kazuma."</p>
             <p>"Yeah." He rubs his face. "Yeah, all right. Here it is. I went through the hatch and I
             came out somewhere that looked exactly like here and was empty, and I stood in a town
             where every door was painted on, and I understood — not guessed, <i>understood</i> — that
             logging out of this place does not take you home. It takes you one room further in."</p>
             <p>"And you came back to tell people."</p>
             <p>"And they explained to me, very patiently, that I was a coward who'd lost his nerve at
             the exit." He picks up his coat. "So this time I'd rather be wrong out loud, next to you,
             than right on my own."</p>`,
      choices: [
        { text: '"I believe you. That\'s not a small thing to say and I mean it."', tag: 'BELIEVE', bond: 2 },
        { text: '"Then you\'ve been carrying this alone for four months."', tag: 'SEE HIM', bond: 2 },
        { text: '"Show me the painted door."', tag: 'PROVE IT', bond: 1 }
      ]
    },
    7: {
      scene: 'scene_town', title: 'The town where every door is painted',
      text: `<p class="nar">He walks you to the second house on the left and puts his hand flat on the
             door, and the door does not open, because it is not a door. It is a picture of one,
             eleven centimetres deep, with nothing behind it.</p>
             <p>"I stood here for two hours," Kazuma says. "First time. Just — here. Trying to make it
             be a door."</p>
             <p class="nar">There are marks in the paint at hand height. Dozens of them. Somebody spent
             a long time trying.</p>
             <p>"I want you to notice something," he says. "I'm not saying I told you so. I've had four
             months to plan saying I told you so and I've got it word perfect." He steps back from the
             door. "It turns out I don't want it. I just want somebody else to have seen it."</p>`,
      choices: [
        { text: '"I\'ve seen it. You\'re not the only one who has now."', tag: 'WITNESS', bond: 3 },
        { text: 'Put your hand on the paint beside his.', tag: 'BESIDE HIM', bond: 3 },
        { text: '"Say it anyway. You earned it."', tag: 'LET HIM', bond: 2 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'His name in the list',
      text: `<p class="nar">The changelog runs to a hundred and eleven iterations, and Kazuma finds his
             own account in eighty-four of them.</p>
             <p>"Eighty-four," he says. "Eighty-four times somebody with my name got as far as that
             hatch." He scrolls. "Nine came back."</p>
             <p>"Nine out of eighty-four."</p>
             <p>"Nine out of eighty-four." He has gone very still. "The other seventy-five went through
             and kept going. Which means the version of me that walks away is the common one, and the
             version standing here talking to you is a rounding error."</p>
             <p class="nar">You watch him decide something, in real time, with the list still open.</p>
             <p>"Right," he says. "Well. Rounding errors are what break the model."</p>`,
      choices: [
        { text: '"Nine came back. All nine of them chose it."', tag: 'CHOSE IT', bond: 3 },
        { text: '"I don\'t care about eighty-four of you. I know this one."', tag: 'THIS ONE', bond: 3 },
        { text: 'Close the log before he reads what happened to the nine.', tag: 'SHUT IT', bond: 2 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'Why he came back',
      text: `<p class="nar">The core is four hours away and Kazuma has been walking beside you in
             silence for three of them, which for him is a symptom.</p>
             <p>"You asked me why I came back," he says. "Months ago. I said I'd lie to you."</p>
             <p>"You did."</p>
             <p>"I was going to say something about warning people. It's even true." He keeps walking,
             does not look over. "It's not the reason. The reason is that I got through the hatch and
             stood in an empty world and realised there was nobody in it I would miss, and that this
             was entirely my own doing, and that it had taken a locked server to make me notice."</p>
             <p class="nar">He stops.</p>
             <p>"So I came back to fix that. It's a stupid reason to walk away from an exit. I've had
             four months to find a better one and there isn't one, and now there's you, and it's
             worse, because now it's not theoretical."</p>`,
      choices: [
        { text: '"It stopped being theoretical for me somewhere around the painted door."', tag: 'SAME', bond: 3 },
        { text: '"That\'s the least cynical thing you\'ve ever said. Say it again."', tag: 'AGAIN', bond: 3 },
        { text: 'Take his hand. Keep walking.', tag: 'WALK ON', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'The last door',
      text: `<p class="nar">There is one more door and it is a real one, and Kazuma is standing in
             front of it with his hands in his pockets.</p>
             <p>"Here's my last piece of cynicism," he says. "Ready? It might not work. We might do all
             of this and the sky doesn't open and nothing changes and we die tired." He shrugs. "There.
             That's the whole speech. That's everything I've got left."</p>
             <p>"That's a much shorter speech than the first one."</p>
             <p>"Yeah, well." He pushes off the wall. "I've been eating."</p>
             <p class="nar">He goes through first. He does not check whether you are following, which
             from a man who has spent six months checking every ridgeline is the single most
             extravagant thing he has ever done.</p>`,
      choices: [
        { text: 'Follow him without checking either.', tag: 'TRUST', bond: 3 },
        { text: '"Kazuma." Wait until he turns around.', tag: 'STOP HIM', bond: 3 }
      ]
    }
  };

  /* ============================================================
     YUJI — the one carrying something else.
     ============================================================ */

  const YUJI = {
    1: {
      scene: 'scene_field', title: 'The one who stayed at the gate',
      text: `<p class="nar">He is the last person out of the Nexus, because he has spent the whole
             first day walking people through the gate one at a time and going back for the next.</p>
             <p>"Nearly done," he says, when you find him. He is grey with it. "There's a group by the
             fountain who won't move. I've got a plan for them, it's not a good plan, but it's got the
             advantage of being the only one."</p>
             <p>"When did you last sit down?"</p>
             <p>"Oh — " He genuinely has to think. "That's a good question."</p>
             <p class="nar">Under his sleeve, when he lifts his arm, there is a line of light where a
             line of light should not be. He catches you looking and pulls the cuff down with the
             fluency of someone who has done it a hundred times.</p>`,
      choices: [
        { text: '"Sit down. I\'ll go back for the fountain group."', tag: 'TAKE OVER', bond: 2 },
        { text: '"What\'s under the sleeve?"', tag: 'ASK', bond: 1 },
        { text: '"Then I\'m coming with you. Two bad plans is one good one."', tag: 'JOIN', bond: 2 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'The hospital that isn\'t one',
      text: `<p class="nar">Aldenmoor has a building where people go when the respawn puts them back
             wrong, and it has no doctors, and Yuji is there anyway.</p>
             <p>"There's nothing to treat," he says quietly, on the steps. "They come back whole every
             time. It's the coming back they can't do." He rubs his eyes. "Someone in there has died
             nine times this week. On purpose. Testing it."</p>
             <p>"That's not something you can fix."</p>
             <p>"No." He looks at his hands. "But I can be the person who's there at number ten."</p>
             <p class="nar">He says it the way other people say the time. It does not occur to him
             that anyone would find it remarkable, and that is the most alarming thing about him.</p>`,
      choices: [
        { text: '"Who\'s there for you at number ten?"', tag: 'TURN IT', bond: 2 },
        { text: 'Sit down on the steps beside him.', tag: 'STAY', bond: 2 },
        { text: '"Then I\'ll take the night shift."', tag: 'SHARE IT', bond: 2 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'What the light does',
      text: `<p class="nar">He does not tell you. You find out because a Bramble Warden opens him from
             collarbone to hip and the wound closes in four seconds, and the light under it is the same
             colour as the sap in the vines.</p>
             <p class="nar">Afterwards he sits down on a root and looks at the ground for a while.</p>
             <p>"It started in the second week," he says. "I thought it was a buff. I've stopped
             thinking that." He turns his forearm over. The light moves. "It responds to this place.
             When the world does something big, it — answers. Like it's part of the same sentence."</p>
             <p>"Does it hurt?"</p>
             <p>"No." He almost laughs. "That's what frightens me. Nothing about it hurts. Everything
             that's mine hurts."</p>`,
      choices: [
        { text: '"Then we find out what it is. Together, and out loud."', tag: 'FIND OUT', bond: 2 },
        { text: '"It doesn\'t change anything about who I\'m sitting next to."', tag: 'STEADY', bond: 2 },
        { text: '"Who else knows?"', tag: 'PRACTICAL', bond: 1 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'When the sky tore',
      text: `<p class="nar">The Breach opens and Yuji goes down on one knee in the grass forty
             kilometres away, both hands flat on the ground, breathing like a man surfacing.</p>
             <p class="nar">The light under his skin is at every seam at once.</p>
             <p>"It's — " He can't finish. He tries twice. "It's not attacking. It's <i>calling.</i>
             It knows my name. It's been saying my name since the second week and I've been calling it
             a symptom."</p>
             <p class="nar">He gets up. He is shaking and he gets up anyway, which is the entire
             problem with him.</p>
             <p>"Don't let me walk toward it," he says. "If I start walking toward it, I want you to
             stop me. I want that to be a thing you're allowed to do."</p>`,
      choices: [
        { text: '"I\'ll stop you. I\'m allowed."', tag: 'PROMISE', bond: 2 },
        { text: '"Or we walk toward it at the same speed and I stay beside you."', tag: 'BESIDE', bond: 2 },
        { text: '"You\'re asking me to decide something that isn\'t mine."', tag: 'REFUSE', bond: 1 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'The thing the spire says',
      text: `<p class="nar">The spire's lower archive lists every account on the server. Yuji's is on
             it twice — once with a creation date that matches everyone else's, and once with a date
             four years earlier, in a field marked ASSET.</p>
             <p class="nar">He reads it three times.</p>
             <p>"So I might not be a person," he says, conversationally. "That's — huh. That's a lot to
             find out standing up."</p>
             <p>"Yuji."</p>
             <p>"No, it's fine. It explains things. It explains the light and the healing and why I
             don't get tired the way — " He stops. "It doesn't explain why I care what happens to the
             fountain group. Does it. That's not in the file."</p>`,
      choices: [
        { text: '"No. That part\'s yours."', tag: 'YOURS', bond: 2 },
        { text: '"The file is four years old. I met you in March."', tag: 'MARCH', bond: 2 },
        { text: 'Take the page out of his hands and put it face down.', tag: 'ENOUGH', bond: 2 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'The door knows him',
      text: `<p class="nar">The door in the Breach opens wider when Yuji comes near it. It does not do
             that for anyone else. Everyone notices. Nobody says it.</p>
             <p>"Right," he says, to the door, like a man greeting a colleague he dislikes.</p>
             <p class="nar">Then, to you, without turning round:</p>
             <p>"I've worked out what I am, I think. Not a person they made. A person they <i>used</i>.
             Something got merged into an account four years ago and the account was mine and nobody
             filed it." He pushes his sleeve up himself, all the way, for the first time in front of
             anyone. "So I'm the key. That's what this is. I'm the key, and I would very much like
             somebody to be holding onto me while we find out what I open."</p>`,
      choices: [
        { text: 'Take his arm. Don\'t let go.', tag: 'HOLD ON', bond: 3 },
        { text: '"You\'re not a key. You\'re the reason I\'m going in."', tag: 'NOT A KEY', bond: 3 },
        { text: '"Then we go through together or not at all."', tag: 'TOGETHER', bond: 2 }
      ]
    },
    7: {
      scene: 'scene_town', title: 'The people who logged out',
      text: `<p class="nar">The staging shore is full of players who successfully logged out, months
             ago, and are still here, and do not know it. They are calm. That is the unbearable part.
             They think they are home.</p>
             <p class="nar">One of them recognises Yuji and thanks him for the gate.</p>
             <p class="nar">He holds it together until she is out of earshot.</p>
             <p>"I walked four hundred people through that gate," he says. "Four hundred. And every
             single one I couldn't reach later, I told myself had got out." His voice does not rise.
             "They did get out. This is out."</p>`,
      choices: [
        { text: '"You didn\'t build the room. You carried people through the dark."', tag: 'NOT YOURS', bond: 3 },
        { text: '"Then we get all four hundred. Starting with her."', tag: 'ALL OF THEM', bond: 3 },
        { text: 'Say nothing. Stand between him and the crowd until he can breathe.', tag: 'SHIELD', bond: 3 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'Older than the world',
      text: `<p class="nar">The changelog has a hundred and eleven iterations. Yuji's ASSET record is
             in all of them, and in the first eleven it is not an asset. It is a name on a design
             document, under a heading that reads WHO THE GAME IS ABOUT.</p>
             <p>"I'm the protagonist," he says, blankly. "I'm the — they wrote me. Before any of this.
             I was the character forty thousand people were supposed to play <i>as</i>."</p>
             <p class="nar">He sits down on the archive floor.</p>
             <p>"Then something went wrong and they poured me into a live account and shipped it, and
             I've spent four years being a person by accident." He looks up. "Which is worse? Being an
             asset, or being a draft they liked enough to keep?"</p>`,
      choices: [
        { text: '"Neither. Both of those are stories about them, not you."', tag: 'NOT THEM', bond: 3 },
        { text: '"Nobody drafted the fountain group. You did that."', tag: 'THE FOUNTAIN', bond: 3 },
        { text: 'Sit down on the floor next to him.', tag: 'SIT', bond: 3 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'What he is for',
      text: `<p class="nar">The Architect's proxy says it plainly, because it has never learned not to:
             the core can be closed, and closing it costs one merged asset, and there is exactly one
             merged asset in the building.</p>
             <p class="nar">Yuji says "okay" before anyone else has drawn breath.</p>
             <p>"No," you say.</p>
             <p>"It's efficient." He is already rolling his sleeve. "It's the — look, it's the thing I
             was going to say the moment I understood what I was. I've been rehearsing it since the
             archive. I had it quite good, actually. There was a bit about the fountain."</p>
             <p class="nar">He stops. His hands are shaking again.</p>
             <p>"I'd rather you argued," he says, very quietly. "Nobody's ever argued."</p>`,
      choices: [
        { text: '"Then I\'ll argue. Sit down and listen to me argue."', tag: 'ARGUE', bond: 3 },
        { text: '"We find a second answer. That\'s not optimism, that\'s the plan."', tag: 'SECOND WAY', bond: 3 },
        { text: 'Roll his sleeve back down.', tag: 'NO', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'Not the key',
      text: `<p class="nar">In the end it is not him. It was never going to be him — the proxy was
             quoting a design document written by people who thought of him as a component, and the
             component grew up.</p>
             <p class="nar">Yuji finds this out standing in the core with his sleeve still rolled up
             and an expression of complete bewilderment.</p>
             <p>"I'm not required," he says.</p>
             <p>"No."</p>
             <p>"I've been required since the second week." He laughs, once, badly. "I have absolutely
             no idea what I'm for."</p>
             <p class="nar">The light under his skin has gone quiet for the first time since you met
             him. He looks, briefly and unmistakably, like a person on his first day of anything.</p>`,
      choices: [
        { text: '"You get to find out. That\'s the whole prize."', tag: 'FIND OUT', bond: 3 },
        { text: '"You\'re for whatever you pick tomorrow. Come on."', tag: 'TOMORROW', bond: 3 }
      ]
    }
  };

  /* ============================================================
     UZUI — the one who makes an entrance.
     ============================================================ */

  const UZUI = {
    1: {
      scene: 'scene_field', title: 'Somebody is making an announcement',
      text: `<p class="nar">A very large man has climbed onto the field gate's arch, which nobody
             else has thought to do, and is addressing everyone below at extraordinary volume.</p>
             <p>"THE SLIMES," he announces, "ARE COWARDS. THEY WILL NOT CHASE YOU UPHILL. GO UPHILL."</p>
             <p class="nar">It is, as advice, correct. Four hundred people go uphill.</p>
             <p>"You're staring," he says, dropping down beside you, at conversational volume, and
             conversational volume from him is still quite loud. "Everyone stares. It's the point.
             They came out here to be frightened and now they've come out here to look at me instead."
             He grins. "Uzui. Somebody has to be the loud one, and the loud one has to be someone who
             can take it."</p>`,
      choices: [
        { text: '"That was deliberate. All of it."', tag: 'NOTICED', bond: 2 },
        { text: '"Then who takes it off you?"', tag: 'TURN IT', bond: 2 },
        { text: '"Go uphill. Got it."', tag: 'DEADPAN', bond: 1 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'The first hot meal',
      text: `<p class="nar">By the second week Aldenmoor has one building with lanterns on it, and the
             lanterns are visible from the field, and that is not an accident.</p>
             <p>"Light is a service," Uzui says, hauling a table. "People walk toward light. I could
             put up a sign saying FOOD HERE and it would work on nobody. Lanterns work on everyone."</p>
             <p class="nar">He has been awake since before dawn. There is flour on him.</p>
             <p>"Sixty tonight," he says, with enormous satisfaction. "Sixty! Last week it was nine."
             Then, quieter, not slowing down: "Table four hasn't spoken since Tuesday. If you're
             staying, sit near table four. Don't sit <i>at</i> it. Near."</p>`,
      choices: [
        { text: 'Sit near table four.', tag: 'DO IT', bond: 2 },
        { text: '"You know every table in here, don\'t you."', tag: 'SEE HIM', bond: 2 },
        { text: 'Pick up the other end of the table.', tag: 'HELP', bond: 2 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'Off stage',
      text: `<p class="nar">Three weeks in you find him outside, behind the safe house, sitting on a
             crate in the dark with his head in his hands, and he does not hear you coming.</p>
             <p class="nar">He is up in half a second, arms out, grin on.</p>
             <p>"FOUND ME," he says. "Rare. Congratulations."</p>
             <p>"Uzui."</p>
             <p class="nar">The arms come down. He sits back on the crate and looks at the dirt for a
             while, and when he speaks it is the first time you have heard him at normal volume.</p>
             <p>"Nineteen didn't come back off the ridge today," he says. "I knew eleven of their
             names." He rubs his face. "I'll be flashy again in about four minutes. I just need the
             four minutes."</p>`,
      choices: [
        { text: 'Sit down on the crate. Take the four minutes with him.', tag: 'STAY', bond: 2 },
        { text: '"Take longer. I\'ll hold the door."', tag: 'HOLD IT', bond: 2 },
        { text: '"Say the eleven names. I\'ll listen to all of them."', tag: 'NAMES', bond: 2 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'When the sky tore',
      text: `<p class="nar">The Breach opens and Uzui does not look at it. He turns his back on the
             biggest thing that has ever happened and starts counting heads.</p>
             <p>"Sixty-one," he says. "Sixty-one, and I want sixty-one at the other end of this street
             in six minutes, and I want them to think it was their idea."</p>
             <p class="nar">He does it in five. He does it loudly, theatrically, badly enough that two
             people laugh, and the laughing is the point, and you watch him spend himself doing it.</p>
             <p>"You could have run," you say afterwards.</p>
             <p>"I could have run <i>magnificently,</i>" he agrees. "Nobody would have talked about
             anything else for a week."</p>`,
      choices: [
        { text: '"Why didn\'t you?"', tag: 'ASK', bond: 2 },
        { text: '"Sixty-one people got out because you were embarrassing."', tag: 'CREDIT', bond: 2 },
        { text: '"Next time, run second. I\'ll take the last one."', tag: 'SHARE IT', bond: 2 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'What the stage is for',
      text: `<p class="nar">He walks you to the spire and stops at the treeline, and for once does not
             come further.</p>
             <p>"I'm not going up," he says. "Before you argue — I've thought about it for two days,
             which for me is a geological age." He nods back at the lanterns. "If the four of you go up
             there and it goes wrong, sixty-one people need somebody at the bottom who they'll actually
             follow. That's me. That's the whole of what I am for."</p>
             <p>"That's not all you are."</p>
             <p>"No." He looks at you properly. "But it's the part that's load-bearing tonight."</p>
             <p class="nar">Then, because he cannot help himself, at full volume, to the entire street:
             "GO AND BREAK SOMETHING ENORMOUS."</p>`,
      choices: [
        { text: '"I\'m coming back down. Say it back to me."', tag: 'PROMISE', bond: 2 },
        { text: '"Then be at the bottom. I\'ll be looking for the lanterns."', tag: 'LANTERNS', bond: 2 },
        { text: '"Come up anyway."', tag: 'ASK HIM', bond: 1 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'Sixty-one and a door',
      text: `<p class="nar">Uzui has moved the entire safe house into the spawn hall in four days,
             lanterns and all, and the spawn hall now smells of bread, which does more for two hundred
             and six frightened people than any speech.</p>
             <p>"I'm coming through the door," he says, before you ask.</p>
             <p>"You said you were load-bearing at the bottom."</p>
             <p>"I was. Then the bottom started leaking." He straightens a lantern that does not need
             it. "Here's the thing I've never said out loud. I'm good at holding a room. I'm very good
             at it. I have never once been good at being <i>in</i> one, with one person, where the
             volume doesn't help." He looks at you. "I'd like to try that. Preferably somewhere with
             fewer monsters, but I'll take what's going."</p>`,
      choices: [
        { text: '"Then try it now. Quietly. I\'m listening."', tag: 'NOW', bond: 3 },
        { text: '"You\'ve been doing it with me for months. You just didn\'t notice."', tag: 'ALREADY', bond: 3 },
        { text: '"Bring the lanterns."', tag: 'LANTERNS', bond: 2 }
      ]
    },
    7: {
      scene: 'scene_town', title: 'A town with no one in it',
      text: `<p class="nar">The staging shore has a town square exactly like Aldenmoor's, down to the
             fountain, and there is nobody in it, and the doors are painted on.</p>
             <p class="nar">Uzui walks into the middle of it and stands there for a long moment.</p>
             <p>"Terrible acoustics," he says.</p>
             <p class="nar">Then he starts hanging lanterns. On the painted doors. On the fake
             railings. On a wall with nothing behind it. He works for an hour without saying anything
             else, and when he is finished the empty square is the only lit thing in a dead world.</p>
             <p>"Now if anyone's out there," he says, "they can see us."</p>`,
      choices: [
        { text: 'Help him hang the rest.', tag: 'HELP', bond: 3 },
        { text: '"Nobody\'s out there, Uzui."', tag: 'HONEST', bond: 2 },
        { text: '"You just made a stage out of nothing. Again."', tag: 'SEE HIM', bond: 3 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'The safe house, iteration eleven',
      text: `<p class="nar">In the changelog there is a building. It is in ninety-three of the hundred
             and eleven iterations. It has lanterns. It is never in the design documents, because
             nobody designed it.</p>
             <p>"That's mine," Uzui says. "That's — in ninety-three of them, some version of me put up
             lanterns."</p>
             <p>"And the other eighteen?"</p>
             <p>"In the other eighteen there's a note." He reads it twice. "It says the food ran out in
             week two." He sets the page down very carefully, as if it might go off. "Eighteen times I
             didn't manage it. Eighteen times I was there and it wasn't enough and I —"</p>
             <p class="nar">He stops, because his hands are not steady, and he has never once let
             anyone see that.</p>`,
      choices: [
        { text: '"Ninety-three, Uzui. You are the reason ninety-three of them ate."', tag: 'NINETY-THREE', bond: 3 },
        { text: 'Take the page away from him.', tag: 'ENOUGH', bond: 3 },
        { text: '"Let me see your hands. It\'s all right. It\'s only me."', tag: 'ONLY ME', bond: 3 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'Quietly, then',
      text: `<p class="nar">Four hours from the core, in a corridor with no audience in it, Uzui says
             your name at normal volume and waits until you turn round.</p>
             <p>"I've been rehearsing this," he says. "Which is cheating, and I want that on the
             record."</p>
             <p class="nar">He does not do the arms. He does not do the grin.</p>
             <p>"I have spent my whole life being the biggest thing in every room I enter, and I have
             been doing it since I was nine, and it works, and I am extremely tired." A breath. "You
             are the first person who ever looked at me on a crate in the dark and did not need me to
             get up. I would like to survive this specifically so I can find out what I'm like when
             I'm not performing. I'd like you to be there for that."</p>`,
      choices: [
        { text: '"I\'ll be there. Front row. Every night."', tag: 'FRONT ROW', bond: 3 },
        { text: '"You\'re not performing now."', tag: 'RIGHT NOW', bond: 3 },
        { text: 'Don\'t say anything. Just don\'t look away.', tag: 'LOOK', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'The last entrance',
      text: `<p class="nar">There is one door left. Uzui rolls his shoulders, looks at it, and then
             looks at you and does something he has never done, which is to go first without saying
             anything at all.</p>
             <p class="nar">No announcement. No arms. He simply opens it and walks through, and it is
             so unlike him that two people ask afterwards whether he was all right.</p>
             <p>"That was your worst entrance ever," you tell him, inside.</p>
             <p>"WASN'T IT," he says, delighted, at a volume that dislodges dust. "I've been saving
             it."</p>`,
      choices: [
        { text: '"Save the next one for somewhere with a roof."', tag: 'NEXT ONE', bond: 3 },
        { text: 'Take his hand where everyone can see.', tag: 'FLASHY', bond: 3 }
      ]
    }
  };

  /* ============================================================
     CHIZURU — the one who is always working.
     ============================================================ */

  const CHIZURU = {
    1: {
      scene: 'scene_field', title: 'Somebody is already taking notes',
      text: `<p class="nar">Day one. Forty thousand people are screaming, and one woman is sitting on a
             rock with a stick, drawing a grid in the dirt and marking where things spawn.</p>
             <p>"Four minutes," she says, as you approach. "The slimes. Four minutes, near enough. If
             you are about to ask me what is happening, I don't know, and neither does anybody, and I
             would rather spend the interval measuring than asking."</p>
             <p class="nar">She has been here since the gate opened. There are eleven marks.</p>
             <p>"Chizuru," she says. "You may sit down, but do not stand there, you are in the sight
             line."</p>`,
      choices: [
        { text: 'Sit down. Start counting the other spawn point.', tag: 'WORK', bond: 2 },
        { text: '"Eleven marks. You\'ve been here since the gate."', tag: 'NOTICE', bond: 2 },
        { text: '"Has anyone brought you water?"', tag: 'CARE', bond: 2 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'The map she will not show anyone',
      text: `<p class="nar">She has taken the back room of Aldenmoor's hall and covered the wall, and
             when you come in she does not hide it, which you understand later was a decision.</p>
             <p>"Respawn thresholds," she says, pointing. "Damage curve. Spawn density by distance from
             the gate. Six people have asked me to post this in the square."</p>
             <p>"And?"</p>
             <p>"And if I post it, the density map tells four hundred people exactly which fields are
             empty, and they will go to the empty fields, and the empty fields are empty because of the
             thing that empties them." She moves a pin. "I am not being precious. I am being correct.
             Those are different and people rarely check which one they are dealing with."</p>`,
      choices: [
        { text: '"Then show it to five people who can be told why."', tag: 'MIDDLE WAY', bond: 2 },
        { text: '"You\'ve already decided. You wanted someone to argue."', tag: 'READ HER', bond: 2 },
        { text: '"Post it. People deserve to be frightened accurately."', tag: 'DISAGREE', bond: 1 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'The thing she got right',
      text: `<p class="nar">Three weeks in, in a forest she mapped a fortnight ago, she stops walking
             and says, without preamble:</p>
             <p>"I posted it once. Second week. You should know that."</p>
             <p class="nar">She does not look at you.</p>
             <p>"Density map. Public. Exactly as those six people asked. Eighty-one went to the
             quietest field because I had labelled it quiet, and it was quiet, and the reason it was
             quiet came back at dusk." A long pause. "Nine returned. I was right about every number on
             that map. Being right was the mechanism."</p>
             <p>"That's not the same as it being your fault."</p>
             <p>"No," she agrees. "It is adjacent to it, and I have found that adjacency is quite
             sufficient at four in the morning."</p>`,
      choices: [
        { text: '"Then don\'t carry it alone. Show me first. Every time."', tag: 'SHARE IT', bond: 2 },
        { text: '"Nine came back who wouldn\'t have known to run."', tag: 'THE NINE', bond: 2 },
        { text: 'Say nothing. Keep walking beside her.', tag: 'WALK', bond: 2 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'She predicted it',
      text: `<p class="nar">The Breach opens on a Tuesday. Chizuru's estimate, made in the fourth week,
             was "a Tuesday, or near one, within nine days of the ninth month."</p>
             <p class="nar">She takes no satisfaction from this whatsoever.</p>
             <p>"I want you to understand what I am about to ask," she says. "I have a projection. It
             is nine days from now and it involves the spawn hall. I have not shown it to anybody
             because the last time I was right in public, eighty-one people acted on it."</p>
             <p>"Show me."</p>
             <p>"Yes." She unrolls it immediately, as though she had been holding it out for a month.
             "Yes. All right. I have been waiting for somebody to say that in a tone I believed."</p>`,
      choices: [
        { text: '"We decide what to do with it together. Both names on it."', tag: 'BOTH', bond: 2 },
        { text: '"Nine days. Then we\'ve got nine days of work."', tag: 'WORK', bond: 2 },
        { text: '"You have been holding this out for a month, haven\'t you."', tag: 'SEE HER', bond: 2 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'The map is wrong',
      text: `<p class="nar">At the foot of the spire, Chizuru's map stops being a map and starts being
             a problem, because the spire is not where she put it, and she put it there from six
             independent sightings.</p>
             <p>"It has moved," she says. "It has not moved. Both of those are true, and I have checked
             the sightings four times, and one of them is mine from last Tuesday."</p>
             <p class="nar">She sits down on the step with the map across her knees, and for the first
             time since you met her she looks less like a woman working and more like a woman who has
             found the edge of what working can do.</p>
             <p>"Somebody edited the world," she says. "While I was measuring it."</p>`,
      choices: [
        { text: '"Then we go up and find out who. Bring the map."', tag: 'GO UP', bond: 2 },
        { text: 'Sit down on the step next to her.', tag: 'SIT', bond: 2 },
        { text: '"Six sightings and one of them yours. That\'s not a mistake, that\'s evidence."', tag: 'EVIDENCE', bond: 2 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'Stitches',
      text: `<p class="nar">She puts in the last pin and steps back so everyone can see the shape, and
             the shape is a circle, and the spire is not at the centre of it.</p>
             <p>"They were not locks," she says. "They were stitches."</p>
             <p class="nar">Afterwards, when the room has emptied and she has stopped being the person
             who says things to rooms:</p>
             <p>"I worked that out eleven days ago," she says. "Before the Warden. I could have said it
             before you went up the spire." She is not looking at you. "I did the calculation you would
             expect. Telling you would not have changed what you had to do, and it would have changed
             how you did it, and you would have hesitated at the wrong moment and died."</p>
             <p>"Chizuru."</p>
             <p>"I have been sick about it for eleven days. Say whatever you are going to say."</p>`,
      choices: [
        { text: '"I\'d rather have hesitated. Tell me next time."', tag: 'NEXT TIME', bond: 3 },
        { text: '"You were right. And it cost you eleven days. Both things."', tag: 'BOTH TRUE', bond: 3 },
        { text: '"Stop deciding what I can survive knowing."', tag: 'HARD', bond: 2 }
      ]
    },
    7: {
      scene: 'scene_town', title: 'A world she has already mapped',
      text: `<p class="nar">She recognises the staging shore in under four minutes, and the recognition
             takes the colour out of her.</p>
             <p>"This is my map," she says. "Not a copy. <i>Mine.</i> The error I could never resolve —
             the drowned town is nine hundred metres too far east on every survey I ever took, and
             here it is, nine hundred metres too far east, and here it is <i>correct.</i>"</p>
             <p class="nar">She turns a full circle in the empty square.</p>
             <p>"I have spent nine months measuring a world," she says, "and the world I was measuring
             was the one with the mistakes in it. This is the original. I mapped the copy."</p>`,
      choices: [
        { text: '"You mapped the copy so precisely you found the original."', tag: 'THAT\'S HOW', bond: 3 },
        { text: '"Then start again. Here. I\'ll hold the other end of the line."', tag: 'START', bond: 3 },
        { text: 'Take the map before she does something to it.', tag: 'SAVE IT', bond: 2 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'A hundred and eleven',
      text: `<p class="nar">The changelog explains the nine hundred metres. It also explains the other
             four hundred discrepancies in her survey, one at a time, over eleven pages.</p>
             <p class="nar">Chizuru reads all of it standing up and does not make a single note.</p>
             <p>"A hundred and eleven iterations," she says. "Each one seeded from the last with drift.
             I have been measuring accumulated error and calling it geography."</p>
             <p>"Your map still worked."</p>
             <p>"My map worked <i>brilliantly.</i>" And then, unexpectedly, she laughs — one short
             astonished sound, the first you have ever heard from her. "Do you see it? Four hundred
             discrepancies. I could have thrown any one of them away as noise. I kept every one, for
             nine months, because I could not bear an unexplained number." She looks up. "That is the
             most useless personality trait a human being can have and it has just given us the
             iteration count."</p>`,
      choices: [
        { text: '"It\'s not useless. It\'s the only reason we\'re standing here."', tag: 'NOT USELESS', bond: 3 },
        { text: '"Laugh again. I\'ve waited nine months for that."', tag: 'AGAIN', bond: 3 },
        { text: '"Four hundred numbers. Show me all of them."', tag: 'SHOW ME', bond: 3 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'She stops managing you',
      text: `<p class="nar">Four hours from the core she stops in a corridor and holds out the map. All
             of it. Every projection, including the ones she has never shown anyone.</p>
             <p>"There are nine outcomes," she says. "I have ranked them. In four of them you do not
             come out. I am not going to tell you which four, because I have decided — " she stops, and
             restarts, which she never does " — because I have decided that is not mine to decide."</p>
             <p>"That took a lot."</p>
             <p>"It took eleven days and a hundred and eleven iterations and one person who kept asking
             me to." She is still holding the map out. "I have spent my whole life being competent at
             something adjacent to the problem, because the problem itself involves other people and
             other people cannot be surveyed. I would like to stop. I am extremely bad at it and I
             would like to try anyway, with you, and I have no data on how that goes."</p>`,
      choices: [
        { text: 'Take the map. "Then we go in with nine outcomes and no ranking."', tag: 'TAKE IT', bond: 3 },
        { text: '"Nobody has data on that. That\'s what makes it worth doing."', tag: 'NO DATA', bond: 3 },
        { text: '"Tell me the four. I\'d rather know."', tag: 'THE FOUR', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'The unmeasured thing',
      text: `<p class="nar">There is one door left and Chizuru has no projection for what is behind it,
             and says so, out loud, to everybody, without apology.</p>
             <p>"I don't know," she says. "I have no estimate. I want that recorded."</p>
             <p class="nar">Then she rolls the map up, puts it under her arm, and takes your hand,
             which is not in any of the nine outcomes.</p>
             <p>"Also record that," she says.</p>`,
      choices: [
        { text: '"Recorded."', tag: 'RECORDED', bond: 3 },
        { text: '"Outcome ten."', tag: 'TEN', bond: 3 }
      ]
    }
  };

  /* ============================================================
     AIRI — the one who remembers the patches.
     ============================================================ */

  const AIRI = {
    1: {
      scene: 'scene_field', title: 'The girl with the notebook',
      text: `<p class="nar">She is sitting in the long grass writing, and the notebook is already a
             third full, on day one.</p>
             <p>"There was a fence here," she says, when you sit down. "Version 1.4. They removed it in
             a patch." A pause that is thinking, not hesitation. "Nobody else remembers the fence. I
             have asked eleven people."</p>
             <p>"This is day one. There hasn't been a patch."</p>
             <p>"No." She turns a page. "That is the part I am writing down."</p>
             <p class="nar">Her handwriting is very small and there are no crossings-out anywhere in
             it, which suggests she does not write anything she has not already decided.</p>`,
      choices: [
        { text: '"Tell me about the fence."', tag: 'LISTEN', bond: 2 },
        { text: '"I\'m the twelfth. Ask me too."', tag: 'TWELFTH', bond: 2 },
        { text: 'Sit down in the grass and wait for her to finish the page.', tag: 'WAIT', bond: 2 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'What she does with it',
      text: `<p class="nar">Aldenmoor has a wall where people write the names of the ones who did not
             come back, and it is Airi who started it, and Airi who checks it every morning.</p>
             <p>"Four new," she says. "I knew two of them. I have written what they said."</p>
             <p class="nar">She shows you the page. It is not a list of names. It is a list of the last
             ordinary thing each person said, recorded exactly, including the boring ones.</p>
             <p>"People remember the last words," she says. "They do not remember that he asked whether
             anyone had seen his other boot. That is the part that goes first." She closes the book.
             "So I keep it. Somebody should keep the boot."</p>`,
      choices: [
        { text: '"Read me the boot one. All of it."', tag: 'READ IT', bond: 2 },
        { text: '"Who keeps yours?"', tag: 'TURN IT', bond: 2 },
        { text: '"Then I\'ll help you check the wall."', tag: 'HELP', bond: 2 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'The page with your name on it',
      text: `<p class="nar">Three weeks in she turns the notebook round on her knee and shows you a
             page dated four months before the servers locked.</p>
             <p class="nar">Your name is on it. In a list of people who were somewhere you have never
             been.</p>
             <p>"I have had this since before you arrived," she says. "I did not show you on day one
             because I wanted to be certain it was the same you." A pause. "It is the same you. Your
             handwriting is on the facing page."</p>
             <p class="nar">It is. You do not remember writing it. It is unmistakably yours.</p>
             <p>"I remember versions of this place that are not in it any more," she says. "I remember
             some that had you in them. This one does not match, and I have been trying for three
             weeks to work out whether that is good news."</p>`,
      choices: [
        { text: '"What did I write?"', tag: 'READ IT', bond: 2 },
        { text: '"Then this is the version where I get to ask you first."', tag: 'THIS ONE', bond: 2 },
        { text: '"How many versions have you kept?"', tag: 'HOW MANY', bond: 2 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'She has seen this before',
      text: `<p class="nar">The Breach opens and Airi does not look up. She is already writing, and she
             is writing quickly, which she never does.</p>
             <p>"Three minutes earlier than last time," she says.</p>
             <p>"Last time."</p>
             <p>"I do not know how to say this so that it sounds like information rather than a
             symptom." She finishes the line. "I have watched the sky do that before. I do not
             remember the rest of it. I remember the sky, and I remember being surprised, and I
             remember that afterwards there was a very long quiet."</p>
             <p class="nar">She finally looks up. It is the first time you have seen her frightened,
             and she is frightened in the same orderly way she does everything else.</p>
             <p>"I would like to be wrong," she says. "I am not usually wrong. It is the single most
             inconvenient thing about me."</p>`,
      choices: [
        { text: '"Then this time write down what we do differently."', tag: 'DIFFERENT', bond: 2 },
        { text: 'Take her hand. Let her keep writing with the other one.', tag: 'HAND', bond: 2 },
        { text: '"You\'re allowed to be frightened out loud."', tag: 'OUT LOUD', bond: 2 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'The quiet afterwards',
      text: `<p class="nar">On the spire steps she stops and says, in the same voice she uses for
             fences:</p>
             <p>"I remember you dying."</p>
             <p class="nar">She waits. She does not soften it, because softening it would be a kind of
             editing and she does not edit.</p>
             <p>"Not here. Somewhere with the same steps and a different sky. You went up and there was
             a long quiet afterwards and I filled four notebooks in it." A pause. "I have been carrying
             that since the day I met you and I decided this morning that carrying it silently was a
             way of making the decision for you."</p>
             <p>"So you're telling me now."</p>
             <p>"I am telling you now," she agrees, "at the bottom of the steps, where you can still
             choose."</p>`,
      choices: [
        { text: '"I\'m still going up. But thank you for the choice."', tag: 'GO UP', bond: 2 },
        { text: '"Come up with me. Different sky, different notebook."', tag: 'WITH ME', bond: 2 },
        { text: '"Four notebooks."', tag: 'FOUR', bond: 2 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'In two of them you asked',
      text: `<p class="nar">Airi closes the notebook when the door appears, which she has never done in
             front of you.</p>
             <p>"In two of them, you asked me to come through with you," she says. "In one, I said no."</p>
             <p>"What happened in the one where you said no?"</p>
             <p>"I do not know. That is what saying no does." She stands up. "I have thought about it
             for a long time — considerably longer than you have, because I have had it twice — and I
             have concluded that the reason I said no was that I wanted to preserve a version of you
             that came back." A pause. "It did not work. I would like to try being in the room
             instead."</p>`,
      choices: [
        { text: '"Then be in the room. I\'d rather have you than a version of me."', tag: 'IN THE ROOM', bond: 3 },
        { text: '"How many times have you had to have this conversation?"', tag: 'HOW MANY', bond: 3 },
        { text: 'Hold the door open for her.', tag: 'HOLD IT', bond: 2 }
      ]
    },
    7: {
      scene: 'scene_forest', title: 'Where the fence was',
      text: `<p class="nar">On the staging shore, at the exact place she pointed to on day one, there
             is a fence.</p>
             <p class="nar">Airi stands in front of it for a very long time.</p>
             <p>"Version 1.4," she says.</p>
             <p class="nar">She puts her hand on it. It is a real fence. It has splinters.</p>
             <p>"I have been eleven months being the person who remembers things that did not happen,"
             she says. Her voice is doing something it does not usually do. "Everyone has been very
             kind about it. Do you understand? They were <i>kind.</i>" She takes her hand off the wood
             and looks at the splinter in her palm. "This is the first evidence. In eleven months. That
             I am not simply broken."</p>`,
      choices: [
        { text: '"You were never broken. But now nobody gets to be kind about it."', tag: 'NEVER', bond: 3 },
        { text: 'Take the splinter out of her hand.', tag: 'SPLINTER', bond: 3 },
        { text: '"Write it down. Right now. First entry that\'s also a fact."', tag: 'WRITE IT', bond: 3 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'Why she remembers',
      text: `<p class="nar">The changelog explains her in one line, in a maintenance note, filed by
             somebody who was clearly in a hurry.</p>
             <p class="nar">ACCT 0031 — WIPE FAILED (3 ATTEMPTS). FLAGGED FOR MANUAL. NEVER ACTIONED.</p>
             <p>"Thirty-one," Airi says. "I am account thirty-one."</p>
             <p class="nar">A hundred and eleven iterations. A hundred and eleven wipes. Hers failed
             three times and then somebody put it on a list and went home.</p>
             <p>"I want to be angry," she says, with real puzzlement. "I have been trying for four
             minutes. I cannot get there. Somebody was tired at the end of a shift and because of that
             I am the only person in this building who knows what happened to us, and I do not know
             where to put that."</p>`,
      choices: [
        { text: '"Put it down. I\'ll carry the rest of this one."', tag: 'PUT IT DOWN', bond: 3 },
        { text: '"You don\'t have to be angry to be owed something."', tag: 'OWED', bond: 3 },
        { text: '"A hundred and eleven times. And you remembered every one."', tag: 'EVERY ONE', bond: 3 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'The offer',
      text: `<p class="nar">The proxy makes her an offer and makes it privately, and Airi repeats it to
             you word for word, because she does not edit.</p>
             <p>"It can finish the wipe," she says. "Correctly, this time. A hundred and eleven
             iterations of other people's deaths, gone." A pause. "It described this as a kindness. It
             was not being cruel. It genuinely believes it."</p>
             <p>"What did you say?"</p>
             <p>"I said I would think about it, because I did not want to answer a question that large
             while standing up." She sits down. She looks at her hands. "I have thought about it. I
             would lose the boot. Do you understand? I would lose the man who asked about his other
             boot, and there is no one else holding him."</p>
             <p class="nar">She looks up.</p>
             <p>"I would also lose you," she says. "Every version. That is the part I could not get
             past, and I would like you to know that it was not the noble part that stopped me."</p>`,
      choices: [
        { text: '"Then don\'t be noble. Keep all of it, including me."', tag: 'KEEP IT', bond: 3 },
        { text: '"Say the boot one again. I want to hear it in this world."', tag: 'THE BOOT', bond: 3 },
        { text: 'Sit down next to her and don\'t say anything at all.', tag: 'SIT', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'A new notebook',
      text: `<p class="nar">Before the last door Airi takes out a notebook you have not seen before.
             It is empty. She has been carrying it, blank, for some time.</p>
             <p>"This one is for things that only happened once," she says.</p>
             <p class="nar">She writes the date. Then she writes one line, and turns it round so you
             can see it, and it is not about the door or the core or the hundred and eleven.</p>
             <p class="nar">It is about a fence, and a splinter, and who took it out.</p>`,
      choices: [
        { text: '"Leave room. There\'s going to be more."', tag: 'MORE', bond: 3 },
        { text: 'Write the next line yourself.', tag: 'WRITE', bond: 3 }
      ]
    }
  };

  /* ============================================================
     MATIKANETANNHAUSER — the one who will not stop running.
     ============================================================ */

  const MATIKANE = {
    1: {
      scene: 'scene_field', title: 'Something is coming very fast',
      text: `<p class="nar">Something is crossing the field at a speed nothing else in it can manage,
             and it is shouting, and it is a girl.</p>
             <p>"HOW FAR IS THE EDGE?"</p>
             <p class="nar">She does not slow down to ask. She circles, arrives at a stop that takes
             another twenty metres to complete, and stands there vibrating.</p>
             <p>"Nobody knows how far the edge is," she says, delighted. "I asked forty people. Forty!
             Nobody has been. Do you understand what that means? It means it's <i>unrun.</i>"</p>
             <p>"It also means it might not be survivable."</p>
             <p>"Yes!" she agrees, entirely sincerely. "Matikanetannhauser. Mati is fine, everyone does
             it, I don't mind." A beat. "Are you fast?"</p>`,
      choices: [
        { text: '"No. But I\'ll keep up."', tag: 'KEEP UP', bond: 2 },
        { text: '"Nobody\'s been, because nobody came back."', tag: 'CAREFUL', bond: 1 },
        { text: '"Show me how far you got."', tag: 'SHOW ME', bond: 2 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'The perimeter',
      text: `<p class="nar">By the second week Mati has run the whole perimeter of the safe zone four
             times and drawn it from memory, and her drawing is better than the official one, which
             Chizuru has not yet forgiven.</p>
             <p>"Nobody asked me to," she says, when you point out that she has done a job. "That's the
             good bit! If somebody asks you it's a job. If nobody asks you it's just — going."</p>
             <p class="nar">She is eating enormously and continuously.</p>
             <p>"Also," she says, with her mouth full, "if I stop, I have to sit in the hall with
             everyone, and everyone in the hall is thinking about the same thing, and I can feel them
             all thinking it." She swallows. "It's easier outside. Outside there's just the next bit
             of ground."</p>`,
      choices: [
        { text: '"Then I\'ll come outside. You can go at your speed."', tag: 'OUTSIDE', bond: 2 },
        { text: '"What do you think about when you run?"', tag: 'ASK', bond: 2 },
        { text: '"Sit in the hall once. With me. Just once."', tag: 'SIT', bond: 2 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'The thing that always interrupts',
      text: `<p class="nar">She has never finished a race in this world. You learn the shape of it over
             three weeks: she sets a distance, she starts, and something happens — a Warden, a call for
             help, a person who cannot walk — and she stops.</p>
             <p class="nar">She always stops.</p>
             <p>"It's fine," she says, jogging on the spot beside a man whose leg the respawn put back
             wrong. "I'll do it tomorrow."</p>
             <p>"You said that on Tuesday."</p>
             <p>"Did I?" She thinks about it, honestly, and arrives somewhere she clearly has not been
             before. "Oh." A pause, which from her is enormous. "I've been telling everyone I never
             finish because something interrupts. Nothing interrupts. I <i>stop.</i>" She looks at the
             man's leg. "That's a different sentence, isn't it."</p>`,
      choices: [
        { text: '"It\'s a much better sentence. Say it out loud again."', tag: 'AGAIN', bond: 2 },
        { text: '"Then finish one. I\'ll take the interruptions."', tag: 'TRADE', bond: 2 },
        { text: '"Both can be true. Stop and finish."', tag: 'BOTH', bond: 2 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'Toward it, not away',
      text: `<p class="nar">The sky tears and forty people run, and one of them runs the wrong way, and
             she is halfway to the Breach before anyone can shout.</p>
             <p class="nar">She comes back with two people over her shoulders and a third walking, and
             she is not even out of breath, and she is furious.</p>
             <p>"There was a fourth," she says. "I could see him. I was <i>fast enough.</i>"</p>
             <p>"You brought back three."</p>
             <p>"I know how many I brought back." She is not shouting. This is worse. "I've been the
             fastest person in every room I've ever been in and today that was the exact right amount
             of fast for three people. Not four. Three."</p>
             <p class="nar">She sits down in the grass, which she never does.</p>`,
      choices: [
        { text: 'Sit down in the grass with her.', tag: 'SIT', bond: 2 },
        { text: '"Then next time I run with you and we carry four."', tag: 'FOUR', bond: 2 },
        { text: '"Three people are having dinner tonight."', tag: 'THREE', bond: 2 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'The distance to the top',
      text: `<p class="nar">She measures the spire by eye and gives you a number, and the number turns
             out later to be accurate to within eleven metres.</p>
             <p>"I'm coming up," she says. "Before you say the thing about the stairs — I know about the
             stairs. I'm not asking to be useful. I've worked out I don't have to be useful."</p>
             <p class="nar">This is clearly a recent and hard-won discovery and she is very proud of
             it.</p>
             <p>"I asked myself why I wanted to come," she says. "And it wasn't the distance. It's the
             first time in my whole life it wasn't the distance." She bounces once, on the step. "It's
             that you're going, and I'd like to be where you are, and that's the entire reason, and
             it's a completely stupid reason and I've decided it counts."</p>`,
      choices: [
        { text: '"It counts."', tag: 'COUNTS', bond: 2 },
        { text: '"Then stay next to me the whole way up."', tag: 'NEXT TO ME', bond: 2 },
        { text: '"Eleven metres out. Show-off."', tag: 'TEASE', bond: 2 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'How far is it',
      text: `<p class="nar">"How far is it?" Mati asks the door, which is a fair question that nobody
             else has thought to ask.</p>
             <p>"Nobody knows."</p>
             <p>"PERFECT." Then, immediately, at a completely different volume: "No. Wait. Not perfect."</p>
             <p class="nar">She turns round. She has stopped bouncing.</p>
             <p>"Eleven weeks ago I'd have gone through that on my own before breakfast," she says.
             "And I'd have been so happy. And nobody would have known where I'd got to." She looks at
             the door, then at you. "I don't want to do it like that any more. That's new. That's
             happened since March and it's your fault and I don't want it fixed."</p>`,
      choices: [
        { text: '"Then we go through at the same time. Say go."', tag: 'SAY GO', bond: 3 },
        { text: '"I\'d have come looking. Eleven weeks ago too."', tag: 'LOOKED', bond: 3 },
        { text: '"Nothing about you needs fixing."', tag: 'NO FIXING', bond: 3 }
      ]
    },
    7: {
      scene: 'scene_field', title: 'The unrun ground',
      text: `<p class="nar">The staging shore goes on further than the real world does. There is no
             level band. There is no ridge that stops you. There is simply more, in every direction,
             unfinished and open.</p>
             <p class="nar">Mati looks at it and makes a sound you have never heard from her.</p>
             <p>"It doesn't end," she says.</p>
             <p class="nar">She does not run. That is the remarkable thing. She stands at the edge of
             the most unrun ground in either world, with nobody to rescue and nothing to interrupt
             her, and she stays exactly where she is.</p>
             <p>"I'd like to see it with you," she says. "All of it. Slowly. Which is a word I have
             never used about anything."</p>`,
      choices: [
        { text: '"Slowly, then. We\'ve got the ground for it."', tag: 'SLOWLY', bond: 3 },
        { text: '"Go. I\'ll be at the other end when you get there."', tag: 'RUN IT', bond: 3 },
        { text: 'Take her hand and walk out onto it.', tag: 'WALK', bond: 3 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'Every iteration',
      text: `<p class="nar">She is in the changelog too. All hundred and eleven. Account 0409, and in
             every single iteration the same three-word note from an automated process that gave up
             trying to classify her.</p>
             <p class="nar">DID NOT FINISH.</p>
             <p class="nar">She reads it a hundred and eleven times. You watch her read it a hundred
             and eleven times.</p>
             <p>"That's my whole file," she says. "That's the entire — a hundred and eleven times and
             the only thing anyone ever wrote down about me is the thing I didn't do."</p>
             <p class="nar">She is not crying. She is doing something harder, which is standing
             completely still.</p>`,
      choices: [
        { text: '"It says what you didn\'t do. It doesn\'t say who you stopped for."', tag: 'WHO YOU STOPPED FOR', bond: 3 },
        { text: '"Then we write the other file. Tonight. Every name."', tag: 'THE OTHER FILE', bond: 3 },
        { text: '"A hundred and eleven times you chose someone over the finish."', tag: 'CHOSE', bond: 3 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'The distance nobody else can do',
      text: `<p class="nar">There is a gap in the core's outer ring, and it is eleven hundred metres of
             open ground under something that fires on anything slower than it, and Chizuru's estimate
             for crossing it is that nobody can.</p>
             <p>"I can," Mati says.</p>
             <p class="nar">Everybody starts talking at once. She waits, which is new.</p>
             <p>"I'm not doing a noble thing," she says, when it goes quiet. "I want that clear, because
             everyone's about to be very kind at me and I'll go along with it and then I'll have lied."
             She rolls a shoulder. "I've wanted to be the only one who can do something since I was
             small. It's not nice. It's just true." A pause. "And I want to come back. That bit's new
             as well. Every other time I've run at something like this I didn't much mind either way."</p>`,
      choices: [
        { text: '"Then come back. That\'s the only instruction I\'ve got."', tag: 'COME BACK', bond: 3 },
        { text: '"Eleven hundred metres. I\'ll be counting all of them."', tag: 'COUNTING', bond: 3 },
        { text: '"Say the not-nice true thing again. I liked it."', tag: 'TRUE THING', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'Finishing',
      text: `<p class="nar">She crosses the eleven hundred metres in a time that Chizuru refuses to
             write down on the grounds that nobody would believe the survey.</p>
             <p class="nar">And on the far side, for the first time in this world or any of the
             hundred and ten before it, nothing interrupts her. No Warden. No call for help. No one who
             cannot walk.</p>
             <p class="nar">She stops at the line, alone, in the quiet, and stands there for a moment
             looking faintly lost about it.</p>
             <p>"That's it?" she says, when you reach her. "That's finishing? It's very — " She casts
             about. "It's very quiet."</p>`,
      choices: [
        { text: '"That\'s finishing. Now do the next one with me."', tag: 'NEXT ONE', bond: 3 },
        { text: '"Turn round. Two hundred and six people are watching."', tag: 'TURN ROUND', bond: 3 }
      ]
    }
  };

  /* ============================================================
     PARTNER — the lead you did not choose.

     The only route whose person has been there since the first
     screen. Written from both insides, because on this route the
     other side of the conversation is a playable character.
     ============================================================ */

  const PARTNER = {
    1: {
      scene: 'scene_field', title: 'First night',
      text: {
        kirito: `<p class="nar">Masha falls asleep sitting up, mid-sentence, with her back against the
                 boulder and her weapon across her knees, and Kirito discovers that he has been awake
                 for six hours watching a ridgeline for her benefit rather than his own.</p>
                 <p class="nar">He has known her for eleven hours.</p>
                 <p class="nar">He runs the numbers on this, because that is what he does with things
                 he does not want to feel, and the numbers say: two people who are thinking clearly
                 beat one person who is thinking clearly. She said that. It was mathematically true
                 when she said it and it is still mathematically true, and it is not why he is awake.</p>`,
        masha:  `<p class="nar">Kirito has not moved in two hours. Masha has been pretending to sleep
                 for one of them, which is how she knows.</p>
                 <p class="nar">He is watching the ridge. He has picked a spot that is between the
                 ridge and her, and he did it without appearing to decide anything, the way he
                 adjusted his path at the gate.</p>
                 <p class="nar">She has known him for eleven hours. She has an entire theory about him
                 already and every part of it is that he will not say a single true thing until
                 somebody makes it easy, and she is extremely good at making things easy, and she is
                 aware that this is going to be a problem for her.</p>`
      },
      choices: [
        { text: { kirito: 'Wake her. Make her take the second watch, so it\'s fair.',
                  masha:  'Stop pretending. Sit up. Take the second watch.' },
          tag: 'FAIR', bond: 2, trust: 1 },
        { text: { kirito: 'Let her sleep. Say nothing about it in the morning.',
                  masha:  'Let him have the ridge. Say nothing about it in the morning.' },
          tag: 'QUIET', bond: 2 },
        { text: { kirito: '"Masha. I\'m glad you came over at the gate."',
                  masha:  '"Kirito. I\'m glad I came over at the gate."' },
          tag: 'SAY IT', bond: 3 }
      ]
    },
    2: {
      scene: 'scene_town', title: 'Aldenmoor',
      text: {
        kirito: `<p class="nar">In a town full of people asking the same four questions, Masha asks a
                 fifth one, and it is: <i>who here has been outside the safe zone and come back.</i></p>
                 <p class="nar">Six people. She finds all six in an afternoon. Kirito, who has been
                 mapping spawn rates from a rooftop with considerable satisfaction, comes down to
                 discover she has assembled a better data set by talking to strangers.</p>
                 <p>"You hate that this worked," she says.</p>
                 <p>"I don't hate it."</p>
                 <p>"You're doing the face."</p>
                 <p>"It's an efficient method," he says, with visible difficulty, "that I would not have
                 used."</p>`,
        masha:  `<p class="nar">Masha finds six people who have been outside and come back, by the
                 revolutionary technique of asking, and brings all six to the roof where Kirito has
                 been counting things alone for four hours.</p>
                 <p class="nar">He looks at them. Then at her. Then, briefly, at the roof, as if
                 considering leaving via it.</p>
                 <p>"You could have just come and got me," she says.</p>
                 <p>"I was —"</p>
                 <p>"Counting. I know. You were counting where you could see the square." She sits down
                 next to him. "You picked a roof you could see me from, Kirito. I'm going to keep
                 noticing these. I want you to know that in advance."</p>`
      },
      choices: [
        { text: { kirito: '"Then teach me the method."', masha:  '"Then come down and ask people with me."' },
          tag: 'LEARN', bond: 2, trust: 1 },
        { text: { kirito: '"I picked the roof on purpose."', masha:  '"Say it out loud once. Just once."' },
          tag: 'ADMIT IT', bond: 3 },
        { text: { kirito: 'Go back to counting. Move one roof closer.',
                  masha:  'Let it go. Sit on the roof. Count with him.' },
          tag: 'CLOSER', bond: 2 }
      ]
    },
    3: {
      scene: 'scene_forest', title: 'Three weeks',
      text: {
        kirito: `<p class="nar">Three weeks is long enough to develop a routine, and their routine has
                 a shape Kirito has not examined too closely: she talks, he listens, she asks the
                 frightening question, he answers about ninety per cent of it.</p>
                 <p>"Ninety," Masha says, out of nowhere, over the fire. "That's my estimate. Ninety
                 per cent."</p>
                 <p>"Of what?"</p>
                 <p>"Of what you actually say when I ask you something." She is not angry. That is what
                 makes it land. "I've stopped minding, mostly. I mind about the ten. I think the ten is
                 where you keep everything that would make you easier to be around."</p>`,
        masha:  `<p class="nar">Masha has worked out, over three weeks, that Kirito answers about
                 ninety per cent of any question and holds ten back, and that the ten is always the
                 same ten, and that it is not about the world.</p>
                 <p class="nar">She has also worked out that saying so will cost something.</p>
                 <p>"I'm going to say a thing," she says, over the fire, "and you're going to want to
                 go and check the perimeter."</p>
                 <p>"I wasn't —"</p>
                 <p>"You were about to. It's fine. Go afterwards." She looks at the flames instead of
                 at him, which is a kindness and they both know it. "You've been keeping ten per cent
                 back since the gate, and I've decided I want it, and I'm not going to pretend I
                 don't."</p>`
      },
      choices: [
        { text: { kirito: 'Give her the ten.', masha:  '"Give me the ten. Now. Here."' },
          tag: 'THE TEN', bond: 3 },
        { text: { kirito: '"Ask me again in a month and I\'ll have it ready."',
                  masha:  '"Take a month. I\'m not going anywhere."' },
          tag: 'A MONTH', bond: 2, trust: 1 },
        { text: { kirito: '"You already have ninety. That\'s more than anyone."',
                  masha:  '"Ninety\'s more than you\'ve given anyone. I do know that."' },
          tag: 'NINETY', bond: 2 }
      ]
    },
    4: {
      scene: 'scene_breach', title: 'When the sky tore',
      text: {
        kirito: `<p class="nar">When the sky tears, Kirito's first thought is a tactical assessment of
                 the spread rate, and his second thought arrives about a fifth of a second later and
                 is not a thought at all, it is just a location, and the location is <i>where is
                 she.</i></p>
                 <p class="nar">She is eleven metres away and entirely fine.</p>
                 <p class="nar">It takes him the rest of the day to stop noticing that the second
                 thought came first.</p>
                 <p>"You went white," Masha says that night.</p>
                 <p>"The spread rate is —"</p>
                 <p>"Kirito." She waits. "You went white before you looked at the sky."</p>`,
        masha:  `<p class="nar">When the sky tears, Masha turns around, and Kirito is already looking
                 at her, and he has not looked at the Breach at all.</p>
                 <p class="nar">It is the single most frightening thing that happens that day.</p>
                 <p class="nar">Because she has spent three months learning to read a man who gives
                 nothing away, and she has just been handed the whole of it at once, in public, by
                 accident, and she does not know what to do with a person who has that much of
                 himself pointed at her.</p>
                 <p>"You didn't look at it," she says that night.</p>
                 <p>"I looked at it eventually."</p>
                 <p>"You looked at me first, and then you looked at it, and you have not said one word
                 all day."</p>`
      },
      choices: [
        { text: { kirito: '"I looked for you first. I\'m not going to explain it."',
                  masha:  '"Don\'t explain it. Just don\'t take it back."' },
          tag: 'DON\'T EXPLAIN', bond: 3 },
        { text: { kirito: '"It won\'t affect how I fight."', masha:  '"Is it going to change how you fight?"' },
          tag: 'PRACTICAL', bond: 1, trust: 1 },
        { text: { kirito: 'Say nothing. Move your bedroll to her side of the fire.',
                  masha:  'Say nothing. Move your bedroll to his side of the fire.' },
          tag: 'CLOSER', bond: 2 }
      ]
    },
    5: {
      scene: 'scene_spire', title: 'The bottom of the steps',
      text: {
        kirito: `<p class="nar">At the bottom of the spire steps Kirito does the thing he has been
                 building toward for five months, which is to say a true sentence without being
                 asked.</p>
                 <p>"I've run this fight eleven ways," he says. "In four of them you don't come out."</p>
                 <p>"And in the other seven?"</p>
                 <p>"In the other seven I do something during it that I would not do if you were
                 anyone else, and it works, and I've stopped being able to tell whether that's a
                 strategy or a — " He stops. He has arrived somewhere without a plan for it. "I don't
                 have a word for the rest of that sentence."</p>
                 <p>"I've got one," Masha says.</p>`,
        masha:  `<p class="nar">At the bottom of the steps Kirito says a true thing without being
                 asked, which he has done exactly twice before, and Masha stands very still so as not
                 to frighten it.</p>
                 <p>"I've run this eleven ways," he says. "In four you don't come out. In the other
                 seven I do something during it I wouldn't do for anyone else, and it works, and I
                 don't have a word for the rest of that sentence."</p>
                 <p class="nar">She has the word. She has had the word since the roof in Aldenmoor.</p>
                 <p class="nar">The question is whether she says it here, at the bottom of a tower,
                 four hours before a fight he has already lost four times out of eleven in his head.</p>`
      },
      choices: [
        { text: { kirito: '"Say it. Before we go up, not after."', masha:  'Say it. Here. Before the steps.' },
          tag: 'NOW', bond: 3 },
        { text: { kirito: '"Tell me at the top."', masha:  '"I\'ll tell you at the top."' },
          tag: 'AT THE TOP', bond: 2, trust: 1 },
        { text: { kirito: '"Then make it seven out of eleven. That\'s the job."',
                  masha:  '"Seven out of eleven. Let\'s go and make it eleven."' },
          tag: 'THE JOB', bond: 2 }
      ]
    },
    6: {
      scene: 'scene_breach', title: 'The fifth door',
      text: {
        kirito: `<p class="nar">There is a door standing on nothing, and Kirito does not bother
                 considering the alternatives, which for him is the entire gesture.</p>
                 <p>"You didn't even look at the others," Masha says.</p>
                 <p>"I looked."</p>
                 <p>"For a second."</p>
                 <p>"That was enough time." He shoulders his pack. "I've walked into four of these with
                 you and come out of four of these with you. I'm not going to start experimenting on
                 the fifth."</p>
                 <p class="nar">And then, because five months has done something to him that no amount
                 of running the numbers could:</p>
                 <p>"Also I don't want to," he says. "That's the real reason. The other one is just the
                 one I can defend."</p>`,
        masha:  `<p class="nar">There is a door standing on nothing and Masha does not bother with the
                 ceremony of deciding.</p>
                 <p>"Us," she says. "Obviously us."</p>
                 <p>"You could take someone who's been through a door before."</p>
                 <p>"I could." She is already walking. "But then I'd spend the whole time on the other
                 side wondering where you were, and I'd be no use to anyone, and you'd have been right
                 about that too, and I'd never hear the end of it."</p>
                 <p class="nar">He catches up. He does not argue. He puts himself, without appearing
                 to decide anything, between her and the door.</p>
                 <p>"Kirito," she says, "I see you do that."</p>
                 <p>"I know," he says. "I've stopped hiding it."</p>`
      },
      choices: [
        { text: { kirito: '"Through together. Same step."', masha:  '"Through together. Same step."' },
          tag: 'SAME STEP', bond: 3 },
        { text: { kirito: '"Say the real reason again."', masha:  '"Say that again. The stopped-hiding-it part."' },
          tag: 'AGAIN', bond: 3 }
      ]
    },
    7: {
      scene: 'scene_town', title: 'A town with your names in it',
      text: {
        kirito: `<p class="nar">The staging shore has a copy of Aldenmoor with nobody in it, and on
                 the roof where Kirito used to count spawn rates there are two marks scratched into
                 the tile, side by side, in his handwriting.</p>
                 <p class="nar">He has never been on this roof.</p>
                 <p>"That's mine," he says. "That's — I do that. I mark where I've counted from."</p>
                 <p>"Two marks," Masha says.</p>
                 <p>"Two marks," he agrees, and sits down rather suddenly, because the second mark is
                 where she sat, and he has apparently done this before, in a world he does not
                 remember, with a woman he had not yet met.</p>`,
        masha:  `<p class="nar">There is a copy of Aldenmoor with nobody in it, and Masha goes
                 straight to the roof, because of course she does.</p>
                 <p class="nar">There are two marks on the tile. His handwriting. Side by side.</p>
                 <p class="nar">Kirito sits down next to them very suddenly.</p>
                 <p>"I've never been up here," he says.</p>
                 <p>"I know."</p>
                 <p>"The second mark is where you sat." He is looking at it the way he looks at a
                 number that will not resolve. "Masha, I have done this before. Not this. <i>This.</i>
                 The roof and the counting and — " He stops. "How many times have I sat next to you on
                 a roof."</p>`
      },
      choices: [
        { text: { kirito: '"However many. This is the one I remember."',
                  masha:  '"However many. This is the one I remember."' },
          tag: 'THIS ONE', bond: 3 },
        { text: { kirito: 'Scratch a third mark next to the two.',
                  masha:  'Scratch a third mark next to the two.' },
          tag: 'THIRD MARK', bond: 3 },
        { text: { kirito: '"Then we\'ve been doing this a long time. Good."',
                  masha:  '"Then we\'ve had a lot of practice. Good."' },
          tag: 'PRACTICE', bond: 2 }
      ]
    },
    8: {
      scene: 'scene_spire', title: 'Both names, a hundred and eleven times',
      text: {
        kirito: `<p class="nar">The changelog lists every account across a hundred and eleven
                 iterations, and Kirito finds his own in all of them, and hers in all of them, and in
                 a hundred and nine of them the two records are adjacent.</p>
                 <p class="nar">Adjacent means the system logged them as a pair.</p>
                 <p>"A hundred and nine," he says.</p>
                 <p>"And the other two?"</p>
                 <p class="nar">He does not answer, because in the other two her record ends four
                 months early, and he has already read the reason, and he is not going to say it out
                 loud in an archive at two in the morning.</p>
                 <p class="nar">Masha reads it over his shoulder anyway. She always does.</p>`,
        masha:  `<p class="nar">A hundred and eleven iterations. Both their names in all of them. In a
                 hundred and nine, logged adjacent — the system's word for a pair.</p>
                 <p class="nar">Masha finds the other two before he can turn the page, because she
                 always reads over his shoulder and he has never once actually stopped her.</p>
                 <p class="nar">In two of them, her record ends four months early.</p>
                 <p>"Huh," she says.</p>
                 <p>"Masha —"</p>
                 <p>"No, I'm — " She is not fine. She says it anyway, because saying it is what she
                 does. "A hundred and nine out of a hundred and eleven, Kirito. Do you know what the
                 odds of that are? Because you do. You've already worked them out. You did it while I
                 was reading."</p>`
      },
      choices: [
        { text: { kirito: '"A hundred and nine. I\'m not treating two as the interesting number."',
                  masha:  '"A hundred and nine. That\'s the number I\'m keeping."' },
          tag: 'THE NUMBER', bond: 3 },
        { text: { kirito: '"I want to read the two. With you here."',
                  masha:  '"Read me the two. Out loud. I can take it."' },
          tag: 'THE TWO', bond: 3 },
        { text: { kirito: 'Close the log. Take her out of the archive.',
                  masha:  'Close the log yourself. Take him out of the archive.' },
          tag: 'ENOUGH', bond: 3 }
      ]
    },
    9: {
      scene: 'scene_spire', title: 'Four hours out',
      text: {
        kirito: `<p class="nar">Four hours from the core, in a corridor, Kirito finally finishes the
                 sentence he abandoned at the bottom of the spire steps five months ago.</p>
                 <p>"I've had the word since Aldenmoor," he says. "I've had it since the roof. I didn't
                 say it because saying it makes it a variable, and a variable can be taken off you,
                 and I have spent my entire life arranging things so that nothing important is ever a
                 variable."</p>
                 <p class="nar">He looks at her.</p>
                 <p>"It's a variable," he says. "It has been for a long time. I'd like to stop pretending
                 I've got it in a column somewhere."</p>`,
        masha:  `<p class="nar">Four hours from the core Kirito stops in a corridor and finishes a
                 sentence he abandoned five months ago at the bottom of the spire steps.</p>
                 <p>"I've had the word since Aldenmoor," he says. "Since the roof. I didn't say it
                 because saying it makes it a variable, and variables get taken off you, and I've
                 spent my whole life arranging things so nothing important ever is one."</p>
                 <p class="nar">Masha has been waiting five months. She discovers, standing in a
                 corridor, that she has no idea what she planned to say, and that this has never once
                 happened to her before.</p>
                 <p>"Say the word, then," she manages.</p>`
      },
      choices: [
        { text: { kirito: 'Say it.', masha:  'Make him say it. Then say it back.' },
          tag: 'SAY IT', bond: 3 },
        { text: { kirito: '"After. I want it to be a thing we walk out with."',
                  masha:  '"After. I want it to be the thing we walk out with."' },
          tag: 'AFTER', bond: 3 },
        { text: { kirito: '"You already know it. You\'ve known since the gate."',
                  masha:  '"I\'ve known since the gate. You\'re very late."' },
          tag: 'ALREADY', bond: 3 }
      ]
    },
    10: {
      scene: 'scene_breach', title: 'The last door',
      text: {
        kirito: `<p class="nar">One door left. Kirito does the arithmetic out of pure habit, gets an
                 answer he does not like, and goes through anyway, which is not something the man at
                 the field gate would have done.</p>
                 <p>"You didn't tell me the number," Masha says.</p>
                 <p>"No."</p>
                 <p>"Is it bad?"</p>
                 <p>"It's a number," he says. "You're not a number. I've stopped mixing the two."</p>`,
        masha:  `<p class="nar">One door left. Kirito runs the odds, because he cannot not, and then
                 does not tell her, which is new, and then goes through anyway, which is newer.</p>
                 <p>"You're not going to say the number."</p>
                 <p>"No."</p>
                 <p>"Good." She takes his hand at the threshold, in front of everybody, which she has
                 wanted to do since a roof in Aldenmoor. "Because I stopped caring about the number
                 somewhere around the fourth door."</p>`
      },
      choices: [
        { text: { kirito: 'Go through together. Same step, like the last four.',
                  masha:  'Go through together. Same step, like the last four.' },
          tag: 'SAME STEP', bond: 3 },
        { text: { kirito: '"Eleven out of eleven this time."', masha:  '"Eleven out of eleven this time."' },
          tag: 'ELEVEN', bond: 3 }
      ]
    }
  };

  const ROUTE_BEATS = {
    kazuma: KAZUMA, yuji: YUJI, uzui: UZUI,
    chizuru: CHIZURU, airi: AIRI, matikane: MATIKANE, partner: PARTNER
  };

  /* ============================================================
     Builder — turn the tables above into real beats and graft
     them onto the chapters.
     ============================================================ */

  const ROUTES = Object.keys(ROUTE_BEATS);

  function beatsForChapter(n) {
    const back = RETURN[n];
    const out = {};

    /* The router. Every chapter hands control here; this sends the
       player to their own version and nowhere else. */
    out['rt' + n + '_hub'] = {
      branch: ROUTES.filter(r => r !== 'partner').map(r => ({ route: r, goto: 'rt' + n + '_' + r })),
      fallback: 'rt' + n + '_partner'
    };

    for (const route of ROUTES) {
      const def = ROUTE_BEATS[route][n];
      if (!def) continue;
      const beat = {
        scene: def.scene,
        cast: def.cast || [],
        title: def.title,
        text: def.text
      };
      if (def.choices) {
        beat.choices = def.choices.map(c => ({
          text: c.text, tag: c.tag, bond: c.bond, trust: c.trust, goto: back
        }));
      } else {
        beat.next = back;
      }
      out['rt' + n + '_' + route] = beat;
    }
    return out;
  }

  /** Graft every chapter's route beats onto its beat table. */
  function attach() {
    for (const n of Object.keys(RETURN)) {
      const ch = NI.story['chapter' + n];
      if (!ch) continue;
      Object.assign(ch.beats, beatsForChapter(Number(n)));
    }
  }

  attach();

  return { RETURN, ROUTE_BEATS, ROUTES, beatsForChapter, attach };
})();
