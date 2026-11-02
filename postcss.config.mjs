// tailwindcss only acts on files with @tailwind directives, which is
// styles/legacy/legacy-tailwind.css (the dashboard). The public site's
// app/(site)/globals.css passes through untouched apart from autoprefixer.
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
