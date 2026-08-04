/**
 * Limpia el CSV descargado de WordPress eliminando comentarios spam.
 * Genera un CSV limpio solo con emails legítimos para importar a la newsletter.
 *
 * Uso: npx tsx scripts/clean-csv-contacts.ts
 *
 * Entrada: /Users/javierbenitez/Downloads/ibx_comments.csv
 * Salida: /Users/javierbenitez/Downloads/ibx_comments_clean.csv
 */
import { readFile, writeFile } from "node:fs/promises";

const INPUT_CSV = "/Users/javierbenitez/Downloads/ibx_comments.csv";
const OUTPUT_CSV = "/Users/javierbenitez/Downloads/ibx_comments_clean.csv";

// Mismos filtros anti-spam que moderate-spam.ts
const NAME_SPAM =
  /binance|referral|download(er|ing|s)?|casino|crypto|bitcoin|\bloan\b|viagra|cialis|escort|\bseo\b|\bslot\b|gacor|\bbet\b|pharm|\bporn\b|\bxxx\b|telegram|t\.me|essay|write ?my|cheap|\bbuy\b|coupon|promo|referal|\bvpn\b|\bapk\b|mod menu|hack|streaming|\bfree\b|generator|\bnude|\bsex\b|dating|pussy|deposit|slot ?gacor|judi|togel|situs/i;

const NAME_URL = /https?:|www\.|\.(com|net|org|ru|io|top|xyz|club|online|site|info|biz|shop|store|live|vip)\b|@/i;

function isSpam(name: string): boolean {
  const n = name || "";
  return NAME_URL.test(n) || NAME_SPAM.test(n);
}

interface CommentRow {
  comment_author_email: string;
  comment_author: string;
  comment_date: string;
  comment_approved: string;
}

async function main() {
  console.log(`📖 Leyendo ${INPUT_CSV}…`);
  const content = await readFile(INPUT_CSV, "utf-8");

  const lines = content.split("\n").filter(Boolean);
  const header = lines[0];
  const rows = lines.slice(1);

  const comments: CommentRow[] = [];
  for (const line of rows) {
    const parts = line.split('","');
    if (parts.length >= 4) {
      comments.push({
        comment_author_email: parts[0].replace(/^"/, ""),
        comment_author: parts[1].replace(/"$/, ""),
        comment_date: parts[2],
        comment_approved: parts[3]?.replace(/"$/, "") || "",
      });
    }
  }

  console.log(`📊 Total comentarios: ${comments.length}`);

  // Filtrar spam
  const spam: CommentRow[] = [];
  const ham: CommentRow[] = [];
  const uniqueEmails = new Set<string>();

  for (const c of comments) {
    if (isSpam(c.comment_author)) {
      spam.push(c);
    } else {
      ham.push(c);
      uniqueEmails.add(c.comment_author_email);
    }
  }

  console.log(`🚫 Spam detectado: ${spam.length} comentarios`);
  console.log(`✅ Legítimos: ${ham.length} comentarios`);
  console.log(`📧 Emails únicos legítimos: ${uniqueEmails.size}`);

  // Mostrar ejemplos de spam eliminado
  console.log("\n=== Ejemplos de SPAM eliminados ===");
  const spamExamples = spam.slice(0, 15);
  for (const s of spamExamples) {
    console.log(`  🗑️  [${s.comment_author}] ${s.comment_author_email}`);
  }
  if (spam.length > 15) {
    console.log(`  … y ${spam.length - 15} más`);
  }

  // Mostrar ejemplos de legítimos conservados
  console.log("\n=== Ejemplos de legítimos conservados ===");
  const hamExamples = ham.slice(0, 15);
  for (const h of hamExamples) {
    console.log(`  ✅ [${h.comment_author}] ${h.comment_author_email}`);
  }
  if (ham.length > 15) {
    console.log(`  … y ${ham.length - 15} más`);
  }

  // Generar CSV limpio (solo emails únicos)
  const cleanLines = ["email"];
  for (const email of uniqueEmails) {
    cleanLines.push(email);
  }

  await writeFile(OUTPUT_CSV, cleanLines.join("\n"), "utf-8");
  console.log(`\n✨ CSV limpio guardado en: ${OUTPUT_CSV}`);
  console.log(`📧 ${uniqueEmails.size} emails listos para importar a la newsletter`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
