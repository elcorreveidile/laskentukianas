import MapaViaje from "@/components/MapaViaje";

export const metadata = {
  title: "El mapa del viaje",
  description: "De Menorca a Kentucky: sigue en el mapa la ruta de las crónicas de Jorge.",
  alternates: { canonical: "/mapa" },
};

export default function MapaPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="font-display text-4xl uppercase text-tinta">El mapa del viaje</h1>
      <p className="mb-6 mt-2 font-serif text-lg text-tinta/70">
        De Menorca a Kentucky, parada a parada. Pulsa cada chincheta para saltar a su
        crónica.
      </p>
      <MapaViaje />
    </div>
  );
}
