"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Easter egg: la batería de Jorge. Se abre con el código Konami
 * (↑ ↑ ↓ ↓ ← → ← → B A) o tecleando "rock". Se toca con el teclado o el ratón.
 * Sonidos sintetizados con Web Audio (sin archivos).
 */

type Piece = "kick" | "snare" | "hihat" | "openhat" | "tom" | "tom2" | "crash";

const PADS: { piece: Piece; key: string; label: string; span?: boolean }[] = [
  { piece: "crash", key: "q", label: "Crash" },
  { piece: "hihat", key: "w", label: "Hi-hat" },
  { piece: "openhat", key: "e", label: "Open hat" },
  { piece: "tom", key: "a", label: "Tom" },
  { piece: "tom2", key: "s", label: "Tom 2" },
  { piece: "snare", key: "d", label: "Caja" },
  { piece: "kick", key: " ", label: "Bombo (espacio)", span: true },
];

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

export default function DrumEasterEgg() {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<Piece | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const konami = useRef<string[]>([]);
  const typed = useRef<string>("");

  const ac = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  };

  const noiseBuffer = useRef<AudioBuffer | null>(null);
  const getNoise = (ctx: AudioContext) => {
    if (!noiseBuffer.current) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseBuffer.current = buf;
    }
    return noiseBuffer.current;
  };

  const hit = (piece: Piece) => {
    const ctx = ac();
    const t = ctx.currentTime;
    const out = ctx.destination;

    const env = (g: GainNode, peak: number, dur: number) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    };
    const noise = (dur: number, hp: number, peak: number) => {
      const src = ctx.createBufferSource();
      src.buffer = getNoise(ctx);
      const filt = ctx.createBiquadFilter();
      filt.type = "highpass";
      filt.frequency.value = hp;
      const g = ctx.createGain();
      env(g, peak, dur);
      src.connect(filt).connect(g).connect(out);
      src.start(t);
      src.stop(t + dur);
    };

    if (piece === "kick") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      env(g, 1, 0.35);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.35);
    } else if (piece === "snare") {
      noise(0.2, 1800, 0.7);
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = 180;
      const g = ctx.createGain();
      env(g, 0.4, 0.15);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.15);
    } else if (piece === "hihat") {
      noise(0.05, 7000, 0.5);
    } else if (piece === "openhat") {
      noise(0.35, 7000, 0.45);
    } else if (piece === "tom") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.2);
      env(g, 0.9, 0.3);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.3);
    } else if (piece === "tom2") {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(65, t + 0.25);
      env(g, 0.9, 0.35);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.35);
    } else if (piece === "crash") {
      noise(0.9, 5000, 0.5);
    }

    setFlash(piece);
    window.setTimeout(() => setFlash((f) => (f === piece ? null : f)), 90);
  };

  // riff de bienvenida
  const riff = () => {
    const seq: [Piece, number][] = [
      ["kick", 0], ["hihat", 0], ["hihat", 200], ["snare", 400], ["hihat", 400],
      ["hihat", 600], ["kick", 800], ["hihat", 800], ["snare", 1000], ["hihat", 1000],
      ["crash", 1000],
    ];
    seq.forEach(([p, ms]) => window.setTimeout(() => hit(p), ms));
  };

  // Triggers globales
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return; // dentro del overlay se maneja aparte
      // Konami
      konami.current.push(e.key);
      konami.current = konami.current.slice(-KONAMI.length);
      if (KONAMI.every((k, i) => konami.current[i]?.toLowerCase() === k.toLowerCase())) {
        setOpen(true);
        konami.current = [];
        return;
      }
      // teclear "rock"
      if (/^[a-zA-Z]$/.test(e.key)) {
        typed.current = (typed.current + e.key.toLowerCase()).slice(-4);
        if (typed.current === "rock") {
          setOpen(true);
          typed.current = "";
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Teclado dentro del overlay
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      const pad = PADS.find((p) => p.key === e.key.toLowerCase());
      if (pad) {
        e.preventDefault();
        hit(pad.piece);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-b from-[#171326] to-[#0b0910] p-6 text-white shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl uppercase tracking-wide text-ambar">
            🥁 La batería de Jorge
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
          >
            Cerrar (Esc)
          </button>
        </div>
        <p className="mb-5 text-sm text-white/60">
          Toca con el ratón o con el teclado. El bombo es la barra espaciadora.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {PADS.map((p) => (
            <button
              key={p.piece}
              onMouseDown={() => hit(p.piece)}
              className={`flex flex-col items-center justify-center rounded-xl border py-6 transition ${
                p.span ? "col-span-3" : ""
              } ${
                flash === p.piece
                  ? "border-ambar bg-ambar/30 scale-[0.98]"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="font-display text-lg uppercase">{p.label}</span>
              <span className="mt-1 rounded bg-white/10 px-2 text-xs uppercase text-white/60">
                {p.key === " " ? "espacio" : p.key}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={riff}
            className="rounded-full bg-neon px-6 py-2 font-display uppercase tracking-wide text-white transition hover:opacity-90"
          >
            ▶ Riff de Jorge
          </button>
        </div>
      </div>
    </div>
  );
}
