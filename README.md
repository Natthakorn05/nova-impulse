# NOVA IMPULSE

An anime isekai visual novel with turn-based JRPG combat. You log into a game on launch day,
the logout button does nothing, and the next ten chapters are about getting strong enough to
reach whoever did that — and then working out what they actually wanted.

Battle-heavy by design: **10 chapters, 284 story beats, 35 battles per run**, free class
selection, a 5-tier skill matrix per class, seven romance routes woven through every chapter,
an endless endgame mode, a two-banner summon system with 27 collectable Echoes, and a gender
choice that decides which of the two leads you play — mechanically, not just cosmetically.

Every number in this README is measured by a tool in `tools/`, not estimated.

---

## Running it

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`. No build step and no dependencies — Phaser is vendored
locally in `vendor/`, so it also works offline. Art is pre-generated and served as static
files, so the game never calls an API to play.

### Controls

- **Story** — click choices, or press `1`–`4`; `Space`/`Enter` advances
- **Battle** — click skill icons, or press `1`–`9`; `Esc` cancels targeting
- Progress auto-saves to `localStorage`; **CONTINUE** on the title resumes

---

## The two paths (§2)

Your gender choice decides who you *control*, not just a pronoun:

| Choice | You play | Companion |
|---|---|---|
| Male | **Kirito** | Masha |
| Female | **Masha** | Kirito |

The plot is the same; the *writing* is not. Both paths carry fully separate text —
**21,275 words on Kirito's path against 21,341 on Masha's, a 0.3% skew** — the same scenes
written twice from two different insides. Kirito's chapters are about someone who copes by
handling logistics instead of feelings; Masha's are about someone who copes by naming the
problem out loud immediately. Neither is the "default" with the other bolted on.

### The leads diverge mechanically too

Whoever you play occupies party slot 0 and brings a trait the other one does not:

| Lead | Trait | Effect |
|---|---|---|
| **Kirito** | Read Ahead | +20% damage to any enemy already suffering a status effect |
| **Masha** | Called It | The first time anyone drops below half HP: +25% damage, +8 SPD, three turns |

> *"He is not faster than you. He got there earlier."* / *"She said this would happen. She hates being right."*

They are deliberately within noise of each other — **89.9% vs 90.3%** boss clear across a full
run — because the choice is meant to change how a fight feels, not which lead is correct.
Read Ahead rewards opening with status; Called It rewards taking the hit and swinging back.

Two things had to be fixed to get there. The trait keyed off *character id*, and both leads are
always in the party, so every run lit both traits at once; it keys off slot 0 now. And Masha's
original trigger (25% HP, +15% damage) fired too late to matter, leaving her 4–7 points behind.

---

## Romance — seven routes (§11)

The route is chosen **during registration**, not at a lock in chapter 6. Six newcomers plus
your partner:

| Route | Available to | Who they are |
|---|---|---|
| **Kazuma** | Female leads | The one who logged out and came back — and won't say why until ch7 |
| **Yuji** | Female leads | The one carrying something else |
| **Uzui** | Female leads | The one who makes an entrance |
| **Chizuru** | Male leads | The one who is always working |
| **Airi** | Male leads | The one who remembers the patches |
| **Matikanetannhauser** | Male leads | The one who will not stop running |
| **Partner** | Either | The lead you did not choose |

Picking at registration is what makes the first half work. When the lock lived in chapter 6,
chapters 1–5 had to pretend six of the seven main characters did not exist, then introduce
them all at once as strangers who instantly mattered.

That is only affordable because route content lives in `src/data/chapters/routes.js` rather
than being copied into ten chapter files. Each chapter hands control to `rt<N>_hub`, a router
that sends the player to their version of that beat and returns them to the spine.
`tools/qa-story.mjs` fails the build if any route is missing a chapter, and
`tools/qa-playthrough.mjs` walks **all seven routes × both leads** through to chapter 10.

Romance builds through a `trust` stat raised by dialogue choices and shared battle moments.

---

## Classes (§3)

You pick your class freely. **Your companion's class is randomised by the system** — you never
choose it, which is the intended replay hook.

| Class | Role |
|---|---|
| **Mage** | Elemental burst, AoE, status pressure. Highest ceiling, lowest HP. |
| **Ranger** | Precision, crits, evasion. Deletes one target at a time. |
| **Fighter** | Melee all-rounder built around combo chains. |
| **Tank** | Aggro, party protection, attrition. Decides who the enemy may attack. |

Boss clear rate across a **full 10-chapter run**, 400 simulated runs per class
(`node tools/qa-balance.mjs 400 --late`):

| Class | Boss clear | Battles won | End level |
|---|---|---|---|
| **Tank** | 94.8% | 96.5% | 17.3 |
| **Mage** | 90.8% | 87.9% | 16.8 |
| **Fighter** | 89.5% | 92.3% | 17.1 |
| **Ranger** | 86.8% | 93.3% | 17.1 |

Measured across a whole run on purpose. In an isolated duel *every* pairing beats the chapter-5
boss 94–100%, because the fight that decides the game is the one you arrive at with your HP and
MP already spent. Benchmarking a boss alone reports 100% across the board and tells you nothing.

Losing is a **written story branch**, never a game over — so even a bad roll continues the story.

---

## Skill matrix (§4)

**71 nodes** across 5 tiers per class — mage 18, ranger 19, fighter 17, tank 17 — mixing
passives and active skills. Tiers unlock by level: `1 / 3 / 5 / 10 / 14`.

Chapters 1–5 land a run around level 9, so tiers 4–5 stay visibly locked for the whole first
half: content you can see but not reach, which is a plot point rather than an oversight. The
back half opens them — a full ten-chapter run ends around **level 17**.

---

## Battle system (§5)

Turn-based, skill-driven, party-vs-enemy across **22 enemies and 37 encounters**. Turn order
recomputes each round from effective SPD, so Slow and Haste actually move the queue.

**Combo Link** — a skill tagged with `combo` hits harder when your partner has already acted
this round. It's the mechanical spine of the party: chapter 4 is an encounter chain designed to
be very hard without it.

Statuses: burn, poison, bleed, slow, freeze, stun, taunt, mark, shields, and timed buffs.
Enemy skills resolve through the *exact same* damage pipeline as player skills — no duplicate math.

### A balance note worth reading

The damage formula splits a skill's stat contribution **across its hits**:

```js
raw = skill.power + (stat * STAT_SCALE) / hits
```

Without that divisor, an 8-hit skill received 8× the full stat bonus, which made multi-hit
strictly dominant and ended boss fights in under two rounds. Splitting it means extra hits buy
you more crit rolls and status procs rather than raw damage — the more interesting trade.

Further fixes came out of simulating the real engine rather than reading it. `qa-balance` plays
whole runs against the actual battle code:

- **The five-tier tree was a two-tier tree.** A run ended at level 7 with 7 skill points, which
  is *exactly* the seven nodes of tiers 1–2. There was never a choice to make.
- **The Ranger was unviable at 21%** boss clear against the Tank's 49%. It stacked crit *chance*
  all game with no crit *damage* node below tier 3, which it never reached. Moving that payoff
  down to tier 2 fixed it.
- HP carried between battles with no recovery, so one hard fight cascaded into losing every
  subsequent one — and losses gave no XP, so the party could never climb out. Battles now grant
  partial recovery, chapters fully restore, and defeats award 40% XP.
- **Chapters 7–10 shipped genuinely unwinnable** (9–51% clear). `tools/tune-bosses.mjs` sweeps
  difficulty by spawning `qa-balance` under an `NI_BALANCE_PATCH` hook and parsing the result;
  it found that boss **HP** was the entire problem and attack was already correct. Four bosses
  came down 25–38%, elites ×0.72.

> One caveat worth recording: the first simulator ranked skills by raw `power` and ignored crit
> entirely, which made the Ranger look 12 points worse than it was. The simulator was fixed
> *before* any class was rebalanced. A benchmark that mis-plays a class will happily tell you to
> buff it into the ground.

---

## Endgame — Echoes, Breach and summoning

Everything here unlocks at the chapter-5 hook and nowhere earlier. That is a balance decision
before it is a story one: chapters 1–5 are tuned for a two-person party, and a third body raises
every win rate in the game.

**Breach** is an endless gauntlet. Waves scale +9% each, you recover 16% of your bars between
them (34% after a Surge wave), and the run ends when both leads are down. Depth is the score.

It is a gauntlet rather than a boss rematch for a measurable reason. A rested level-10 party
beats that boss close to 100% of the time. The first version of `qa-echoes` benchmarked exactly
that and every row read 100%, with or without an Echo, common or legendary. That is a broken
instrument, not a balance result.

### Echoes

Creature companions that fight in a third slot and **play themselves** — a pet the player
micromanages is a third set of buttons every round and doubles the length of a fight.
**27 of them: 7× 3★, 12× 4★, 8× 5★.** Duplicates raise *bond* (1–5) rather than stacking.

Measured contribution, as extra Breach waves over a 6.5-wave base (60 runs per row):

| Tier | bond 1 | bond 5 |
|---|---|---|
| 3★ | +1.7 | +2.0 |
| 4★ | +2.5 to +4.4 | +3.1 to +5.3 |
| 5★ | +3.9 to +6.0 | +4.5 to +7.4 |

Two corrections were needed to get there, both invisible without the tool. Wardens dominate an
attrition mode far beyond their rarity — mitigation compounds where raw damage does not, and the
first epic warden beat both legendaries. And a 5★ striker landed *below* a 4★ warden, which is a
broken promise about what rarity means; the fix was lifesteal rather than a bigger number,
because a striker's problem is that damage does nothing to keep a run alive.

### Two banners

| Banner | Base 5★ | Soft pity | Hard pity | Pool |
|---|---|---|---|---|
| **OPEN INDEX** | 0.5% | 65 | 80 | The full roster |
| **DEEP INDEX** | 1.0% | 45 | 60 | Six exclusive Echoes |

**Pity is tracked per banner** (`pityKey`), which is the behaviour every player expects; a shared
counter lets you build 79 pulls on one banner and cash it in on the other. A featured Echo gets a
50% rate-up applied *after* tier selection, so a rate-up never changes how often you see a 5★ —
only which one you get.

100 shards a pull. **949 pulls to complete the roster**, about 174 full runs to wave 8.

The summon screen has banner tabs, a per-banner pity bar, ×1/×10, rates and history sheets, and
a tiered summon animation — `stable` / `unstable` / `anomaly`. The anticipation tell is
**honest**: an anomaly flare always means a 5★. A fake-out that resolves to a 3★ trains players
to skip the animation, which defeats the point of having one.

Run `node tools/qa-echoes.mjs` after touching any of it.

---

## AI features (optional, never load-bearing)

One Netlify Function (`netlify/functions/companion.mjs`) drives four modes. **All four fail
silently** — a 6-second `AbortController` timeout, and every call returns `{ok: false}` rather
than showing an error. The game is complete with the function offline, and none of it is
required to finish the story.

| Mode | What it does | Budget |
|---|---|---|
| `chat` | Talk to a companion, in character, with story context | 260 tokens |
| `epilogue` | A closing document written from your actual run | 420 tokens |
| `breach` | Names and describes each Breach floor | 90 tokens |
| `boss` | One spoken line, reacting to how the fight is going | 70 tokens |

Providers fall back in order: **Groq** (`llama-3.3-70b-versatile`) → **Gemini**
(`gemini-flash-latest`) → **Cerebras** (`gpt-oss-120b`). All free tier. Keys live in Netlify's
environment, never in the client.

### The spoiler gate

The cast knows only what the player's current chapter allows. A `KNOWN` list gates facts by
chapter, and an `OPEN` list names questions they must refuse.

The important part is what is *absent*: **later reveals are never written into the prompt at
all.** Naming a secret in order to forbid it is how you leak it — a model told "do not mention
the Architect's true nature" has now been told there is one. Verified in production by asking
Airi at chapter 1 the most direct spoiler question in the game; she offers rumour as rumour and
claims no evidence.

### Prompt lessons, all learned by shipping something wrong

- **Models echo your vocabulary.** My epilogue prompt said "chapter", so the epilogue said
  "chapter ten" — a diegetic document referring to itself as a chapter.
- **"State that X" produces the word "that".** The output copied the grammar of the instruction:
  *"...and that you have not pressed it either."*
- **Independent calls cannot self-diversify.** Breach floors clustered into "Fractured Code
  Chamber" and "Corrupted Code Nexus" because each call was blind to the others. No amount of
  "be varied" fixes this; the fix is structural — 11 rotating registers, picked before the call.

---

## Art (§7)

All character, enemy and scene art is AI-generated at **build time** into `assets/generated/`
and served as static files. **65 assets**: 22 enemies, 27 Echoes, 6 scenes, the two leads, and
six route portraits. The game never calls an image API at runtime.

```bash
npm run art:list                  # show the manifest
npm run art                       # fill in anything missing
npm run art:force                 # regenerate everything
npm run art:cut                   # key out backdrops -> transparent PNGs
node tools/qa-sheet.mjs           # contact sheets for eyeballing the whole cast
node tools/generate-art.mjs --reroll 2 --only kirito_sprite   # redraw one bad asset
```

There is a binding style guide the whole cast is generated against; `tools/qa-art.mjs` enforces
it. See "Style drift" below.

### Cutouts, and why sprites aren't just pasted on

Characters and enemies are generated on a **flat chroma backdrop**, then keyed to transparent
PNGs by `tools/cutout.mjs`. Scenes keep their backgrounds.

The key colour is chosen **per asset** to be far from that subject's own palette (`chroma:` in
`prompts.js` and `enemies.js`). There are four chromas — green, magenta, orange, **blue** — and
the fourth exists because warm subjects collide with the first three. This matters more than it
sounds: a white backdrop behind Masha's white jacket cannot be keyed without eating the jacket.

Keying is five passes, each solving a failure that showed up in QA:

1. **Flood fill inward from the border.** A global "delete all white" punches holes through white
   clothing; only background actually connected to the edge is removed.
2. **Hue-direction chroma suppression.** Backdrop the model shaded or gradient-lit is still the
   key *hue*, just darker, and survives a plain distance test — it showed up as a pink halo over
   the Null Seraph.
3. **Saturated global distance test.** Background trapped in enclosed pockets (between legs,
   walled in by coat and shoes) is unreachable from the border. Gated on saturation, because
   chroma residue is always vivid while the subject tones that collide with a key colour — dark
   iron, olive shadow, black cloth — are muted. Without that gate it ate the Cinder Moth.
4. **Despeckle**, dropping opaque pixels almost entirely surrounded by transparency — spiky hair
   leaves isolated survivors that read as dirt.
5. **Despill**, near transparent edges only. Fringing on a black-haired character against a green
   key is a genuine blend of key and hair, so *deleting* it eats the silhouette. Neutralising the
   key's dominant channels instead took Kirito's residue from 1368 stray pixels to 8, while the
   Echo Duelist — legitimately teal on a green key — kept its colour.

Measure residue rather than eyeballing it. Two failures that only a metric catches:

- **The Cinder Moth was on magenta**, which ate its pale wing markings — near-white is closer to
  magenta in RGB than to anything else. It is on green now.
- **The Architect Proxy asked for olive and khaki on a *green* key.** Its regen frames were
  shredded. It is on blue now, with a rewritten prompt.
- **I judged `patchling` clean at card size and the hole metric said 6.2%.** The metric was right:
  at full resolution every seam was perforated. It took three chromas to land.

Sprites are trimmed to their alpha bounding box so they scale predictably. **Portraits are
deliberately not trimmed** — they're generated square with the face framed inside, and trimming
turns 768×768 into a tall strip, which a square `object-fit: cover` thumbnail then crops through
the middle, landing on the chest instead of the face.

In game, `artLoader.castGrade()` applies a per-scene colour filter plus a contact shadow and
ground gradient. A perfectly cut sprite still reads as a sticker if it's neutrally lit on a
sunset background.

`index.json` carries a `_v` timestamp that `artLoader` appends to every asset URL. Regenerated
art reuses the same filenames, so without it the browser serves the previous image forever.

### Prompt rules learned the hard way

- **No age words.** Not "17 year old", not "teenage". Any age marker near a body descriptor gets
  the request rejected as NSFW. "young man / young woman" passes. Real ages live in the story.
- **Say "not chibi"** and specify head-to-body ratio. At a tall aspect ratio these models shrink
  the torso and inflate the head until the character reads about twelve.
- **The leads carry no weapon.** Class is chosen at runtime, so a sword in Kirito's art is wrong
  three times out of four.
- **Negation does not subtract — it emphasises.** FLUX-1-schnell accepts only
  `{prompt, width, height, steps}`: no negative prompt, no image-to-image. `iterling` stayed a
  cat through several rerolls, and "no cat features, no ears, no tail" is simply three more
  mentions of cats. Removing every negation is what fixed it.
- **Framing beats subject.** The mascot framing turned "a floating orb of cyan light" into a blue
  cat with ears. The model follows framing over description every time.
- **A subject with no hard edge cannot be chroma-keyed.** `echo_wispling` was rerolled four times
  across two chromas chasing a tint no key choice fixed. What fixed it was changing the *design*
  to include an opaque crystal core, giving the key something to cut against.
- **Abstractions get drawn literally.** `patchling` needed "three versions of itself" (drew three
  animals), then "ghosted, fading" (drew a white halo), then "hard-edged duplicate" (drew
  speckled erosion) before the concrete "mismatched armour panels" worked.
- **There is a prompt length cap**, and exceeding it is a 400, not a truncation.
- **The NSFW classifier is non-deterministic.** The same prompt passes on one call and fails on
  the next. The generator retries with a varied seed rather than switching provider, because
  mixing providers breaks visual consistency across the cast.

### Style drift

`qa-art.mjs` also checks whether an asset has wandered from the house style. This started as a
fixed ±0.22 band and flagged 15 of 43 assets — which is a broken threshold, not 15 broken
images. It compares **per cohort** now (scenes against scenes, Echoes against Echoes) using
3×MAD, and reports drift as **advisory** rather than failing the build.

That last part is deliberate. Five assets currently drift on line weight or saturation and are
staying: they were looked at, and they are good art that happens to be heavier than its
neighbours. Regenerating good art to chase a metric already made things worse once.

Providers for generation (configure in `.env`, see `.env.example`):

| Provider | Cost | Notes |
|---|---|---|
| **Cloudflare Workers AI** | **Free**, no card | FLUX-1-schnell. Best anime output — current default. |
| **Pollinations** | **Free**, no key at all | Zero setup. Automatic fallback. |
| Together AI | Free tier | FLUX.1-schnell endpoint |
| Hugging Face | — | Free tier **no longer serves image models** (verified) |
| Google Gemini | Paid | Image generation requires billing; Imagen is deprecated |

If art is missing, `src/art/artLoader.js` falls back to deterministic procedural SVG
placeholders, so the game stays fully playable.

---

## Structure (§9)

```
index.html                        14 screens, all script tags, ?v= stamped
├── vendor/phaser.min.js          vendored — no CDN, works offline
├── styles/  main.css             diegetic system UI
│         battle.css              JRPG battle HUD
├── netlify/functions/            companion.mjs — the only server code
├── tools/                        art generation, build, and 6 QA tools
├── assets/generated/             65 AI assets + index.json
└── src/
    ├── main.js                   game state, flow, saves
    ├── data/
    │   ├── classes.js            4 classes x 5 tiers (71 nodes)
    │   ├── enemies.js            22 enemies, 37 encounters, boss voices
    │   ├── characters.js         the two leads, their traits, 7 routes
    │   ├── echoes.js             27 Echoes + 2 banners
    │   ├── collection.js         pulls, pity, history
    │   ├── icons.js              SVG glyph set for skills
    │   └── chapters/1..10.js     story beats as data
    │       └── routes.js         all seven romance routes
    ├── ai/companion.js           client for the 4 AI modes; fails silently
    ├── battle/battleSystem.js    headless combat rules
    ├── art/                      prompts + runtime loader
    └── ui/
        ├── screens.js            VN, registration, class select
        ├── battleHud.js          JRPG HUD + battle loop
        ├── battleStage.js        Phaser sprites and FX
        ├── endgame.js            Breach, summon, collection
        └── skillTree.js          skill matrix UI
```

### Why hybrid DOM + Phaser

Phaser owns the canvas — enemy sprites, idle motion, hit flashes, impact bursts. The DOM owns
everything textual — dialogue, menus, bars, turn order, the skill tree.

Full-Phaser would mean hand-rolling text layout, wrapping, scrolling and mobile responsiveness
for a game that is half visual novel. `battleStage.js` degrades safely: if Phaser or WebGL is
unavailable, `isReady()` stays false and the HUD alone remains a complete, playable battle.

### One screen-management trap

`screens.js` used to iterate a **hard-coded list** of screen ids in `show()`. Five endgame
screens were added and never appended to it, so summoning silently rendered nothing — a bug
that presents as "the gacha is broken" and has nothing to do with the gacha. `show()` derives
the list from `.screen` in the DOM now, and logs loudly if a target is missing.

---

## QA

Six tools, run against the real code rather than a model of it.

```bash
npm run qa                          # story + art + balance + echoes
node tools/qa-story.mjs             # graph integrity, orphan flags, path word-parity
node tools/qa-playthrough.mjs       # walks 7 routes x 2 leads to chapter 10
node tools/qa-art.mjs               # cutout residue, holes, and style drift per asset
node tools/qa-balance.mjs 400 --late --lead masha    # Monte Carlo, chapters 1-10
node tools/qa-echoes.mjs            # Breach contribution + gacha economy, both banners
node tools/qa-sheet.mjs             # contact sheets for a human to look at
node tools/tune-bosses.mjs          # sweep boss difficulty and report the curve
```

`qa-art` separates two defects that look identical in a viewer but have different fixes:
**leftover backdrop** (a cutout-tolerance problem) and **subject tint** (a prompt problem — the
model painting the character to match its own chroma screen). The Null Seraph had *zero* stray
magenta pixels and a hot pink halo. It also allows documented per-asset `HOLE_LIMIT` exemptions,
because the Prior Build's silhouette gaps are real design, not key damage.

### The recurring bug in this project

**A broken measuring instrument looks exactly like a passing result.** This has happened eight
or more times here, and it is the single most useful thing the repo has taught:

- `qa-balance` defaulted `--echo` to `null`, so it measured chapters 6–10 with a **two-person
  party** in a mode balanced around three. The late game read as unwinnable because the measure
  was wrong, not the game.
- The same tool **hard-coded Kirito into slot 0**, so Masha's trait was never measured at all.
  `--lead masha` exists because of that.
- `qa-echoes` reported "20000 pulls — economy reachable". It pulled **one banner**, six Echoes
  were therefore unobtainable, 20000 was the loop cap, and nothing checked whether the cap had
  been hit. It is banner-aware and fails on the cap now.
- The style-drift gate compared every asset against one global band, so it flagged whole
  cohorts.

Every one of those passed CI while measuring the wrong thing. The tools now print **what they
measured** in their header — which chapters, which Echo, which lead — so a wrong measurement is
visible in the output rather than hiding behind a green check.

---

## Deploying

**Netlify, from GitHub.** `netlify.toml` runs `node tools/stamp.mjs && node tools/build-dist.mjs`
and publishes `dist`, so a push to `main` rebuilds and redeploys.

The publish directory is **built by allow-list, never by exclusion**. `build-dist.mjs` copies only
the files the browser loads, then re-scans its own output and exits non-zero if `.env`, `tools/`,
`.claude/` or anything credential-shaped got in. This matters: the project root contains `.env`
with live API keys, and publishing the root directly would serve them at `/.env`.

`stamp.mjs` runs **on Netlify, not just locally**. It rewrites the `?v=<sha1>` on every script and
stylesheet in `index.html`; relying on a committed stamp means one forgotten `npm run stamp` ships
a page pointing at the previous version's hashes.

```bash
npm run build        # -> dist/, with the safety scan
npm run deploy       # build + netlify-cli --prod, if you'd rather not use Git deploys
```

Netlify Functions live **outside** `publish` on purpose. `dist/` is the public site; server code
must never be reachable as a static file.

Caching is set around those content hashes: assets are `immutable` for a year, `index.html` and
`index.json` always revalidate.

One trap worth knowing, because it cost a debugging round: **localhost sends no CSP header and
Netlify does**, so a Content-Security-Policy mistake is invisible locally and only breaks in
production. `img-src` needs `blob:` — Phaser XHRs each sprite and hands the browser an object URL,
so without it every asset fetch returns 200 and the *decode* is blocked, leaving a silently empty
battle canvas. Verify rendering against the deployed URL, not the dev server.

Docs-only commits can skip a build with `[skip netlify]` in the commit message.

---

## Status

**Chapters 1–10 complete.** 284 beats, 35 battles per run, 71 skill nodes, 7 romance routes,
27 Echoes across 2 banners, 65 art assets, 14 screens. 26 story flags set, 26 read, **0 orphans**
— `qa-story` fails the build if that stops being true.

The story has an ending. The Breach does not.
