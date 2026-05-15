import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#0B0D12",
          700: "#2A2F3A",
          500: "#5B6473",
          300: "#9AA3B2",
          100: "#E5E8EE",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FAFAFB",
          subtle: "#F4F5F7",
        },
        accent: {
          DEFAULT: "#1877F2",
          hover: "#1463CC",
          soft: "#E8F1FE",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        cardHover:
          "0 4px 12px rgba(16, 24, 40, 0.06), 0 2px 4px rgba(16, 24, 40, 0.04)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};

export default config;
