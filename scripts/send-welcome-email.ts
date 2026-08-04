/**
 * Envía email de bienvenida a todos los suscriptores de Brevo.
 * Incluye diseño corporativo con logo, colores y enlace a la nueva web.
 *
 * Uso: npx tsx scripts/send-welcome-email.ts [--preview] [--send]
 *
 * --preview  : Muestra el email sin enviar (default)
 * --send     : Envía realmente a Brevo
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { sendCampaign } from "../src/lib/brevo";

// Cargar .env.local explícitamente
config({ path: resolve(__dirname, "../.env.local") });

const LIST_ID = Number(process.env.BREVO_LIST_ID || 3);
const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://laskentukianas.com";
const MODE = process.argv.includes("--send") ? "SEND" : "PREVIEW";

// Logo SVG como data URL para embed
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48">
  <rect width="64" height="64" rx="14" fill="#3aa6d6"/>
  <g stroke="#ffffff" stroke-width="6" stroke-linecap="round">
    <line x1="16" y1="50" x2="48" y2="18"/>
    <line x1="48" y1="50" x2="16" y2="18"/>
  </g>
  <circle cx="48" cy="18" r="5.5" fill="#ffffff"/>
  <circle cx="16" cy="18" r="5.5" fill="#ffffff"/>
</svg>`;

function buildWelcomeEmail(): string {
  return `<!doctype html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bienvenido a las Crónicas Kentukianas</title>
  <style>
    a { color: #3aa6d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5efe6;font-family:Georgia,'Times New Roman',serif;">
  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#f5efe6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Nueva web, nuevas aventuras. Las Crónicas Kentukianas renacen.
  </div>

  <!-- Main Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5efe6;padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Email Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);max-width:100%;">

          <!-- Header with Logo -->
          <tr>
            <td style="background:linear-gradient(135deg,#3aa6d6 0%,#2c8cb5 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <div style="width:64px;height:64px;margin:0 auto 16px;background-color:#ffffff;border-radius:12px;padding:8px;">
                      ${LOGO_SVG}
                    </div>
                    <!-- Title -->
                    <h1 style="margin:0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;letter-spacing:1px;text-transform:center;">
                      CRÓNICAS KENTUKIANAS
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:48px 40px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 24px;color:#2c3e50;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;">
                ¡Hola de nuevo!
              </h2>

              <!-- Main Message -->
              <p style="margin:0 0 20px;color:#2c3e50;font-size:17px;line-height:1.7;">
                Si lees este email, es porque alguna vez dejaste un comentario en <strong>lectoraium.com</strong>. Buenas noticias: las Crónicas Kentukianas han vuelto.
              </p>

              <p style="margin:0 0 20px;color:#2c3e50;font-size:17px;line-height:1.7;">
                Hemos migrado todo el contenido a una nueva web moderna: las crónicas del aula, las Kentukianas, el mapa del viaje, los vídeos… todo está en <strong style="color:#3aa6d6;">laskentukianas.com</strong>.
              </p>

              <p style="margin:0 0 32px;color:#2c3e50;font-size:17px;line-height:1.7;">
                Ya no tienes que hacer nada —simplemente queríamos avisarte de que seguimos escribiendo. Si quieres volver a leer, el enlace está abajo:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <a href="${SITE}" style="display:inline-block;background:linear-gradient(135deg,#3aa6d6 0%,#2c8cb5 100%);color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:16px;padding:16px 32px;border-radius:999px;box-shadow:0 4px 12px rgba(58,166,214,0.3);">
                      Visitar la nueva web →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Additional Info -->
              <p style="margin:32px 0 16px;color:#7f8c8d;font-size:15px;line-height:1.6;">
                <em>Por cierto, si no quieres seguir recibiendo estos emails, puedes darte de baja abajo del todo. Sin reproches 😉.</em>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf7f1;padding:24px 40px;border-top:1px solid rgba(0,0,0,0.06);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 8px;color:#8a8378;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
                      <strong>Crónicas Kentukianas</strong> — Aventuras de un profesor en Kentuky
                    </p>
                    <p style="margin:0;color:#8a8378;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">
                      Recibes este correo porque te suscribiste en lectoraium.com.<br/>
                      <a href="{{ unsubscribe }}" style="color:#8a8378;">Darse de baja</a> ·
                      <a href="${SITE}" style="color:#8a8378;">Visitar web</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Email Container -->

      </td>
    </tr>
  </table>
  <!-- End Main Container -->
</body>
</html>`;
}

async function main() {
  console.log("🎨 Generando email de bienvenida corporativo...\n");

  const htmlContent = buildWelcomeEmail();

  if (MODE === "PREVIEW") {
    console.log("📧 PREVIEW MODE (no se envía nada)\n");
    console.log("════════════════════════════════════════════════════════════════");
    console.log(htmlContent);
    console.log("════════════════════════════════════════════════════════════════");
    console.log("\n💡 Para enviar realmente, ejecuta: npx tsx scripts/send-welcome-email.ts --send");
    return;
  }

  if (MODE === "SEND") {
    console.log("🚧 SEND MODE - Enviando a Brevo...");
    console.log("📋 Lista:", LIST_ID);
    console.log("🌐 Sitio:", SITE);
    console.log("");

    try {
      const result = await sendCampaign({
        name: "Bienvenida - Nueva web Kentukianas",
        subject: "Las Crónicas Kentukianas han vuelto 🎉",
        htmlContent,
        listId: LIST_ID,
        send: true,
      });

      console.log("✅ Email enviado a Brevo:");
      console.log(`   Campaign ID: ${result.campaignId}`);
      console.log(`   Estado: ${result.sent ? "ENVIADO" : "BORRADOR"}`);
      console.log("");
      console.log("📊 Revisa el resultado en: https://app.brevo.com/campaigns");

    } catch (error) {
      console.error("❌ Error enviando:", error);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
