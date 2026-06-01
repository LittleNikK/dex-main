/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5b5cf0",
        "primary-foreground": "#ffffff",
        background: "#f6f7fb",
        foreground: "#0f172a",
        muted: "#eef0f6",
        "muted-foreground": "#475569",
      },
      fontFamily: {
        display: ["Playfair Display", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "40px",
        xl: "30px",
        lg: "22px",
        md: "14px",
        sm: "8px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
        deep: "var(--shadow-deep)",
      },
      maxWidth: { 120: "1200px", 330: "330px" },
    },
  },
  plugins: [],
};
