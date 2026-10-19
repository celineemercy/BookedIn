import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2B211D",
        muted: "#66564E",
        cream: "#FFF9F3",
        paper: "#FFF9F3",
        peach: "#FFF0E8",
        coral: "#F36B45",
        tangerine: "#F36B45",
        accentText: "#B44426"
      },
      fontFamily: { sans: ["Plus Jakarta Sans", "Arial", "sans-serif"] },
      boxShadow: { soft: "0 18px 48px rgba(59, 36, 25, .10)" }
    }
  },
  plugins: []
} satisfies Config;
