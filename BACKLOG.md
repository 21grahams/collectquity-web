# Backlog

What's next, in order. The old app is retired, so database work is open.

- **Public beta, Pokémon-only (goal: a few weeks out, decided 2026-10-13).** An invite-only
  browser beta at collectquity.com before any App Store release, so testers can try the app and
  shape what comes next. Collections is the fast-follow right after (below). Steps:
  1. ~~Decide on auth~~ **Decided 2026-10-14: stay on Supabase Auth** (no Clerk). Clerk mostly
     adds ready-made screens; Supabase already covers email/password, Google and Apple sign-in
     (web and native Swift) and free two-step login, with no rewrite of the data rules and no
     second vendor. Testers use a regular browser; only the owner uses the home-screen app,
     with email and password. The owner id stays Supabase's uuid.
  2. **Multi-user database.** Every table gets an owner; every rule becomes "you only see your
     own rows". Fix what assumes one user: the single Long Hold, short hold numbering, Summary
     totals, the daily jobs and history, market links. The catalog stays shared. The owner's
     data is assigned to their account (nothing changes for them).
  3. **Accounts:** sign-up with email confirmation, forgot password (none today), delete my
     account, a privacy policy page. Confirm and reset with 6-digit email codes, not links, so
     everything happens inside the app. Send email through Resend (free tier 3,000/month,
     ~100/day) from collectquity.com; Supabase's built-in email only reaches the project team.
     Then **Google sign-in** (free Google login key), so the beta feels like the real product.
     **Apple sign-in** once the owner enrolls in the paid Apple Developer Program ($99/year,
     also needed for the App Store; today the account is the free kind).
  4. **Onboarding** for new users: a few questions and a Pokémon starting setup, landing on a
     blank slate.
  5. **Price-data costs:** the free tiers (JustTCG 100 requests/day and 1,000/month;
     PokemonPriceTracker ~50 graded cards/day) won't cover many users. Products shared between
     users are fetched once, but plan a paid tier or a cap on auto-priced items per user.
  6. **Invite-only access** (invite codes) so the beta's size and costs stay under control.

- **Before any App Store release: trademark attorney check** on "Collectquity" (renamed
  2026-10-12; domain collectquity.com). Neighbors to show them: SoleSavy's COLLECT (Class 9),
  Collectable, Collecticity. Pair the name with the plain tagline and avoid investment language.
- **App icon (low).** Since 2026-10-13 the icon is a gold ring "C" with a padlock ("for now");
  revisit for a final design before any App Store release.
- **Price charts (in a few weeks, once history builds up).** Daily history is recorded since
  2026-10-13 (`item_value_history`, `summary_history` in the backend). Plan: tap a card (singles
  and sealed) to open a detail sheet with a price chart (1W / 1M / 3M / 1Y / All), a dashed
  line at what you paid, and the item's details; on Summary, one chart of total market value vs
  cost over time with Singles / Long Hold / Short Hold / All. No mini charts on list cards
  (clutter, slower lists). Use a chart library that fits MUI (e.g. MUI X Charts). Maybe check
  whether JustTCG offers past prices to backfill (PokemonPriceTracker history costs credits).
- **Edit a completed hold (low priority, database).** Completed holds are read-only in the app
  (their sale is recorded at completion, so editing or removing their items would make Sealed and
  Summary disagree). If a past hold ever needs correcting, add a proper edit for the hold itself:
  sold price, cost and profit, plus its items, updated together. Until then, fixes are a one-off
  database change.
- **Collections (fast-follow after the beta launches; staged).** Goal: a real product for other
  people, beyond Pokémon. Collections live under
  one account (Gmail-style: graham.kirsh@ holds Pokémon, Shoes, Hats); a new email is an
  entirely separate account. Design: the money engine (qty, dates, cost, fees, value, P&L,
  quarters, Summary) stays fixed; each collection defines its own descriptive fields (label,
  type: text/number/date/pick-from-list, order; add/remove like the Tag link), stored as field
  definitions plus a flexible column per item. Autocomplete, search and filters work per field;
  the condition picker becomes a pick-from-list field. Stages: (1) multiple collections for one
  user with custom fields, switcher in the avatar menu (medium-heavy); (2) modules per
  collection: Sealed optional, short/long holds optional within it, Accounts optional
  (medium); (3) templates beyond Pokémon in onboarding (Sneakers, Handbags…). Other users,
  sign-ups and onboarding come first, with the beta above. Meanwhile: keep new backend work
  (e.g. market values) tied to the money engine, not to Pokémon fields.
- **Swift app (later).** Mirrors the web app (old + new features) over the same `api_*`
  functions. Follow Apple's Liquid Glass design (iOS 26+): the standard tab bar, navigation bars
  and sheets get it automatically with the current SDK; use the glass effect for custom pieces
  like the avatar button. Add Face ID to reveal account details (the web app masks them behind a
  tap with no password, since a password would add friction 20–30×/day).

## Parked (only if beta testers ask)

- **Your own item photos.** Catalog art on linked cards (since 2026-10-13) already gives the
  image the owner wanted, so uploads are on hold. Pick back up only if testers ask for photos of
  their own copies (proof of condition, slab labels, unlinked items). Notes: reuse the avatar's
  storage and upload pieces, shrink photos on the phone before upload (free tier is 1 GB), and
  decide what happens to photos when an item is sold or merged.
