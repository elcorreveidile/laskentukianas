"use client";

import { useState } from "react";

/**
 * Firma "desarrollo Por 2 duros" con guiño: al pasar el cursor por la marca, aparece
 * una frase aleatoria (rock / batería / profe / Kentucky / humor) y la marca se anima.
 */
const FRASES = [
  "Hecho con dos duros y mucho rock.",
  "Sin ánimo de lucro, con ánimo de batería.",
  "Programado entre redoble y redoble.",
  "Del aula de Kentucky al escenario del garito.",
  "Aquí no hay Grammy, pero hay groove.",
  "Código y baquetas: todo por dos duros.",
  "Menorca queda lejos; el rock, aquí al lado.",
  "Si suena, es que funciona.",
  "Spanish teacher de día, batería de siempre.",
  "Wildcats, tildes y platillos.",
  "El backstage lo montamos por dos duros.",
  "Puede contener trazas de distorsión.",
  "Esto lo firma un profe con baquetas.",
  "Dos duros bien invertidos (en cuerdas de repuesto).",
];

export function Por2DurosCredit() {
  const [frase, setFrase] = useState(FRASES[0]);
  const pick = () => setFrase(FRASES[Math.floor(Math.random() * FRASES.length)]);

  return (
    <span className="p2d">
      Desarrollo{" "}
      <a
        href="https://www.por2duros.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p2d__brand"
        onMouseEnter={pick}
        onFocus={pick}
      >
        Por 2 duros
        <span className="p2d__coins" aria-hidden>
          🪙🪙
        </span>
      </a>
      <span className="p2d__bubble" role="status">
        {frase}
      </span>
    </span>
  );
}
