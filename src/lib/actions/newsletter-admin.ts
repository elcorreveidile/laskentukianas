"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { importContacts, sendCampaign } from "@/lib/brevo";
import sanitizeHtml from "sanitize-html";

async function requireEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !(role === "ADMIN" || role === "EDITOR")) {
    throw new Error("No autorizado");
  }
  return session;
}

const LIST_ID = Number(process.env.BREVO_LIST_ID || 3);
const SITE = process.env.NEXT_PUBLIC_APP_URL || "https://laskentukianas.com";

export type ActionResult = { ok: boolean; message?: string; error?: string };

// Extrae emails únicos de un texto (pegado o CSV). No exportada: solo se usa aquí.
function extractEmails(text: string): string[] {
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const found = text.match(re) || [];
  return Array.from(new Set(found.map((e) => e.toLowerCase())));
}

export async function importContactsAction(rawText: string): Promise<ActionResult> {
  await requireEditor();
  const emails = extractEmails(rawText || "");
  if (!emails.length) {
    return { ok: false, error: "No encontré ningún email válido en el texto." };
  }
  try {
    await importContacts(LIST_ID, emails);
    return {
      ok: true,
      message: `${emails.length} email(s) enviados a la lista. Brevo los procesa en unos minutos.`,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const sendSchema = z.object({
  subject: z.string().min(3, "El asunto es muy corto."),
  intro: z.string().min(10, "El mensaje es muy corto."),
  send: z.boolean(),
});

function buildEmailHtml(intro: string): string {
  const clean = sanitizeHtml(intro, { allowedTags: [], allowedAttributes: {} });
  const parrafos = clean
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2b2b2b;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5efe6;padding:24px;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,.08);">
      <tr><td style="background:#3aa6d6;padding:22px 28px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.5px;color:#fff;font-size:20px;text-transform:uppercase;">Crónicas Kentukianas</span>
      </td></tr>
      <tr><td style="padding:28px;">
        ${parrafos}
        <p style="margin:24px 0 0;">
          <a href="${SITE}" style="display:inline-block;background:#3aa6d6;color:#fff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:700;padding:12px 22px;border-radius:999px;font-size:15px;">Visitar la nueva web →</a>
        </p>
      </td></tr>
      <tr><td style="padding:18px 28px;background:#faf7f1;border-top:1px solid rgba(0,0,0,.06);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8378;">
        Recibes este correo porque te suscribiste a las Crónicas Kentukianas.
        <br/><a href="{{ unsubscribe }}" style="color:#8a8378;">Darse de baja</a>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendAnnouncementAction(input: unknown): Promise<ActionResult> {
  await requireEditor();
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Datos no válidos." };
  }
  const { subject, intro, send } = parsed.data;
  try {
    const r = await sendCampaign({
      name: `Aviso — ${subject}`,
      subject,
      htmlContent: buildEmailHtml(intro),
      listId: LIST_ID,
      send,
    });
    return {
      ok: true,
      message: send
        ? `✅ Campaña enviada a la lista (id ${r.campaignId}).`
        : `📝 Borrador creado en Brevo (id ${r.campaignId}). Revísalo y envíalo desde el panel de Brevo.`,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
