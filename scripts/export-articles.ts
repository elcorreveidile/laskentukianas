/**
 * Exporta los artículos publicados (series CRONICAS + KENTUKIANA) a
 * i18n-work/source/<id>.json para alimentar el pipeline de traducción.
 * Solo lectura de la BD.
 *
 * Requiere DATABASE_URL en .env.local.
 * Uso: npm run export:articles   (o: npx tsx scripts/export-articles.ts)
 */
import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const db = new PrismaClient();
const OUT_DIR = join(__dirname, "..", "i18n-work", "source");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const articles = await db.article.findMany({
    where: { status: "PUBLISHED", series: { in: ["CRONICAS", "KENTUKIANA"] } },
    orderBy: [{ series: "asc" }, { order: "asc" }],
    select: {
      id: true,
      series: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  let cronicas = 0;
  let kentukiana = 0;
  for (const a of articles) {
    await writeFile(join(OUT_DIR, `${a.id}.json`), JSON.stringify(a, null, 2), "utf8");
    if (a.series === "CRONICAS") cronicas++;
    else kentukiana++;
  }

  console.log(`Exportados ${articles.length} artículos → ${OUT_DIR}`);
  console.log(`  CRONICAS: ${cronicas} · KENTUKIANA: ${kentukiana}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
