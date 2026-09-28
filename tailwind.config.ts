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
        // Midi Agency Solar Gold & Warm Sand
        brand: {
          50: "#fdf8ee",
          100: "#fbf1db",
          200: "#f6e1b6",
          300: "#f0cf8c",
          400: "#e8bc60",
          500: "#deaf4a", // Logo Ochre Gold
          600: "#c69435",
          700: "#9e7027",
          800: "#7a5522",
          900: "#5e421d",
          950: "#38260e",
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
          sand: "#E5D9C5",
          emerald: "#34D399",
          coral: "#F87171",
        }
      },
    },
  },
  plugins: [],
};
export default config;
