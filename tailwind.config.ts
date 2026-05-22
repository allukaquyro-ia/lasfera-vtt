import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#070708",
        graphite: "#111116",
        ash: "#1b1b22",
        ruby: "#9f1239",
        "ruby-bright": "#e11d48",
        antique: "#c9a45d",
        arcane: "#2563eb",
        ally: "#22c55e",
        enemy: "#ef4444",
      },
      boxShadow: {
        ember: "0 0 32px rgba(159, 18, 57, 0.25)",
        glyph: "inset 0 0 0 1px rgba(201, 164, 93, 0.18)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
