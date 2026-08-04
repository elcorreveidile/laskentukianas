import QuizReto from "@/components/QuizReto";

export const metadata = {
  title: "Reto kentukiano",
  description:
    "Pon a prueba tu español, tu Kentucky y tu memoria de las crónicas. 10 preguntas al azar por partida.",
  alternates: { canonical: "/reto" },
};

export default function RetoPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8 text-center">
        <p className="font-hand text-2xl text-kentuki-dark">¿Cuánto sabes? 🇪🇸🥁</p>
        <h1 className="mt-1 font-display text-4xl uppercase text-tinta sm:text-5xl">
          Reto kentukiano
        </h1>
        <p className="mx-auto mt-3 max-w-lg font-serif text-lg text-tinta/70">
          Diez preguntas al azar sobre español, Kentucky, música y las propias crónicas.
          ¿Serás digno de la batería de Jorge?
        </p>
      </header>
      <QuizReto />
    </div>
  );
}
