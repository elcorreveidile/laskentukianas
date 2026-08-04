"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AdminSidebarNav({ userName }: { userName: string }) {
  return (
    <aside className="w-full shrink-0 md:w-52">
      <p className="font-display text-lg uppercase text-kentuki-dark">Backstage</p>
      <nav className="mt-4 flex flex-col gap-1 text-sm">
        <Link href="/admin" className="rounded px-2 py-1.5 hover:bg-black/5">Panel</Link>
        <Link href="/admin/articulos" className="rounded px-2 py-1.5 hover:bg-black/5">Artículos</Link>
        <Link href="/admin/comentarios" className="rounded px-2 py-1.5 hover:bg-black/5">Comentarios</Link>
        <Link href="/admin/newsletter" className="rounded px-2 py-1.5 hover:bg-black/5">Newsletter</Link>
        <Link href="/" className="rounded px-2 py-1.5 hover:bg-black/5">Ver sitio ↗</Link>
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
    </aside>
  );
}
