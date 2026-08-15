import Link from "next/link";
import { db } from "@/lib/db";
import { setCommentApproved, deleteComment } from "@/lib/actions/comments";

export const dynamic = "force-dynamic";

export default async function AdminComentarios() {
  const comments = await db.comment.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    take: 50,
    include: { article: { select: { title: true, slug: true } } },
  });
  const pendientes = comments.filter((c) => !c.approved).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl uppercase text-tinta">Comentarios</h1>
        <p className="text-sm text-tinta/60">
          {pendientes} por moderar · {comments.length} en total (últimos 50)
        </p>
      </div>

      <ul className="space-y-3">
        {comments.map((c) => (
          <li
            key={c.id}
            className={`rounded-xl border p-4 ${
              c.approved ? "border-black/10 bg-white" : "border-amber-300 bg-amber-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-bold text-tinta">
                  {c.authorName}{" "}
                  {!c.approved && (
                    <span className="ml-1 rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-900">
                      pendiente
                    </span>
                  )}
                </p>
                <p className="mt-1 whitespace-pre-line font-serif text-tinta/80">{c.content}</p>
                <p className="mt-2 text-xs text-tinta/50">
                  en{" "}
                  <Link href={`/${c.article.slug}`} className="text-kentuki-dark hover:underline">
                    {c.article.title}
                  </Link>{" "}
                  · {new Date(c.createdAt).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <form action={setCommentApproved.bind(null, c.id, !c.approved)}>
                  <button
                    className={`w-full rounded-lg px-3 py-1.5 text-sm font-medium ${
                      c.approved
                        ? "bg-black/10 text-tinta hover:bg-black/20"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {c.approved ? "Ocultar" : "Aprobar"}
                  </button>
                </form>
                <form action={deleteComment.bind(null, c.id)}>
                  <button className="w-full rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                    Borrar
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
