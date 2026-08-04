/**
 * Lista los remitentes verificados en Brevo para poder usar uno válido.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { getSenders } from "../src/lib/brevo";

config({ path: resolve(__dirname, "../.env.local") });

async function main() {
  console.log("📧 Consultando remitentes verificados en Brevo...\n");

  try {
    const senders = await getSenders();

    console.log(`✅ ${senders.length} remitente(s) encontrado(s):\n`);

    if (senders.length === 0) {
      console.log("❌ No hay remitentes verificados.");
      console.log("\n📝 Tienes que:");
      console.log("   1. Entrar en https://app.brevo.com/advanced/senders");
      console.log("   2. Crear/verificar un remitente nuevo");
      console.log("   3. Usar ese email en BREVO_SENDER_EMAIL");
      return;
    }

    senders.forEach((s, i) => {
      console.log(`${i + 1}. ${s.name} <${s.email}>`);
    });

    console.log("\n💡 Para usar uno de estos, actualiza .env.local:");
    console.log("   BREVO_SENDER_EMAIL=tu_email_verificado@dominio.com");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
