import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#24312D",
        muted: "#69756F",
        cream: "#F9F8F4",
        peach: "#FBE9DF",
        coral: "#E7795E",
        forest: "#294A3B"
      },
      fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] },
      boxShadow: { soft: "0 16px 50px rgba(42, 62, 53, .08)" }
    }
  },
  plugins: []
} satisfies Config;
