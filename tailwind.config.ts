import type { Config } from "tailwindcss"

const config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        customButton: {
          DEFAULT: '#FFDEDE',        // background default (like bg-[#FFDEDE])
          hoverBg: '#FFEDED',        // background hover (like hover:bg-[#FFEDED])
          text: '#A30000',           // text default (like text-[#A30000])
          hoverText: '#C70000',      // text hover (like hover:text-[#C70000])
          gradientFrom: '#FFDEDE',   // gradient start
          gradientTo: '#FFB3B3',     // gradient end
        },
        sponsor: {
          diamond: '#FFEDED',
          gold: '#FFDEDE',
          bronze: '#FFBABA',
          silver: '#FFF5F5',
          border: '#FFCCCC',
          text: '#A30000',
          hoverText: '#C70000',
        },
        bordercolor: '#FFC0C0',
        bgheadersidebar: '#FFF5F5',
        bglogin: '#fff3f3',
        focusborder: '#C70000',
        focusborderring: '#C70000',
        linegradientFrom: '#FFBABA',
        linegradientTo: '#FF7B7B',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },

    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
