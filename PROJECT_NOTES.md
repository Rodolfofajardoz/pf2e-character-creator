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
  proficiencies (Perception, saves, Class DC, weapons, armor, skills), and
  every single `feats1` entry individually re-verified against Archives of
  Nethys (real mechanical text, not just a plausible-sounding paraphrase).
  An earlier pass had a real data-quality problem: a noticeable fraction of
  feat descriptions across many classes were outright fabricated —
  mechanics that sounded right but didn't match the actual feat at all
  (e.g. Monk's Tiger Stance/Wolf Stance/Mountain Stance, Cleric's Harming
  Hands/Healing Hands/Holy Castigation, Champion's Unimpeded Step/Vicious
  Vengeance, Oracle's Foretell Harm/Nudge the Scales, Rogue's and
  Swashbuckler's You're Next, Investigator's Flexible Studies/Takedown
  Expert, and the shared Reach Spell/Widen Spell text reused by 6 classes).
  All of these were caught and rewritten by systematically querying AoN's
  search index (see "AoN scraping notes" below) and comparing every feat
  name against its real text — not just spot-checking. If you add more
  feats1 entries later (e.g. for leveling past 1, phase 4), verify each one
  the same way rather than writing a plausible summary from memory.
- **16 ancestries**: the 8 Core Rulebook ones (Dwarf, Elf, Gnome, Goblin,
  Halfling, Human, Leshy, Orc) plus all 8 Player Core 2 "uncommon" ones
  (Catfolk, Hobgoblin, Kholo, Kobold, Lizardfolk, Ratfolk, Tengu, Tripkee) —
  all with verified ability boosts/flaw, heritages, and 1st-level feats.
  The uncommon 8 also have an `abilities` array in `src/data/ancestries.js`
  for innate ancestry features (bonus unarmed attacks, bonus feats, etc.)
  that aren't a heritage or feat choice — shown in a new "Innate Abilities"
  section in `AncestryStep.jsx` and folded into the Identity card in
  `SummaryStep.jsx`. The original 8 didn't need this field.
- **35 general backgrounds** — verified one-by-one against Archives of
  Nethys (name, boost choice, skill, Lore, and the real skill feat).
- **Equipment**: 47 weapons (17 simple + 30 martial), 13 armors, and 29
  adventuring gear items, all with prices/categories re-verified against AoN
  (`src/data/equipment.js`). This pass caught two pre-existing data bugs:
  **Shortbow was miscategorized as Simple** (it's Martial) and the toolkits
  were named "Tools" instead of the correct "Toolkit" (prices were already
  right on both). `formatGold()` was also fixed to render gp+sp combos
  (e.g. 1.5 → "1 gp, 5 sp") instead of a raw decimal.
- **84 general feats** (`src/data/generalFeats.js`, level 1 only, verified
  against AoN) with a picker wired into `AncestryStep.jsx` for the two
  1st-level spots that grant a free choice of general feat: Human's
  "Versatile Heritage" heritage and "General Training" ancestry feat (both
  flagged `grantsGeneralFeat: true` in the data). Turned out no skill-feat
  catalog was needed — every "skill feat" grant already in the data names a
  specific feat, there's no open player choice among them at level 1.
- A working ability-boost calculator (ancestry → background → class → 4 free
  boosts, remaster rules) and a final character sheet with computed HP, AC,
  Perception, saves, Class DC, and skill modifiers.
- A **Print / Save as PDF** button on the summary screen (uses the browser's
  native print dialog — pick "Save as PDF" as the destination).
- **Human's "Natural Ambition" ancestry feat is wired up** (was the loose
  end from the general-feats pass). Since Ancestry comes before Class in the
  wizard, this "bonus 1st-level class feat" pick is deferred to `ClassStep`
  — a `grantsClassFeat: true` flag on the feat data triggers a second class
  feat picker there once a class (and its `feats1`) is known, stored as
  `character.bonusClassFeat`.
- **Full correctness audit pass** (bonus math + full-flow retesting) found
  and fixed 4 real bugs, none of which were in the "known gaps" list:
  1. **AC used Trained proficiency for *any* worn armor**, even armor
     outside the class's actual proficiency (e.g. a Wizard in Full Plate
     showed AC as if trained). Added `armorProficiency: [...]` per class in
     `classes.js` (Cleric defaults to the Cloistered baseline — doctrine
     isn't modeled) and `SummaryStep.jsx` now uses Untrained (bonus 0) for
     out-of-category armor, with an inline "(untrained in this armor...)"
     note so it's not silently wrong.
  2. **Fighter's guaranteed "Acrobatics or Athletics" skill was never
     enforced** — it was folded into the free skill-pool *count* with no
     requirement that the player actually pick one of those two, so it
     could be skipped entirely. Gave Fighter a dedicated
     `fixedSkillChoiceOptions: ['acrobatics','athletics']` array and a
     required picker in `ClassStep` (mirrors how background skill choices
     already work), validated before advancing. Sorcerer/Witch keep the old
     "abstract bonus, no specific skills" behavior since their choice
     depends on bloodline/patron, which isn't modeled.
  3. **The Skills step had no validation at all** — `App.jsx`'s
     `canGoNext` fell through to `default: true` for it, so you could reach
     Summary with unfilled trained-skill slots. Added a real check
     (`trainedSkills.length === poolSize`, via a new shared
     `getSkillPoolSize()` helper in `data/skills.js` used by both
     `SkillsStep` and `App.jsx`).
  4. **Weapon/armor selection ignored the 15 gp budget entirely** — only
     the generic "Adventuring Gear" list checked `remaining >= price`;
     picking an expensive weapon *and* expensive armor could blow well past
     15 gp with no warning (and `formatGold` would render the negative
     remainder as nonsense like "-200 cp"). `EquipmentStep.jsx` now disables
     any weapon/armor option that would exceed the budget once the other
     two categories' costs are accounted for.
  All other computed values (HP, ability-boost order/18+ rule, Perception,
  saving throws, Class DC, skill modifiers, proficiency-bonus formula) were
  checked against the remaster rules and are correct as originally written.
- **"Inspect" mode** (press **T**, or click the toggle in the header —
  modeled on Baldur's Gate 3's Inspect): while active, rules jargon in
  feat/heritage/ancestry/skill text becomes clickable and opens a popover
  with a plain-English definition. Definitions can reference further terms,
  which stack additional popovers (closed individually, with Escape, or by
  toggling Inspect off). New files: `src/data/glossary.js` (~55 terms:
  proficiency ranks, bonus types, defenses, conditions, feat categories, and
  all 16 skills), `src/utils/glossaryTokenizer.js` (splits text into
  term/non-term chunks via a longest-match-first regex), and
  `src/context/InspectContext.jsx` (the mode toggle, popover stack state,
  and the `<InspectText>` / `<GlossaryTerm>` / `<InspectToggle>` /
  `<InspectPopovers>` components). Matching is **case-sensitive on
  purpose** — glossary `term` strings must be capitalized exactly as they
  should appear in source text, which avoids false positives like the
  common word "will" matching the Will save, or "hidden" in "hidden traps"
  matching the Hidden condition. `GlossaryTerm` renders as a `<span
  role="button">`, not a real `<button>`, specifically because these get
  embedded inside description text that's often already inside a clickable
  `option-card` `<button>` — nesting real buttons is invalid HTML and
  browsers mangle it.
- **Committed dark theme**, inspired by a D&D Beyond character sheet's
  layout: near-black page background (`--bg`), cards
  filled with a lighter solid panel color (`--panel-bg` /
  `--panel-bg-raised` for selected/raised state) instead of just a border on
  transparent, and near-white body/heading text. Previously the app followed
  `prefers-color-scheme` and had no light-mode-only fallback worth keeping,
  so `index.css` now sets the dark palette directly on `:root` rather than
  behind a media query. Glossary terms (Inspect Mode) got their own
  `--inspect` yellow (`#ffd60a`), deliberately distinct from the app's
  purple `--accent`, so "this is clickable" reads clearly against the new
  panel backgrounds. The print stylesheet (`@media print`) still forces
  white/black regardless of theme — verify sheet-card/ability-box/prof-grid
  print rules stay in sync if you add new panel-styled components.

## Data sources (so you know what's authoritative vs. approximate)

- `Pathfinder 2nd Edition - Core Rulebook-cropped.pdf` (a print copy,
  **pre-remaster** 2019 edition) — used for Bard, Cleric, Druid, Fighter,
  Ranger, Rogue, Wizard, the 6 core ancestries' heritages/feats, backgrounds
  chapter, and the weapon/armor/gear price tables.
- `Pathfinder 2e - Player Core 2.pdf` (a print copy, **remastered**) — used
  for Alchemist, Barbarian, Champion, Investigator, Monk, Oracle, Sorcerer,
  Swashbuckler (exact remaster text).
- Archives of Nethys (`https://2e.aonprd.com`) — used to verify remaster-only
  facts not in the above two books: exact ability boosts/flaws for the 6 core
  ancestries (confirmed flaws were **not** removed in the remaster — only
  terminology shifted from "ability" to "attribute"), Leshy/Orc
  heritages+ancestry boosts, the Witch class's proficiencies, and all 35
  backgrounds' exact skill/Lore/feat text.
- **The Witch class has no owned source** — it's only in Player Core, not
  covered by either print copy above. Fully verified via AoN instead: its
  proficiencies were already correct, and its `feats1` turned out to need no
  placeholder data at all — per AoN (Player Core pg. 178), the Witch is one
  of the few classes that grants **no class feat at 1st level** (its first
  witch feat comes at 2nd level, alongside patron/familiar/hexes already
  covering 1st level). `feats1` is now `[]`, and `App.jsx`/`ClassStep.jsx`/
  `SummaryStep.jsx` were updated to treat an empty `feats1` as valid instead
  of blocking progression or showing `undefined — undefined`.

### AoN scraping notes (useful if you continue verifying data)

- **Best method by far: query AoN's own Elasticsearch index directly**, from
  a `javascript_tool`/browser-console `fetch()` call while any `2e.aonprd.com`
  page is open (same-origin, no CORS issues). This is what actually worked
  for pulling all 8 uncommon ancestries' full mechanics + heritages + 1st-
  level feats in a handful of calls — **don't bother with the listing-page
  scraping tricks below first**, try this.
  ```js
  const res = await fetch('https://elasticsearch.aonprd.com/aon/_search?stats=searchbar', {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      query: { bool: { must: [
        { term: { category: 'feat' } },        // or 'ancestry', 'heritage', 'class', 'weapon', 'armor', 'equipment', etc.
        { match_phrase: { trait: 'Catfolk' } }, // trait/name/text support match_phrase; exact fields use term
        { term: { level: 1 } },
        { match_phrase: { primary_source: 'Player Core 2' } }, // filters out legacy/pre-remaster duplicates
      ] } },
      _source: ['name', 'text', 'level', 'source'], // trim the payload; omit for everything
      size: 30,
    }),
  });
  const data = await res.json();
  data.hits.hits.map(h => h._source);
  ```
  Useful fields seen on docs: `category`, `name`, `text` (plain-text rules
  text, ready to trim into a `desc`), `level`, `primary_source` (use this to
  pick the remaster version over `source: "Advanced Player's Guide"` /
  `"Ancestry Guide"` legacy duplicates — legacy docs have a `remaster_id`
  pointing at the current one), `trait` (array, used for ancestry-restricted
  feats), `hp`/`attribute`/`attribute_flaw`/`speed_raw` (on `ancestry` docs).
  Heritage docs have **no field linking them to their ancestry** — filter by
  `wildcard: {'name.keyword': '* <Noun>'}` instead (e.g. `'* Catfolk'`, but
  Ratfolk heritages are named `'* Rat'`, not `'* Ratfolk'` — check the actual
  names first with a broader query if a count looks low).
- AoN's own **search/listing pages** (`Feats.aspx?Traits=X`, `Backgrounds.aspx`
  with no ID, `Weapons.aspx`, etc.) get stuck forever on "Loading Deck" in
  the browser console (an Elm app) and render an empty results shell —
  true even with a real JS-executing browser tool, not just plain
  fetch/WebFetch. **Don't waste time on these**; query Elasticsearch instead.
- **Individual item detail pages** (`Ancestries.aspx?ID=N`,
  `Backgrounds.aspx?ID=N`, `Classes.aspx?ID=N`, `Heritages.aspx?Ancestry=N`,
  `Feats.aspx?ID=N`) render fully server-side and work great with a real
  browser tool — useful for spot-checking a single item, or when you don't
  yet know the right Elasticsearch field to filter on.
- Fastest extraction pattern for a detail page: navigate to it, then run
  this via a JS-eval tool to strip the nav boilerplate:
  ```js
  document.body.innerText.slice(
    document.body.innerText.indexOf('Legacy version here.'),
    document.body.innerText.indexOf('Site Owner:')
  ).trim()
  ```
- **Don't filter out feats with an `archetype` field to find "real" class
  feats** — that field means "also selectable via this archetype," not
  "archetype-only." A genuine class feat (e.g. Monk's Crane Stance,
  Alchemist's Blowgun Poisoner) can still carry `archetype: [...]` because
  some archetype (Martial Artist, Poisoner, etc.) happens to grant the same
  feat. Filtering it out just silently drops real results. If you need to
  tell "class feat" apart from "archetype-only feat," there isn't a clean
  field for it — cross-check against the class's own feat list page instead
  (`Classes.aspx?ID=N` → the "___ Feats" link's `Traits=` id), or just
  trust that a feat sharing the class's own trait (e.g. `"Monk"` in
  `trait`) at the right level is legitimate.
- Background IDs run sequentially from 1 (Acolyte) through the 35 general
  backgrounds, then continue into rare ones (gaps exist, e.g. ID 31 was
  "not found"). Ancestry IDs (remaster): Dwarf=59, Elf=60, Gnome=61,
  Goblin=62, Halfling=63, Human=64, Leshy=65, Orc=66, Catfolk=77,
  Hobgoblin=78, Kholo=79, Kobold=80, Lizardfolk=81, Ratfolk=82, Tengu=83,
  Tripkee=84.

## Known gaps / things NOT implemented yet

1. **No leveling past 1** — this is strictly a level-1 builder. (phase 4)
2. **AC Expert+ armor not modeled**: no class/feat in this app's level-1
   data actually grants Expert+ *armor* proficiency (only the Monk's
   Expert *unarmored* proficiency, which is handled), so this doesn't
   currently under-report anything — **nothing to actually fix today**, just
   a reminder: if a future addition (leveling, an archetype) grants it,
   `armorProficiency` in `classes.js` needs an upgrade path beyond the
   current binary trained/untrained (same fix pattern as `unarmoredProficiency`).
3. **Class sub-choices aren't modeled** (Bard Muse, Cleric Doctrine, Druid
   Order, Oracle Mystery, Sorcerer Bloodline, Witch Patron, Wizard Arcane
   School, Champion Cause). This was already true for feats before phase 3
   (several feats already say "Requires the X Order/Cause" with no way to
   actually pick one), and phase 3 hit the same wall harder: whole spells
   are gated behind these (Bard's Composition cantrips need a Muse, Cleric's
   Divine Lance-style doctrine cantrips need a Doctrine, Witch hexes need a
   Patron). The spell catalog (see below) only includes spells with no such
   gate. **On the roadmap as a real feature** — see "Personalization roadmap"
   below — but deliberately deferred rather than silently guessed at.

### Phase 3: Spellcasting selection — done

Added `src/data/spells.js`: 42 cantrips + 93 1st-rank spells, verified
against AoN. Scope: only spells with a `tradition` field in AoN's data (see
above gap #3 for what that excludes) — a class/tradition filter, not a
per-subclass one.

Each of the 8 spellcasting classes was checked individually on its own AoN
class page for its real 1st-level `Cantrips / 1st` spell table row, rather
than assumed uniform — **Sorcerer and Oracle know 3 first-rank spells at
1st level, not 2** like the other five (Bard, Cleric, Druid, Witch,
Wizard all get 5 cantrips + 2 first-rank). Champion is excluded entirely:
it doesn't have a normal spell list at 1st level, just a single devotion
spell from a feat like Deity's Domain (already handled in the Class step).

Each spell also carries `traits`, `source`, `range`, `area`, `target`,
`duration`, and `defense` fields — fetched in two follow-up AoN passes
(the original pass only pulled `name`/`tradition`/`text`/`cast`; small
Node scripts, `node --check`-verified each time, spliced the new fields
into the existing 135-entry file by id rather than hand-editing). Fields
are only set when AoN actually has them (most cantrips have no
`duration`; area spells have no `target`, etc.) — `InfoLine` in
`SpellsStep.jsx` renders whichever are present, comma-separated.

The `.spell-card` UI in `SpellsStep.jsx` is styled after an AoN spell card
screenshot, same structure: a header bar with the name and an action-cost
badge (`actionBadge()` turns `cast` — "Single Action", "Reaction", "1-3
actions", etc. — into a short label, defaulting to "2 Actions" when
unset), a row of trait tag pills, then a body with the source line, the
`InfoLine` (Range/Area/Target/Duration/Defense), a divider, and the
description — using the app's existing gold/navy palette rather than
copying AoN's own colors.

One data-quality check worth noting for future scraping: ~30 of the 135
spells' `primary_source_raw` came back as "Core Rulebook" even under a
`primary_source: 'Player Core'` filter, because that filter uses `match`
(analyzed/fuzzy), and "Core Rulebook" shares the token "core" with "Player
Core." Re-verified with a strict `match_phrase` query that none of those
30 actually have a Player Core reprint — the Core Rulebook sourcing was
correct, not a bug — but the lesson stands: a loose `match` on
`primary_source` can silently pick the wrong sourcebook when both exist,
so treat "Core Rulebook"-sourced results as worth a `match_phrase` sanity
check rather than assuming the filter did its job.

New `SpellsStep.jsx`, inserted as step 4 (right after Class, before Ability
Scores — it only depends on `classId`). For Sorcerer/Witch, whose tradition
depends on an unmodeled Bloodline/Patron, there's a required tradition
picker (`character.spellTradition`) before the spell lists appear. Chosen
cantrips/spells are stored as `character.knownCantrips` /
`character.knownSpells1` (arrays of spell ids), validated in `App.jsx`
against each class's exact known-spell counts. This is a **snapshot, not a
daily-preparation simulator** — matches how the rest of the app treats
1st-level chargen (a decision made explicitly rather than assumed, since
Cleric/Druid/Witch prepared casters technically re-choose from a wider
pool each day in actual play).

### Fixed: background/class skill collision (was gap #3)

If your class and background trained the *same* skill (e.g. Cleric +
Acolyte both train Religion), the summary used to list it twice instead of
applying the real rule: **"if you'd become trained in a skill you're
already trained in, you instead train a different skill of your choice."**

Fixed via `getBackgroundSkillInfo()` in `src/data/skills.js` — since
Background comes before Class in the wizard, the collision can only be
detected once both are known, so it's resolved in `SkillsStep.jsx`: when a
collision exists, a new "Background skill substitute" picker appears
(any skill not already trained), stored as
`character.backgroundSkillSubstitute`. `App.jsx`'s `canGoNext` for the
`skills` step now requires that substitute when applicable, and
`SummaryStep.jsx` uses the same helper so the sheet reflects the
substituted skill instead of the phantom duplicate. Verified live with
Cleric + Acolyte (both train Religion).

## Agreed phase order for continuing

1. ~~Remaining 8 ancestries (Player Core 2)~~ done, ~~verify Witch feats via
   AoN~~ done, ~~full equipment catalog~~ done. **Phase 1 complete.**
2. ~~General & skill feats catalog~~ done (turned out to be general feats
   only — see Known Gaps for the one remaining loose end, "Natural
   Ambition"). **Phase 2 complete.**
3. ~~Spellcasting (spell lists + selection)~~ done — see "Phase 3" above.
   **Phase 3 complete.**
4. Leveling 2–20. **(next up)**

After phase 4, see "Personalization roadmap" (to be added once phase 4 and
a design pass are done) for the larger post-1.0-groundwork feature list:
custom sheet printing, live side-panel preview, multiclass, save/load a
character catalog, language selection, archetypes, familiars, and modeling
the class sub-choices from gap #3 above.

## How to run the dev server

```bash
cd pf2e-character-creator
npm install   # first time only, or after pulling dependency changes
npm run dev
```

On Windows, if `npm` fails with a PowerShell script-execution-policy error,
use `npm.cmd` instead, or run once: `Set-ExecutionPolicy -Scope CurrentUser
RemoteSigned`.

Then open the printed `http://localhost:5173/` URL in a browser.

## Continuing from a different device

The project lives on GitHub — clone it, install, and run:

```bash
git clone https://github.com/Rodolfofajardoz/pf2e-character-creator.git
cd pf2e-character-creator
npm install
npm run dev
```

**Node.js must be installed** on the device (any recent LTS version; this
project was built and tested with Node v24 and npm v11). Point a new
session at this file (`PROJECT_NOTES.md`) to pick up full context — it
doesn't need the original source PDFs again unless extracting *new* data
(everything verified so far is already baked into `src/data/*.js`). Further
verification can rely on Archives of Nethys alone, using the technique
below.
