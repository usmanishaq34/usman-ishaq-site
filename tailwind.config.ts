import type { Config } from "tailwindcss";

// Tailwind is used ONLY by the dashboard, which renders inside
// <div class="dv-legacy">. The public site is plain CSS (app/(site)/globals.css):
//   - preflight is off here and re-added, scoped, in styles/legacy/legacy-tailwind.css
//   - `important: ".dv-legacy"` scopes every utility under that wrapper
//   - `content` lists only the dashboard files
const config: Config = {
  important: ".dv-legacy",
  corePlugins: { preflight: false },
  content: ["./app/usman-1000-admin/**/*.{ts,tsx}", "./components/admin/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        dv: { accent: "#db4c23", dark: "#0a0a0a", cream: "#faf9f6" },
        bg: { DEFAULT: "#ffffff", 2: "#faf9f6", 3: "#f3f1ec" },
        line: { DEFAULT: "rgba(10, 10, 10, 0.1)", strong: "rgba(10, 10, 10, 0.22)" },
        ink: { DEFAULT: "#0a0a0a", 2: "#2a2a2a", muted: "#6b6b65", dim: "#9b9b95" },
        accent: { DEFAULT: "#db4c23", hover: "#c43d18", soft: "rgba(219, 76, 35, 0.08)", glow: "rgba(219, 76, 35, 0.18)" },
      },
      borderRadius: { DEFAULT: "2px" },
      maxWidth: { content: "1320px", prose: "800px", narrow: "1100px" },
    },
  },
  plugins: [],
};
export default config;
