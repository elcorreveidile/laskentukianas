import Link from "next/link";
import { db } from "@/lib/db";
import { deleteArticle } from "@/lib/actions/articles";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Borrador", cls: "bg-gray-100 text-gray-700" },
  REVIEW: { label: "Revisión", cls: "bg-amber-100 text-amber-800" },
  PUBLISHED: { label: "Publicado", cls: "bg-green-100 text-green-800" },
  ARCHIVED: { label: "Archivado", cls: "bg-red-100 text-red-700" },
};
const SERIE: Record<string, string> = {
  CRONICAS: "Crónica",
  KENTUKIANA: "Kentukiana",
  MENORQUIANA: "Menorquianas",
  PAGINA: "Página",
};

const PAGE_SIZE = 20;

export default async function AdminArticulos({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const where = { NOT: { status: "ARCHIVED" as const } };
  const total = await db.article.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(searchParams.page) || 1), totalPages);

  const articles = await db.article.findMany({
    where,
    orderBy: [{ series: "asc" }, { order: "asc" }],
    select: { id: true, title: true, series: true, status: true, order: true },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase text-tinta">Artículos</h1>
        <Link
          href="/admin/articulos/nuevo"
          className="rounded-lg bg-kentuki px-5 py-2.5 font-display uppercase text-white hover:bg-kentuki-dark"
        >
          + Nuevo
        </Link>
      </div>

      <div className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-4">
            <span className="w-8 text-center text-sm text-tinta/50">{a.order}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-tinta">{a.title}</p>
              <p className="text-xs text-tinta/50">{SERIE[a.series]}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[a.status].cls}`}>
              {STATUS[a.status].label}
            </span>
            <Link
              href={`/admin/articulos/${a.id}/editar`}
              className="rounded-lg bg-kentuki/10 px-3 py-1.5 text-sm font-medium text-kentuki-dark hover:bg-kentuki/20"
            >
              Editar
            </Link>
            <form action={deleteArticle.bind(null, a.id)}>
              <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                Archivar
              </button>
            </form>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-tinta/60">
          {page > 1 ? (
            <Link
              href={`/admin/articulos?page=${page - 1}`}
              className="rounded-lg border border-black/10 px-3 py-1.5 hover:bg-black/5"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="rounded-lg border border-black/10 px-3 py-1.5 opacity-40">← Anterior</span>
          )}
          <span>
            Página {page} de {totalPages} · {total} artículos
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/articulos?page=${page + 1}`}
              className="rounded-lg border border-black/10 px-3 py-1.5 hover:bg-black/5"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="rounded-lg border border-black/10 px-3 py-1.5 opacity-40">Siguiente →</span>
          )}
        </div>
      )}
    </div>
  );
}
