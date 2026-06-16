import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Philix Finance Official Brand Colors
        navy: {
          50:  "#e8edf4",
          100: "#c5d0e3",
          200: "#9fb1d0",
          300: "#7892bc",
          400: "#587bac",
          500: "#3865a0",
          600: "#2d5592",
          700: "#1f4080",
          800: "#132e6b",
          900: "#0B1F3A",  // PRIMARY NAVY
          950: "#071529",
        },
        gold: {
          50:  "#fdf8e8",
          100: "#fbf0c7",
          200: "#f7e091",
          300: "#f2cc58",
          400: "#edb92f",
          500: "#C9A227",  // PRIMARY GOLD
          600: "#b08a1e",
          700: "#8f6f16",
          800: "#705610",
          900: "#54400b",
        },
        warm: {
          50:  "#fdfcfa",
          100: "#F5F0E6",  // PRIMARY BACKGROUND
          200: "#ede5d4",
          300: "#e0d5bf",
          400: "#d0c1a3",
        },
        // Keep slate for client portal dark theme
        slate: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:    ["IBM Plex Mono", "JetBrains Mono", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in":       "fade-in 0.25s ease-out",
        "slide-in-right":"slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
