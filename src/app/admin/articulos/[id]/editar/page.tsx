import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditarArticulo({ params }: { params: { id: string } }) {
  const a = await db.article.findUnique({
    where: { id: params.id },
    include: { tags: { include: { tag: true } } },
  });
  if (!a) notFound();

  const tags = a.tags.map((t) => t.tag.name).join(", ");

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl uppercase text-tinta">Editar artículo</h1>
      <ArticleForm
        initial={{
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content: a.content,
          coverImage: a.coverImage,
          series: a.series,
          order: a.order,
          status: a.status,
          byline: a.byline,
          tags,
        }}
      />
    </div>
  );
}
