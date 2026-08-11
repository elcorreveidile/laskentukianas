/**
 * Importa las traducciones inglesas de i18n-work/out/<id>.json a la tabla
 * ArticleTranslation. Genera el slug inglés (slugify del título traducido, con
 * unicidad) y guarda un hash del contenido fuente para detectar obsolescencia.
 *
 * Requiere DATABASE_URL en .env.local.
 * Uso: npx tsx scripts/import-translations.ts --apply   (sin --apply = dry-run)
 */
import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const db = new PrismaClient();
const SRC_DIR = join(__dirname, "..", "i18n-work", "source");
const OUT_DIR = join(__dirname, "..", "i18n-work", "out");
const APPLY = process.argv.includes("--apply");
const LOCALE = "en";

// Mismo slugify que src/lib/actions/articles.ts.
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Garantiza unicidad de (locale, slug) sin chocar con otros artículos.
async function uniqueSlug(base: string, articleId: string) {
  const root = base || articleId;
  let candidate = root;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await db.articleTranslation.findFirst({
      where: { locale: LOCALE, slug: candidate, NOT: { articleId } },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${root}-${i++}`;
  }
}

async function main() {
  let files: string[];
  try {
    files = (await readdir(OUT_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    console.error(`No existe ${OUT_DIR}. ¿Has ejecutado ya la traducción?`);
    process.exit(1);
  }

  console.log(`${files.length} traducciones en ${OUT_DIR}. Modo: ${APPLY ? "APLICAR" : "dry-run"}`);
  let ok = 0;
  let skip = 0;

  for (const f of files) {
    const id = f.replace(/\.json$/, "");
    const out = JSON.parse(await readFile(join(OUT_DIR, f), "utf8"));

    let source: { title?: string; content?: string } | null = null;
    try {
      source = JSON.parse(await readFile(join(SRC_DIR, f), "utf8"));
    } catch {
      source = null;
    }

    const article = await db.article.findUnique({ where: { id }, select: { id: true } });
    if (!article) {
      console.warn(`  ⚠ ${id}: artículo no encontrado, saltando`);
      skip++;
      continue;
    }

    const title = String(out.title ?? "").trim();
    const content = String(out.content ?? "");
    if (!title || !content) {
      console.warn(`  ⚠ ${id}: traducción incompleta (falta título o contenido), saltando`);
      skip++;
      continue;
    }

    const slug = await uniqueSlug(slugify(title), id);
    const sourceHash = source
      ? createHash("sha256").update(`${source.title ?? ""}\n${source.content ?? ""}`).digest("hex")
      : null;

    console.log(`  ${APPLY ? "✔" : "·"} ${id} → /en/${slug}  «${title.slice(0, 60)}»`);

    if (APPLY) {
      const data = {
        title,
        slug,
        excerpt: (out.excerpt ?? null) as string | null,
        content,
        metaTitle: (out.metaTitle ?? null) as string | null,
        metaDescription: (out.metaDescription ?? null) as string | null,
        sourceHash,
      };
      await db.articleTranslation.upsert({
        where: { articleId_locale: { articleId: id, locale: LOCALE } },
        create: { articleId: id, locale: LOCALE, ...data },
        update: data,
      });
    }
    ok++;
  }

  console.log(`\n${APPLY ? "Aplicadas" : "Previstas"}: ${ok} · Saltadas: ${skip}`);
  if (!APPLY) console.log("Dry-run. Añade --apply para escribir en la BD.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
