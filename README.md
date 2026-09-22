# Favourites Home

A quiet, fast browser homepage for the websites you use every day. Favourites Home uses **Supabase Auth + PostgreSQL** for cross-device cloud synchronization and is deployable as a static Vite application on Vercel.

> The WebDev environment provides a React/Vite scaffold rather than Next.js. The runtime architecture is intentionally lightweight and keeps Supabase’s official browser client, OAuth session persistence, and RLS intact. Vercel serves the built static output directly.

## What is included

- Google OAuth through Supabase Auth, with persistent sessions and logout.
- Cloud CRUD for favourites, optimistic add/edit/delete, and persisted drag-and-drop ordering.
- Automatic favicon lookup from each website domain with initials fallback.
- Category filtering, configurable Google/DuckDuckGo/Bing search, and `/` keyboard focus shortcut.
- Same-tab or new-tab links.
- System, light, and dark themes with local preference persistence.
- Responsive mobile-first layout, loading skeleton, empty state, connection-friendly errors, and setup guidance.
- `supabase.sql` with the complete table, index, timestamp trigger, and four RLS policies.

## Run locally

```bash
pnpm install
cp env.example .env.local
pnpm dev
```

Open the URL printed by Vite. Without Supabase variables, the app displays a clearly labelled preview mode with sample cards and local in-memory interactions. No `favourites.json` file, File System Access API, local server, or manual import is used.

## Supabase database setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**.
3. Paste the complete contents of [`supabase.sql`](./supabase.sql) and run it.
4. Confirm in **Table Editor** that `public.favourites` exists and in **Authentication → Policies** that RLS is enabled.

The browser only uses the public anonymous key. Never put a `service_role` key in this project or in Vercel environment variables.

## Configure Google OAuth

1. In Supabase, open **Authentication → Providers → Google** and enable Google.
2. In Google Cloud Console, create or select a project, configure the OAuth consent screen, and create an OAuth client of type **Web application**.
3. In the Google client’s **Authorized redirect URIs**, add the Supabase callback URL shown in the Supabase Google provider panel. Its standard format is:

   `https://<project-ref>.supabase.co/auth/v1/callback`

4. Copy the Google client ID and secret into the Supabase Google provider settings and save.
5. In **Authentication → URL Configuration**, set the **Site URL** to your production Vercel URL, for example `https://your-project.vercel.app`. Add local development to **Redirect URLs**, usually `http://localhost:3000` (or the port printed by Vite).
6. After deployment, make sure both the local URL and the exact production URL are present in Supabase’s allowed redirect URLs. The app calls `signInWithOAuth` with the current origin, so the same build works on localhost and Vercel.

## Environment variables

Create `.env.local` locally from `env.example`:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key>
```

Find these values in **Supabase → Project Settings → API**. Use the **Project URL** and the public **anon** key. Do not commit `.env.local`.

For Vercel:

1. Import this repository into Vercel.
2. Set the framework preset to **Vite** if Vercel does not detect it automatically.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Environment Variables** for Production, Preview, and Development as appropriate.
4. Redeploy after changing variables. Vite embeds `VITE_` variables during the build.
5. Update Supabase **Authentication → URL Configuration** with the final `https://YOUR-PROJECT.vercel.app` URL and add it to Google’s authorized JavaScript/redirect configuration where required.

## Build and deploy

```bash
pnpm build
```

The generated `dist/` directory is the Vercel deployment output. Vercel’s default build command can be `pnpm build`, with output directory `dist`.

## Project structure

```text
favourites-home/
├── client/
│   ├── src/
│   │   ├── lib/supabase.ts
│   │   ├── pages/Home.tsx
│   │   ├── types/favourite.ts
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── supabase.sql
├── env.example
├── .gitignore
├── package.json
└── README.md
```

## Security model

The public anon key is safe to expose only because Supabase Row Level Security is the access boundary. Every query is constrained by `auth.uid() = user_id`; users cannot select, insert, update, or delete another user’s rows. Review `supabase.sql` before production use and never disable RLS.
