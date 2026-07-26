/* ============================================================
   build-dist.mjs — assemble a deployable copy of the game.

   The project root is NOT safe to publish: it contains .env with
   live API keys, plus tools/, .claude/, node_modules/ and the
   ~7MB of source .jpg files that only the cutout pipeline needs.
   Dragging this folder onto Netlify Drop would serve the keys at
   https://<site>/.env — publicly, permanently, and indexed.

   So the deploy target is built by allow-list, never by exclusion:
   only files this script names are copied, and it then re-scans
   the output and fails loudly if anything secret slipped through.

     node tools/build-dist.mjs      -> dist/
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/* ---- what the browser actually loads ---- */
const FILES = ['index.html'];
const DIRS  = ['src', 'styles'];
const SINGLE = ['vendor/phaser.min.js'];

/* Anything matching these must never reach the output. */
const FORBIDDEN = [/(^|[\\/])\.env/i, /(^|[\\/])\.claude([\\/]|$)/i, /(^|[\\/])tools([\\/]|$)/i,
                   /(^|[\\/])node_modules([\\/]|$)/i, /\.(key|pem|p12)$/i,
                   /(^|[\\/])(Dockerfile|fly\.toml|package-lock\.json)$/i];

function copyFile(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return fs.statSync(src).size;
}

function copyDir(rel) {
  let bytes = 0, n = 0;
  for (const entry of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    const child = rel + '/' + entry.name;
    if (entry.isDirectory()) { const r = copyDir(child); bytes += r.bytes; n += r.n; }
    else { bytes += copyFile(child); n++; }
  }
  return { bytes, n };
}

/* ---- go ---- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

let bytes = 0, count = 0;
for (const f of [...FILES, ...SINGLE]) { bytes += copyFile(f); count++; }
for (const d of DIRS) { const r = copyDir(d); bytes += r.bytes; count += r.n; }

/* Art: copy exactly what index.json references, and nothing else. The
   source .jpg for each cutout is an input to tools/cutout.mjs, not an
   asset the game loads — shipping both roughly doubles the payload. */
const indexRel = 'assets/generated/index.json';
const index = JSON.parse(fs.readFileSync(path.join(ROOT, indexRel), 'utf8'));
bytes += copyFile(indexRel); count++;

let missing = 0;
for (const [key, val] of Object.entries(index)) {
  if (key.startsWith('_') || typeof val !== 'string') continue;
  if (!fs.existsSync(path.join(ROOT, val))) { console.warn(`  ! referenced but absent: ${val}`); missing++; continue; }
  bytes += copyFile(val); count++;
}

/* ---- verify: walk the OUTPUT, not the input ---- */
const leaked = [];
(function scan(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { scan(full); continue; }
    const rel = path.relative(DIST, full);
    if (FORBIDDEN.some(rx => rx.test(rel))) leaked.push(rel);
  }
})(DIST);

const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`dist/  ${count} files, ${mb(bytes)}`);
if (missing) console.log(`       ${missing} asset(s) referenced by index.json are missing`);

if (leaked.length) {
  console.error('\nREFUSING TO SHIP — secrets or tooling reached dist/:');
  for (const l of leaked) console.error('  x ' + l);
  process.exit(1);
}
console.log('verified — no .env, tooling, or credentials in the output.');
console.log('\ndeploy:  npx netlify-cli deploy --dir dist --prod');
