/**
 * Re-decodifica y normaliza el texto de los comentarios ya importados
 * (entidades HTML tipo &#8216; y comillas tipográficas), preservando saltos de línea.
 *   npx tsx scripts/clean-comments.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const normalize = (s: string) =>
  s.replace(/[‘’‚‛]/g, "'").replace(/[“”„]/g, '"').replace(/–/g, "-");

const clean = (s: string) => normalize(decode(s)).trim();

async function main() {
  const comments = await db.comment.findMany({ select: { id: true, content: true } });
  let changed = 0;
  for (const c of comments) {
    const next = clean(c.content);
    if (next !== c.content) {
      await db.comment.update({ where: { id: c.id }, data: { content: next } });
      changed++;
    }
  }
  console.log(`Comentarios revisados: ${comments.length} · actualizados: ${changed}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
