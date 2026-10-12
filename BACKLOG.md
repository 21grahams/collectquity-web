# Backlog

What's next, in order. The old app is retired, so database work is open.

- **Rename the app** (top priority, but floating: not a blocker for other work; must happen before
  any App Store/Swift release). Still brainstorming; lean broader than Pokémon, since collections
  for other hobbies and other users are a long-term goal (see Collections). Before settling, search
  USPTO for sound-alikes in classes 9, 36 and 42 (Arcula was dropped: too close to the registered
  Arculus crypto-wallet marks). Includes the
  custom domain, GitHub repo names, and tidying the Mac folders at the same time (`~/Pullsheet`
  vs `~/pullsheet-web`): moving the backend folder means updating the nightly backup job's paths,
  the practice setup, and Claude's per-project notes together.
- **Automatic market values (top new feature).** Prices update by themselves, so
  values, P&L, quarters and Summary stay current. Plan: match each item once to a catalog product
  (AI suggests, user confirms), then a daily Supabase scheduled job fetches prices and writes
  normal per-unit price checks; typing a value still overrides. Candidate sources (verify access,
  terms, pricing first): Pokémon TCG API (free; TCGplayer market prices, raw singles) and
  PriceCharting's paid API (graded + sealed). Avoid scraping eBay (sold data is partner-only).
  First step: a small trial with ~10 real items (raw, graded, sealed) to check coverage and
  accuracy per source. A paid "pro" tier only matters if the app goes multi-user/App Store.
- **Catalog autocomplete (right after automatic market values).** Today's autocomplete suggests
  only names you've saved. Once the card catalog is connected for pricing, suggest every card and
  set from it (e.g. "Charizard ex – Obsidian Flames"), so new items match the catalog from the
  start and get prices without a separate matching step.
- **Item photos (nice to have, after the avatar).** Optional photo per card/item: proof of
  condition, telling copies apart, a thumbnail in the list. Reuses the avatar's storage and upload
  pieces; photos are shrunk on the phone before upload (free tier is 1 GB; lists stay fast).
  Decide what happens to photos when an item is sold or merged. Lighter alternative for Singles:
  official card art from a free card database (e.g. Pokémon TCG API) by Pokémon + set, with no
  uploads; set-name matching won't always work, and sealed has no equivalent.
- **Edit a completed hold (low priority, database).** Completed holds are read-only in the app
  (their sale is recorded at completion, so editing or removing their items would make Sealed and
  Summary disagree). If a past hold ever needs correcting, add a proper edit for the hold itself:
  sold price, cost and profit, plus its items, updated together. Until then, fixes are a one-off
  database change.
- **Collections (long-term; staged).** Goal: eventually a real product for other people; for
  now the owner tracks only Pokémon but wants the ability to add more. Collections live under
  one account (Gmail-style: graham.kirsh@ holds Pokémon, Shoes, Hats); a new email is an
  entirely separate account. Design: the money engine (qty, dates, cost, fees, value, P&L,
  quarters, Summary) stays fixed; each collection defines its own descriptive fields (label,
  type: text/number/date/pick-from-list, order; add/remove like the Tag link), stored as field
  definitions plus a flexible column per item. Autocomplete, search and filters work per field;
  the condition picker becomes a pick-from-list field. Stages: (1) multiple collections for one
  user with custom fields, switcher in the avatar menu (medium-heavy); (2) modules per
  collection: Sealed optional, short/long holds optional within it, Accounts optional
  (medium); (3) other users: onboarding questions, templates (Pokémon, Sneakers, Handbags…),
  sign-ups with per-user data isolation, account deletion, privacy policy, App Store (heavy;
  pairs with the rename and Swift). Meanwhile: keep new backend work (e.g. market values) tied to
  the money engine, not to Pokémon fields.
- **Swift app (later).** Mirrors the web app (old + new features) over the same `api_*`
  functions. Follow Apple's Liquid Glass design (iOS 26+): the standard tab bar, navigation bars
  and sheets get it automatically with the current SDK; use the glass effect for custom pieces
  like the avatar button. Add Face ID to reveal account details (the web app masks them behind a
  tap with no password, since a password would add friction 20–30×/day).
