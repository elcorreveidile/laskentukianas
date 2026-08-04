import Link from "next/link";

export type CardArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
};

export function ArticleCard({ article }: { article: CardArticle }) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-kentuki-light/20">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-4xl uppercase text-kentuki/40">
            CK
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-body text-lg font-bold leading-snug text-tinta">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-3 font-serif text-tinta/70">{article.excerpt}</p>
        )}
        <span className="mt-4 font-hand text-lg text-kentuki-dark">Leer el artículo →</span>
      </div>
    </Link>
  );
}
