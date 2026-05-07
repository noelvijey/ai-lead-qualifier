import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        base: "#0B0B0A",
        surface: "#141412",
        elevated: "#1C1C1A",
        "border-subtle": "#2A2A27",
        "border-strong": "#3A3A35",
        "text-primary": "#F0EFE8",
        "text-secondary": "#9B9A93",
        "text-muted": "#5C5B56",
        accent: {
          DEFAULT: "#D97706",
          light: "#F59E0B",
        },
        "score-a": "#10B981",
        "score-b": "#3B82F6",
        "score-c": "#F59E0B",
        "score-d": "#F97316",
        "score-f": "#EF4444",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease both",
        "scale-in": "scaleIn 0.35s ease both",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
