export const metadata = {
  title: "El Garito",
  description: "La música de Jorge: directos, baquetas y rock del bueno.",
  alternates: { canonical: "/garito" },
};

const BLOB_GIG =
  "https://nkrpa7hjjwvhb02a.public.blob.vercel-storage.com/wp/506-VID_20230804_0012150_0_COMPRESSED-1.mp4";

const VIDEOS = [
  { src: "/videos/intro.mp4", poster: "/videos/intro-poster.jpg", title: "A la batería, en la calle" },
  { src: "/videos/gig2.mp4", poster: "/videos/gig2-poster.jpg", title: "Directo" },
  { src: BLOB_GIG, poster: undefined as string | undefined, title: "Más caña" },
];

export default function GaritoPage() {
  return (
    <>
      {/* Hero de escenario */}
      <section className="bg-escenario text-white">
        <div className="mx-auto max-w-content px-6 py-16 text-center">
          <p className="font-hand text-2xl text-ambar">Sube el telón 🎸</p>
          <h1
            className="mt-1 font-display text-5xl uppercase md:text-6xl"
            style={{ textShadow: "0 0 20px rgba(255,55,95,.6), 0 0 44px rgba(245,166,35,.4)" }}
          >
            El Garito
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg text-white/75">
            Jorge no solo escribe crónicas: también está detrás de la batería en{" "}
            <span className="text-ambar">Holy Crackers</span>. Sube el telón — directo,
            baquetas y ruido del bueno.
          </p>
        </div>
      </section>

      {/* YouTube */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="mb-6 font-display text-2xl uppercase text-tinta">En directo</h2>
        <div className="space-y-8">
          {[
            { id: "DHMq9jRC5_4", cap: "Holy Crackers — «Don't wake me now»" },
            { id: "-akWmqJUeDc", cap: "Y además… rap en directo 🎤" },
          ].map((v) => (
            <figure key={v.id}>
              <div className="aspect-video overflow-hidden rounded-2xl border border-black/10 bg-black shadow-card">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.cap}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <figcaption className="mt-2 text-center font-hand text-lg text-tinta/70">
                {v.cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Vídeos de batería */}
      <section className="mx-auto max-w-content px-6 pb-6">
        <h2 className="mb-6 font-display text-2xl uppercase text-tinta">Baquetas</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {VIDEOS.map((v) => (
            <figure key={v.src} className="overflow-hidden rounded-xl border border-black/10 bg-black">
              <video
                controls
                playsInline
                preload="metadata"
                poster={v.poster}
                className="mx-auto max-h-[70vh] w-full bg-black object-contain"
              >
                <source src={v.src} type="video/mp4" />
              </video>
              <figcaption className="bg-white p-3 text-center font-hand text-lg text-tinta/70">
                {v.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Guiño al easter egg */}
      <section className="mx-auto max-w-content px-6 pb-16 text-center">
        <p className="font-hand text-xl text-kentuki-dark">
          Psst… ¿quieres tocar tú? Teclea <span className="rounded bg-tinta px-2 py-0.5 text-crema">rock</span> en cualquier página. 🥁
        </p>
      </section>
    </>
  );
}
