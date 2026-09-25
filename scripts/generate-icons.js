import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth: 8
  ihdr.writeUInt8(6, 9); // color type: RGBA (6)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Generate raster data with gradient & center circle
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius) {
        // Inner circle with gradient
        const t = (x + y) / (width + height);
        rawData[pos++] = Math.round(79 * (1 - t) + 16 * t);   // R
        rawData[pos++] = Math.round(70 * (1 - t) + 185 * t);  // G
        rawData[pos++] = Math.round(229 * (1 - t) + 129 * t); // B
        rawData[pos++] = 255;
      } else {
        // Dark background
        rawData[pos++] = 15;
        rawData[pos++] = 23;
        rawData[pos++] = 42;
        rawData[pos++] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return ~c;
}

const table = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[n] = c;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 99, 102, 241));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 99, 102, 241));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 99, 102, 241));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 99, 102, 241));
fs.writeFileSync('public/icon-192.png', createPng(192, 192, 99, 102, 241));

console.log('PWA PNG icons generated successfully!');
