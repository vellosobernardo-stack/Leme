import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais do Leme
        primary: {
          DEFAULT: "#112D4E",
          dark: "#2a3f5f",
          hover: "#354d73",
          foreground: "#FFFFFF",
        },
        // Fundos
        background: {
          DEFAULT: "#FFFFFF",
          light: "#F7FAFD",
        },
        // Textos
        foreground: {
          DEFAULT: "hsl(0, 0%, 10%)",
          muted: "hsl(0, 0%, 40%)",
        },
        // Bordas
        border: {
          DEFAULT: "hsl(0, 0%, 90%)",
        },
        // Status
        success: {
          DEFAULT: "#22c55e",
          light: "#dcfce7",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;