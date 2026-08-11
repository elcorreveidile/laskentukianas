"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PREGUNTAS, type Pregunta } from "@/lib/reto-preguntas";

const RONDA = 10;

function barajar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Barajada = { p: Pregunta; orden: number[] };

function nuevaRonda(): Barajada[] {
  return barajar(PREGUNTAS)
    .slice(0, RONDA)
    .map((p) => ({ p, orden: barajar(p.options.map((_, i) => i)) }));
}

function veredicto(aciertos: number): { emoji: string; titulo: string; sub: string } {
  const pct = aciertos / RONDA;
  if (pct >= 0.9) return { emoji: "🎓🥁", titulo: "¡Kentukiano de pura cepa!", sub: "Jorge estaría orgulloso. ¿Seguro que no eres tú?" };
  if (pct >= 0.7) return { emoji: "🔥", titulo: "¡Muy bien! Casi profe.", sub: "Te falta poquísimo para el sobresaliente." };
  if (pct >= 0.4) return { emoji: "🙂", titulo: "Aprobado justo.", sub: "Un repaso a las crónicas y lo bordas." };
  return { emoji: "😅", titulo: "Uf… vuelve a clase.", sub: "¿Seguro que has leído las crónicas?" };
}

export default function QuizReto() {
  const t = useTranslations("reto");
  const [ronda, setRonda] = useState<Barajada[] | null>(null);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fin, setFin] = useState(false);

  useEffect(() => {
    setRonda(nuevaRonda());
  }, []);

  if (!ronda) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-card">
        <p className="animate-pulse font-serif text-tinta/50">{t("shuffling")}</p>
      </div>
    );
  }

  const actual = ronda[i];
  const correcta = actual.p.answer;

  function elegir(optIdx: number) {
    if (elegida !== null) return;
    setElegida(optIdx);
    if (optIdx === correcta) setAciertos((n) => n + 1);
  }

  function siguiente() {
    if (!ronda || i + 1 >= ronda.length) {
      setFin(true);
      return;
    }
    setI((n) => n + 1);
    setElegida(null);
  }

  function reiniciar() {
    setRonda(nuevaRonda());
    setI(0);
    setElegida(null);
    setAciertos(0);
    setFin(false);
  }

  if (fin) {
    const v = veredicto(aciertos);
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-card">
        <div className="text-5xl">{v.emoji}</div>
        <p className="mt-3 font-display text-5xl uppercase text-kentuki-dark">
          {aciertos}/{RONDA}
        </p>
        <h2 className="mt-2 font-display text-2xl uppercase text-tinta">{v.titulo}</h2>
        <p className="mt-1 font-serif text-tinta/70">{v.sub}</p>
        <button
          onClick={reiniciar}
          className="mt-6 rounded-full bg-kentuki px-6 py-3 font-body font-semibold text-white transition hover:bg-kentuki-dark"
        >
          {t("playAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-card sm:p-8">
      <div className="mb-5 flex items-center justify-between font-body text-sm text-tinta/60">
        <span className="rounded-full bg-kentuki/10 px-3 py-1 font-semibold text-kentuki-dark">
          {actual.p.cat}
        </span>
        <span>
          {t("progress", { current: i + 1, total: ronda.length, score: aciertos })}
        </span>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-kentuki transition-all"
          style={{ width: `${(i / ronda.length) * 100}%` }}
        />
      </div>

      <h2 className="font-display text-2xl leading-tight text-tinta sm:text-3xl">{actual.p.q}</h2>

      <div className="mt-6 grid gap-3">
        {actual.orden.map((optIdx) => {
          const esCorrecta = optIdx === correcta;
          const esElegida = optIdx === elegida;
          let cls = "border-black/10 bg-white hover:border-kentuki hover:bg-kentuki/5";
          if (elegida !== null) {
            if (esCorrecta) cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (esElegida) cls = "border-red-400 bg-red-50 text-red-900";
            else cls = "border-black/10 bg-white opacity-60";
          }
          return (
            <button
              key={optIdx}
              onClick={() => elegir(optIdx)}
              disabled={elegida !== null}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-body transition ${cls}`}
            >
              <span className="font-semibold">{actual.p.options[optIdx]}</span>
              {elegida !== null && esCorrecta && <span className="ml-auto">✓</span>}
              {elegida !== null && esElegida && !esCorrecta && <span className="ml-auto">✗</span>}
            </button>
          );
        })}
      </div>

      {elegida !== null && (
        <div className="mt-5">
          {actual.p.explain && (
            <p className="rounded-lg bg-crema px-4 py-3 font-serif text-tinta/80">
              💡 {actual.p.explain}
            </p>
          )}
          <button
            onClick={siguiente}
            className="mt-4 w-full rounded-full bg-kentuki px-6 py-3 font-body font-semibold text-white transition hover:bg-kentuki-dark sm:w-auto"
          >
            {i + 1 >= ronda.length ? t("result") : t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
