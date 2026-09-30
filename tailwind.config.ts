import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          // Échelle neutre (anciennement or « Midi »). L'or ne subsiste
          // qu'en accent ponctuel via accent-gold.
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#b4b4bb",
          500: "#a1a1aa",
          600: "#85858e",
          700: "#52525b",
          800: "#3f3f46",
          900: "#27272a",
          950: "#18181b",
        },
        // Midi Dark Charcoal / Carbon System
        carbon: {
          800: "#272a30",
          850: "#1e2024",
          900: "#18191c",
          950: "#121315",
        },
        accent: {
          gold: "#DEAF4A",
          amber: "#F59E0B",
          sand: "#e4e4e7",
          emerald: "#34D399",
          coral: "#F87171",
        }
      },
    },
  },
  plugins: [],
};
export default config;
