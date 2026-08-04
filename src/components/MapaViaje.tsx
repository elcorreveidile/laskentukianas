"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type Enlace = { slug: string; text: string };
type Stop = {
  n: number;
  name: string;
  coords: [number, number];
  label: string;
  links: Enlace[];
};

const STOPS: Stop[] = [
  {
    n: 1,
    name: "Menorca",
    coords: [39.95, 4.05],
    label: "Menorca — el punto de partida",
    links: [
      { slug: "el-profe-de-espanol", text: "1. El profe de español" },
      { slug: "que-hago-aqui", text: "2. ¿Y qué hago yo aquí?" },
      { slug: "el-porque-de-las-kentukianas", text: "3. El porqué" },
      { slug: "en-los-huesos-parte-1", text: "4. «En los huesos»: la cuenta atrás" },
      { slug: "en-los-huesos-parte-4", text: "7. Embajada y despedida" },
    ],
  },
  {
    n: 2,
    name: "La Mancha",
    coords: [39.46, -3.6],
    label: "La Mancha — «un viaje por La Mancha»",
    links: [{ slug: "en-los-huesos-parte-3", text: "6. Entre Texas e Indiana" }],
  },
  {
    n: 3,
    name: "Cincinnati / Kentucky",
    coords: [39.096, -84.503],
    label: "Cincinnati &amp; Newport (KY) — la llegada y el aula",
    links: [
      { slug: "en-el-aire-de-menorca-a-cincinnati", text: "8. «En el aire»: de Menorca a Cincinnati" },
      { slug: "en-tierra-parte-1", text: "9. «En tierra»: Serendipias" },
      { slug: "11-en-el-comet-the-mortals-final-show", text: "11. En el Comet" },
      { slug: "kentukiana", text: "…y toda la serie Kentukiana (el aula)" },
    ],
  },
  {
    n: 4,
    name: "Lago Cumberland",
    coords: [36.92, -85.15],
    label: "Lago Cumberland — «En el agua»",
    links: [
      { slug: "12-en-el-agua-parte-i-un-viaje-inesperado", text: "12. Un viaje inesperado" },
      { slug: "14-en-el-agua-la-gallina-se-implica-el-cerdo-se-compromete", text: "14. Fiesta en el lago" },
      { slug: "15-en-el-agua-ei-buddy-are-you-ready", text: "15. Ei buddy!" },
    ],
  },
];

export default function MapaViaje() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      // evitar doble init
      if ((ref.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return;

      map = L.map(ref.current, { scrollWheelZoom: false });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 18,
      }).addTo(map);

      const pts: [number, number][] = [];
      for (const s of STOPS) {
        pts.push(s.coords);
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:30px;height:30px;background:#3aa6d6;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">
                   <span style="transform:rotate(45deg);color:#fff;font-weight:700;font-family:system-ui;font-size:13px;">${s.n}</span>
                 </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -28],
        });
        const enlaces = s.links
          .map(
            (l) =>
              `<a href="/${l.slug}" style="color:#1f6f96;font-weight:600;">${l.text} →</a>`
          )
          .join("<br/>");
        L.marker(s.coords, { icon })
          .addTo(map)
          .bindPopup(`<strong>${s.label}</strong><br/>${enlaces}`);
      }

      L.polyline(pts, { color: "#3aa6d6", weight: 3, dashArray: "6 8", opacity: 0.8 }).addTo(map);
      map.fitBounds(L.latLngBounds(pts).pad(0.35));
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return <div ref={ref} className="h-[70vh] min-h-[420px] w-full rounded-2xl border border-black/10" />;
}
