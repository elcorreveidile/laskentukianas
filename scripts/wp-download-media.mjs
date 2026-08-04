/**
 * Descarga los ficheros de media de "Crónicas Kentukianas" desde el origen nginx de
 * SiteGround, fijando la IP (el DNS reparte entre Vercel y SiteGround y falla al azar).
 *
 * Uso: node scripts/wp-download-media.mjs
 */
import https from 'node:https';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'wp-export');
const MEDIA = join(ROOT, 'media');

const ORIGIN_IPS = ['34.120.190.48', '35.227.194.51'];
const HOST = 'lectoraium.com';

function get(path, ip) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: ip,
        port: 443,
        path,
        method: 'GET',
        servername: HOST, // SNI correcto para el certificado
        headers: { Host: HOST, 'User-Agent': 'kentukianas-export' },
        timeout: 60000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        resolve(res);
      }
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

async function download(path, dest) {
  let lastErr;
  for (const ip of ORIGIN_IPS) {
    try {
      const res = await get(path, ip);
      await new Promise((resolve, reject) => {
        const ws = createWriteStream(dest);
        res.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
        res.on('error', reject);
      });
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

await mkdir(MEDIA, { recursive: true });
const media = JSON.parse(await readFile(join(ROOT, 'data', 'media.json'), 'utf8'));

let ok = 0;
let fail = 0;
const manifest = [];
const CONC = 10;
for (let i = 0; i < media.length; i += CONC) {
  await Promise.all(
    media.slice(i, i + CONC).map(async (m) => {
      const src = m.source_url;
      if (!src) return;
      const path = new URL(src).pathname;
      const file = `${m.id}-${basename(path)}`;
      const dest = join(MEDIA, file);
      try {
        // saltar si ya existe con tamaño > 0
        try {
          const s = await stat(dest);
          if (s.size > 0) {
            ok++;
            manifest.push({ id: m.id, src, file, alt: m.alt_text || '', mime: m.mime_type });
            return;
          }
        } catch {}
        await download(path, dest);
        ok++;
        manifest.push({ id: m.id, src, file, alt: m.alt_text || '', mime: m.mime_type });
      } catch (e) {
        fail++;
        manifest.push({ id: m.id, src, file: null, error: String(e) });
      }
    })
  );
  process.stdout.write(`  ${ok}/${media.length} (fallos ${fail})\r`);
}

await writeFile(join(ROOT, 'data', 'media-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`\n✓ Imágenes descargadas: ${ok} (fallos ${fail})`);
