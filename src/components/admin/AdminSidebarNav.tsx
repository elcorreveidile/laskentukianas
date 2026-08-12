"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/articulos", label: "Artículos" },
  { href: "/admin/comentarios", label: "Comentarios" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/", label: "Ver sitio ↗" },
];

export function AdminSidebarNav({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="w-full shrink-0 md:w-52">
      {/* Cabecera: en móvil, título + hamburguesa; en escritorio solo el título. */}
      <div className="flex items-center justify-between md:block">
        <p className="font-display text-lg uppercase text-kentuki-dark">Backstage</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="admin-menu"
          className="-mr-2 inline-flex items-center justify-center rounded-lg p-2 text-kentuki-dark transition hover:bg-black/5 md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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

      {/* Menú: colapsable en móvil (hamburguesa), siempre visible en escritorio. */}
      <div id="admin-menu" className={`${open ? "block" : "hidden"} md:block`}>
        <nav className="mt-4 flex flex-col gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1.5 hover:bg-black/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-black/10 pt-4 text-sm">
          <p className="text-tinta/60">{userName}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-1 font-medium text-red-600 hover:text-red-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
