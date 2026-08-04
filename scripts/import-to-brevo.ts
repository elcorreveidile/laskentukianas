/**
 * Importa los emails del CSV limpio directamente a Brevo (Newsletter).
 * Uso: npx tsx scripts/import-to-brevo.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { importContacts, getListStats } from "../src/lib/brevo";

// Cargar .env.local explícitamente
config({ path: resolve(__dirname, "../.env.local") });

const CLEAN_CSV = "/Users/javierbenitez/Downloads/ibx_comments_clean.csv";
const LIST_ID = Number(process.env.BREVO_LIST_ID || 3);

async function main() {
  console.log("📖 Leyendo CSV limpio…");
  const content = await readFile(CLEAN_CSV, "utf-8");

  // Extraer emails (saltar header)
  const lines = content.split("\n").filter(Boolean);
  const emails = lines.slice(1).map(e => e.trim()).filter(e => e.includes("@"));

  console.log(`📧 ${emails.length} emails encontrados`);

  if (emails.length === 0) {
    console.log("❌ No hay emails para importar");
    return;
  }

  // Mostrar muestra
  console.log("\n📋 Muestra de emails a importar:");
  emails.slice(0, 5).forEach(e => console.log(`  • ${e}`));
  if (emails.length > 5) console.log(`  … y ${emails.length - 5} más`);

  try {
    console.log("\n🚀 Enviando a Brevo...");
    await importContacts(LIST_ID, emails);
    console.log(`✅ ${emails.length} emails enviados a lista ${LIST_ID}`);

    console.log("\n⏳ Brevo procesa la importación en segundo plano (puede tardar unos minutos)");

    // Ver stats después
    setTimeout(async () => {
      try {
        const stats = await getListStats(LIST_ID);
        console.log(`\n📊 Estado actual de la lista:`, stats);
      } catch (e) {
        console.log("ℹ️  Los stats estarán disponibles cuando Brevo termine de procesar");
      }
    }, 3000);

  } catch (error) {
    console.error("❌ Error importando a Brevo:", error);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
