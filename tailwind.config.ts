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
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bcdfff",
          300: "#8eccff",
          400: "#58b0ff",
          500: "#2f8dff",
          600: "#136bfc",
          700: "#0b53e8",
          800: "#0e43bd",
          900: "#113c94",
          950: "#0a245c",
        },
        accent: {
          cyan: "#00E5FF",
          emerald: "#10B981",
          purple: "#8B5CF6",
          amber: "#F59E0B",
        }
      },
    },
  },
  plugins: [],
};
export default config;
