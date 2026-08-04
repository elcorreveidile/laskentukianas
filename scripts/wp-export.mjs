/**
 * Exporta el contenido de "Crónicas Kentukianas" (WordPress) por su API pública.
 * Guarda JSON en wp-export/data/ y descarga las imágenes en wp-export/media/.
 * No requiere credenciales.
 *
 * Uso: node scripts/wp-export.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'wp-export');
const DATA = join(ROOT, 'data');
const MEDIA = join(ROOT, 'media');

const WP = 'https://www.lectoraium.com/wp-json/wp/v2';

async function fetchAll(resource, extra = '') {
  const items = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = `${WP}/${resource}?per_page=100&page=${page}${extra}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) break; // sin más páginas
      throw new Error(`${resource} p${page}: HTTP ${res.status}`);
    }
    totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    const batch = await res.json();
    items.push(...batch);
    process.stdout.write(`  ${resource}: ${items.length} (pág ${page}/${totalPages})\r`);
    page++;
  } while (page <= totalPages);
  console.log(`  ${resource}: ${items.length} elementos            `);
  return items;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

await mkdir(DATA, { recursive: true });
await mkdir(MEDIA, { recursive: true });

console.log('Exportando contenido de Crónicas Kentukianas…\n');

const resources = ['posts', 'pages', 'categories', 'tags', 'users', 'comments', 'media'];
const collected = {};
for (const r of resources) {
  collected[r] = await fetchAll(r);
  await writeFile(join(DATA, `${r}.json`), JSON.stringify(collected[r], null, 2), 'utf8');
}

// Descargar los ficheros de media
console.log('\nDescargando imágenes…');
const media = collected.media;
let ok = 0;
let fail = 0;
const manifest = [];
const CONCURRENCY = 8;
for (let i = 0; i < media.length; i += CONCURRENCY) {
  const slice = media.slice(i, i + CONCURRENCY);
  await Promise.all(
    slice.map(async (m) => {
      const src = m.source_url;
      if (!src) return;
      const file = `${m.id}-${basename(new URL(src).pathname)}`;
      try {
        await download(src, join(MEDIA, file));
        manifest.push({ id: m.id, src, file, alt: m.alt_text || '', mime: m.mime_type });
        ok++;
      } catch (e) {
        fail++;
        manifest.push({ id: m.id, src, file: null, error: String(e) });
      }
    })
  );
  process.stdout.write(`  descargadas ${ok}/${media.length} (fallos ${fail})\r`);
}
await writeFile(join(DATA, 'media-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`\n\n✓ Export completo:`);
for (const r of resources) console.log(`  ${r}: ${collected[r].length}`);
console.log(`  imágenes descargadas: ${ok} (fallos ${fail})`);
console.log(`\nDatos en wp-export/data/ · imágenes en wp-export/media/`);
