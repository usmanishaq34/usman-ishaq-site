# Usman Ishaq | Personal Website

Portfolio and lead site for usmanishaq.com, built with Next.js, with a dashboard
for blog posts and the homepage (login with an emailed sign-in code).

## Run it on your computer

1. Install Node.js 20 or newer from nodejs.org.
2. Copy `.env.example` to `.env.local` and fill in the values (see "Dashboard setup").
3. Run `npm install`
4. Run `npm run dev`
5. Open http://localhost:3000

Without a database the public site still runs: the homepage shows its default
content and the blog is empty. The dashboard needs the database.

## Put it live

The site runs on Vercel from the GitHub repository `usmanishaq34/usman-ishaq-site`.
Every push to `main` deploys. Set the variables from `.env.example` under
Vercel → Project → Settings → Environment Variables.

## Where things live

| What | File |
|---|---|
| Public site shell (fonts) | `app/layout.tsx` |
| Public styles | `app/(site)/globals.css` |
| Homepage | `app/(site)/page.tsx` renders the editable sections |
| Homepage default sections | `content/pages/core--home.json`, generated from `components/sections/*.jsx` by `npm run content:export` |
| Section components (source of the defaults) | `components/sections/` |
| Blog index, post, draft preview | `app/(site)/blog/`, `app/(site)/preview/` |
| Animations and interactions | `components/Interactions.jsx` |
| Schema (Person, Organization, FAQ) | `lib/schema.js`, article schema in `components/Article.tsx` |
| Dashboard pages | `app/usman-1000-admin/` |
| Dashboard API | `app/api/` (every route needs a signed-in admin) |
| Dashboard UI and styles | `components/admin/`, `styles/legacy/` (Tailwind, scoped under `.dv-legacy`) |
| Login, sign-in code, IP blocks | `lib/auth.ts`, `lib/two-factor.ts`, `lib/login-guard.ts` |
| Database schema | `prisma/schema.prisma` |
| Images | `public/images/` |
| robots.txt and sitemap | `app/robots.js`, `app/sitemap.ts` |

## Dashboard

Open `/usman-1000-admin`. Sign-in is two steps: email and password, then a
six-digit code emailed to the address in `TWO_FACTOR_EMAIL`. A session lasts
8 hours. After 3 wrong passwords from one address, that address is blocked
until it is lifted under Security.

- **Posts**: write in the rich-text editor, add a featured image from the media
  library, set SEO fields, save as draft, schedule, or publish. A published post
  appears at `/blog/<slug>`, on `/blog`, in the homepage blog section and in
  the sitemap. Drafts can be previewed at `/preview/<id>` while signed in.
- **Categories** and **Authors**: the category filter on the blog pages and the
  byline box under a post.
- **Media Library**: uploads go to Supabase Storage.
- **Homepage**: every section of the homepage. "Visual edit" lets you click
  any text on the live design and type. "Sections" shows the HTML per section
  with reorder, hide, duplicate, delete and reset. "SEO" sets title,
  description, share image, canonical and noindex. Edits are stored in the
  `SiteContent` table on top of the defaults; "Reset page" removes them.
- **Account**: change your password. **Security**: blocked addresses.

## Dashboard setup (once)

1. Create a Supabase project. Under Connect → ORMs → Prisma copy the two
   connection strings into `DATABASE_URL` (pooled, port 6543) and `DIRECT_URL`.
2. Create a public Storage bucket named `usman-ishaq-media`. Copy the project URL
   and the service role key into `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Set `AUTH_SECRET` to a long random string, `AUTH_URL` to the site's address,
   `TWO_FACTOR_EMAIL` to the inbox that receives sign-in codes, and the SMTP
   settings of the mailbox that sends them.
4. Create the tables: `npm run db:push`
5. Create the first admin user with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set in
   `.env.local`: `npm run db:seed`
6. Put the same variables (except `ADMIN_*`) in Vercel and redeploy.

## Editing tips

- Text on the homepage: Dashboard → Homepage → Visual edit.
- To change a section in code, edit the file in `components/sections/`, then
  run `npm run content:export` so the dashboard's "original content" matches.
  Sections already edited in the dashboard keep the edited version until "Reset".
- The brand colour is `--orange: #db4c23` at the top of `app/(site)/globals.css`.

## Contact form

The form opens the visitor's email app with their answers filled in, sent to
workwithus@digitalvikingz.com.
