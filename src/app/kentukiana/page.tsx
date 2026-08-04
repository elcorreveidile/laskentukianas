import { db } from "@/lib/db";
import { ArticleCard } from "@/components/content/ArticleCard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kentukiana",
  description: "Enseñar español en un aula «kentukiana»: la serie del profe.",
  alternates: { canonical: "/kentukiana" },
};

export default async function KentukianaPage() {
  const articles = await db.article
    .findMany({
      where: { status: "PUBLISHED", series: "KENTUKIANA" },
      orderBy: { order: "asc" },
      select: { slug: true, title: true, excerpt: true, coverImage: true },
    })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-content px-6 py-14">
      <h1 className="mb-2 font-display text-4xl uppercase text-tinta">Kentukiana</h1>
      <p className="mb-10 font-serif text-lg text-tinta/70">
        Enseñar español en un aula «kentukiana»: la serie del profe.
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
