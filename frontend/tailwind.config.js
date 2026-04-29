/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#fff8f0",
          100: "#ffeedd",
          200: "#ffd4aa",
          300: "#ffb870",
          400: "#ff9340",
          500: "#ff6b00",
          600: "#e85c00",
          700: "#c44d00",
          800: "#9a3d00",
          900: "#6e2d00",
        },
        ink: "#1a1006",
        cream: "#fdf8f2",
      },
      animation: {
        "slide-up": "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fadeIn 0.25s ease",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        pulseDot: {
          "0%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
          "50%":       { opacity: 1,   transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};
