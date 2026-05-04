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
          DEFAULT: "#D5677B",
          light: "#F29BA2",
          dark: "#D5677B",
          soft: "#F2DCE2",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#7EA672",
          dark: "#734439",
          foreground: "#FFFFFF",
        },
        // ---------- Design tokens ----------
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          muted: "var(--ink-muted)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        pink: {
          50: "var(--pink-50)",
          100: "var(--pink-100)",
          300: "var(--pink-300)",
          500: "var(--pink-500)",
          600: "var(--pink-600)",
        },
        green: {
          50: "var(--green-50)",
          700: "var(--green-700)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
      transitionDuration: {
        '2000': '2000ms',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Fraunces", "serif"],
        montserrat: ["Fraunces", "serif"],
        barlow: ["Inter", "sans-serif"],
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
        "slide-in-right": {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "fade-in-from-top": {
          "0%": { 
            background: "linear-gradient(to bottom, rgba(242, 109, 133, 0.1) 0%, rgba(242, 109, 133, 0.1) 0%, transparent 0%)"
          },
          "100%": { 
            background: "linear-gradient(to bottom, rgba(242, 109, 133, 0.2) 0%, rgba(242, 109, 133, 0.2) 100%, transparent 100%)"
          }
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "pulse": "pulse 1.5s ease-in-out infinite",
        "slide-in-right": "slide-in-right 1s ease-out",
        "fade-in-from-top": "fade-in-from-top 0.3s ease"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;