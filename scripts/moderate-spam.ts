/**
 * Detecta y (opcionalmente) elimina comentarios spam heredados del WordPress.
 *   node/tsx scripts/moderate-spam.ts          → solo ANALIZA (no borra)
 *   node/tsx scripts/moderate-spam.ts --apply   → BORRA los detectados como spam
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Señales de spam en el NOMBRE del autor (anclas típicas de spam SEO).
const NAME_SPAM =
  /binance|referral|download(er|ing|s)?|casino|crypto|bitcoin|\bloan\b|viagra|cialis|escort|\bseo\b|\bslot\b|gacor|\bbet\b|pharm|\bporn\b|\bxxx\b|telegram|t\.me|essay|write ?my|cheap|\bbuy\b|coupon|promo|referal|\bvpn\b|\bapk\b|mod menu|hack|streaming|\bfree\b|generator|\bnude|\bsex\b|dating|pussy|deposit|slot ?gacor|judi|togel|situs/i;

// URL o dominio en el nombre → casi siempre spam.
const NAME_URL = /https?:|www\.|\.(com|net|org|ru|io|top|xyz|club|online|site|info|biz|shop|store|live|vip)\b|@/i;

// En el contenido: enlaces + jerga promocional.
const CONTENT_SPAM =
  /https?:\/\/|\[url|href=|<a\s|binance|download(er|ing)?|casino|crypto|bitcoin|viagra|cialis|escort|slot ?gacor|judi|togel|situs|telegram|t\.me|essay writ|write my (essay|paper)|cheap \w+ (for sale|online)|generator online|mod (apk|menu)/i;

// Detección SOLO por el nombre del autor (alta precisión; el contenido da falsos
// positivos con enlaces/palabras legítimas). CONTENT_SPAM queda como referencia.
void CONTENT_SPAM;
function isSpam(name: string, _content: string) {
  const n = name || "";
  return NAME_URL.test(n) || NAME_SPAM.test(n);
}

async function main() {
  const comments = await db.comment.findMany({
    select: { id: true, authorName: true, content: true },
  });

  const spam = comments.filter((c) => isSpam(c.authorName, c.content));
  const ham = comments.filter((c) => !isSpam(c.authorName, c.content));

  const byName = (list: typeof comments) => {
    const m = new Map<string, number>();
    for (const c of list) m.set(c.authorName, (m.get(c.authorName) || 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };

  console.log(`Total: ${comments.length} · SPAM detectado: ${spam.length} · Legítimos: ${ham.length}\n`);
  console.log("=== Comentarios marcados como SPAM (los borraría) ===");
  for (const c of spam) {
    console.log(`  • [${c.authorName}] ${(c.content || "").replace(/\s+/g, " ").slice(0, 90)}`);
  }
  console.log("\n=== Autores conservados (muestra, verificar que son legítimos) ===");
  for (const [name, n] of byName(ham).slice(0, 40)) console.log(`  ${n}×  ${name}`);

  if (APPLY) {
    const res = await db.comment.deleteMany({ where: { id: { in: spam.map((c) => c.id) } } });
    console.log(`\n🧹 Borrados ${res.count} comentarios spam. Quedan ${ham.length}.`);
  } else {
    console.log("\n(modo análisis: nada borrado. Ejecuta con --apply para borrar.)");
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
