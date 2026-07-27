#!/usr/bin/env node
/* ============================================================
   generate-art.mjs — build-time art generation (§7).

   Deliberately NOT a runtime call. Assets are written once into
   assets/generated/ and committed/served as static files, so the
   game never depends on an API being up or a key being present.

   Providers (free tier only, per project decision), in fallback order:
     cloudflare    — DEFAULT. Needs CF_ACCOUNT_ID + CF_API_TOKEN. Best output
                     of everything tested, and the source of every asset in
                     the game.
     together      — needs TOGETHER_API_KEY
     huggingface   — needs HF_TOKEN (image gen is dead on the free tier;
                     kept only because a paid account would revive it)
     gemini        — needs GEMINI_API_KEY *with billing enabled*

   Pollinations was removed on 2026-07-27. It required no key at all, which
   is why it had been the default, but across the last two batches it
   accepted every connection and never answered — one run sat for 1h12m and
   produced nothing while four working providers waited behind it. It also
   predated fetchWithTimeout below, so it hung rather than failing over.

   Usage:
     node tools/generate-art.mjs                 # fill in missing art
     node tools/generate-art.mjs --force         # regenerate everything
     node tools/generate-art.mjs --only kirito   # key substring filter
     node tools/generate-art.mjs --reroll 7      # vary the seed
     node tools/generate-art.mjs --provider together
     node tools/generate-art.mjs --list          # show manifest, generate nothing
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'generated');

/* ---------------- tiny .env loader (no dependency) ---------------- */

function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}
loadEnv();

/* ---------------- load browser data files in node ---------------- */

/**
 * These files assign onto `window` and then read the resulting global
 * (`window.NI = ...; NI.enemies = ...`). A plain object isn't enough —
 * `window` has to BE the global object for that second line to resolve.
 * A vm context where window points at itself reproduces the browser.
 */
function loadBrowserModule(relPath) {
  const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const ctx = {};
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.module = undefined;      // force prompts.js down its browser branch
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: relPath });
  return ctx.NI;
}

const promptsNI = loadBrowserModule('src/art/prompts.js');
const enemiesNI = loadBrowserModule('src/data/enemies.js');
const P = promptsNI.prompts;

const echoesNI = loadBrowserModule('src/data/echoes.js');

const MANIFEST = P.MANIFEST
  .concat(P.enemyManifest(enemiesNI.enemies.ENEMIES))
  .concat(P.echoManifest(echoesNI.echoes.ECHOES));

/* ---------------- args ---------------- */

const argv = process.argv.slice(2);
const has = f => argv.includes(f);
const val = f => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };

const FORCE = has('--force');
const LIST = has('--list');
const ONLY = val('--only');
const PROVIDER = val('--provider') || process.env.ART_PROVIDER || 'cloudflare';
const REROLL = Number(val('--reroll') || 0);

const RATIO = {
  '1:1':  { w: 768,  h: 768  },
  '3:4':  { w: 768,  h: 1024 },
  '16:9': { w: 1024, h: 576  }
};

/* ---------------- providers ---------------- */

/* Every provider call goes through this rather than bare fetch().
   Node's fetch has no default timeout, so a provider that accepts the
   connection and then never answers hangs the whole run forever — and
   because the request never rejects, the fallback chain below never fires.
   That is exactly what Pollinations did before it was removed: the generator
   sat on one portrait indefinitely with four working providers behind
   it. A dead provider has to fail fast to be fallen back from. */
const HTTP_TIMEOUT = Number(process.env.ART_TIMEOUT_MS || 90000);

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`timeout after ${Math.round(HTTP_TIMEOUT / 1000)}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const providers = {

  /* Free tier with a monthly credit cap. Anime-tuned checkpoints. */
  async huggingface(prompt, size) {
    const token = process.env.HF_TOKEN;
    if (!token) throw new Error('HF_TOKEN missing from .env');
    const model = process.env.HF_MODEL || 'cagliostrolab/animagine-xl-4.0';
    const r = await fetchWithTimeout(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { negative_prompt: P.NEGATIVE, width: size.w, height: size.h }
      })
    });
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`huggingface HTTP ${r.status} ${t.slice(0, 120)}`);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) throw new Error('huggingface returned no image');
    return { buf, ext: 'png' };
  },

  /* Free tier: ~10k neurons/day, no card required.
     Needs CF_ACCOUNT_ID + CF_API_TOKEN in .env. */
  async cloudflare(prompt, size) {
    const acct = process.env.CF_ACCOUNT_ID;
    const token = process.env.CF_API_TOKEN;
    if (!acct || !token) throw new Error('CF_ACCOUNT_ID / CF_API_TOKEN missing from .env');
    const model = process.env.CF_MODEL || '@cf/black-forest-labs/flux-1-schnell';
    const r = await fetchWithTimeout(
      `https://api.cloudflare.com/client/v4/accounts/${acct}/ai/run/${model}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        /* flux-1-schnell caps at 8 steps; 4 is the speed default but 8 is
           noticeably cleaner on faces and hands, which is where cheap
           generations fall apart most visibly. */
        body: JSON.stringify({ prompt, width: size.w, height: size.h, steps: 8 })
      }
    );
    const ct = r.headers.get('content-type') || '';
    if (!r.ok) throw new Error(`cloudflare HTTP ${r.status} ${(await r.text()).slice(0, 100)}`);

    /* flux-schnell returns { result: { image: <base64> } }; some models return raw bytes */
    if (ct.includes('application/json')) {
      const j = await r.json();
      const b64 = j?.result?.image;
      if (!b64) throw new Error('cloudflare returned no image field');
      return { buf: Buffer.from(b64, 'base64'), ext: 'jpg' };
    }
    return { buf: Buffer.from(await r.arrayBuffer()), ext: 'png' };
  },

  /* Free FLUX.1-schnell endpoint + signup credit. Needs TOGETHER_API_KEY. */
  async together(prompt, size) {
    const key = process.env.TOGETHER_API_KEY;
    if (!key) throw new Error('TOGETHER_API_KEY missing from .env');
    const model = process.env.TOGETHER_MODEL || 'black-forest-labs/FLUX.1-schnell-Free';
    const r = await fetchWithTimeout('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, prompt, width: size.w, height: size.h, steps: 4, n: 1,
        response_format: 'b64_json'
      })
    });
    const j = await r.json();
    if (j.error) throw new Error(`together: ${JSON.stringify(j.error).slice(0, 110)}`);
    const b64 = j?.data?.[0]?.b64_json;
    if (!b64) throw new Error('together returned no b64_json');
    return { buf: Buffer.from(b64, 'base64'), ext: 'jpg' };
  },

  /* Requires billing enabled on the Google AI Studio project. */
  async gemini(prompt) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY missing from .env');
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
    const r = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const j = await r.json();
    if (j.error) throw new Error(`gemini ${j.error.status}: ${j.error.message.slice(0, 90)}`);
    const parts = j?.candidates?.[0]?.content?.parts || [];
    const img = parts.find(p => p.inlineData || p.inline_data);
    if (!img) throw new Error('gemini returned no image part');
    const d = img.inlineData || img.inline_data;
    return { buf: Buffer.from(d.data, 'base64'), ext: 'png' };
  }
};

/* Try the requested provider, then fall back to anything else usable. */
const FALLBACK_ORDER = ['cloudflare', 'together', 'huggingface', 'gemini'];

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Free image endpoints rate-limit under sustained use and answer with
 * transient 500s rather than a clean 429. Retrying the same provider
 * with backoff recovers far more often than immediately failing over,
 * so each provider gets its own attempts before we move on.
 */
async function generate(prompt, size, seed) {
  const order = [PROVIDER, ...FALLBACK_ORDER.filter(p => p !== PROVIDER)];
  const errors = [];
  /* Generous: the NSFW classifier is flaky enough that some prompts need
     several draws before one passes, and falling back to another provider
     costs visual consistency across the cast. */
  const ATTEMPTS = 9;

  /* A timeout is not a rate limit. Rate limits clear if you wait; a provider
     that accepts the connection and never answers is simply down, and giving
     it the full nine attempts with exponential backoff costs a quarter of an
     hour per asset before the working provider behind it is ever tried. */
  const TIMEOUT_ATTEMPTS = 2;

  for (const name of order) {
    if (!providers[name]) continue;
    let timeouts = 0;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      try {
        /* vary the seed per attempt so an NSFW retry is a genuinely
           different draw rather than the same rejected one */
        const out = await providers[name](prompt, size, (seed + attempt * 104729) >>> 0);
        return { ...out, provider: name, attempts: attempt };
      } catch (err) {
        const msg = err.message || String(err);
        const timedOut = /timeout after/i.test(msg);
        if (timedOut && ++timeouts >= TIMEOUT_ATTEMPTS) {
          errors.push(`${name}: ${msg} (x${timeouts}, moving on)`);
          break;
        }
        const rateLimited = /HTTP (5\d\d|429)|fetch failed|timeout|small body/i.test(msg);
        /* Cloudflare's NSFW classifier is non-deterministic — the exact same
           prompt passes on one call and is rejected on the next. Treating it
           as fatal drops the asset to a fallback provider and breaks visual
           consistency, so retry it like any other flaky failure. */
        const flaggedNsfw = /NSFW/i.test(msg);

        if ((!rateLimited && !flaggedNsfw) || attempt === ATTEMPTS) {
          errors.push(`${name}: ${msg}`);
          break;
        }
        await sleep(flaggedNsfw ? 1200 : 6000 * Math.pow(2, attempt - 1));
      }
    }
  }
  throw new Error(errors.join(' | '));
}

/* ---------------- run ---------------- */

function existingFile(key) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const f = path.join(OUT_DIR, `${key}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let items = MANIFEST;
  if (ONLY) items = items.filter(i => i.key.includes(ONLY));

  if (LIST) {
    console.log(`manifest: ${items.length} assets\n`);
    for (const i of items) {
      console.log(`  ${existingFile(i.key) ? '[have]' : '[    ]'} ${i.key.padEnd(24)} ${i.kind}`);
    }
    return;
  }

  const todo = items.filter(i => FORCE || !existingFile(i.key));

  console.log(`Nova Impulse art generation`);
  console.log(`  provider : ${PROVIDER} (fallback: ${FALLBACK_ORDER.filter(p => p !== PROVIDER).join(', ')})`);
  console.log(`  manifest : ${items.length}   to generate: ${todo.length}\n`);

  if (!todo.length) { console.log('Nothing to do — all art present. Use --force to regenerate.'); return; }

  let ok = 0, fail = 0;
  const manifestOut = {};

  for (let i = 0; i < todo.length; i++) {
    const item = todo[i];
    const size = RATIO[item.ratio] || RATIO['1:1'];
    const prompt = P.buildPrompt(item.subject, item.kind, item.chroma);
    /* Stable seed per key, so regenerating gives the same character rather
       than a new one. --reroll shifts it when a specific asset comes out bad
       and you want a different draw of the same prompt. */
    const seed = ([...item.key].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
                  + REROLL * 7919) >>> 0;

    process.stdout.write(`  [${String(i + 1).padStart(2)}/${todo.length}] ${item.key.padEnd(24)} `);
    try {
      const { buf, ext, provider, attempts } = await generate(prompt, size, seed);
      const file = path.join(OUT_DIR, `${item.key}.${ext}`);
      fs.writeFileSync(file, buf);
      manifestOut[item.key] = `assets/generated/${item.key}.${ext}`;
      console.log(`ok  ${(buf.length / 1024).toFixed(0)}kb  via ${provider}${attempts > 1 ? ` (retry x${attempts})` : ''}`);
      ok++;
    } catch (err) {
      console.log(`FAIL  ${err.message.slice(0, 100)}`);
      fail++;
    }
    /* Free endpoints rate-limit per IP. Pacing here is the difference
       between a slow success and a fast wall of 429s. */
    if (i < todo.length - 1) await sleep(Number(process.env.ART_DELAY_MS || 7000));
  }

  /* Merge into the index the browser reads so missing art degrades gracefully. */
  const indexFile = path.join(OUT_DIR, 'index.json');
  let index = {};
  if (fs.existsSync(indexFile)) {
    try { index = JSON.parse(fs.readFileSync(indexFile, 'utf8')); } catch { index = {}; }
  }
  for (const item of MANIFEST) {
    const f = existingFile(item.key);
    if (f) index[item.key] = 'assets/generated/' + path.basename(f);
  }
  Object.assign(index, manifestOut);
  /* Cache-bust stamp: regenerated art reuses the same filenames, so without
     a changing query string the browser serves the old image forever. */
  index._v = Date.now();
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));

  console.log(`\ndone — ${ok} generated, ${fail} failed`);
  console.log(`index: assets/generated/index.json (${Object.keys(index).length - 1} assets)`);
}

main().catch(err => { console.error('fatal:', err); process.exit(1); });
