# NOVA IMPULSE

An anime isekai visual novel with turn-based JRPG combat. You log into a game, logout is
disabled, and the next five chapters are about getting strong enough to reach whoever did it.

Battle-heavy by design: **16 encounters across 5 chapters**, free class selection, a 5-tier
skill matrix per class, party combo mechanics, and a gender choice that decides which of the
two leads you play — and who fights beside you.

**Chapter 5 ends on a hook, not a resolution.** That is deliberate.

---

## Running it

```bash
python -m http.server 5173
```

Then open `http://localhost:5173`. No build step and no dependencies — Phaser is vendored
locally in `vendor/`, so it also works offline.

### Controls

- **Story** — click choices, or press `1`–`4`; `Space`/`Enter` advances
- **Battle** — click skill icons, or press `1`–`9`; `Esc` cancels targeting
- Progress auto-saves to `localStorage`; **CONTINUE** on the title resumes

---

## The two paths (§2)

Your gender choice decides who you *control*, not just a pronoun:

| Choice | You play | Companion / romance |
|---|---|---|
| Male | **Kirito** | Masha |
| Female | **Masha** | Kirito |

The plot is the same; the *writing* is not. **44 beats carry fully separate text per path** —
the same scene written twice from two different insides. Kirito's chapters are about someone
who copes by handling logistics instead of feelings; Masha's are about someone who copes by
naming the problem out loud immediately. Neither is the "default" with the other bolted on.

Romance builds through a `trust` stat raised by dialogue choices and shared battle moments,
gating softer scenes at the end of Chapter 4.

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

Party composition genuinely matters. Boss clear rate across a **full 5-chapter run**
(`npm run qa:balance -- 1500 --matrix`):

| Party | Clears the boss |
|---|---|
| tank + tank | 99% |
| fighter + tank | 89% |
| fighter + fighter | 83% |
| ranger + tank | 68% |
| mage + mage · mage + tank | 64–65% |
| ranger + fighter | 61% |
| mage + ranger · mage + fighter | 54–55% |
| ranger + ranger | 40% |

Measured across a whole run on purpose. In an isolated level-8 duel *every* pairing beats
Warden Prime 94–100%, because the fight that decides the game is the one you arrive at with
your HP and MP already spent on the Seraph and the Escort. Benchmarking the boss alone reports
100% across the board and tells you nothing.

Losing is a **written story branch**, never a game over — so even a bad roll continues the story.

---

## Skill matrix (§4)

**68 nodes** — 17 per class across 5 tiers, 3–4 nodes each, mixing passives and active skills.
Tiers unlock by level: `1 / 3 / 5 / 10 / 14`.

A clean playthrough finishes around **level 9**, so **tiers 4 and 5 stay visibly locked** —
future-chapter content you can see but not reach, exactly as the doc specifies.

---

## Battle system (§5)

Turn-based, skill-driven, party-vs-enemy. Turn order recomputes each round from effective SPD,
so Slow and Haste actually move the queue.

**Combo Link** — a skill tagged with `combo` hits harder when your partner has already acted
this round. It's the mechanical spine of the party: Chapter 4 is an encounter chain designed to
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

Further fixes came out of simulating the real engine rather than reading it. `npm run qa:balance`
plays whole 5-chapter runs against the actual battle code — every number below is measured, not
estimated:

- **The five-tier tree was a two-tier tree.** A run ended at level 7 with 7 skill points, which is
  *exactly* the seven nodes of tiers 1–2. There was never a choice to make and tier 3 was scenery.
  The curve now lands a run at level 8–9: eight or nine points against eleven nodes. Tiers 4–5 stay
  sealed on purpose — that is a plot point, not an oversight.
- **The Ranger was unviable at 21%** boss clear against the Tank's 49%. It stacked crit *chance* the
  whole game and had no crit *damage* node below tier 3, which it never reached. Moving that payoff
  down to tier 2 brought it to 60%.
- HP carried between battles with no recovery, so one hard fight cascaded into losing every
  subsequent one — and losses gave no XP, so the party could never climb out. Battles now grant
  partial recovery, chapters fully restore, and defeats award 40% XP.

Boss clear rate by class, 1,500 simulated runs each: Mage 58%, Ranger 60%, Fighter 76%, Tank 82%.

> One caveat worth recording: the first version of the simulator ranked skills by raw `power` and
> ignored crit entirely, which made the Ranger look 12 points worse than it was. The simulator was
> fixed *before* any class was rebalanced. A benchmark that mis-plays a class will happily tell you
> to buff it into the ground.

---

## Art (§7)

All character, enemy and scene art is AI-generated at **build time** into `assets/generated/`
and served as static files. The game never calls an image API at runtime, so it works offline
and needs no keys to play.

```bash
npm run art:list                  # show the 23-asset manifest
npm run art                       # fill in anything missing
npm run art:force                 # regenerate everything
npm run art:cut                   # key out backdrops -> transparent PNGs
npm run art:qa -- scene_field out.png kirito_sprite masha_sprite   # eyeball a composite
node tools/generate-art.mjs --reroll 2 --only kirito_sprite        # redraw one bad asset
```

### Cutouts, and why sprites aren't just pasted on

Characters and enemies are generated on a **flat chroma backdrop**, then keyed
to transparent PNGs by `tools/cutout.mjs`. Scenes keep their backgrounds.

The key colour is chosen **per asset** to be far from that subject's own palette
(`chroma:` in `prompts.js` and `enemies.js`). This matters more than it sounds:
a white backdrop behind Masha's white jacket, or green behind the Cinder Moth's
olive wing shadows, cannot be keyed without eating the character.

Keying is four passes, each solving a failure that showed up in QA:

1. **Flood fill inward from the border.** A global "delete all white" would
   punch holes through white clothing; only background actually connected to
   the edge is removed.
2. **Hue-direction chroma suppression.** Backdrop the model shaded or
   gradient-lit is still the key *hue*, just darker, and survives a plain
   distance test — it showed up as a pink halo over the Null Seraph.
3. **Saturated global distance test.** Background trapped in enclosed pockets
   (between a character's legs, walled in by coat and shoes) is unreachable
   from the border. Gated on saturation, because chroma residue is always
   vivid while the subject tones that collide with a key colour — dark iron,
   olive shadow, black cloth — are muted. Without that gate it ate the moth.
4. **Despeckle**, dropping opaque pixels almost entirely surrounded by
   transparency — spiky hair leaves isolated survivors that read as dirt.
5. **Despill**, near transparent edges only. Fringing on a black-haired
   character against a green key is a genuine blend of key and hair, so
   *deleting* it eats the silhouette. Neutralising the key's dominant channels
   instead took Kirito's residue from 1368 stray pixels to 8, while the Echo
   Duelist — which is legitimately teal on a green key — kept its colour.

Measure residue rather than eyeballing it: count visible pixels whose hue
matches the key. Masha reads 0, Kirito 3-8, and the Duelist's ~4% is its actual
crystal, confirmed by compositing.

Sprites are then trimmed to their alpha bounding box so they scale predictably.
**Portraits are deliberately not trimmed** — they're generated square with the
face framed inside, and trimming turns 768×768 into a tall strip, which a square
`object-fit: cover` thumbnail then crops through the middle, landing on the
chest instead of the face. Portrait slots also anchor with
`object-position: center top`.

In game, sprites are then lit to match: `artLoader.castGrade()` applies a
per-scene colour filter, plus a contact shadow and a ground gradient. A
perfectly cut sprite still reads as a sticker if it's neutrally lit on a
sunset background.

`index.json` carries a `_v` timestamp that `artLoader` appends to every asset
URL. Regenerated art reuses the same filenames, so without it the browser
serves the previous image indefinitely.

One CSS trap worth knowing: the lead-select card's inner elements are `<span>`s.
Inline boxes **ignore `height`, `overflow` and vertical padding**, so a declared
`height: 190px` silently did nothing and the portrait rendered at full natural
size, blowing the card past 900px tall. They're `display: block` now.

### Prompt rules learned the hard way

- **No age words.** Not "17 year old", not "teenage", not "high-school-age".
  Any age marker near a body descriptor ("shoulders", "build") gets the request
  rejected as NSFW. "young man / young woman" passes. Their real age lives in
  the story text.
- **Say "not chibi" explicitly**, and specify head-to-body ratio. Asked for a
  full body at a tall aspect ratio, these models shrink the torso and inflate
  the head until the character reads about twelve.
- **The leads carry no weapon.** Class is chosen at runtime, so a sword in
  Kirito's art is wrong three times out of four.
- **The NSFW classifier is non-deterministic** — the same prompt passes on one
  call and fails on the next. The generator retries NSFW rejections with a
  varied seed rather than failing over to another provider, because mixing
  providers breaks visual consistency across the cast.
- Avoid describing glows/haloes *behind* a subject on a chroma backdrop; they
  merge with it and can't be keyed.

Providers are pluggable with an automatic fallback chain. Configure in `.env` (see `.env.example`):

| Provider | Cost | Notes |
|---|---|---|
| **Cloudflare Workers AI** | **Free**, no card | FLUX-1-schnell. Best anime output — current default. |
| **Pollinations** | **Free**, no key at all | Zero setup, uncapped. Automatic fallback. |
| Together AI | Free tier | FLUX.1-schnell endpoint |
| Hugging Face | — | Free tier **no longer serves image models** (verified) |
| Google Gemini | Paid | Image generation requires billing enabled; Imagen is deprecated |

All 23 assets share one style contract in `src/art/prompts.js` — edit `STYLE` there to re-skin
the entire game's art in one place. Prompts avoid phrasings like "faceless humanoid figure",
which content filters reject as depicting an unclothed person.

If art is missing, `src/art/artLoader.js` falls back to deterministic procedural SVG
placeholders, so the game stays fully playable.

---

## Structure (§9)

```
index.html
├── vendor/phaser.min.js          vendored — no CDN, works offline
├── styles/  main.css             diegetic system UI
│         battle.css              JRPG battle HUD
├── tools/generate-art.mjs        build-time art generation
├── assets/generated/             AI art + index.json
└── src/
    ├── main.js                   game state, flow, saves
    ├── data/
    │   ├── classes.js            4 classes x 5 tiers (68 nodes)
    │   ├── enemies.js            13 enemies, 17 encounters
    │   ├── characters.js         the two leads + path resolution
    │   ├── icons.js              SVG glyph set for skills
    │   └── chapters/1..5.js      story beats as data
    ├── battle/battleSystem.js    headless combat rules
    ├── art/                      prompts + runtime loader
    └── ui/
        ├── screens.js            VN, registration, class select
        ├── battleHud.js          JRPG HUD + battle loop
        ├── battleStage.js        Phaser sprites and FX
        └── skillTree.js          skill matrix UI
```

### Why hybrid DOM + Phaser

Phaser owns the canvas — enemy sprites, idle motion, hit flashes, impact bursts, element
flashes. The DOM owns everything textual — dialogue, menus, bars, turn order, the skill tree.

Full-Phaser would mean hand-rolling text layout, wrapping, scrolling and mobile responsiveness
for a game that is half visual novel. The split keeps text crisp and responsive while Phaser does
the animation work it's actually good at. `battleStage.js` degrades safely: if Phaser or WebGL is
unavailable, `isReady()` stays false and the HUD alone remains a complete, playable battle.

### Adding Chapter 6

Write `src/data/chapters/chapter6.js`, add a `<script>` tag in `index.html`, and add one line to
the `CHAPTERS` map in `src/main.js`. The engine needs no changes — beats are pure data.

A beat may be a plain string or a per-path object:

```js
c6_open: {
  scene: 'scene_spire',
  cast: { kirito: ['masha'], masha: ['kirito'] },
  text: {
    kirito: `<p class="nar">…written from inside Kirito…</p>`,
    masha:  `<p class="nar">…written from inside Masha…</p>`
  },
  choices: [
    { text: '…', trust: 2, tag: 'OPEN', sets: 'someFlag', goto: 'c6_next' }
  ]
}
```

---

## QA

Three tools, run against the real code rather than a model of it. Nothing in this README is an
estimate.

```bash
npm run qa           # all three
npm run qa:story     # graph integrity, orphan flags, path word-parity
npm run qa:art       # cutout residue vs. chroma cast, per asset
npm run qa:balance   # Monte Carlo playthroughs of the real battle engine
```

`qa:art` is worth explaining. It separates two defects that look identical in a viewer but have
different fixes: **leftover backdrop** (a cutout-tolerance problem) and **subject tint** (a prompt
problem — the model painting the character to match its own chroma screen). The Null Seraph had
*zero* stray magenta pixels and a hot pink halo.

---

## Deploying

**Netlify, from GitHub.** `netlify.toml` sets `command = "node tools/build-dist.mjs"` and
`publish = "dist"`, so a push to `main` rebuilds and redeploys.

The publish directory is **built by allow-list, never by exclusion**. `tools/build-dist.mjs` copies
only the files the browser loads, then re-scans its own output and exits non-zero if `.env`,
`tools/`, `.claude/` or anything credential-shaped got in. This matters: the project root contains
`.env` with live API keys, and publishing the root directly would serve them at `/.env`.

```bash
npm run build        # -> dist/, with the safety scan
npm run deploy       # build + netlify-cli --prod, if you'd rather not use Git deploys
```

Caching is set up around the content hashes `tools/stamp.mjs` writes into `index.html`: assets are
`immutable` for a year, `index.html` and `index.json` always revalidate.

One trap worth knowing about, because it cost a debugging round: **localhost sends no CSP header
and Netlify does**, so a Content-Security-Policy mistake is invisible locally and only breaks in
production. `img-src` needs `blob:` — Phaser XHRs each sprite and hands the browser an object URL,
so without it every asset fetch returns 200 and the *decode* is blocked, leaving a silently empty
battle canvas. Verify rendering against the deployed URL, not the dev server.

---

## Status

Chapters 1–5 complete: **109 story beats, 16 battles, 6 choice points (18 options), 68 skill nodes,
23 art assets**. Every choice flag the story sets is read somewhere later — `npm run qa:story`
fails the build if that stops being true.

No ending exists yet, by design. Chapter 5 stops mid-scene on the reveal.

## Endgame — Echoes, Breach and summoning

Everything below unlocks at the Chapter 5 hook and nowhere earlier. That is a
balance decision before it is a story one: chapters 1–5 are tuned for a
two-person party, and a third body raises every win rate in the game.

**Breach** is an endless gauntlet. Waves scale +9% each, you recover 16% of
your bars between them (34% after a Surge wave), and the run ends when both
leads are down. Depth is the score.

It is a gauntlet rather than a rematch with Warden Prime for a measurable
reason. A rested level-10 party beats that boss close to 100% of the time —
the story's difficulty is attrition across sixteen fights, not any single one.
The first version of `tools/qa-echoes.mjs` benchmarked exactly that and every
row read 100%, with or without an Echo, common or legendary. That is a broken
instrument, not a balance result. Depth has no ceiling, so depth is what is
measured now.

**Echoes** are creature companions that fight in a third slot and play
themselves — a pet the player micromanages is a third set of buttons every
round and doubles the length of a fight. Sixteen of them across 3★/4★/5★.
Duplicates raise *bond* (1–5) rather than stacking.

5★ Echoes are summon-only: they have no `from` field, so nothing in the world
drops them. Adding a new one later is one entry in `ECHOES` plus an art
prompt — nothing else in the system needs to know.

Measured contribution, as extra Breach waves over a 6.7-wave base:

| tier | bond 1 | bond 5 |
|---|---|---|
| 3★ | +1.5 | +1.9 |
| 4★ | +4.0 | +4.9 |
| 5★ | +5.8 | +7.7 |

Two things that had to be corrected to get there, both invisible without the
tool. Wardens dominate an attrition mode far beyond their rarity — mitigation
compounds where raw damage does not, and the first epic warden added **11.6**
waves to a 6.6-wave base, beating both legendaries. And a 5★ striker landed
*below* a 4★ warden, which is a broken promise about what rarity means; the
fix was lifesteal rather than a bigger number, because a striker's problem is
that damage does nothing to keep a run alive.

The gacha costs 100 shards a pull, with pity guaranteeing a 5★ every 35.
Completing the roster runs ~100 pulls, about 48 runs to wave 8. The first
weighting put it at 313 pulls — roughly 174 runs — which is a joke at the
player's expense rather than a collection goal.

Run `npm run qa:echoes` after touching any of it.

### A note on art for Echoes

Each Echo has its own sprite rather than reusing its source enemy's. Two
lessons are baked into `src/art/prompts.js` from generating them:

- **Framing beats subject.** The mascot framing turned "a floating orb of cyan
  light" into a blue cat with ears. The model follows the framing over the
  description every time.
- **A subject with no hard edge cannot be chroma-keyed.** `echo_wispling` was
  rerolled four times across two chroma colours chasing a tint that no key
  choice fixed. What fixed it was changing the *design* to include an opaque
  crystal core, giving the key something to cut against.

Negations still do not work. "Nobody inside" produced a hooded child with a
visible face; filling the helm with violet smoke and two eye-lights produced
empty armour.
