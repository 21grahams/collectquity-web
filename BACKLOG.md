# After-parity backlog

Ideas agreed for **after** the new app matches the old one (parity first). Not scheduled yet.

- **Backend comment cleanup.** Frontend done (2026-10-06). After cutover, as part of retiring
  `legacy_*`, trim backend comments to non-obvious "why" notes (never edit applied migrations;
  do it in the retirement migration, scripts and README).
- **One card per sealed product per hold (first after cutover).** Adding or moving a product
  into a hold that already has it (same name, ignoring case and spaces) merges into that card:
  quantity, cost and PAS fees add up; the existing card's quarter values are kept; the earliest
  purchase date wins; the absorbed row is soft-deleted so sales history still links. Edit blocks
  a rename that would create a duplicate ("Already in this hold — use Add to increase qty").
  Change lives in the database functions; check production for existing duplicates first.
- **Enforce valid conditions in the database.** After cutover (when the old app's free-text name
  field can no longer write), add a database rule matching the app's: NM/LP/MP/HP/DMG, or
  PSA/BGS/CGC/SGC/TAG with a grade from 1 to 10 in half steps.
- **Rename the app** (right after the quick fixes; before new features and any App Store/Swift
  release). Name idea: "Pulled", but lean broader than Pokémon, since collections for other
  hobbies and other users are a long-term goal (see Collections). Includes the
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
- **Profile avatar (higher priority).** Your own image on your profile, even with a single
  profile: nicer UI. Needs a Supabase Storage bucket for the image (small backend addition that
  doesn't touch tables the old app uses) plus an upload/crop step. It lives in the avatar menu
  ("Change photo") and replaces the initial in the top-right circle.
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
