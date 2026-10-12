# Collectquity web — notes for Claude

The Collectquity frontend (formerly PullSheet, renamed 2026-10-12): a single-user Pokémon
collection and P&L tracker, used mostly as an iPhone home-screen app, plus desktop. Live at
https://collectquity.com (GitHub Pages, custom domain via Porkbun DNS). The visible name and
tagline live only in `src/lib/brand.ts`. It reached parity with the original app
(`21grahams/pullsheet`, now archived) and replaced it on 2026-10-07; the old app was retired on
2026-10-11. New work comes from `BACKLOG.md`.

The backend lives in `21grahams/collectquity-backend` (private, `~/collectquity/backend`). Its `api_*`
Postgres functions are this app's entire API.

## Stack and commands

Vite, React 19, TypeScript (strict), MUI, TanStack Query, supabase-js, react-router
(HashRouter), vite-plugin-pwa, Vitest + Testing Library, oxlint, Prettier. Node is pinned in
`.nvmrc` (use `nvm use`).

```sh
npm run dev         # local dev server (needs .env.local; copy .env.example)
npm run check       # lint + format check + typecheck + tests; CI runs this before deploying
npm run build
npm run gen:types   # regenerate src/types/database.ts after backend changes
```

Pushing to `main` deploys via GitHub Actions (`.github/workflows/deploy.yml`) only if
`npm run check` passes. Settings → About shows the build version (commit SHA); **check it on
each device before testing a change**, because an open page can run cached old code until it
reloads.

## Structure and conventions

- `src/api/`: the only place that calls Supabase. Typed wrappers around `api_*` RPCs.
- `src/hooks/`: one TanStack Query hook per query/mutation.
- `src/features/{auth,singles,sealed,summary,accounts}/`: screens.
- `src/lib/`: pure, unit-tested helpers (money/date formatting, per-card math).
- `src/theme/`: the design tokens (originally the old app's `:root`), plus the MUI theme.

Rules:

- Market values from the API are **per unit**; multiply by quantity for totals. Generated types
  claim nullable values are numbers, so declare them `number | null` in `api/`.
- Never compute quarters or "today" from the device clock; use `api_get_context`.
- Every write sends a `requestId` generated **once per user action** and reused on retry.
  No optimistic updates (it's money data): refetch after success.
- Mutations fail fast offline (`networkMode: 'always'`). Never queue writes.
- Logout uses `signOut({ scope: 'local' })`, so other devices stay logged in.
- No magic links or OAuth redirects (iOS home-screen apps have separate storage), and
  `detectSessionInUrl: false`.
- Inputs at least 16px (iOS zoom). Bottom sheets: a shared bottom-anchored Drawer.
- Only the Supabase URL and **publishable** key ship in the bundle (they're public by design).
  Never a secret/service-role key.

## Working agreements (important)

- **Show code/diffs before committing**, even locally. **Ask before every push.**
- Desktop and iPhone both matter; say when something needs a real-device check.
- Small, reviewable steps.
- **Imports:** type imports first, then third-party, then ours, with a blank line between sections.
  Prettier sorts them automatically (`npm run format`); CI fails if they're out of order.
- **A blank line before `return`** when other statements come before it in the block (early
  `if (…) return` one-liners excepted). Not enforced by a tool; follow it by hand.
- **Minimal comments.** Only add one when the code would mislead without it (a non-obvious
  "why"). No comments that just describe what the code does.

## Status

- All phases done: live since 2026-10-07; the old app, its adapter and `legacy_*` were retired
  on 2026-10-11. Next: the backlog (merge duplicate sealed cards, the condition rule, the rename).
- The app will be renamed later. Keep new identifiers name-neutral where cheap.
