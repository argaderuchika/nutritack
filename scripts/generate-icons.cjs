const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const raw = Buffer.alloc(height * (1 + width * 4));
  let pos = 0;
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[pos++] = r;
      raw[pos++] = g;
      raw[pos++] = b;
      raw[pos++] = a;
    }
  }

  const idatData = zlib.deflateSync(raw);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate an icon with dark luxury background, emerald gradient border & glowing flame symbol
function drawAppIcon(x, y, width, height) {
  const nx = x / width;
  const ny = y / height;
  const cx = 0.5;
  const cy = 0.52;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: dark navy slate (#090d16) to (#0f172a)
  let r = Math.round(9 + ny * 6);
  let g = Math.round(13 + ny * 10);
  let b = Math.round(22 + ny * 20);
  let a = 255;

  // Emerald glowing circle in the center background
  const glow = Math.max(0, 1 - dist / 0.45);
  if (glow > 0) {
    r = Math.min(255, Math.round(r + 16 * glow * 1.5));
    g = Math.min(255, Math.round(g + 185 * glow * 0.4));
    b = Math.min(255, Math.round(b + 129 * glow * 0.4));
  }

  // Flame / leaf shape
  // Flame shape centered at (0.5, 0.52), normalized radius ~0.25
  const fx = (nx - 0.5) * 2.8;
  const fy = (ny - 0.52) * 2.8;

  // Heart/flame curve: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0 inverted
  // Parametric flame check:
  // Base teardrop: x^2 + (y - sqrt(|x|))^2 or similar
  const inFlameOuter = (fx * fx * 1.3 + (fy + 0.35 * Math.abs(fx)) * (fy + 0.35 * Math.abs(fx))) < 0.65 && (fy < 0.65 && fy > -0.85);
  const inFlameInner = (fx * fx * 2.5 + (fy - 0.15 + 0.5 * Math.abs(fx)) * (fy - 0.15 + 0.5 * Math.abs(fx))) < 0.2 && fy < 0.35;

  if (inFlameOuter) {
    // Vibrant emerald gradient: top teal/emerald, bottom lime/green
    const t = (fy + 0.85) / 1.5;
    r = Math.round(16 + (1 - t) * 30);
    g = Math.round(185 + t * 45);
    b = Math.round(129 - t * 40);

    // Inner bright core
    if (inFlameInner) {
      r = 255;
      g = 255;
      b = 255;
    }
  }

  return [r, g, b, a];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write 180x180 apple touch icon
console.log('Writing apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, drawAppIcon));

// Write 192x192 PWA icon
console.log('Writing pwa-192x192.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, drawAppIcon));

// Write 512x512 PWA icon
console.log('Writing pwa-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, drawAppIcon));

console.log('Done generating icons!');
