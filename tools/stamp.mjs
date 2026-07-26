/* ============================================================
   stamp.mjs — content-hash cache busting for index.html.

   The game loads ~20 classic <script> tags, and both file:// and
   the dev server will happily serve a cached copy of one you just
   edited. That produced a genuinely confusing debugging session:
   the page reported the old story graph after the story had
   changed. This stamps ?v=<content hash> on every local script and
   stylesheet, so a changed file is a changed URL.

     node tools/stamp.mjs

   Idempotent — re-running replaces the old stamps. Files that did
   not change keep their hash, so unchanged assets stay cached.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(ROOT, 'index.html');

/* src="..." on <script>, href="..." on <link rel=stylesheet> */
const REF = /(<(?:script|link)\b[^>]*?\b(?:src|href)=")([^"]+?)(?:\?v=[0-9a-f]+)?(")/gi;

let changed = 0;
let skipped = 0;

const out = fs.readFileSync(HTML, 'utf8').replace(REF, (whole, pre, url, post) => {
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) { skipped++; return whole; }

  const file = path.join(ROOT, url);
  if (!fs.existsSync(file)) {
    console.warn(`  ! missing ${url}`);
    skipped++;
    return whole;
  }

  const hash = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  changed++;
  return `${pre}${url}?v=${hash}${post}`;
});

fs.writeFileSync(HTML, out);
console.log(`stamped ${changed} asset(s), skipped ${skipped}`);
