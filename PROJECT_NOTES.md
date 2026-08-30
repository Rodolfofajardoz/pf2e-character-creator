# PF2e Character Creator — Project Notes

Read this first if you're picking this project back up (including on another
device/session). It covers what's done, what's verified, what's still
missing, and how to get the dev server running somewhere new.

## What this is

A React + Vite web app that walks a player through building a **level 1
Pathfinder 2e character** (remastered rules): Ancestry → Background → Class →
Ability Scores → Skills → Equipment → Summary. All text is in English.

## Current status (as of this note)

- **16 classes** (all of Player Core 1 + 2) with verified 1st-level
  proficiencies (Perception, saves, Class DC, weapons, armor, skills) and a
  handful of real 1st-level class feats each.
- **8 ancestries**: Dwarf, Elf, Gnome, Goblin, Halfling, Human, Leshy, Orc —
  with verified ability boosts/flaw, heritages, and 1st-level feats.
- **35 general backgrounds** — verified one-by-one against Archives of
  Nethys (name, boost choice, skill, Lore, and the real skill feat).
- **Equipment**: a curated ~30-item list (12 weapons, 12 armors, 12 gear
  items) with prices verified against the Core Rulebook's equipment tables.
- A working ability-boost calculator (ancestry → background → class → 4 free
  boosts, remaster rules) and a final character sheet with computed HP, AC,
  Perception, saves, Class DC, and skill modifiers.
- A **Print / Save as PDF** button on the summary screen (uses the browser's
  native print dialog — pick "Save as PDF" as the destination).

## Data sources (so you know what's authoritative vs. approximate)

- `Pathfinder 2nd Edition - Core Rulebook-cropped.pdf` (the user's own copy,
  **pre-remaster** 2019 edition) — used for Bard, Cleric, Druid, Fighter,
  Ranger, Rogue, Wizard, the 6 core ancestries' heritages/feats, backgrounds
  chapter, and the weapon/armor/gear price tables.
- `Pathfinder 2e - Player Core 2.pdf` (the user's own copy, **remastered**) —
  used for Alchemist, Barbarian, Champion, Investigator, Monk, Oracle,
  Sorcerer, Swashbuckler (exact remaster text).
- Archives of Nethys (`https://2e.aonprd.com`) — used to verify remaster-only
  facts not in the above two books: exact ability boosts/flaws for the 6 core
  ancestries (confirmed flaws were **not** removed in the remaster — only
  terminology shifted from "ability" to "attribute"), Leshy/Orc
  heritages+ancestry boosts, the Witch class's proficiencies, and all 35
  backgrounds' exact skill/Lore/feat text.
- **The Witch class has no source at all** — it's only in Player Core 1,
  which the user doesn't have. Its proficiencies *are* verified (via AoN),
  but its four 1st-level feat names are made up placeholders, clearly marked
  `unverifiedFeats: true` in `src/data/classes.js` (shows a ⚠ warning in the
  UI).

### AoN scraping notes (useful if you continue verifying data)

- AoN's **search/listing pages** (`Feats.aspx?Traits=X`, `Backgrounds.aspx`
  with no ID, `Weapons.aspx`, etc.) render an empty results shell when
  fetched programmatically — the actual list is populated by JS that doesn't
  run for a plain fetch/WebFetch call. **Don't waste time on these.**
- **Individual item detail pages** (`Ancestries.aspx?ID=N`,
  `Backgrounds.aspx?ID=N`, `Classes.aspx?ID=N`, `Heritages.aspx?Ancestry=N`)
  render fully server-side and work great with a real browser tool.
- Fastest extraction pattern found: navigate to the page, then run this in
  the page via a JS-eval tool to strip the nav boilerplate:
  ```js
  document.body.innerText.slice(
    document.body.innerText.indexOf('Legacy version here.'),
    document.body.innerText.indexOf('Site Owner:')
  ).trim()
  ```
- Background IDs run sequentially from 1 (Acolyte) through the 35 general
  backgrounds, then continue into rare ones (gaps exist, e.g. ID 31 was
  "not found"). Ancestry IDs: Dwarf=59, Elf=60, Gnome=61, Goblin=62,
  Halfling=63, Human=64, Leshy=65, Orc=66 (see the full list captured
  earlier in this project's chat history if you need uncommon ancestries).

## Known gaps / things NOT implemented yet

1. **General & skill feats catalog** — doesn't exist. This means ancestry
   heritages/feats that grant a general feat (e.g. Human's "Versatile
   Heritage") don't actually let you pick one; the app just shows the text.
2. **Spellcasting selection** — no spell lists, no picking known/prepared
   spells for casters. The summary shows *that* a class casts spells and
   from which tradition, but not *which* spells.
3. **No leveling past 1** — this is strictly a level-1 builder.
4. **8 ancestries missing** from Player Core 2's "uncommon" list: Catfolk,
   Hobgoblin, Kholo, Kobold, Lizardfolk, Ratfolk, Tengu, Tripkee. (Data is in
   the user's Player Core 2 PDF, just not extracted yet.)
5. **Minor display quirk**: if your class and background both train the same
   skill, the summary lists that skill twice instead of applying the real
   rule (train a *different* skill of your choice instead). Not fixed yet.
6. **AC approximation**: `SummaryStep.jsx` assumes Trained armor proficiency
   for everyone except the Monk (hardcoded `unarmoredProficiency: 'expert'`
   flag). If a future class/feat grants Expert+ armor at level 1, this will
   under-report AC — same fix pattern as the Monk one.

## Agreed phase order for continuing (per user's earlier decision)

1. Remaining 8 ancestries (Player Core 2) + full equipment catalog + verify
   Witch feats via AoN.
2. General & skill feats catalog.
3. Spellcasting (spell lists + selection).
4. Leveling 2–20.

## How to run the dev server

```powershell
cd "C:\Users\Rodol\Documents\dnd\Campaña – El Juicio del Tejido\pf2e-character-creator"
npm.cmd run dev
```

(`npm.cmd` instead of `npm` sidesteps a PowerShell script-execution-policy
error some Windows setups have. Alternative permanent fix, run once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.)

Then open the printed `http://localhost:5173/` URL in a browser.

## Continuing from a different device

This folder lives inside the Obsidian vault
`Campaña – El Juicio del Tejido`, so:

- **If that vault already syncs to your other PC** (OneDrive, iCloud, Google
  Drive, Obsidian Sync, Syncthing, etc.), this whole project will show up
  there too once sync finishes — `node_modules` is a few hundred MB of tiny
  files though, so it may sync slowly or you may want to exclude it from
  sync and just reinstall (see below). Everything else (`src/`, this file,
  configs) is small and safe to sync.
- **If it doesn't sync automatically**, copy the `pf2e-character-creator`
  folder to the other machine via a USB drive or cloud folder — but skip
  `node_modules` (it's regenerated by `npm install` and doesn't need to
  travel; copying it can even break things across different OSes/CPU
  architectures).
- Either way, on the new device run `npm install` once before `npm run dev`
  — that rebuilds `node_modules` from `package-lock.json`, so you get the
  exact same dependency versions.
- **Node.js must be installed** on the new device (any recent LTS version;
  this project was built and tested with Node v24 and npm v11).
- When you open a new Claude Code session on the other device, point it at
  this file (`PROJECT_NOTES.md`) and the `pf2e-character-creator` folder —
  it doesn't need the original PDFs again unless you're extracting *new*
  data (the ancestries/classes/backgrounds already done are baked into
  `src/data/*.js`). If you do want to verify more data, the source PDFs are
  in this machine's `Downloads` folder and would need to travel too, or you
  can rely on Archives of Nethys alone using the technique above.
