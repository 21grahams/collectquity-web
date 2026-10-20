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
  2. ~~Multi-user database~~ **Done 2026-10-14.** Every row has an owner and users see only their
     own (the app_users list still gates access); one Long Hold and short hold numbering per user;
     the daily snapshot is per user. Each user has a time zone (default Denver) for "today" and
     quarters; setting it from the browser at sign-up comes with steps 3–4.
  3. **Accounts:** sign-up with email confirmation, forgot password (none today), delete my
     account, a privacy policy page. Confirm and reset with 6-digit email codes, not links, so
     everything happens inside the app. Send email through Resend (free tier 3,000/month,
     ~100/day) from collectquity.com; Supabase's built-in email only reaches the project team.
     **Google sign-in** done 2026-10-14 (hidden in the home-screen app; Google's screen names the
     supabase.co address until a paid custom auth domain).
     **Apple sign-in** once the owner enrolls in the paid Apple Developer Program ($99/year,
     also needed for the App Store; today the account is the free kind).
  4. ~~Onboarding and sections per user~~ **Done 2026-10-15.** Most people track two things, not the owner's three:
     singles or sealed (or both), with no short/long split, and no retailer accounts. So each
     user gets on/off settings: Singles, Sealed, "split sealed into short and long holds", and
     Accounts. Onboarding asks (keep it short):
     1. What do you collect? Pokémon (only choice), with Shoes, Coins… greyed out as "coming in
        Beta V2".
     2. What do you track? Singles, Sealed, or both.
     3. Only if Sealed: split sealed into short-term flips and long-term holds? No (default) / Yes.

     Accounts stays out of onboarding (off by default, a Settings switch). Without the split, all
     sealed lives in the user's Long Hold but the screen just says "Sealed" (no Move, Short Hold
     or Complete Hold). Summary shows only the tracked sections. Everything can be changed later
     in Settings; turning a section off hides it, never deletes data. The owner's account gets
     everything on. New users land on a blank slate. Later collections (shoes…) reuse this with
     one product list plus Summary.

  5. ~~Price-data costs~~ **Done 2026-10-14.** Per-user limits (2,000 singles, 1,000 sealed, 500
     auto-priced items; only items still in the collection count). The daily job looks each
     product up once for everyone who owns it, stays inside the free plans (9 JustTCG requests and
     45 graded lookups a run), serves whoever waited longest first, saves as it goes and runs in
     the background. Revisit plans and limits at App Store time.
  6. ~~Invite-only access~~ **Done 2026-10-16.** 8 one-use codes created (one per friend, name in
     the code's note); more can be added the same way.

- **Desktop layout (next).** On big screens the app is a 900px column with wide empty sides.
  Use the width, e.g. two columns of cards. (Tried lining the header up with the column on
  2026-10-16; it made the empty space more obvious, so the full-width header stays.) Also on big
  screens: show sheets (Add, Edit, Sell, Filter…) as centered dialogs instead of a 600px panel
  attached to the bottom; phones keep the full-width bottom sheet. Keep refining the Add/Edit
  form there too: it still feels busy (2026-10-16 it got name and set full width, date + qty on
  one row, and fees / tag behind "+ More"). Next up while price history builds and beta testers
  try the app.

- ~~Google's own sign-in button~~ **Done 2026-10-15** (Google now says "to continue to Collectquity"). Today Google's
  screen says "to continue to zjtiggbmkrouceaqgfdw.supabase.co" because sign-in returns through
  Supabase's address. Use Google's official button (Google Identity Services, ID token passed to
  Supabase's signInWithIdToken with a nonce) so it says collectquity.com. Free; the button uses
  Google's own design (dark style). The paid alternative (Supabase custom domain, about $35/month
  with Pro) waits until the App Store.
- ~~Light mode~~ **Done 2026-10-15** (follows the phone; sun/moon button in the header). The app is dark-only today; add a light theme and a
  switch (follow the phone's setting by default). The design tokens in `src/theme/tokens.ts` make
  this mostly a second set of colors.
- **Backups for a multi-user app.** Weekly backups go to the owner's Mac (`backups/`; newest 12 kept,
  none older than 90 days), so beta users' data sits on a laptop (fine with FileVault on). Encrypt
  the backup files and move them to a private cloud location; at public launch, decide whether
  Supabase Pro's daily backups ($25/month) replace ours. The privacy page promises backups are gone
  within ~3 months.
- **Before any App Store release: trademark attorney check** on "Collectquity" (renamed
  2026-10-12; domain collectquity.com). Neighbors to show them: SoleSavy's COLLECT (Class 9),
  Collectable, Collecticity. Pair the name with the plain tagline and avoid investment language.
- **Set field as a second way to pick (later).** With a Pokémon filled in, typing in Set could
  search the catalog for that Pokémon in that set ("Charizard" + "Base" → Base Set Charizard) and
  link it, instead of only suggesting set names you've used before.
- ~~"Last opened" per user~~ **Done 2026-10-19** with an owner-only Admin page (account menu):
  invites used, who opened the app this week, join dates, counts, and creating invite codes.
- **Clean up abandoned sign-ups (later).** A weekly job deleting logins that never confirmed their
  email (the 6-digit code) after ~7 days, so we don't keep addresses of people who never finished
  signing up. Storage isn't the reason (each is ~1–2 KB). Only ever touch never-confirmed logins
  that never joined: anyone who confirmed, signed in with Google, or redeemed an invite stays,
  however long they go between visits. Mention it in the privacy policy.
- **Instant exact prices (later, "Option A").** Since 2026-10-19 a linked item gets TCGplayer's
  market price (roughly Near Mint) right away and the exact price for its condition or grade the
  next morning. Later: look up the exact price the moment an item is added (a second or two
  after the estimate), sharing results between users and batching bulk adds. Needs paid data
  plans (PokemonPriceTracker Business $99/month for commercial use; JustTCG plans unknown); do it
  when the beta shows weekly use, or at App Store time.
- **Confirm commercial terms for every price source** (TCGCSV, JustTCG, PokemonPriceTracker)
  before charging money or talking to a buyer; free tiers are fine for the beta.
- **Make the web repo private (soon).** `collectquity-web` is public, so anyone can read the
  whole frontend. GitHub Pages from a private repo needs GitHub Pro (about $4/month).
- **CSV export.** Download your collection and sales as a spreadsheet: data you can take with you,
  handy at tax time, and something buyers like to see. Cheap to build.
- **Wishlist.** Items you want but don't own yet; works for any collection type. Later: tell me
  when one drops below a price.
- **Tax report (later).** A yearly realized-profit report built on the export, once people are
  actually selling.
- **Account menu keyboard access (low).** Since 2026-10-15 the photo actions sit in the menu's
  header (avatar + "Change photo · Remove" links), which arrow-key menu navigation skips. Fine
  for touch and mouse; make them keyboard-reachable if desktop keyboard use matters.
- **App icon (low).** Since 2026-10-13 the icon is a gold ring "C" with a padlock ("for now");
  revisit for a final design before any App Store release.
- **Price charts (in a few weeks, once history builds up).** Daily history is recorded since
  2026-10-13 (`item_value_history`, `summary_history` in the backend). Plan: tap a card (singles
  and sealed) to open a detail sheet with a price chart (1W / 1M / 3M / 1Y / All), a dashed
  line at what you paid, and the item's details; on Summary, one chart of total market value vs
  cost over time with Singles / Long Hold / Short Hold / All. No mini charts on list cards
  (clutter, slower lists). Use a chart library that fits MUI (e.g. MUI X Charts). Maybe check
  whether JustTCG offers past prices to backfill (PokemonPriceTracker history costs credits).
  **Part b (owner, important):** expanding a card should also spotlight the market value and its
  price history, since the auto-updating value is the app's standout. Also add a small "▲ $4
  today" daily change under each card's market value (daily history makes this possible). Cards
  already show the market value bold and larger, with a blue dot when it auto-updated today.
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

- **Card scanner.** Every collector app has one, but it's hard to build well and a likely buyer
  (e.g. Collectr) already has one; our edge is the money tracking. Set completion and binders are
  skipped on purpose: they don't fit a money-first, any-collection app (decided 2026-10-18).

- **Your own item photos.** Catalog art on linked cards (since 2026-10-13) already gives the
  image the owner wanted, so uploads are on hold. Pick back up only if testers ask for photos of
  their own copies (proof of condition, slab labels, unlinked items). Notes: reuse the avatar's
  storage and upload pieces, shrink photos on the phone before upload (free tier is 1 GB), and
  decide what happens to photos when an item is sold or merged.
