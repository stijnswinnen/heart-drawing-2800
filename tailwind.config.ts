import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FFDEE2",
          foreground: "#333333",
        },
        secondary: {
          DEFAULT: "#F6F6F7",
          foreground: "#333333",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      cursor: {
        pin: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"10\" r=\"3\"/><path d=\"M12 2v1M12 21v-1M4.2 4.2l.7.7m12.1 12.1l.7.7M2 12h1m18 0h1M4.2 19.8l.7-.7m12.1-12.1l.7-.7\"/></svg>'), pointer",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "pulse": "pulse 1.5s ease-in-out infinite"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;