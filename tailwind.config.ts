import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#e6fbff",
          100: "#b8f0ff",
          200: "#8ae4ff",
          300: "#5bd8ff",
          400: "#2bccff",
          500: "#00b4e6",
          600: "#008db3",
          700: "#006680",
          800: "#003f4d",
          900: "#00191a"
        },
        deep: {
          950: "#0b1222",
          900: "#111a2e",
          800: "#18213a",
          700: "#212a45"
        }
      },
      fontFamily: {
        sans: ["\"Plus Jakarta Sans\"", "ui-sans-serif", "system-ui"],
        display: ["\"Space Grotesk\"", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0, 180, 230, 0.18)",
        card: "0 12px 30px rgba(3, 10, 28, 0.35)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      }
    }
  },
  plugins: []
} satisfies Config;
