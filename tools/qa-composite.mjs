/* QA: composite cutout sprites onto a scene so we can actually SEE whether
   they read as standing in it, rather than pasted on top of it. */
import fs from 'node:fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const DIR = 'assets/generated/';

function loadAny(key) {
  for (const ext of ['png', 'jpg']) {
    const p = DIR + key + '.' + ext;
    if (!fs.existsSync(p)) continue;
    const buf = fs.readFileSync(p);
    if (ext === 'png') { const g = PNG.sync.read(buf); return { w: g.width, h: g.height, d: g.data }; }
    const j = jpeg.decode(buf, { useTArray: true });
    return { w: j.width, h: j.height, d: Buffer.from(j.data) };
  }
  throw new Error('missing ' + key);
}

/** nearest-neighbour scale, good enough for a QA sheet */
function scale(img, nw, nh) {
  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < nh; y++) {
    const sy = Math.min(img.h - 1, (y * img.h / nh) | 0);
    for (let x = 0; x < nw; x++) {
      const sx = Math.min(img.w - 1, (x * img.w / nw) | 0);
      img.d.copy(out, (y * nw + x) * 4, (sy * img.w + sx) * 4, (sy * img.w + sx) * 4 + 4);
    }
  }
  return { w: nw, h: nh, d: out };
}

function composite(bg, fg, ox, oy) {
  for (let y = 0; y < fg.h; y++) {
    const by = oy + y; if (by < 0 || by >= bg.h) continue;
    for (let x = 0; x < fg.w; x++) {
      const bx = ox + x; if (bx < 0 || bx >= bg.w) continue;
      const fi = (y * fg.w + x) * 4, bi = (by * bg.w + bx) * 4;
      const a = fg.d[fi + 3] / 255;
      if (a <= 0) continue;
      for (let c = 0; c < 3; c++) bg.d[bi + c] = Math.round(fg.d[fi + c] * a + bg.d[bi + c] * (1 - a));
    }
  }
}

/** soft elliptical contact shadow so feet don't float */
function shadow(bg, cx, cy, rx, ry) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const bx = cx + x, by = cy + y;
      if (bx < 0 || by < 0 || bx >= bg.w || by >= bg.h) continue;
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (d > 1) continue;
      const a = (1 - Math.sqrt(d)) * 0.55;
      const bi = (by * bg.w + bx) * 4;
      for (let c = 0; c < 3; c++) bg.d[bi + c] = Math.round(bg.d[bi + c] * (1 - a));
    }
  }
}

/** darken the lower part of the scene the way the in-game CSS grade does */
function grade(bg) {
  for (let y = 0; y < bg.h; y++) {
    const t = Math.max(0, (y / bg.h - 0.55) / 0.45);
    const k = 1 - t * 0.5;
    for (let x = 0; x < bg.w; x++) {
      const i = (y * bg.w + x) * 4;
      for (let c = 0; c < 3; c++) bg.d[i + c] = Math.round(bg.d[i + c] * k);
    }
  }
}

const [, , sceneKey, outFile, ...subjects] = process.argv;
const scene = loadAny(sceneKey);
const bg = { w: scene.w, h: scene.h, d: Buffer.from(scene.d) };
grade(bg);

const n = subjects.length;
subjects.forEach((key, i) => {
  const s = loadAny(key);
  const targetH = Math.round(bg.h * 0.82);
  const sc = scale(s, Math.max(1, Math.round(s.w * targetH / s.h)), targetH);
  const cx = Math.round(bg.w * ((i + 1) / (n + 1)));
  const oy = bg.h - sc.h - Math.round(bg.h * 0.04);
  shadow(bg, cx, oy + sc.h, Math.round(sc.w * 0.42), Math.round(bg.h * 0.028));
  composite(bg, sc, cx - (sc.w >> 1), oy);
});

const png = new PNG({ width: bg.w, height: bg.h });
bg.d.copy(png.data);
for (let i = 3; i < png.data.length; i += 4) png.data[i] = 255;
fs.writeFileSync(outFile, PNG.sync.write(png));
console.log('wrote', outFile, bg.w + 'x' + bg.h);
