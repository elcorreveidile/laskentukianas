import { sendTransactionalEmail } from "@/lib/brevo";

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plantilla HTML de marca (tablas + estilos inline para clientes de correo). */
function renderAuthEmail(opts: {
  heading: string;
  paragraphs: string[];
  button: { label: string; url: string };
}): string {
  const body = opts.paragraphs
    .map(
      (p) =>
        `<p style="font-size:15px;line-height:1.6;color:#333;margin:0 0 14px;">${p}</p>`
    )
    .join("");
  return `<div style="background:#f5efe6;padding:24px 12px;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #ececec;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#3aa6d6;padding:22px 28px;">
      <span style="font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.5px;color:#fff;font-size:20px;text-transform:uppercase;">Crónicas Kentukianas</span>
    </td></tr>
    <tr><td style="padding:26px 28px 8px;">
      <h1 style="font-size:20px;color:#141414;margin:0 0 14px;font-weight:800;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(opts.heading)}</h1>
      ${body}
      <div style="margin:8px 0 20px;">
        <a href="${opts.button.url}" style="background:#3aa6d6;color:#fff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:15px;padding:12px 24px;border-radius:999px;display:inline-block;">${escapeHtml(opts.button.label)}</a>
      </div>
      <p style="font-size:12px;line-height:1.5;color:#9a9a9a;margin:0;">Si el botón no funciona, copia y pega esta dirección en tu navegador:<br/>${escapeHtml(opts.button.url)}</p>
    </td></tr>
    <tr><td style="padding:16px 28px 24px;border-top:1px solid #f0f0f0;">
      <p style="font-size:12px;line-height:1.5;color:#9a9a9a;margin:0;">Correo automático de Crónicas Kentukianas. Si no lo has solicitado, puedes ignorarlo.</p>
    </td></tr>
  </table>
</div>`;
}

/** En local, si no hay API key de Brevo, se registra el enlace en consola. */
function devFallback(kind: string, url: string): boolean {
  if (!process.env.BREVO_API_KEY) {
    console.info(`[auth-email:${kind}] (sin BREVO_API_KEY) enlace →`, url);
    return true;
  }
  return false;
}

export async function sendMagicLinkEmail(to: string, name: string, url: string): Promise<void> {
  if (devFallback("magic-link", url)) return;
  await sendTransactionalEmail({
    to,
    toName: name,
    subject: "Tu enlace de acceso a Crónicas Kentukianas",
    htmlContent: renderAuthEmail({
      heading: `Hola${name ? `, ${escapeHtml(name)}` : ""} 👋`,
      paragraphs: [
        "Pulsa el botón para entrar en tu cuenta. El enlace caduca en 1 hora y solo puede usarse una vez.",
      ],
      button: { label: "Entrar", url },
    }),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, url: string): Promise<void> {
  if (devFallback("reset", url)) return;
  await sendTransactionalEmail({
    to,
    toName: name,
    subject: "Restablecer tu contraseña · Crónicas Kentukianas",
    htmlContent: renderAuthEmail({
      heading: "Restablecer contraseña",
      paragraphs: [
        "Has pedido cambiar tu contraseña. Pulsa el botón para elegir una nueva. El enlace caduca en 1 hora.",
        "Si no has sido tú, ignora este correo: tu contraseña seguirá igual.",
      ],
      button: { label: "Elegir nueva contraseña", url },
    }),
  });
}
