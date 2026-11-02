# Usman Ishaq | Personal Website

Single-page portfolio and lead site for usmanishaq.com, built with Next.js.

## Run it on your computer

1. Install Node.js 20 or newer from nodejs.org.
2. Open a terminal in this folder.
3. Run `npm install`
4. Run `npm run dev`
5. Open http://localhost:3000

## Put it live

The easiest host is Vercel:

1. Push this folder to a GitHub repository.
2. Import the repository on vercel.com.
3. Add your domain usmanishaq.com in the project settings.

Any host that runs Next.js works too (Netlify, a VPS with `npm run build` then `npm start`).

## Where things live

| What | File |
|---|---|
| Page order (all sections) | `app/page.js` |
| Title, description, social preview | `app/layout.js` |
| All styling and colours | `app/globals.css` |
| Each section's content | `components/sections/` (one file per section) |
| Animations and interactions | `components/Interactions.jsx` |
| Schema (Person, Organization, FAQ) | `lib/schema.js` |
| Images | `public/images/` |
| robots.txt and sitemap | `app/robots.js`, `app/sitemap.js` |

## Editing tips

- To change text, open the section file in `components/sections/` and edit the words inside the quotes.
- If you change a FAQ question or answer in `components/sections/Faq.jsx`, change it in `lib/schema.js` too, so the FAQ schema matches what the page shows.
- The brand colour is `--orange: #db4c23` at the top of `app/globals.css`.

## Contact form

The form opens the visitor's email app with their answers filled in, sent to workwithus@digitalvikingz.com. To receive form entries directly instead, connect it to a form service or an API route.
