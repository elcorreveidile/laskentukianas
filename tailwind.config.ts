import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidad "Crónicas Kentukianas"
        kentuki: {
          DEFAULT: "#3aa6d6", // azul de marca
          light: "#7fc4e6",
          dark: "#1f6f96",
        },
        crema: "#f5f1e8",
        tinta: { DEFAULT: "#14140f", light: "#2b2b26" },
        // Escenario / rock (intro y acentos)
        escenario: "#0b0910",
        ambar: "#f5a623",
        neon: "#ff375f",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"], // rótulo rock
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      maxWidth: { article: "695px", content: "1200px" },
      boxShadow: {
        card: "0 1px 0 1px rgba(20,20,15,0.06)",
        "card-hover": "0 6px 20px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
