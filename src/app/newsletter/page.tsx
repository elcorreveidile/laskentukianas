import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata = {
  title: "No te pierdas nada",
  description: "Suscríbete y recibe cada nueva crónica de Jorge en tu correo.",
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-article px-6 py-16 text-center">
      <p className="font-hand text-2xl text-kentuki-dark">🥁</p>
      <h1 className="font-display text-4xl uppercase text-tinta">No te pierdas nada</h1>
      <p className="mx-auto mt-4 max-w-md font-serif text-lg text-tinta/75">
        Apúntate y recibe cada nueva crónica en tu correo. Sin spam, solo las aventuras de
        Jorge de Menorca a Kentucky.
      </p>
      <NewsletterForm />
      <p className="mt-4 text-xs text-tinta/40">
        Te puedes dar de baja cuando quieras.
      </p>
    </div>
  );
}
