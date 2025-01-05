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
        pin: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23000000\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle></svg>'), pointer",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" }
        },
        "pop-in": {
          "0%": {
            width: "0px",
            height: "0px",
            opacity: "0",
            boxShadow: "none"
          },
          "70%": {
            width: "55px",
            height: "55px",
            opacity: "1",
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.4)"
          },
          "85%": {
            width: "48px",
            height: "48px",
            boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.3)"
          },
          "100%": {
            width: "50px",
            height: "50px",
            boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.3)"
          }
        },
        "wobble": {
          "0%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(2.5deg)" },
          "50%": { transform: "rotate(-2deg)" },
          "65%": { transform: "rotate(1deg)" },
          "100%": { transform: "rotate(0deg)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "pulse": "pulse 1.5s ease-in-out infinite",
        "marker-pop": "pop-in 0.3s ease-out forwards, wobble 1.5s ease-in-out 0.3s forwards"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;