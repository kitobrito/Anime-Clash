// Idle "living board" animation: everything on a board that isn't one of the four clickable
// corner objects. Water ripples, foliage sways, creatures breathe, lights flicker, particles drift.
//
// Two canvases: BACK sits between the background painting and the card platform; FRONT sits
// above the platform but under the corner objects, and never paints over the card area.
// Layers are cut from the board's own painting (or prepared assets in art/boards-anime/ambient)
// and redrawn with tiny offsets, so the art itself moves rather than anything pasted on top.
// All positions are in the normalized 0..1000 board space used by catalog.js.
import {AMBIENT} from './ambient-config.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = t => t * t * (3 - 2 * t);
const loaded = new Map();
function loadImage(src) {
  if (!loaded.has(src)) loaded.set(src, new Promise((resolve, reject) => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => resolve(im);
    im.onerror = () => { loaded.delete(src); reject(new Error(`Could not load ${src}`)); };
    im.src = new URL(src, document.baseURI).href;
  }));
  return loaded.get(src);
}
const asset = name => `art/boards-anime/ambient/${name}`;
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
// Small deterministic random generator, so every visit looks the same at the same moment.
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s >>>= 0) / 4294967296)); }
// Smooth pseudo-noise built from incommensurate sines: wind gusts and creature breathing never loop visibly.
const wobble = (t, p) => Math.sin(t * 1.0 + p) * .55 + Math.sin(t * 1.618 + p * 2.1) * .3 + Math.sin(t * 2.71 + p * .7) * .15;

// Cut a feathered polygon out of an image. Returns the layer canvas plus where it sits (board units)
// and padding, in source pixels, so warps can move content beyond the original outline.
function cutPolygon(image, poly, feather = 2.5, pad = 6) {
  const W = image.naturalWidth, H = image.naturalHeight, sx = W / 1000, sy = H / 1000;
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
  for (const [x, y] of poly) { l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y); }
  const x0 = Math.max(0, Math.floor(l * sx - feather * 2)), y0 = Math.max(0, Math.floor(t * sy - feather * 2));
  const x1 = Math.min(W, Math.ceil(r * sx + feather * 2)), y1 = Math.min(H, Math.ceil(b * sy + feather * 2));
  const c = canvas(x1 - x0 + pad * 2, y1 - y0 + pad * 2), g = c.getContext('2d');
  // The polygon's blurred shadow is the mask (shadowBlur works everywhere, unlike ctx.filter).
  const off = c.width + 50;
  g.save(); g.shadowColor = '#fff'; g.shadowBlur = feather * 2; g.shadowOffsetX = off; g.fillStyle = '#fff';
  g.beginPath(); poly.forEach(([x, y], i) => { const px = x * sx - x0 + pad - off, py = y * sy - y0 + pad; i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); g.fill(); g.restore();
  g.globalCompositeOperation = 'source-in'; g.drawImage(image, x0 - pad, y0 - pad, c.width, c.height, 0, 0, c.width, c.height);
  return {canvas: c, rect: [(x0 - pad) / sx, (y0 - pad) / sy, c.width / sx, c.height / sy]};
}
function alphaMap(img) {
  const c = canvas(img.width ?? img.naturalWidth, img.height ?? img.naturalHeight), g = c.getContext('2d', {willReadFrequently: true});
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, a = new Uint8Array(c.width * c.height);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
  return {a, w: c.width, h: c.height};
}

export class Ambient {
  constructor(scene) {
    this.scene = scene; this.key = scene.def.key; this.cfg = AMBIENT[this.key] ?? {layers: []};
    this.back = document.createElement('canvas'); this.back.className = 'scene-ambient scene-ambient-back';
    this.front = document.createElement('canvas'); this.front.className = 'scene-ambient scene-ambient-front';
    for (const c of [this.back, this.front]) c.setAttribute('aria-hidden', 'true');
    this.bctx = this.back.getContext('2d'); this.fctx = this.front.getContext('2d');
    this.layers = []; this.lastBack = 0; this.ready = false; this.w = 0; this.h = 0; this.dpr = 1;
  }
  mount(beforePlatform, beforeProps) { beforePlatform.before(this.back); (beforeProps ?? beforePlatform).before(this.front); }
  async load(plate) {
    this.plate = plate;
    this.layers = [];
    for (const spec of this.cfg.layers) {
      try { const L = await this.prepare(spec); if (L) { this.layers.push(L); if (L.partsLayer) this.layers.push(L.partsLayer); } } catch (error) { console.warn('Ambient layer skipped', spec.type, error); }
    }
    this.ready = true;
  }
  async prepare(spec) {
    const L = {...spec, seed: spec.seed ?? this.cfg.layers.indexOf(spec) * 7 + 3};
    const img = async name => loadImage(asset(name));
    switch (spec.type) {
      case 'rockingSea': {
        L.sea = await img(spec.sea); L.ship = await img(spec.ship);
        const ship = document.createElement('img'); ship.className = 'scene-ambient scene-ambient-ship'; ship.alt = ''; ship.draggable = false; ship.src = L.ship.src;
        this.back.after(ship); this.extra = [ship];
        const parts = await Promise.all((spec.parts ?? []).map(async p => ({...p, image: await img(p.src)})));
        L.partsLayer = {type: 'shipParts', layer: 'front', parts};
        L.gulls = await Promise.all((spec.gulls ?? []).map(async (g, i) => ({...g, image: await img(g.src), phase: i * 1.7 + .4})));
        L.shipAlpha = alphaMap(L.ship);
        L.glint = this.sparkles(spec.glints ?? 0, spec.glintArea ?? [0, spec.horizon, 1000, 1000 - spec.horizon], L.seed);
        return L;
      }
      case 'water': {
        L.image = await img(spec.src); L.alpha = alphaMap(L.image); this.water = L; return L;
      }
      case 'warp': case 'pivot': case 'pulse': {
        if (spec.patch) L.patchImage = await img(spec.patch.src);
        if (spec.type === 'pulse') { const [x, y] = spec.at, r = spec.r; L.poly = Array.from({length: 24}, (_, i) => [x + Math.cos(i / 24 * TAU) * r, y + Math.sin(i / 24 * TAU) * r * (this.plate.naturalWidth / this.plate.naturalHeight)]); }
        const cut = cutPolygon(this.plate, L.poly, spec.feather ?? 2.5, spec.pad ?? 8);
        L.cut = cut.canvas; L.rect = cut.rect; return L;
      }
      case 'sprites': {
        L.items = await Promise.all(spec.items.map(async (it, i) => ({...it, image: await img(it.src), phase: (it.phase ?? i * 2.3) + .5})));
        return L;
      }
      case 'glints': L.dots = this.sparkles(spec.count, spec.rect, L.seed); return L;
      default: {
        const r = rng(L.seed * 977 + 13);
        L.parts = Array.from({length: spec.count ?? 0}, (_, i) => ({i, a: r(), b: r(), c: r(), d: r(), e: r()}));
        return L;
      }
    }
  }
  sparkles(count, rect, seed) { const r = rng(seed * 31 + 5); return Array.from({length: count}, () => ({x: rect[0] + r() * rect[2], y: rect[1] + r() * rect[3], p: r() * 50, s: .6 + r() * .9, dur: 1.4 + r() * 2.2})); }
  resize(w, h, dpr) {
    this.w = w; this.h = h; this.dpr = dpr;
    for (const c of [this.back, this.front]) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    this.lastBack = 0;
  }
  // Pixel helpers (device pixels).
  X(v) { return v / 1000 * this.w * this.dpr; }
  Y(v) { return v / 1000 * this.h * this.dpr; }
  waterAt(x, y) {
    const L = this.water; if (!L) return 1;
    const [rx, ry, rw, rh] = L.rect, px = Math.floor((x - rx) / rw * L.alpha.w), py = Math.floor((y - ry) / rh * L.alpha.h);
    if (px < 0 || py < 0 || px >= L.alpha.w || py >= L.alpha.h) return 0;
    return L.alpha.a[py * L.alpha.w + px] / 255;
  }
  draw(now, still = false) {
    if (!this.ready || !this.w) return;
    const t = still ? 0 : now / 1000;
    // The painted world updates at up to 30fps (it moves slowly); the front particles every frame.
    if (still || now - this.lastBack > 31) {
      this.lastBack = now;
      const c = this.bctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.back.width, this.back.height);
      for (const L of this.layers) if ((L.layer ?? 'back') === 'back') this.drawLayer(c, L, t, still);
    }
    const f = this.fctx; f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, this.front.width, this.front.height);
    f.save();
    const [px, py, pw, ph] = this.scene.def.play, W = this.front.width, H = this.front.height;
    f.beginPath(); f.rect(0, 0, W, H); f.rect(px * W, py * H, pw * W, ph * H); f.clip('evenodd');
    for (const L of this.layers) if (L.layer === 'front') this.drawLayer(f, L, t, still);
    f.restore();
  }
  drawLayer(c, L, t, still) {
    c.save();
    try { this[`draw_${L.type}`]?.(c, L, t, still); } finally { c.restore(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  }
  // Horizontal strips of a layer, each nudged by fn(boardY) -> [dx, dy] in board units.
  // Destination rows stay on whole device pixels (no seams); vertical motion shifts the sampling instead.
  strips(c, image, rect, fn, y0 = rect[1], y1 = rect[1] + rect[3], step = 2, xr = null) {
    const iw0 = image.width ?? image.naturalWidth, ih = image.height ?? image.naturalHeight;
    let sx0 = 0, iw = iw0, dx0 = this.X(rect[0]), dw = this.X(rect[2]);
    if (xr) { const a = clamp((xr[0] - rect[0]) / rect[2], 0, 1), b = clamp((xr[1] - rect[0]) / rect[2], 0, 1); sx0 = a * iw0; iw = (b - a) * iw0; dx0 = this.X(rect[0] + a * rect[2]); dw = this.X((b - a) * rect[2]); }
    const top = Math.max(0, Math.floor(this.Y(Math.max(y0, rect[1])))), bottom = Math.ceil(this.Y(Math.min(y1, rect[1] + rect[3])));
    const sPerDev = ih / this.Y(rect[3]), hStep = Math.max(1, Math.round(step * this.dpr));
    for (let dy = top; dy < bottom; dy += hStep) {
      const h = Math.min(hStep, bottom - dy), by = (dy + h / 2) / (this.h * this.dpr) * 1000;
      const [ox, oy] = fn(by);
      let sy = (dy - this.Y(rect[1])) * sPerDev - this.Y(oy) * sPerDev, sh = h * sPerDev;
      if (sy < 0) { if (sy + sh <= 0) continue; sh += sy; sy = 0; }
      if (sy + sh > ih) sh = ih - sy; if (sh <= 0) continue;
      c.drawImage(image, sx0, sy, iw, sh, dx0 + this.X(ox), dy, dw, h * (sh / (h * sPerDev)));
    }
  }

  // ---------------------------------------------------------------- Thousand Sunny: rocking sea
  draw_rockingSea(c, L, t, still) {
    const W = this.back.width, H = this.back.height, hz = L.horizon;
    const roll = still ? 0 : (Math.sin(t * TAU / 7.4) * .7 + Math.sin(t * TAU / 3.3 + 1.1) * .3) * L.roll;
    const heave = still ? 0 : (Math.sin(t * TAU / 5.6 + .6) * .75 + Math.sin(t * TAU / 2.9) * .25) * L.heave;
    // Sea and sky (with islands and seagulls) rock around the middle of the deck.
    c.save();
    // Only paint where sea or sky can be seen around the ship (the rest is covered by it).
    c.beginPath(); c.rect(0, 0, W, this.Y(L.bands[0][1]) + 1);
    for (const [bx0, by0, bx1, by1] of L.bands) c.rect(this.X(bx0), this.Y(by0), this.X(bx1 - bx0), this.Y(by1 - by0));
    c.clip();
    const s = 1 + (still ? 0 : L.margin);
    c.translate(W / 2, H * .55); c.rotate(roll * Math.PI / 180); c.translate(0, this.Y(heave)); c.scale(s, s); c.translate(-W / 2, -H * .55);
    c.drawImage(L.sea, 0, 0, W, H);
    if (!still) {
      const R = L.ripple, fn = y => {
        const depth = clamp((y - hz) / (1000 - hz), 0, 1);
        const a = R.amp * (.12 + .88 * Math.pow(depth, .8));
        return [a * (Math.sin(y * R.k - t * R.w) * .65 + Math.sin(y * R.k * 2.3 + t * R.w * 1.4 + 1.3) * .35), .5 * a * Math.sin(y * R.k * .7 + t * R.w * .8)];
      };
      // Only the stretches of sea that can actually be seen around the ship.
      for (const [bx0, by0, bx1, by1] of L.bands) this.strips(c, L.sea, [0, 0, 1000, 1000], fn, Math.max(hz + 1.5, by0), by1, 2, [bx0, bx1]);
      // Sun glints winking on the water (the ship is drawn over them afterwards).
      c.globalCompositeOperation = 'lighter';
      for (const g of L.glint) {
        const k = ((t + g.p) % g.dur) / g.dur; if (k > .35) continue;
        const a = Math.sin(k / .35 * Math.PI), x = this.X(g.x + Math.sin(t * .4 + g.p) * 4), y = this.Y(g.y), r = this.X(1.4 * g.s) * (.6 + a);
        c.globalAlpha = a * .75; c.fillStyle = '#fffbe6';
        c.beginPath(); c.moveTo(x - r * 2.4, y); c.lineTo(x, y - r * .45); c.lineTo(x + r * 2.4, y); c.lineTo(x, y + r * .45); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(x, y - r * 1.3); c.lineTo(x + r * .3, y); c.lineTo(x, y + r * 1.3); c.lineTo(x - r * .3, y); c.closePath(); c.fill();
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    }
    // Seagulls: glide on a slow figure-of-eight, tilt into the turn, with occasional wingbeats.
    for (const g of L.gulls) {
      const [x, y, w, h] = g.rect, p = g.phase;
      let ox = 0, oy = 0, rot = 0, flap = 1;
      if (!still) {
        ox = Math.sin(t * .23 + p) * 9 + Math.sin(t * .51 + p * 2) * 3; oy = Math.sin(t * .46 + p) * 4 + Math.sin(t * 1.3 + p) * .8;
        rot = Math.cos(t * .23 + p) * .07;
        const cyc = (t + p * 3) % 6.5; if (cyc < 1.35) flap = 1 - .42 * Math.pow(Math.abs(Math.sin(cyc / 1.35 * Math.PI * 3)), 1.5);
      }
      c.save(); c.translate(this.X(x + w / 2 + ox), this.Y(y + h / 2 + oy)); c.rotate(rot); c.scale(1, flap);
      c.drawImage(g.image, -this.X(w) / 2, -this.Y(h) / 2, this.X(w), this.Y(h)); c.restore();
    }
    c.restore();
    // The ship itself never moves: it's a plain image above this canvas (see prepare), so it costs nothing per frame.
  }
  draw_shipParts(c, L, t, still) { for (const p of L.parts) this.drawPart(c, p, t, still); }
  drawPart(c, p, t, still) {
    const [x, y, w, h] = p.rect, m = p.motion;
    if (still) { c.drawImage(p.image, this.X(x), this.Y(y), this.X(w), this.Y(h)); return; }
    if (m.kind === 'pivot') { // a rope garland swinging from its tie-off, with a little flutter of its own
      const [px, py] = m.pivot, g = wobble(t * TAU / m.period, m.phase ?? 0) + Math.sin(t * TAU / (m.period * .37)) * (m.flutter ?? 0) * .25;
      c.save(); c.translate(this.X(px), this.Y(py)); c.rotate(m.rot * g * Math.PI / 180);
      c.drawImage(p.image, this.X(x - px), this.Y(y - py), this.X(w), this.Y(h)); c.restore(); return;
    }
    const span = m.span ?? h;
    this.strips(c, p.image, p.rect, by => {
      const d = clamp(m.dir < 0 ? (m.hinge - by) / span : (by - m.hinge) / span, 0, 1), s = Math.pow(d, m.curve ?? 1.4);
      const g = wobble(t * TAU / m.period, m.phase ?? 0), travel = Math.sin(t * TAU / (m.period * .43) - by / (m.wave ?? 60));
      return [s * (m.ax * g + (m.flutter ?? 0) * travel), -s * (m.ay ?? 0) * (.5 + .5 * g)];
    });
  }

  // ---------------------------------------------------------------- open water (Sea King)
  draw_water(c, L, t, still) {
    const [x, y, w, h] = L.rect;
    if (still) return;
    this.strips(c, L.image, L.rect, by => {
      const depth = clamp((by - L.horizon) / (1000 - L.horizon), 0, 1), a = L.amp * (.15 + .85 * Math.pow(depth, .7));
      const swell = Math.sin(t * TAU / 6.5 + by * .012) * L.swell * depth;
      return [a * (Math.sin(by * L.k - t * L.w) * .55 + Math.sin(by * L.k * 2.7 + t * L.w * 1.3 + 2) * .3 + Math.sin(by * L.k * .43 - t * L.w * .6) * .15) + swell,
        a * .6 * Math.sin(by * L.k * .8 + t * L.w * .9 + 1)];
    }, y, y + h, 2);
  }

  // ---------------------------------------------------------------- foliage, garlands, sails, creatures
  draw_warp(c, L, t, still) {
    if (L.patchImage) { const [x, y, w, h] = L.patch.rect; c.drawImage(L.patchImage, this.X(x), this.Y(y), this.X(w), this.Y(h)); }
    if (still) { const [x, y, w, h] = L.rect; c.drawImage(L.cut, this.X(x), this.Y(y), this.X(w), this.Y(h)); return; }
    const span = L.span ?? (L.dir < 0 ? L.hinge - L.rect[1] : L.rect[1] + L.rect[3] - L.hinge);
    const T = t * TAU / L.period, ph = L.phase ?? 0;
    this.strips(c, L.cut, L.rect, by => {
      const d = clamp(L.dir < 0 ? (L.hinge - by) / span : (by - L.hinge) / span, 0, 1), s = Math.pow(d, L.curve ?? 1.5);
      const g = wobble(T, ph), travel = Math.sin(T * 2.3 - by / (L.wave ?? 40) + ph);
      return [s * (L.ax * g + (L.flutter ?? 0) * travel), -s * (L.ay ?? 0) * (.5 + .5 * Math.sin(T * (L.breath ?? 1) + ph))];
    });
  }
  draw_pivot(c, L, t, still) {
    if (L.patchImage) { const [x, y, w, h] = L.patch.rect; c.drawImage(L.patchImage, this.X(x), this.Y(y), this.X(w), this.Y(h)); }
    const [x, y, w, h] = L.rect, [px, py] = L.pivot;
    const g = still ? 0 : wobble(t * TAU / L.period, L.phase ?? 0), lift = still ? 0 : (.5 + .5 * Math.sin(t * TAU / L.period * .7 + (L.phase ?? 0)));
    c.translate(this.X(px), this.Y(py)); c.rotate((L.rot * g) * Math.PI / 180); c.translate(0, -this.Y((L.rise ?? 0) * lift));
    c.drawImage(L.cut, this.X(x - px), this.Y(y - py), this.X(w), this.Y(h));
  }
  draw_pulse(c, L, t, still) {
    const [x, y, w, h] = L.rect, [cx, cy] = L.at;
    const k = still ? 1 : 1 + L.amp * (.5 + .5 * Math.sin(t * TAU / L.period + (L.phase ?? 0)));
    const ox = still ? 0 : Math.sin(t * TAU / (L.period * 1.7) + (L.phase ?? 0)) * (L.drift ?? 0), oy = still ? 0 : -Math.abs(Math.sin(t * TAU / (L.period * 2.1) + (L.phase ?? 0))) * (L.bob ?? 0);
    c.translate(this.X(cx + ox), this.Y(cy + oy)); c.scale(k, k);
    c.drawImage(L.cut, this.X(x - cx), this.Y(y - cy), this.X(w), this.Y(h));
  }
  draw_sprites(c, L, t, still) {
    for (const it of L.items) {
      const [x, y, w, h] = it.rect, m = it.motion ?? {}, p = it.phase;
      let ox = 0, oy = 0, rot = 0, sx = 1;
      if (!still) {
        if (m.kind === 'drift') { // a leaf hanging in the air on the breeze
          ox = Math.sin(t * .37 + p) * m.ax + Math.sin(t * .91 + p * 2) * m.ax * .3; oy = Math.sin(t * .53 + p) * m.ay;
          rot = Math.sin(t * .7 + p) * (m.rot ?? .5); sx = .55 + .45 * Math.abs(Math.cos(t * .8 + p));
        } else if (m.kind === 'flutter') { // a leaf lying on the deck that lifts a little when a gust passes
          const gust = Math.max(0, wobble(t * .55 + (it.rect[0] / 400), 1.3) - .35) / .65, ripple = Math.sin(t * 9 + p * 4);
          rot = gust * ((m.rot ?? .35) * .6 + ripple * .12); oy = -gust * (m.lift ?? 1.4); ox = gust * (m.slide ?? 1.5);
        }
      }
      const pivX = m.pivot ? m.pivot[0] : x + w / 2, pivY = m.pivot ? m.pivot[1] : y + h / 2;
      c.save(); c.translate(this.X(pivX + ox), this.Y(pivY + oy)); c.rotate(rot); c.scale(sx, 1);
      c.drawImage(it.image, this.X(x - pivX), this.Y(y - pivY), this.X(w), this.Y(h)); c.restore();
    }
  }

  // ---------------------------------------------------------------- light
  draw_glow(c, L, t, still) {
    const [x, y] = L.at, r = this.X(L.r);
    let k = still ? .5 : .5 + .5 * Math.sin(t * TAU / L.period + (L.phase ?? 0));
    if (!still && L.flicker) k = clamp(k + (wobble(t * 11, L.phase ?? 0) * .5 + (Math.sin(t * 37 + (L.phase ?? 0) * 9) > .93 ? -.6 : 0)) * L.flicker, 0, 1);
    c.globalCompositeOperation = L.blend ?? 'lighter'; c.globalAlpha = L.alpha[0] + (L.alpha[1] - L.alpha[0]) * k;
    const sw = L.sway ? (still ? 0 : Math.sin(t * TAU / (L.sway[1]) + (L.phase ?? 0)) * L.sway[0]) : 0;
    const gx = this.X(x + sw), gy = this.Y(y), gr = c.createRadialGradient(gx, gy, 0, gx, gy, r);
    gr.addColorStop(0, L.color); gr.addColorStop(L.core ?? .25, L.color); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.beginPath(); c.ellipse(gx, gy, r, r * (L.squash ?? 1), 0, 0, TAU); c.fill();
  }
  draw_rays(c, L, t, still) {
    c.globalCompositeOperation = 'screen';
    const [ox, oy] = L.origin, r = rng(L.seed);
    for (let i = 0; i < L.count; i++) {
      const base = L.angle + (i / Math.max(1, L.count - 1) - .5) * L.spread + (r() - .5) * .05;
      const ang = base + (still ? 0 : Math.sin(t * TAU / (L.period * 2.3) + i) * .012);
      const len = this.Y(L.length * (.75 + r() * .4)), wid = this.X(L.width * (.6 + r() * .8));
      const k = still ? .5 : .5 + .5 * Math.sin(t * TAU / L.period * (.7 + r() * .6) + i * 1.9);
      c.save(); c.translate(this.X(ox + (r() - .5) * L.jitter), this.Y(oy)); c.rotate(ang);
      const g = c.createLinearGradient(0, 0, 0, len); g.addColorStop(0, L.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = L.alpha * (.35 + .65 * k); c.fillStyle = g;
      c.beginPath(); c.moveTo(-wid * .3, 0); c.lineTo(wid * .3, 0); c.lineTo(wid, len); c.lineTo(-wid, len); c.closePath(); c.fill(); c.restore();
    }
  }
  draw_lightning(c, L, t, still) {
    if (still) return;
    const cycle = L.every, k = (t + 2.5) % cycle;
    // A double flicker: bright, dip, brighter, fade.
    const f = k < .08 ? k / .08 : k < .16 ? 1 - (k - .08) / .08 * .8 : k < .24 ? .2 + (k - .16) / .08 : k < .9 ? Math.pow(1 - (k - .24) / .66, 2) : 0;
    if (f <= 0) return;
    c.globalCompositeOperation = 'lighter';
    const [sx, sy, sw, sh] = L.sky; c.globalAlpha = f * L.skyAlpha;
    const sky = c.createLinearGradient(0, this.Y(sy), 0, this.Y(sy + sh)); sky.addColorStop(0, L.color); sky.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = sky; c.fillRect(this.X(sx), this.Y(sy), this.X(sw), this.Y(sh));
    for (const [bx, by, br] of L.bolts) {
      const gx = this.X(bx), gy = this.Y(by), g = c.createRadialGradient(gx, gy, 0, gx, gy, this.X(br));
      g.addColorStop(0, 'rgba(235,245,255,.95)'); g.addColorStop(.2, L.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = f; c.fillStyle = g; c.beginPath(); c.arc(gx, gy, this.X(br), 0, TAU); c.fill();
    }
  }
  draw_mist(c, L, t, still) {
    const [rx, ry, rw, rh] = L.rect;
    c.beginPath(); c.rect(this.X(rx), this.Y(ry), this.X(rw), this.Y(rh)); c.clip();
    for (const p of L.parts) {
      const speed = L.speed * (.6 + p.c * .8), x = rx + ((p.a * rw + (still ? 0 : t * speed)) % (rw + L.size * 2)) - L.size, y = ry + p.b * rh + (still ? 0 : Math.sin(t * .2 + p.d * 9) * rh * .06);
      const R = this.X(L.size * (.6 + p.e * .8)), gx = this.X(x), gy = this.Y(y);
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, R); g.addColorStop(0, L.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = L.alpha * (.55 + .45 * (still ? .5 : Math.sin(t * .3 + p.d * 7) * .5 + .5)); c.fillStyle = g;
      c.beginPath(); c.ellipse(gx, gy, R, R * (L.flat ?? .35), 0, 0, TAU); c.fill();
    }
  }
  draw_clouds(c, L, t, still) { this.draw_mist(c, L, t, still); }
  draw_birds(c, L, t, still) {
    if (still) return;
    const [y0, y1] = L.band;
    for (const p of L.parts) {
      const dur = L.cross * (.8 + p.a * .5), k = ((t + p.b * dur * 3) % (dur * (1.6 + p.c))) / dur; if (k > 1) continue;
      const dir = p.d < .5 ? 1 : -1, x = dir > 0 ? -30 + k * 1060 : 1030 - k * 1060, y = y0 + p.e * (y1 - y0) + Math.sin(k * 7 + p.a * 9) * 4;
      // Small flocks of two or three, wings beating then gliding.
      for (let j = 0; j < 1 + Math.floor(p.c * 3); j++) {
        const bx = this.X(x - dir * j * 14), by = this.Y(y + j * 6 + (j % 2) * 3), s = this.X(L.size * (.8 + p.e * .4) * (1 - j * .12));
        const beat = Math.sin(t * 9 + j * 1.3 + p.a * 20), glide = Math.sin(t * .9 + p.b * 9) > .3 ? .25 : 1, wing = beat * glide;
        c.strokeStyle = L.color; c.globalAlpha = L.alpha; c.lineWidth = Math.max(.8, s * .18); c.lineCap = 'round';
        c.beginPath(); c.moveTo(bx - s, by - s * .5 * wing); c.quadraticCurveTo(bx - s * .4, by - s * .55 * wing - s * .15, bx, by); c.quadraticCurveTo(bx + s * .4, by - s * .55 * wing - s * .15, bx + s, by - s * .5 * wing); c.stroke();
      }
    }
  }
  draw_glints(c, L, t, still) {
    if (still) return;
    c.globalCompositeOperation = 'lighter';
    for (const g of L.dots) {
      const k = ((t + g.p) % g.dur) / g.dur; if (k > .3) continue;
      if (L.mask === 'water' && this.waterAt(g.x, g.y) < .9) continue;
      const a = Math.sin(k / .3 * Math.PI), x = this.X(g.x), y = this.Y(g.y), r = this.X(1.3 * g.s) * (.5 + a);
      c.globalAlpha = a * (L.alpha ?? .7); c.fillStyle = L.color ?? '#effcff';
      c.beginPath(); c.moveTo(x - r * 2.2, y); c.lineTo(x, y - r * .4); c.lineTo(x + r * 2.2, y); c.lineTo(x, y + r * .4); c.closePath(); c.fill();
    }
  }
  draw_bubbles(c, L, t, still) {
    if (still) return;
    const [rx, ry, rw, rh] = L.rect;
    for (const p of L.parts) {
      const dur = L.rise * (.7 + p.a * .6), k = ((t + p.b * dur) % dur) / dur;
      const x = rx + p.c * rw + Math.sin(t * 2.2 + p.d * 9) * 2.2 * (1 - k), y = ry + rh * (1 - k);
      if (L.mask === 'water' && this.waterAt(x, y) < .95) continue;
      const r = this.X(L.size * (.5 + p.e)), a = Math.min(1, k * 6) * (1 - Math.pow(k, 3)) * L.alpha;
      c.globalAlpha = a; c.strokeStyle = '#d8fbff'; c.lineWidth = Math.max(.6, r * .22);
      c.beginPath(); c.arc(this.X(x), this.Y(y), r, 0, TAU); c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(this.X(x) - r * .35, this.Y(y) - r * .35, r * .28, 0, TAU); c.fill();
    }
  }
  draw_spray(c, L, t, still) {
    if (still) return;
    L.points.forEach(([x, y, ang, every, pw = 1], idx) => {
      const k = ((t + idx * 1.37) % every) / every * every; if (k > 1.25) return;
      for (let i = 0; i < 14; i++) {
        const r = Math.sin(i * 12.9898 + idx * 78.233) * 43758.5453 % 1, q = Math.abs(r), s = .4 + q * .9;
        const life = .7 + q * .55; if (k > life) continue;
        const u = k / life, a = (ang + (q - .5) * 1.1) * Math.PI / 180, v = 26 * pw * s;
        const px = x + Math.cos(a) * v * u, py = y - Math.sin(a) * v * u + 38 * pw * u * u;
        c.globalAlpha = (1 - u) * .8; c.fillStyle = '#f4ffff';
        c.beginPath(); c.arc(this.X(px), this.Y(py), this.X(.9 + q * 1.4) * (1 - u * .4), 0, TAU); c.fill();
      }
    });
  }
  draw_smoke(c, L, t, still) {
    if (still) return;
    for (const [x, y, scale = 1] of L.points) {
      for (let i = 0; i < 9; i++) {
        const k = ((t / L.rise + i / 9) % 1), u = smooth(k);
        const px = x + u * L.drift * scale + Math.sin(t * .8 + i * 2.1) * 2 * u * scale, py = y - u * L.height * scale, R = this.X((1.2 + u * 5) * scale);
        const g = c.createRadialGradient(this.X(px), this.Y(py), 0, this.X(px), this.Y(py), R); g.addColorStop(0, L.color); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = L.alpha * Math.sin(k * Math.PI) * (1 - u * .5); c.fillStyle = g; c.beginPath(); c.arc(this.X(px), this.Y(py), R, 0, TAU); c.fill();
      }
    }
  }
  draw_fireflies(c, L, t, still) {
    if (still) return;
    for (const p of L.parts) {
      const area = L.rects[p.i % L.rects.length], [rx, ry, rw, rh] = area;
      const x = rx + (p.a + Math.sin(t * .11 * (1 + p.c) + p.d * 9) * .18 + Math.sin(t * .37 + p.e * 7) * .05) * rw;
      const y = ry + (p.b + Math.sin(t * .09 * (1 + p.d) + p.c * 9) * .2 + Math.sin(t * .29 + p.a * 5) * .04) * rh;
      const blink = Math.pow(Math.max(0, Math.sin(t * (.6 + p.e * .7) + p.a * 30)), 3);
      if (blink < .02) continue;
      const gx = this.X(x), gy = this.Y(y), r = this.X(L.size * (.7 + p.c * .6));
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, r * 5); g.addColorStop(0, L.color); g.addColorStop(.2, L.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalCompositeOperation = 'lighter'; c.globalAlpha = blink * .55; c.fillStyle = g; c.beginPath(); c.arc(gx, gy, r * 5, 0, TAU); c.fill();
      c.globalAlpha = blink; c.fillStyle = L.core ?? '#f6ffd0'; c.beginPath(); c.arc(gx, gy, r * .7, 0, TAU); c.fill();
    }
  }
  draw_leaves(c, L, t, still) {
    if (still) return;
    const [rx, ry, rw, rh] = L.rect;
    for (const p of L.parts) {
      const dur = L.fall * (.75 + p.a * .6), k = ((t + p.b * dur * 2.7) % (dur * (1 + L.gap * p.c))) / dur; if (k > 1) continue;
      const x = rx + p.d * rw + k * L.wind * rw + Math.sin(k * 9 + p.e * 9) * 18, y = ry + k * rh + Math.sin(k * 13 + p.a * 5) * 6;
      const spin = t * (1.5 + p.e * 2) + p.a * 9, s = this.X(L.size * (.7 + p.c * .6));
      const fade = Math.min(1, k * 8, (1 - k) * 8);
      c.save(); c.translate(this.X(x), this.Y(y)); c.rotate(spin * .6); c.scale(Math.cos(spin), 1);
      c.globalAlpha = fade * (L.alpha ?? .95); c.fillStyle = L.colors[p.i % L.colors.length];
      c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * .55, s, 0); c.quadraticCurveTo(0, s * .55, -s, 0); c.fill();
      c.strokeStyle = 'rgba(30,50,20,.45)'; c.lineWidth = Math.max(.5, s * .08); c.beginPath(); c.moveTo(-s * .95, 0); c.lineTo(s * .9, 0); c.stroke();
      c.restore();
    }
  }
}
