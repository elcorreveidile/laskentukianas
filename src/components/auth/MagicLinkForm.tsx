"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";
type Challenge = { a: number; b: number; token: string };

/**
 * Pide un enlace mágico (nombre + email) con verificación humana (operación
 * matemática firmada + honeypot), revalidada en el servidor. No revela si el
 * email existe.
 */
export function MagicLinkForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");

  async function loadChallenge() {
    try {
      const res = await fetch("/api/auth/challenge", { cache: "no-store" });
      setChallenge(await res.json());
      setAnswer("");
    } catch {
      /* se reintenta al enviar */
    }
  }
  useEffect(() => {
    loadChallenge();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challenge) return;
    setStatus("sending");
    setMessage(null);

    const fd = new FormData(e.currentTarget);
    fd.set("answer", answer);
    fd.set("challenge", challenge.token);

    try {
      const res = await fetch("/api/auth/magic-link", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("sent");
        return;
      }
      setStatus("error");
      if (data?.error === "challenge") {
        setMessage("La operación no es correcta. Prueba con la nueva.");
        loadChallenge();
      } else {
        setMessage(typeof data?.error === "string" ? data.error : "No se pudo enviar el enlace.");
      }
    } catch {
      setStatus("error");
      setMessage("No se pudo enviar el enlace. Inténtalo de nuevo.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-lg border border-kentuki/40 bg-kentuki/5 p-4 text-center text-sm">
        <p className="font-bold text-tinta">Revisa tu correo 📬</p>
        <p className="mt-1 text-tinta/70">
          Si los datos son correctos, te hemos enviado un enlace para entrar. Caduca en 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot (oculto a humanos) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <input
        name="name"
        type="text"
        required
        minLength={2}
        placeholder="Tu nombre"
        className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="tu@email.com"
        className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm"
      />
      <div className="flex items-center gap-2">
        <label className="text-sm text-tinta/70">
          ¿Cuánto es <strong>{challenge ? `${challenge.a} + ${challenge.b}` : "…"}</strong>?
        </label>
        <input
          type="number"
          required
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-20 rounded-lg border border-black/15 px-3 py-2 text-sm"
          aria-label="Resultado de la operación"
        />
      </div>

      {status === "error" && message && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !challenge}
        className="w-full rounded-lg border border-kentuki bg-white px-4 py-3 font-body font-semibold text-kentuki-dark transition hover:bg-kentuki/5 disabled:opacity-50"
      >
        {status === "sending" ? "Enviando…" : "Enviarme un enlace de acceso"}
      </button>
    </form>
  );
}
