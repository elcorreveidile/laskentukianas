"use client";

import { useState, useTransition } from "react";
import { importContactsAction, type ActionResult } from "@/lib/actions/newsletter-admin";

export function ImportContacts() {
  const [text, setText] = useState("");
  const [res, setRes] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const count = (text.match(/@/g) || []).length;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.readAsText(f);
  }

  function submit() {
    setRes(null);
    start(async () => setRes(await importContactsAction(text)));
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-card">
      <h2 className="font-display text-xl uppercase text-tinta">Importar contactos</h2>
      <p className="mt-1 text-sm text-tinta/60">
        Pega los correos (uno por línea o separados por comas) o sube un CSV. Se añaden a la
        lista y no se duplican.
      </p>

      <div className="mt-4">
        <input
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          onChange={onFile}
          className="block w-full text-sm text-tinta/70 file:mr-3 file:rounded-full file:border-0 file:bg-kentuki/10 file:px-4 file:py-2 file:font-body file:text-kentuki-dark hover:file:bg-kentuki/20"
        />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="ana@ejemplo.com&#10;luis@ejemplo.com&#10;…"
        className="mt-3 w-full rounded-lg border border-black/15 p-3 font-mono text-sm focus:border-kentuki focus:outline-none"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={pending || count === 0}
          className="rounded-full bg-kentuki px-5 py-2.5 font-body font-semibold text-white transition hover:bg-kentuki-dark disabled:opacity-40"
        >
          {pending ? "Importando…" : `Importar ${count || ""} contacto(s)`}
        </button>
        <span className="text-sm text-tinta/50">{count} email(s) detectados</span>
      </div>

      {res && (
        <p className={`mt-3 text-sm ${res.ok ? "text-emerald-700" : "text-red-600"}`}>
          {res.ok ? res.message : res.error}
        </p>
      )}
    </div>
  );
}
