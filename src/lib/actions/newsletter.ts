"use server";

import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email no válido"),
  website: z.string().optional(), // honeypot
});

export type SubResult = { ok: boolean; message?: string; error?: string };

/**
 * Suscribe un email a la lista de Brevo (antiguo Sendinblue).
 * Requiere en el entorno: BREVO_API_KEY y BREVO_LIST_ID.
 */
export async function subscribeNewsletter(input: unknown): Promise<SubResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Revisa el email." };
  }
  const { email, website } = parsed.data;

  // Honeypot: si un bot rellena el campo oculto, fingimos éxito.
  if (website && website.trim() !== "") {
    return { ok: true, message: "¡Gracias por suscribirte!" };
  }

  const key = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!key || !listId) {
    return { ok: false, error: "La newsletter aún no está configurada." };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true, // si ya existe, lo añade a la lista sin error
      }),
    });

    if (res.ok) {
      return { ok: true, message: "¡Gracias! Ya estás en la lista. Nos vemos en tu bandeja." };
    }

    const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    if (data?.code === "duplicate_parameter") {
      return { ok: true, message: "Ya estabas suscrito. ¡Gracias por seguir ahí!" };
    }
    console.error("Brevo error:", res.status, data);
    return { ok: false, error: "No se pudo completar la suscripción. Inténtalo más tarde." };
  } catch (e) {
    console.error("Brevo fetch error:", e);
    return { ok: false, error: "No se pudo conectar con el servicio. Inténtalo más tarde." };
  }
}
