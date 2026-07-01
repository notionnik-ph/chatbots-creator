import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        background: "#050507",
        surface: {
          DEFAULT: "#0a0a0f",
          elevated: "#111118",
          hover: "#1a1a24",
        },
        border: {
          DEFAULT: "#1e1e2e",
          hover: "#2a2a40",
        },
        primary: {
          DEFAULT: "#6366f1",
          hover: "#818cf8",
          glow: "rgba(99, 102, 241, 0.3)",
        },
        accent: {
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          pink: "#ec4899",
        },
        text: {
          primary: "#f0f0ff",
          secondary: "#8888aa",
          muted: "#55556a",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-lg": "0 0 40px rgba(99, 102, 241, 0.2)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
