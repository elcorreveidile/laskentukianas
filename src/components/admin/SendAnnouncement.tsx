"use client";

import { useState, useTransition } from "react";
import { sendAnnouncementAction, type ActionResult } from "@/lib/actions/newsletter-admin";

const DEFAULT_SUBJECT = "Las Crónicas Kentukianas se han mudado 🎸";
const DEFAULT_INTRO = `¡Hola!

Las «Crónicas Kentukianas» tienen nueva casa. He reconstruido el blog desde cero, más rápido y bonito, con todas las crónicas de siempre y algún extra: el mapa del viaje, El Garito (mi música) y hasta un pequeño reto.

Pásate cuando quieras y, si te apetece, deja un comentario. ¡Gracias por seguir ahí!

Jorge`;

export function SendAnnouncement() {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [intro, setIntro] = useState(DEFAULT_INTRO);
  const [res, setRes] = useState<ActionResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  function run(send: boolean) {
    setRes(null);
    setConfirming(false);
    start(async () => setRes(await sendAnnouncementAction({ subject, intro, send })));
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-card">
      <h2 className="font-display text-xl uppercase text-tinta">Enviar aviso a la lista</h2>
      <p className="mt-1 text-sm text-tinta/60">
        Crea la campaña en Brevo (con diseño de marca y baja automática) y la envía a toda la lista.
      </p>

      <label className="mt-4 block text-sm font-semibold text-tinta">Asunto</label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mt-1 w-full rounded-lg border border-black/15 p-2.5 text-sm focus:border-kentuki focus:outline-none"
      />

      <label className="mt-4 block text-sm font-semibold text-tinta">Mensaje</label>
      <textarea
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        rows={10}
        className="mt-1 w-full rounded-lg border border-black/15 p-3 font-serif text-sm leading-relaxed focus:border-kentuki focus:outline-none"
      />
      <p className="mt-1 text-xs text-tinta/50">
        Se envía con la cabecera de marca y un botón a la web. Deja líneas en blanco para separar párrafos.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            disabled={pending}
            className="rounded-full bg-kentuki px-5 py-2.5 font-body font-semibold text-white transition hover:bg-kentuki-dark disabled:opacity-40"
          >
            Enviar a toda la lista…
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5">
            <span className="text-sm text-red-700">¿Enviar ya a todos?</span>
            <button
              onClick={() => run(true)}
              disabled={pending}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Sí, enviar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-full px-3 py-1.5 text-sm text-tinta/60 hover:text-tinta"
            >
              Cancelar
            </button>
          </span>
        )}
      </div>

      {res && (
        <p className={`mt-3 text-sm ${res.ok ? "text-emerald-700" : "text-red-600"}`}>
          {res.ok ? res.message : res.error}
        </p>
      )}
    </div>
  );
}
