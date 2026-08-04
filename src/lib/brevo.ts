// Helper server-only para la API de Brevo (antiguo Sendinblue).
// Requiere BREVO_API_KEY. El remitente de campañas usa BREVO_SENDER_EMAIL/NAME.
const BASE = "https://api.brevo.com/v3";

function apiKey(): string {
  const k = process.env.BREVO_API_KEY;
  if (!k) throw new Error("BREVO_API_KEY no está configurada.");
  return k;
}

async function brevo(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "api-key": apiKey(),
      "content-type": "application/json",
      accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data?.message || `Brevo respondió ${res.status}`);
  }
  return data;
}

export type ListStats = {
  id: number;
  name: string;
  totalSubscribers: number;
  totalBlacklisted: number;
};

export async function getListStats(listId: number): Promise<ListStats> {
  const d = await brevo(`/contacts/lists/${listId}`);
  return {
    id: d.id,
    name: d.name,
    totalSubscribers: d.totalSubscribers ?? d.uniqueSubscribers ?? 0,
    totalBlacklisted: d.totalBlacklisted ?? 0,
  };
}

/** Envía contactos a una lista (crea o actualiza). Procesa en segundo plano en Brevo. */
export async function importContacts(listId: number, emails: string[]): Promise<void> {
  if (!emails.length) return;
  await brevo(`/contacts/import`, {
    method: "POST",
    body: JSON.stringify({
      listIds: [listId],
      updateExistingContacts: true,
      emailBlacklist: false,
      smsBlacklist: false,
      jsonBody: emails.map((email) => ({ email })),
    }),
  });
}

/** Remitentes verificados en la cuenta (para poder enviar campañas). */
export async function getSenders(): Promise<{ name: string; email: string }[]> {
  const d = await brevo(`/senders`);
  return (d.senders || []).map((s: any) => ({ name: s.name, email: s.email }));
}

/**
 * Crea una campaña de email en Brevo dirigida a una lista.
 * Si `send` es true la envía ya; si no, queda como borrador para revisar en Brevo.
 */
export async function sendCampaign(opts: {
  name: string;
  subject: string;
  htmlContent: string;
  listId: number;
  send: boolean;
}): Promise<{ campaignId: number; sent: boolean }> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Crónicas Kentukianas";
  if (!senderEmail) {
    throw new Error(
      "Falta BREVO_SENDER_EMAIL (un remitente verificado en Brevo). Configúralo para poder enviar."
    );
  }
  const camp = await brevo(`/emailCampaigns`, {
    method: "POST",
    body: JSON.stringify({
      name: opts.name.slice(0, 120),
      subject: opts.subject,
      sender: { name: senderName, email: senderEmail },
      htmlContent: opts.htmlContent,
      recipients: { listIds: [opts.listId] },
    }),
  });
  const campaignId = camp.id as number;
  if (opts.send) {
    await brevo(`/emailCampaigns/${campaignId}/sendNow`, { method: "POST" });
  }
  return { campaignId, sent: opts.send };
}

/** Email transaccional puntual (1 destinatario) vía Brevo SMTP API. */
export async function sendTransactionalEmail(opts: {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}): Promise<void> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Crónicas Kentukianas";
  if (!senderEmail) throw new Error("Falta BREVO_SENDER_EMAIL (remitente verificado en Brevo).");
  await brevo(`/smtp/email`, {
    method: "POST",
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: opts.to, name: opts.toName || undefined }],
      subject: opts.subject,
      htmlContent: opts.htmlContent,
    }),
  });
}
