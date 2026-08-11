/**
 * Importa el archivo local de "Crónicas Kentukianas" (wp-export/) a la BD (Prisma) y sube
 * las imágenes a Vercel Blob, reescribiendo las URLs del contenido HTML.
 *
 * Requiere en .env.local: DATABASE_URL (Neon) y BLOB_READ_WRITE_TOKEN.
 * Uso: npm run wp:import   (o: npx tsx scripts/wp-import.ts)
 *
 * Idempotente por wpId (re-ejecutable sin duplicar).
 */
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";
import { PrismaClient, Series, ContentStatus } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar .env.local explícitamente
config({ path: join(__dirname, "..", ".env.local") });
const EXPORT = join(__dirname, "..", "wp-export");
const DATA = join(EXPORT, "data");
const MEDIA = join(EXPORT, "media");

const db = new PrismaClient();
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!BLOB_TOKEN) throw new Error("Falta BLOB_READ_WRITE_TOKEN en .env.local");

// ---------- helpers ----------
const readJson = async (name: string) =>
  JSON.parse(await readFile(join(DATA, `${name}.json`), "utf8"));

const decodeEntities = (s = "") =>
  s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// Normaliza comillas tipográficas sueltas a rectas (evita ‘ ’ “ ” raros en títulos).
const normalizeQuotes = (s = "") =>
  s
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/–/g, "-")
    .replace(/ /g, " ");

const stripHtml = (s = "") =>
  normalizeQuotes(decodeEntities(s.replace(/<[^>]+>/g, "")))
    .replace(/\s+/g, " ")
    .trim();

const firstInt = (s = "") => {
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
};

// stem = nombre de fichero sin extensión, sin sufijo de tamaño (-1024x768) ni -scaled
const stemOf = (filename: string) =>
  decodeURIComponent(filename)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-\d+x\d+$/i, "")
    .replace(/-scaled$/i, "");

async function main() {
  const [posts, pages, categories, tags, users, comments, media] = await Promise.all([
    readJson("posts"),
    readJson("pages"),
    readJson("categories"),
    readJson("tags"),
    readJson("users"),
    readJson("comments"),
    readJson("media"),
  ]);

  // ---------- 1) Subir imágenes a Blob ----------
  console.log(`Subiendo ${media.length} imágenes a Vercel Blob…`);
  const blobByWpId = new Map<number, string>();
  const blobByStem = new Map<string, string>();
  let up = 0;
  for (const m of media) {
    const src: string = m.source_url;
    if (!src) continue;
    const file = `${m.id}-${basename(new URL(src).pathname)}`;
    // idempotencia: si ya existe en BD, reutiliza
    const existing = await db.media.findUnique({ where: { wpId: m.id } });
    let url = existing?.url;
    if (!url) {
      try {
        const buf = await readFile(join(MEDIA, file));
        const blob = await put(`wp/${file}`, buf, {
          access: "public",
          token: BLOB_TOKEN,
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: m.mime_type || undefined,
        });
        url = blob.url;
        await db.media.upsert({
          where: { wpId: m.id },
          create: {
            wpId: m.id, filename: file, url, originalUrl: src,
            mimeType: m.mime_type || "image/jpeg", alt: m.alt_text || null,
          },
          update: { url, originalUrl: src },
        });
      } catch (e) {
        console.warn(`  ! media ${m.id} (${file}): ${e}`);
        continue;
      }
    }
    blobByWpId.set(m.id, url!);
    blobByStem.set(stemOf(basename(new URL(src).pathname)), url!);
    if (++up % 50 === 0) process.stdout.write(`  ${up}/${media.length}\r`);
  }
  console.log(`  imágenes en Blob: ${up}                    `);

  // reescribe URLs de imágenes del WP en el HTML → Blob (por stem, cubre variantes de tamaño)
  const rewrite = (html = "") =>
    html.replace(
      /https?:\/\/(?:www\.)?lectoraium\.com\/wp-content\/uploads\/[^\s"')]+?\.(?:jpe?g|png|gif|webp)/gi,
      (url) => blobByStem.get(stemOf(basename(url))) ?? url
    );

  // ---------- 2) Autores (User + Author) ----------
  const authorByWpId = new Map<number, { userId: string; authorId: string; name: string }>();
  for (const u of users) {
    const name: string = u.name || "Autor";
    const slug: string = u.slug || `autor-${u.id}`;
    const user = await db.user.upsert({
      where: { email: `wp-${u.id}@kentukianas.local` },
      create: { email: `wp-${u.id}@kentukianas.local`, name, role: "EDITOR" },
      update: { name },
    });
    const author = await db.author.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
    authorByWpId.set(u.id, { userId: user.id, authorId: author.id, name });
  }
  const fallbackAuthor = authorByWpId.values().next().value!;

  // ---------- 3) Categorías y etiquetas ----------
  const catByWpId = new Map<number, string>();
  for (const c of categories) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      create: { name: stripHtml(c.name), slug: c.slug, description: c.description || null },
      update: { name: stripHtml(c.name) },
    });
    catByWpId.set(c.id, cat.id);
  }
  const tagByWpId = new Map<number, string>();
  for (const t of tags) {
    const tag = await db.tag.upsert({
      where: { slug: t.slug },
      create: { name: stripHtml(t.name), slug: t.slug },
      update: { name: stripHtml(t.name) },
    });
    tagByWpId.set(t.id, tag.id);
  }

  // ---------- 4) Entradas (posts → CRONICAS, pages → KENTUKIANA/PAGINA) ----------
  const articleByWpId = new Map<number, string>();

  async function importEntry(item: any, series: Series) {
    const a = authorByWpId.get(item.author) || fallbackAuthor;
    const titleText = stripHtml(item.title?.rendered);
    const data = {
      title: titleText,
      slug: item.slug,
      excerpt: item.excerpt?.rendered ? stripHtml(item.excerpt.rendered) : null,
      content: rewrite(item.content?.rendered || ""),
      coverImage: item.featured_media ? blobByWpId.get(item.featured_media) || null : null,
      series,
      order: firstInt(titleText),
      status: item.status === "publish" ? ContentStatus.PUBLISHED : ContentStatus.DRAFT,
      publishedAt: item.date_gmt ? new Date(item.date_gmt + "Z") : null,
      authorId: a.userId,
      byline: a.name,
    };
    const article = await db.article.upsert({
      where: { wpId: item.id },
      create: { ...data, wpId: item.id },
      update: data,
    });
    articleByWpId.set(item.id, article.id);

    // firma (Author)
    await db.authorsOnArticles.upsert({
      where: { articleId_authorId: { articleId: article.id, authorId: a.authorId } },
      create: { articleId: article.id, authorId: a.authorId, order: 0 },
      update: {},
    });
    // categorías
    for (const cid of item.categories || []) {
      const categoryId = catByWpId.get(cid);
      if (!categoryId) continue;
      await db.categoriesOnArticles.upsert({
        where: { articleId_categoryId: { articleId: article.id, categoryId } },
        create: { articleId: article.id, categoryId },
        update: {},
      });
    }
    // etiquetas
    for (const tid of item.tags || []) {
      const tagId = tagByWpId.get(tid);
      if (!tagId) continue;
      await db.tagsOnArticles.upsert({
        where: { articleId_tagId: { articleId: article.id, tagId } },
        create: { articleId: article.id, tagId },
        update: {},
      });
    }
  }

  console.log(`Importando ${posts.length} crónicas…`);
  for (const p of posts) await importEntry(p, Series.CRONICAS);

  console.log(`Importando ${pages.length} páginas…`);
  for (const pg of pages) {
    const t = stripHtml(pg.title?.rendered);
    const series = /kentukiana/i.test(t) ? Series.KENTUKIANA : Series.PAGINA;
    await importEntry(pg, series);
  }

  // ---------- 5) Comentarios ----------
  console.log(`Importando ${comments.length} comentarios…`);
  let cok = 0;
  for (const c of comments) {
    const articleId = articleByWpId.get(c.post);
    if (!articleId) continue;
    // Conservamos el estado de moderación del WordPress: el autor los aprobó a mano
    // cuando el sitio estaba vivo. Los comentarios NUEVOS del sitio nuevo sí pasarán
    // por moderación + anti-spam.
    const wasApproved = c.status === "approved";
    await db.comment.upsert({
      where: { wpId: c.id },
      create: {
        wpId: c.id,
        articleId,
        authorName: c.author_name || "Anónimo",
        content: stripHtml(c.content?.rendered || ""),
        approved: wasApproved,
        parentWpId: c.parent || null,
        createdAt: c.date_gmt ? new Date(c.date_gmt + "Z") : new Date(),
      },
      update: { approved: wasApproved },
    });
    cok++;
  }

  const counts = {
    articulos: await db.article.count(),
    cronicas: await db.article.count({ where: { series: Series.CRONICAS } }),
    kentukiana: await db.article.count({ where: { series: Series.KENTUKIANA } }),
    paginas: await db.article.count({ where: { series: Series.PAGINA } }),
    media: await db.media.count(),
    comentarios: await db.comment.count(),
  };
  console.log("\n✓ Importación completa:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
