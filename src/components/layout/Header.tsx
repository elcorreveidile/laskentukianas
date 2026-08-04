"use client";

import Link from "next/link";
import { useState } from "react";

function LogoBadge() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#3aa6d6" />
      <g stroke="#fff" strokeWidth="6" strokeLinecap="round">
        <line x1="16" y1="50" x2="48" y2="18" />
        <line x1="48" y1="50" x2="16" y2="18" />
      </g>
      <circle cx="48" cy="18" r="5.5" fill="#fff" />
      <circle cx="16" cy="18" r="5.5" fill="#fff" />
    </svg>
  );
}

const NAV = [
  { href: "/cronicas", label: "Crónicas" },
  { href: "/kentukiana", label: "Kentukiana" },
  { href: "/garito", label: "El Garito 🎸" },
  { href: "/mapa", label: "Mapa" },
  { href: "/reto", label: "Reto 🇪🇸" },
  { href: "/newsletter", label: "No te pierdas nada" },
  { href: "/buscar", label: "Buscar 🔎" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <LogoBadge />
          <span className="font-display text-lg uppercase tracking-wide text-kentuki-dark sm:text-2xl">
            Crónicas Kentukianas
          </span>
        </Link>

        {/* Navegación de escritorio */}
        <nav className="hidden items-center gap-6 font-body text-sm md:flex">
          {NAV.slice(0, -1).map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-kentuki">
              {l.label}
            </Link>
          ))}
          <Link href="/buscar" aria-label="Buscar" className="transition hover:text-kentuki">
            🔎
          </Link>
        </nav>

        {/* Botón hamburguesa (móvil) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="menu-movil"
          className="-mr-2 inline-flex items-center justify-center rounded-lg p-2 text-kentuki-dark transition hover:bg-black/5 md:hidden"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Menú desplegable (móvil) */}
      {open && (
        <nav
          id="menu-movil"
          className="border-t border-black/10 bg-crema px-4 pb-4 pt-2 font-body text-base md:hidden"
        >
          <div className="flex flex-col">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-tinta transition hover:bg-black/5 hover:text-kentuki"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
