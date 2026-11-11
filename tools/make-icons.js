/**
 * Generator ikon PWA Portal KiTA.
 * Digambar manual (gradient + mark geometris), lalu di-downsample dari 4x
 * supaya tepinya halus. Jalankan: node tools/make-icons.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

/* ---------- PNG encoder minimal ---------- */
function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const payload = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload));
  return Buffer.concat([len, payload, crc]);
}
function encodePNG(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 3;
      const d = y * (width * 3 + 1) + 1 + x * 3;
      raw[d] = rgb[s];
      raw[d + 1] = rgb[s + 1];
      raw[d + 2] = rgb[s + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- util warna & SDF ---------- */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mix = (a, b, t) => a + (b - a) * t;
const mixRGB = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const smooth = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const sdfCircle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;
const sdfSegment = (x, y, ax, ay, bx, by, r) => {
  const pax = x - ax, pay = y - ay, bax = bx - ax, bay = by - ay;
  const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay));
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
};

/* ---------- desain ikon ---------- */
function shade(px, py, scale) {
  // px,py dalam koordinat 0..1
  let col = mixRGB([255, 173, 84], [249, 115, 22], smooth(0.1, 0.62, px * 0.5 + py * 0.55));
  col = mixRGB(col, [124, 45, 92], smooth(0.5, 0.98, px * 0.5 + py * 0.65));

  // glow hangat
  const g1 = smooth(0.62, 0.0, Math.hypot(px - 0.22, py - 0.16));
  col = mixRGB(col, [255, 238, 210], g1 * 0.5);
  const g2 = smooth(0.7, 0.0, Math.hypot(px - 0.82, py - 0.86));
  col = mixRGB(col, [155, 135, 245], g2 * 0.55);
  const g3 = smooth(0.5, 0.0, Math.hypot(px - 0.9, py - 0.18));
  col = mixRGB(col, [255, 107, 91], g3 * 0.35);

  const cx = 0.5, cy = 0.5;
  const s = scale;
  const ink = [255, 247, 237];

  // cincin portal tipis
  const ring = Math.abs(sdfCircle(px, py, cx, cy, 0.395 * s)) - 0.009;
  const aRing = 1 - smooth(-0.002, 0.0025, ring);
  col = mixRGB(col, ink, aRing * 0.34);

  // huruf K geometris (capsule)
  const bar = sdfSegment(px, py, cx - 0.135 * s, cy - 0.195 * s, cx - 0.135 * s, cy + 0.195 * s, 0.049 * s);
  const armA = sdfSegment(px, py, cx - 0.105 * s, cy, cx + 0.115 * s, cy - 0.215 * s, 0.045 * s);
  const armB = sdfSegment(px, py, cx - 0.105 * s, cy, cx + 0.13 * s, cy + 0.21 * s, 0.045 * s);
  const k = Math.min(bar, armA, armB);
  const aK = 1 - smooth(-0.0015, 0.0018, k);
  col = mixRGB(col, ink, aK);

  // titik aksen
  const dot = sdfCircle(px, py, cx + 0.265 * s, cy - 0.245 * s, 0.036 * s);
  col = mixRGB(col, [255, 214, 165], (1 - smooth(-0.0015, 0.0018, dot)) * 0.95);

  return col;
}

function render(size, markScale) {
  const SS = 4;
  const W = size * SS;
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size;
          const py = (y + (sy + 0.5) / SS) / size;
          const c = shade(px, py, markScale);
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 3;
      out[i] = Math.round(clamp(r / n, 0, 255));
      out[i + 1] = Math.round(clamp(g / n, 0, 255));
      out[i + 2] = Math.round(clamp(b / n, 0, 255));
    }
  }
  return encodePNG(size, size, out);
}

const dir = path.join(__dirname, "..", "assets", "icons");
fs.mkdirSync(dir, { recursive: true });
const jobs = [
  ["icon-192.png", 192, 0.92],
  ["icon-512.png", 512, 0.92],
  ["icon-maskable-192.png", 192, 0.68],
  ["icon-maskable-512.png", 512, 0.68],
  ["apple-touch-icon.png", 180, 0.86],
  ["favicon-32.png", 32, 1],
];
for (const [name, size, scale] of jobs) {
  fs.writeFileSync(path.join(dir, name), render(size, scale));
  console.log("✓", name);
}
