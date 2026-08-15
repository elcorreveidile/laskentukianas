import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [articulos, publicados, comentarios, pendientes, visitas] = await Promise.all([
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.comment.count(),
    db.comment.count({ where: { approved: false } }),
    db.counter.findUnique({ where: { key: "site" } }).catch(() => null),
  ]);

  const totalVisitas = visitas?.count ?? 0;

  const cards = [
    { label: "Artículos", value: articulos, sub: `${publicados} publicados`, href: "/admin/articulos" },
    { label: "Comentarios", value: comentarios, sub: `${pendientes} por moderar`, href: "/admin/comentarios" },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl uppercase text-tinta">Panel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-black/10 bg-white p-6 shadow-card transition hover:shadow-card-hover"
          >
            <p className="text-sm text-tinta/60">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-kentuki-dark">{c.value}</p>
            <p className="mt-1 text-sm text-tinta/60">{c.sub}</p>
          </Link>
        ))}
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-card">
          <p className="text-sm text-tinta/60">Visitas</p>
          <p className="mt-1 text-3xl font-bold text-kentuki-dark">
            {totalVisitas.toLocaleString("es-ES")}
          </p>
          <p className="mt-1 text-sm text-tinta/60">contador propio del sitio</p>
        </div>
      </div>
      <Link
        href="/admin/articulos/nuevo"
        className="mt-6 inline-block rounded-lg bg-kentuki px-6 py-3 font-display uppercase tracking-wide text-white hover:bg-kentuki-dark"
      >
        + Nuevo artículo
      </Link>
    </div>
  );
}
