# Backlog

What's next, in order. The old app is retired, so database work is open.

- **Before any App Store release: trademark attorney check** on "Collectquity" (renamed
  2026-10-12; domain collectquity.com). Neighbors to show them: SoleSavy's COLLECT (Class 9),
  Collectable, Collecticity. Pair the name with the plain tagline and avoid investment language.
- **App icon redesign (low).** Today's icon is a placeholder gold serif "C" (slightly off-center);
  candidates from the design agent include an "arc C" (nested arcs + gem).
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
