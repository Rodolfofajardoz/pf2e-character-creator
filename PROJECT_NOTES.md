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

1. **No leveling past 1** — this is strictly a level-1 builder. See
   [ROADMAP.md](./ROADMAP.md) item 5.
2. **AC Expert+ armor not modeled**: no class/feat in this app's level-1
   data actually grants Expert+ *armor* proficiency (only the Monk's
   Expert *unarmored* proficiency, which is handled), so this doesn't
   currently under-report anything — **nothing to actually fix today**, just
   a reminder: if a future addition (leveling, an archetype) grants it,
   `armorProficiency` in `classes.js` needs an upgrade path beyond the
   current binary trained/untrained (same fix pattern as `unarmoredProficiency`).
   Folded into leveling, not a separate fix — see ROADMAP.md's closing note.
3. **Class sub-choices aren't modeled** (Bard Muse, Cleric Doctrine, Druid
   Order, Oracle Mystery, Sorcerer Bloodline, Witch Patron, Wizard Arcane
   School, Champion Cause). This was already true for feats before phase 3
   (several feats already say "Requires the X Order/Cause" with no way to
   actually pick one), and phase 3 hit the same wall harder: whole spells
   are gated behind these (Bard's Composition cantrips need a Muse, Cleric's
   Divine Lance-style doctrine cantrips need a Doctrine, Witch hexes need a
   Patron). The spell catalog (see below) only includes spells with no such
   gate. **First item on [ROADMAP.md](./ROADMAP.md)** — deliberately
   deferred rather than silently guessed at.

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

**`desc` holds the complete, unabridged spell text, not a summary** — this
was a deliberate correction after showing a first (summarized) pass to the
user: they want every description usable standalone by a brand-new player,
so nothing gets trimmed for card size regardless of length. Getting there
required a *third* AoN pass (full `text` field, this time re-fetched
since the original fetch that produced the short hand-written descs wasn't
saved anywhere): split on `---` to separate the header block (discarded —
it's redundant with the structured fields) from the main body and any
`Heightened (...)` entries, which became their own `heightened` field so
`SpellCard` can render them as a separate labeled block below a second
divider. Also swept `flat-footed` → `off-guard` across the newly-pulled
text (a few spells are Core Rulebook-only and still had the legacy term).

Given full text made the old tight `.card-grid` (`minmax(220px, ...)`)
unreadable, spell cards now use their own `.spell-grid`
(`minmax(340px, 1fr)`) with real room to breathe. `SpellPicker` (wrapping
`SpellCard`) adds a per-list search box (matches name or description) and
a multi-select trait filter — see "polish round 2" below for how that
filter and the card layout evolved — plus a "Selected: ..." name summary
above the grid so the pick list stays visible while scrolling/filtering.

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

### Spell card polish round 2: multi-select trait filter, fixed card height, readable Heightened tiers

A follow-up pass on the Phase 3 spell cards, after screenshots showed three
concrete problems: only one trait filter could be active at a time, cards
in the same grid row had visibly uneven heights/gaps because height was
driven by description length, and multi-tier `Heightened` text read as one
dense, unbroken paragraph.

- **Trait filter**: replaced the single-select `<select>` (`.spell-trait-filter`,
  now removed) with a `traitFilters` array and `toggleTraitFilter()` in
  `SpellPicker` (`SpellsStep.jsx`), rendered as a row of small toggle chips
  (`.chip.small`) plus a conditional "Clear" chip (`.chip.ghost`). Filtering
  is OR/union across selected traits (`traitFilters.some((t) =>
  s.traits.includes(t))`) — picking Acid and Evocation shows spells with
  *either* trait, not just spells with both, since AoN traits are additive
  tags, not an AND-able taxonomy players would expect.
- **Fixed card height**: `.spell-card` now has a fixed `height: 360px`
  instead of sizing to its content; `.spell-card-body` is `flex: 1;
  min-height: 0; overflow-y: auto`, so long descriptions/Heightened blocks
  scroll internally rather than stretching the card. This keeps the full
  unabridged text (nothing was re-summarized to make it fit) while making
  every card in a `.spell-grid` row line up — the header/trait-tag row
  stays fixed height, only the body scrolls.
- **Heightened tiers**: `SpellCard` already split the raw `heightened`
  string on `/(?=Heightened \()/` into one `<p>` per tier; this round just
  added the missing CSS (`.spell-card-heightened-tier`) — a left border
  tick plus small padding per tier — so each `(3rd)/(5th)/(7th)/...` entry
  reads as a distinct line instead of running together.

### Spell card polish round 3: redundant trait filter, stacked info line, combined selection summary

Three small follow-ups from another screenshot review:

- The trait filter for the Cantrips list always offered a "Cantrip" chip,
  even though every entry in that list already has the Cantrip trait (and
  the 1st-rank list never has it at all) — it could never actually narrow
  anything. `SpellPicker`'s `traitOptions` now deletes `'Cantrip'` from the
  computed set before rendering the chips.
- `InfoLine`'s Range/Area/Target/Duration/Defense fields were comma-joined
  onto one line (`Range touch, Target 1 creature, Defense Fortitude`),
  which read as cluttered once more than one or two fields were present.
  Changed `.spell-card-info` to a `<div>` of one `<p>` per field (flex
  column layout) so each label/value pair gets its own line.
- Added a combined "Spells Selected" section at the bottom of
  `SpellsStep.jsx`, below both pickers, listing chosen cantrips and
  chosen 1st-rank spells together in one place — each `SpellPicker`
  already showed its own per-list "Selected: ..." line, but there was no
  single summary of the full spell selection across both ranks.

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

Phase 4 onward is the full personalization roadmap, now designed and
written up in **[ROADMAP.md](./ROADMAP.md)**, ordered by difficulty
(quickest first): ~~live side-panel preview~~ done (v0.6.0), ~~language
selection~~ done (v0.6.7), ~~custom backgrounds~~ done (v0.6.8), ~~custom
PDF sheet printing~~ done (v0.7.0), a save/load character catalog, class
sub-choices, familiars, multiclass/archetypes, and leveling 2–20 last as
the single largest item. Two items
(familiars, multiclass/archetypes) rank ahead of leveling by size but
actually need it done first — flagged explicitly in the doc rather than
reordered around it. App versioning is being tracked as each item lands
(see the GitHub Releases page); v1.0 lands once every roadmap item is
done.

### Roadmap item 1: Live side-panel preview — done (v0.6.0)

`SummaryStep.jsx`'s derived-stat math (ability scores/mods, HP, AC,
Perception, Class DC, saves) was factored out into a shared
`useComputedCharacter(character)` hook (`src/hooks/`), defensively
guarded so every field comes back `null` instead of throwing when the
ancestry/background/class it depends on hasn't been picked yet — needed
since, unlike `SummaryStep`, the new panel is visible from step 1
onward, when most of `character` is still empty. `LivePreviewPanel.jsx`
consumes that hook and renders next to the current step (`App.jsx`'s new
`.layout-row`) on every step except Summary. Below a 900px viewport it
collapses into a `Preview ▸` toggle instead of a fixed side column.

### Patch: v0.6.1 — three UX fixes reported after trying v0.6.0

1. **Live preview trained skills weren't Inspect-able**: `LivePreviewPanel`
   rendered skill names as plain text instead of wrapping them in
   `GlossaryTerm` like every other skill mention in the app. Fixed.
2. **Unaffordable equipment gave no feedback**: `EquipmentStep` used to
   `disable` a weapon/armor/gear chip you couldn't afford, which silently
   swallows the click — no error, nothing, easy to mistake for "my
   previous pick got cleared" when it's actually just doing nothing.
   Chips are no longer `disabled`; they stay clickable, and clicking an
   unaffordable one triggers a brief shake + red flash (`.deny-shake`,
   `denyShake()` in `EquipmentStep.jsx`) via a `deniedId` state cleared
   after 420ms, then settles back to its normal muted (`.unaffordable`)
   look. The already-selected item is untouched either way — confirmed
   in-browser that selecting a cheap weapon then clicking an unaffordable
   armor leaves the weapon selected and only shakes the armor chip.
3. **No auto-scroll through a step's sub-sections**: `AncestryStep`,
   `BackgroundStep`, and `ClassStep` (the three step files with a
   `reveal-group` of progressively-relevant sub-sections) now compute a
   `focusKey` — the next sub-section still missing a choice, in reading
   order — and smoothly center it (`scrollIntoViewCentered`,
   `src/utils/scrollFocus.js`) whenever that key changes, so finishing one
   choice scrolls you straight to the next instead of leaving you to hunt
   for what just unlocked. Separately, `App.jsx` scrolls down to the Next
   button itself the moment a step's last requirement is satisfied
   (tracked via a prev-value ref so it only fires on the false→true
   transition, not on every render or when arriving at an
   already-complete step). `AbilityScoresStep`, `SkillsStep`, and
   `EquipmentStep` weren't given this treatment — they don't have a
   `reveal-group` chain of sub-sections gating each other the way the
   other three do, just one flat set of choices each, so there's no
   "next sub-section" to jump to.

### Patch: v0.6.2 — equipment shop model + skill cards

Two more fixes reported after trying v0.6.1:

1. **Equipment only let you buy one weapon and one armor**: picking a
   second weapon/armor silently replaced the first instead of buying
   both — wrong model for a shop, where the only real constraint is
   gold. `character.weaponId`/`armorId` (single) became
   `weaponIds`/`armorIds` (arrays); `EquipmentStep` now toggles them
   exactly like `gearIds` already worked (buy/sell freely, budget-gated,
   `deny-shake` on unaffordable — same mechanic added in v0.6.1). AC and
   Strike math still need exactly *one* worn/wielded weapon and armor
   though, so `useComputedCharacter` treats **the first one purchased**
   as equipped — a deliberate simplification, called out in a code
   comment, since a real equip/unequip UI is explicitly out of scope for
   now (the user's own framing: "comprar" and "equipar" are different
   problems). `weapons`/`armors` (plural, full owned list) are also
   exposed from the hook; `SummaryStep` lists anything beyond the first
   of each under "Also purchased," and the live preview panel appends
   "(+N more owned)".
2. **Skill picker redesigned as cards**: `SkillsStep`'s "Additional
   trained skills" chip row became an `option-card` grid — skill name as
   an `<h4>`, its glossary definition always visible underneath as
   `<p className="option-desc">`, matching the ancestry/background/class
   card pattern elsewhere. The name is deliberately **plain text, not a
   `GlossaryTerm`**, per explicit instruction — the definition is right
   there on the card, so making the name Inspect-clickable too would
   just pop up a popover repeating what's already visible. The
   "Automatic training" list above (class/background-granted skills,
   no visible definition) was left untouched and still uses
   `GlossaryTerm` normally.

### Patch: v0.6.3 — fixed-position Inspect toggle and mobile preview sheet

Two more fixes reported after trying v0.6.2, both about controls
scrolling out of reach:

1. **Inspect toggle scrolled away with the header**: on any step longer
   than one screen (the Ancestry grid, easily), the header — and the
   Inspect toggle inside it — scrolled out of view almost immediately,
   so using Inspect meant scrolling all the way back up, toggling, then
   scrolling back down to where you were. `InspectToggle` now renders as
   `position: fixed` (`.inspect-toggle-wrap` in `App.css`) pinned to the
   top-right corner, reachable from anywhere in a step regardless of
   scroll position — the fix applies to desktop and mobile alike, since
   the underlying problem (header scrolls away, toggle was inside it)
   applied to both. Also added a small persistent caption ("Tap terms
   for definitions") under the button, since moving it out of the header
   removed the contextual "this is Inspect mode" framing that used to
   sit next to it — a first-time visitor now gets a hint even without
   that context. On screens ≤600px the header gets `padding-right` to
   keep the (large, relative to viewport) `<h1>` from wrapping under the
   now-floating toggle.
2. **Mobile preview toggle had the same problem**: `LivePreviewPanel`'s
   mobile collapse (added in v0.6.0) sat inline at the *top* of the step
   content, so it also scrolled out of view while browsing a long list —
   the toggle was only reachable when already scrolled to the top,
   which defeated the point of a collapsible preview. Redesigned as a
   fixed-position floating pill ("📋 Preview ▸") anchored bottom-right,
   reachable from anywhere; tapping it expands into a bottom sheet
   (`.live-preview.open`, fixed to the bottom edge, internal scroll
   capped at `60vh`) with a semi-transparent tap-outside-to-close
   backdrop (`.live-preview-backdrop`, mobile-only — hidden by default,
   only rendered visually inside the ≤900px media query). Verified in
   the browser: the FAB stays put through scrolling, opens/closes
   correctly, and the backdrop closes it on tap.

### Patch: v0.6.4 — scroll-to-top on step change, full equipment overhaul

Four more fixes:

1. **Scroll to top on Next/Back/step-pill**: the wizard used to keep
   whatever scroll position you were at (often far down, since v0.6.1's
   auto-scroll had just brought Next into view) when moving to a new
   step, landing you mid-page instead of at its start. `goNext`/`goBack`/
   `goToStep` in `App.jsx` now call `window.scrollTo({top: 0, behavior:
   'smooth'})`.
2. **Equipment added to the live preview panel**: it previously showed
   only the equipped weapon/armor name plus a vague "(+N more owned)."
   Now lists everything purchased with quantities, same data the
   Summary page's Equipment card uses (see item 4 below).
3. **Dropped the "T" keyboard hint on mobile**: no physical keyboard to
   press it on, so `.inspect-toggle kbd` is hidden below 600px.
4. **Equipment step rebuilt as a real shop** — the big one:
   - **Categorized**: Weapons split into Simple/Martial (already had a
     `category` field, just wasn't grouped in the UI), Armor split into
     Unarmored/Light/Medium/Heavy (same story), plus two categories that
     didn't exist in the app at all before — **Shields** (Buckler,
     Wooden/Steel/Tower Shield, with Hardness/HP/BT/Speed penalty) and
     **Ammunition** (Arrows/Bolts/Sling Bullets/Blowgun Darts, sold in
     bundles of 10 per the book).
   - **Full Adventuring Gear catalog**: `GEAR` grew from ~28 curated
     items to all 68 level-0 items AoN lists under Player Core's
     Adventuring Gear category (a full pull of `item_category:
     "Adventuring Gear"`, `level: 0`, sourced to Player Core, deduped by
     name+price — this *is* Table 6-9, not a subset). Mount-only gear
     (Barding) was excluded.
   - **Quantity, not toggle**: buying is no longer binary select/
     deselect. `character.weaponIds`/`armorIds`/`gearIds` (and the two
     new fields, `ammoIds`/`shieldIds`) are flat arrays *with
     repetition* — buying 2 daggers means `'dagger'` appears twice —
     so the existing budget math (sum of prices across the array) and
     the "first purchased is equipped" logic in `useComputedCharacter`
     both kept working unchanged. New helpers in `equipment.js`
     (`addOne`/`removeOne`/`countOwned`/`groupPurchases`/`totalSpent`)
     add/remove one instance, count how many of an item are owned, and
     collapse the flat array into `{item, qty, lineTotal}` rows for
     display. `EquipmentStep` replaced the old toggle chips with
     `ShopRow` — name/meta/price plus a −/qty/+ stepper — kept
     clickable-when-unaffordable with the v0.6.1 deny-shake (now
     `.shop-row.deny-shake`) rather than disabled, same reasoning as
     before: a click should do *something* observable.
   - **Receipt**: a "Your Purchases" table (Item | Qty | Price | Total)
     at the bottom of the step, built from the same `groupPurchases`
     helper, with a grand total and remaining gold.
   - **Shields don't add to AC**: raising a shield is a per-turn action
     in PF2e, not a passive bonus, so unlike armor its `acBonus` is
     shown for reference only and deliberately left out of the AC
     formula in `useComputedCharacter` — folding it in would silently
     overstate a character's baseline AC.
   - **Bug fix along the way**: `formatGold` used to round anything
     under 1 gp down to the nearest sp (48 copper displayed as "5 sp"
     instead of "4 sp, 8 cp"), harmless while every purchase was a
     single item but actively wrong once quantities could produce odd
     copper remainders — the receipt's grand total surfaced it
     immediately. Rewritten to decompose fully into gp/sp/cp.
   - Verified in the browser end to end: bought 2 daggers, 8 torches, a
     steel shield, and a bundle of arrows; confirmed quantities, the
     receipt math, an unaffordable item (Spyglass) denies with a shake
     instead of silently failing, and the same purchases show correctly
     on both the Summary page and the live preview panel.

Four more, added to the same v0.6.4 batch before it shipped:

5. **Spells in the preview panel didn't say which rank they were**:
   `LivePreviewPanel`'s cantrip and 1st-rank lines were two unlabeled
   paragraphs — readable once you already know the app always lists
   cantrips first, meaningless otherwise. Added `Cantrips:`/`1st-Rank:`
   labels, matching the wording `SpellsStep` and `SummaryStep` already
   use.
6. **Coin conversion reference in the shop**: a `1 gp = 10 sp = 100 cp`
   line now sits above the gold tracker in `EquipmentStep`, so a price
   like "5 gp" is easy to translate without doing the arithmetic by
   hand.
7. **Two-level shop hierarchy**: Weapons and Armor previously rendered
   as a flat run of same-weight section headings (Simple Weapons,
   Martial Weapons, Ammunition, Heavy Armor, Medium Armor, ...) with
   nothing showing they were related. Added a `ShopGroup` wrapper (a
   bigger, gold, top-bordered `<h3>`) around each: "Weapons" now
   visually contains Simple/Martial/Ammunition as nested `<h4>`
   subsections, "Armor" contains Heavy/Medium/Light/Unarmored —
   reordered heaviest-first per explicit request, rather than the
   data's own none→light→medium→heavy order. Shields and Adventuring
   Gear got the same group-level heading treatment but no subgroups
   (the book doesn't subdivide them, and nesting a single subsection
   under a group would've just repeated its own title).
8. **Inspect toggle read as two separate buttons**: the "what this
   does" caption sat in its own pill directly under the toggle — two
   same-sized rounded shapes stacked, only the top one clickable, so a
   tap on the caption (which looked exactly as tappable as the real
   button) did nothing. Merged them into one `<button>` with two
   stacked lines instead of two elements, so there's exactly one
   tappable shape (`InspectContext.jsx`'s `InspectToggle`, restyled in
   `App.css`).

One more, found while re-testing item 1 above on a mobile viewport after
a user report that Next still wasn't scrolling to the top on their phone:

9. **`behavior: 'smooth'` doesn't just fail to animate on some mobile
   browsers — it fails to scroll at all.** The step-change effect (item
   1) and `scrollIntoViewCentered` (`scrollFocus.js`, used for the
   auto-scroll-to-next-section behavior and the scroll-to-Next-button
   effect, both from the v0.6.1 patch) all used `{ behavior: 'smooth' }`.
   Tested directly on a mobile viewport: `window.scrollTo({top: 0,
   behavior: 'smooth'})` and `element.scrollIntoView({behavior: 'smooth',
   ...})` both left `scrollY` completely unchanged — not a skipped
   animation, a no-op. Confirmed the fix by reproducing the exact
   scenario (scroll deep into a step, click Next, check `scrollY`): with
   `behavior: 'smooth'` it stayed wherever it was; with a plain
   `scrollTo(0, 0)` / `scrollIntoView({block: 'center'})` (no options
   object) it moved every time. All three call sites now scroll
   instantly rather than smoothly — an instant jump that reliably works
   beats a smooth one that sometimes silently doesn't move at all. Also
   added `overflow-anchor: none` on `body` defensively, in case a
   browser's scroll-anchoring was fighting the jump on a step that
   changes page height (turned out not to be the actual cause here, but
   it's a real interaction worth guarding against regardless).

### Docs release: v0.6.4.1 — CLAUDE.md working agreements

First release using the new **fourth version segment** (`X.Y.Z.A`), which
marks a release that changes no application code at all — see the
Versioning table in `CLAUDE.md`. Nothing in `src/` was touched, so the
built app is byte-for-byte what `v0.6.4` shipped; this exists purely so the
conventions themselves get a restore point in the release history.

**What landed:** a `CLAUDE.md` at the repo root (PR #1), recording the
working agreements that until now existed only implicitly, inferable from
the shape of the commit/tag/release history. A session picking this project
up had to reconstruct them by reading `git log`, the tag list and the
GitHub Releases page — which is exactly what happened at the start of the
session that produced this file, and the reason it was written.

It documents:

- **Workflow** — confirm before every push, including docs-only ones; work
  on a branch and open a PR rather than committing straight to `master`;
  and the full release chain `branch → PR → merge → tag → GitHub Release`,
  with the tag and Release called out explicitly as a *second step after
  the merge* rather than something that can be prepared inside the PR.
  Also that merging to `master` is a production deploy, since that is what
  triggers `.github/workflows/deploy.yml`.
- **Versioning** — the bump table (minor for a roadmap item, patch for
  polish, the new fourth segment for docs-only, `v1.0` when the roadmap is
  complete) and the four-part release checklist: `package.json` bumped in
  the same commit, `vX.Y.Z: lowercase summary` commit prefix, git tag, and
  a Release named `vX.Y.Z — Title Case Name`. Plus the requirement to add
  a section to *this* file in the same PR.
- **Pre-push checks** — `npm run lint` (0 errors; the 4 existing warnings
  are the baseline, not something to "fix" incidentally) and `npm run
  build`.
- **Architecture** — the three facts that are load-bearing for anyone
  changing code here: the single flat `initialCharacter` state object in
  `App.jsx`, `canGoNext` as the *only* gate on advancing a step (a new
  required choice not validated there can be skipped entirely), and
  `useComputedCharacter` as the single source of truth for every derived
  stat, never recomputed in a component.
- **The Archives of Nethys rule** — never write feat/spell/ancestry text
  from memory. Written with the reason attached rather than as a bare
  instruction, because the reason is what makes it stick: an earlier pass
  fabricated a noticeable fraction of feat descriptions that read
  plausibly but did not match the real feats, and every one had to be
  hunted down and rewritten.
- **UI conventions** — the committed dark theme with no light mode, keeping
  the `@media print` rules in sync when adding panel-styled components,
  the deliberately case-sensitive glossary matching, and `{ behavior:
  'smooth' }` being a confirmed no-op on mobile.

**Process note:** this was also the repo's first pull request. Every commit
before it went directly to `master` — which, given that a push to `master`
deploys to GitHub Pages, meant every commit was an immediate production
deploy with no review step. The branch-and-PR rule was added to `CLAUDE.md`
to put a reviewable gate in front of that — then reverted the same day: the
project is worked on solo across sessions/devices, and an explicit
go-ahead in chat before each push (already the standing rule, and what
every prior release actually used) already serves as that gate without the
overhead of a branch and a GitHub-side merge. `CLAUDE.md` now says commit
straight to `master`.

### Patch: v0.6.5 — six audit bugs (three state, three mobile)

The first six findings from the external audit, all of them confirmed
against the code before being touched. They were picked first for one
reason: **every one of them is silent.** The interface reports success, the
numbers look plausible, and the error reaches the printed sheet. Nothing
here touches rules data, so none of it was waiting on Archives of Nethys.

**APP-01 — a duplicate-skill substitution could count without adding a
skill.** When background and class train the same skill, the player picks a
substitute. `substituteOptions` excluded the class's fixed skills and the
background's own, but not skills already sitting in `trainedSkills` — so
picking one that was already a free pick counted it twice: once as the
background's effective training, once in the pool. The counter read as
satisfied with one fewer distinct skill than the character was owed, and
`SummaryStep` (which prints the background skill separately, then maps
`trainedSkills`) put that skill on the sheet twice. Choosing a substitute
now releases its pool slot, so the count and the sheet both stay honest.
Reproduced end to end in a browser with Scholar + Wizard colliding on
Arcana: the counter goes 1/5 → 0/5 on substituting, the skill moves out of
the free grid into automatic training, Next stays disabled until another is
picked, and the finished sheet lists eight distinct skills with no
duplicate.

**APP-02 — Natural Ambition left an orphaned class feat.** The ancestry-feat
handler updated only `ancestryFeat` and `generalFeatChoice`, while
`bonusClassFeat` was cleared solely when the *class* changed. Switching the
ancestry feat away from Natural Ambition therefore left its bonus feat in
the character, still labelled "Bonus (Natural Ambition)" on a sheet where
Natural Ambition no longer appeared — an extra feat with no source. The
grant and the pick it produces now live and die together, and changing
ancestry clears it too.

**APP-03 — re-clicking a selected option wiped dependent choices.** The
ancestry, background and class cards stay enabled once chosen, which is
right — they should still read as the active choice — but a second click
ran the full selection path and reset everything downstream. On Class that
meant losing an entire spell list. Re-selecting what you already have is
now a no-op. The same guard went on heritage and ancestry feat, which had
the identical problem one level down.

**MOB-01 — the spell grid forced horizontal overflow.** `minmax(340px, 1fr)`
against a container of `min(1800px, 94vw)` less 40px of padding: below
roughly 405px of viewport the track is wider than the box that holds it, on
the step with the most text to read. Now `minmax(min(340px, 100%), 1fr)`,
which keeps 340px columns where they fit and collapses to the container
where they don't. Measured at 360px: the grid computes to 298px, exactly
the content width.

**MOB-02 — the quantity steppers were 26×26px with a 6px gap.** Adjacent
controls tapped repeatedly while shopping, with the interactive area
matching the visual one exactly. Now 36×36 with a 10px gap.

**MOB-03 — the Inspect popover could not fit a 320px screen.**
`box-sizing: border-box` is set per-element in this project rather than
globally, and `.inspect-popover` didn't have it — so 12px of padding and a
1px border sat *outside* its 300px width, making a 326px box that, pinned
8px from the left, ran 14px off the screen. The element is border-box now,
and the positioning maths in `InspectContext.jsx` reads a shared
`POPOVER_WIDTH` constant instead of a hardcoded 328 that no longer matched
anything. Measured at 320px: the popover sits at x=12 with its right edge
at 312.

All six were verified in a real browser with Playwright, not just by
reading the diff — the three mobile ones by measuring computed geometry at
320 and 360px, the three state ones by driving the wizard through the exact
sequences that used to produce the bad state.

## External audit of v0.6.4 — verification status

An external audit (produced with ChatGPT, delivered as a Word document)
reported **24 findings** against v0.6.4 / commit `fe0512d`, with IDs and
S1–S4 severities. Every claim was checked against the actual code in the
session that received it, and the six rules claims were then verified
against Archives of Nethys in a follow-up session once the environment's
network policy allowed it. Final tally: **23 confirmed, 1 refuted** — the
audit was right about everything except one reading of a lint warning, and
in two places it understated the problem. The audit is accurate — where it gives a number, the number
is exact.

Keep this section until the 6 open items are settled; it is the handoff
for that work.

### Confirmed — real, with evidence

The ones worth acting on first, because they are **silent**: the UI reports
success, the numbers look plausible, and the error survives to the printed
sheet.

**APP-01, APP-02, APP-03 and MOB-01/02/03 were fixed in v0.6.5** — see that
patch section below. RULE-02, RULE-03 and the legacy-data findings are still
open.

- **APP-01 — a duplicate-skill substitution can count without adding a
  skill.** `substituteOptions` in `SkillsStep.jsx` excludes the class's
  fixed skills and the background's own skill, but *not* skills already in
  `character.trainedSkills`. Pick one that's already chosen and it vanishes
  from the grid while staying in the array and still counting toward the
  pool. Worse than the audit describes: `SummaryStep` prints the background
  skill separately and then maps `trainedSkills`, so **the same skill
  appears twice on the final sheet**.
- **APP-02 — Natural Ambition leaves an orphaned class feat.** The ancestry
  feat handler (`AncestryStep.jsx:140`) updates only `ancestryFeat` and
  `generalFeatChoice`. `bonusClassFeat` is cleared only when the *class*
  changes, so switching the ancestry feat away from Natural Ambition leaves
  the bonus feat in place, still labelled "Bonus (Natural Ambition)".
- **APP-03 — re-clicking a selected card wipes dependent choices.** The
  three `select*` handlers reset dependent fields unconditionally and no
  `onClick` checks whether the id was already selected. Worst in Class,
  where it clears `knownCantrips` and `knownSpells1`.
- **RULE-03 — feat effects never reach the calculations.** `hp` is
  literally `ancestry.hp + cls.hp + mods.con`; there is no channel through
  which a feat can influence any stat. Human + Fighter + Con +1 + Toughness
  shows 19 HP instead of 20 — and the app's own Toughness entry already
  says "Increase your maximum Hit Points by your level". Fixing this means
  designing a structured modifier channel, not patching a formula.
- **RULE-02 — prerequisites are displayed, never enforced.** Confirmed by
  the app's own data: the Human ancestry feat Adapted Cantrip
  (`ancestries.js:174`) starts its description with "Prerequisite: a
  spellcasting class feature", and the app prints that and then lets a
  Fighter take it.
- **DATA-01 — 30 legacy spells.** Exactly 30 entries declare `Core Rulebook`
  as their source: 10 cantrips and 20 rank-1, out of 135 total (42 + 93).
  That's 22% of the catalog.
- **DATA-02 — legacy names.** Holy Castigation, Wild Shape and Eschew
  Materials in `classes.js`; Half-Elf and Half-Orc in `ancestries.js`. None
  of the remaster replacements appear anywhere. The audit missed a worse
  one: Holy Castigation's description says *"Requires good alignment"*, and
  alignment was removed from the system by the remaster, not renamed.
- **MOB-01/02/03 — three mobile overflows, all three measurements exact.**
  `.spell-grid` uses `minmax(340px, 1fr)` against a container of
  `min(1800px, 94vw)` minus 40px of padding, so it only fits from ~405px up.
  The `+`/`−` steppers are 26×26px with a 6px gap. And `.inspect-popover`
  is `content-box` (`box-sizing: border-box` is set only on `#root` and
  `.app`, and it does not inherit), so 300 + 24 padding + 2 border = 326px
  of outer box, placed at x = 8 → 334px on a 320px screen.

### Refuted — do not "fix" this one

- **CODE-01's staleness reading is wrong.** The audit suggests the
  `exhaustive-deps` warning in `AbilityScoresStep.jsx` may hide a stale
  memoized value. It doesn't: the `useMemo` lists all five values
  `computeScoresBeforeFreeBoosts` actually reads. The dependencies are
  already exhaustive; the rule simply can't see inside the helper and wants
  the whole `character` object, which would recompute *more* often, not
  less. This is exactly why the four warnings are the documented baseline.

### The 6 open items — resolved (2026-09-01)

Investigated independently by two sessions the same day, against two
different sources (this one against AoN's Elasticsearch index directly;
the other against AoN's Elasticsearch index plus `foundryvtt/pf2e` as a
cross-reference) — both reached the same six confirmations, which is a
good sign neither is a misread. Merged here rather than duplicated.

| # | Claim | Verdict |
|---|---|---|
| RULE-04 | Wizard's first class feat is at 2nd level | **Confirmed** — and wider than reported (6 classes, not 1) |
| RULE-05 | Cleric is prepared-only | **Confirmed**, with one nuance |
| RULE-06 | Rogue/Wizard weapon proficiencies are legacy | **Confirmed** |
| RULE-08 | Alternate Ancestry Boosts exists, separate from Voluntary Flaws | **Confirmed** |
| RULE-09 | Aiuvarin/Dromaar replace Half-Elf/Half-Orc | **Confirmed** — but *not* Human-only |
| RULE-10 | Player Core lists 40 backgrounds | **Confirmed**, exactly |

What both sessions found beyond the audit's original framing:

- **RULE-04 affects 6 classes, not 1.** The 7 full casters (Bard, Cleric,
  Druid, Oracle, Sorcerer, Witch, Wizard) get their first class feat at 2nd
  level, trading the 1st-level slot for their tradition feature — confirmed
  via each class's `Class Features` table and `attack_proficiency` field
  (fetched for all 16 in one `_mget` batch). The app gave `feats1` to all
  of them except Witch, which was right by accident, not by decision. The
  9 martial/hybrid classes (Alchemist, Barbarian, Champion, Fighter,
  Investigator, Monk, Ranger, Rogue, Swashbuckler) were all already
  correct; Champion is the one caster-adjacent class that still gets a
  1st-level feat.
- **RULE-06 also affects Bard**, not just Rogue/Wizard as the audit named.
  All three had the same enumerated Core Rulebook legacy weapon list
  swapped in for Player Core's simplified proficiency (Rogue/Bard: full
  simple + martial; Wizard: simple only). Oracle's weapon line was also
  missing "unarmed attacks" entirely (present in AoN, absent in the app).
- **RULE-05's nuance**: Sanctification is not a separate 1st-level class
  feature — it's described inside the Deity entry, and Foundry's 1st-level
  Cleric items agree (Deity, Cleric Spellcasting, Doctrine, First Doctrine,
  Divine Font — no Sanctification). Deity/font/doctrine stay a documented
  gap (need deity modeling — ROADMAP item 5), not fixed this round.
- **RULE-08 is two rules, not one.** "Optional: Voluntary Flaws" (Player
  Core pg. 23) is explicitly marked Optional in its own title — a GM-table
  variant, correctly out of scope. "Alternate Ancestry Boosts" (same page,
  no "Optional:" prefix) reads "You always have the option to replace your
  ancestry's listed attribute boosts and attribute flaws entirely and
  instead select two free attribute boosts" — an always-available choice,
  and a real gap. Fixed (see patch section below).
- **RULE-09's Human restriction is wrong in the app, not just the name.**
  Aiuvarin and Dromaar are typed `Versatile Heritage` in AoN — Player
  Core's "Playing a Versatile Heritage" lets *any* ancestry take one (a
  dwarf aiuvarin is legal), and Player Core has 4 total (Changeling,
  Nephilim, Aiuvarin, Dromaar). The app files Half-Elf/Half-Orc inside
  Human's heritage list specifically, with legacy text — a structurally
  different, not just renamed, mechanic. **Extra trap found**: the app's
  Human heritage list already has an entry literally named "Versatile
  Heritage" (grants a free general feat pick) — the remaster renamed that
  specific heritage to "Versatile Human" precisely because "Versatile
  Heritage" now means the Aiuvarin/Changeling/Dromaar/Nephilim category.
  Whoever implements RULE-09 needs to rename that Human heritage first, or
  the two meanings collide in the UI. **Not fixed this session** — needs a
  real data-model decision (a heritage not scoped to one ancestry doesn't
  fit `ancestry.heritages` as it's currently shaped), not a find/replace.
- **RULE-10 confirmed exact.** Player Core has exactly 40 backgrounds
  (verified via `primary_source_raw` starting with `"Player Core pg"`,
  excluding Player Core 2's 24). The app had 35, missing exactly Bandit,
  Cook, Cultist, Raised by Belief, and Teacher — the same 5 the audit
  named, no more, no fewer.

**Source note:** `pf2.d20pfsrd.com` is dead — it answers `410 Gone` at the
origin, not blocked by any proxy; don't try it as a cross-reference.
PathfinderWiki is lore, not mechanics, and its line about aiuvarins all
descending from humans reads misleadingly like a mechanical restriction —
it's flavor, not a rule. `foundryvtt/pf2e` disagreed with AoN on nothing
that was checked.

### Patch: class feat/weapon fixes, 4 new backgrounds, Alternate Ancestry Boosts

Applied everything actionable from the 6 items above, correcting one
implementation mistake caught during review before it shipped: the first
pass at RULE-04 simply emptied `feats1` for the 6 wrong classes, which
silently breaks Human's Natural Ambition ("you gain a 1st-level class
feat", no class exception) — `needsBonusFeat` in `App.jsx`/`ClassStep.jsx`
gates on `feats1.length > 0`, so an empty catalog makes the bonus-feat
picker vanish along with the (correctly removed) required 1st-level pick.
Fixed by decoupling the two: `feats1` catalogs were restored (Bard,
Cleric, Druid, Oracle, Sorcerer, Wizard all keep their AoN-verified Feat-1
options), and a new `classFeatAtLevel1: false` flag on those 6 classes
(plus Witch, for consistency) now gates only the *required* pick.
`needsBonusFeat` still keys off `feats1.length > 0`, so Natural Ambition
works correctly again. Witch is a **known remaining gap**: its `feats1`
stays empty because no AoN-verified Witch Feat-1 data has been entered
yet, so Natural Ambition still produces nothing for a Human Witch — fixing
it just needs that data added, not another logic change.

Full change set: `src/data/classes.js` (6 classes' weapons corrected,
`classFeatAtLevel1: false` + restored `feats1` for 6 classes, Cleric's
spellcasting type corrected), `src/App.jsx` + `ClassStep.jsx` (gating
switched from `feats1.length` to `classFeatAtLevel1` for the required
pick), `src/data/backgrounds.js` (Bandit/Cook/Cultist/Teacher added,
35 → 39), and a new Alternate Ancestry Boosts checkbox in
`AncestryStep.jsx` / `abilityScores.js` / `glossary.js`. Verified:
`npm run lint` (0 errors, same 4 baseline warnings), `npm run build`
(clean), and live in the browser — Wizard/Cleric/Bard/Druid/Oracle/
Sorcerer show "doesn't gain a class feat at 1st level" while still
offering their catalog under Natural Ambition; Rogue/Fighter/etc. show
their normal required pick; Rogue/Wizard/Bard weapon lines read the
remaster text; toggling Alternate Ancestry Boosts on a Dwarf correctly
drops the Con/Wis boosts and Charisma flaw, offers all 6 abilities, caps
at 2, and reverts cleanly when unchecked.

Remaining from this audit, not yet done: RULE-09 (Versatile Heritages —
needs the data-model decision above, including the Human "Versatile
Heritage" naming collision), Witch's missing Feat-1 catalog, Raised by
Belief and the 24 Player Core 2 backgrounds (need deity modeling / are
just more data entry), RULE-02 (unenforced prerequisites), RULE-03 (feats
not reaching calculations), and DATA-01/02 (legacy spell sources/names).

### A framing note on the audit's severities

The audit rates missing level-1 subclass choices (RULE-01) S1-critical,
the same as the orphaned-feat bug. They aren't equivalent. Subclasses are a
**deliberately deferred, already-documented gap** — gap #3 above, and item 6
of `ROADMAP.md`. RULE-13 (languages) is roadmap item 2. The audit never
acknowledges that this project already tracks several of the absences it
reports. What deserves priority is the opposite group: the bugs in features
that *do* exist and fail silently.

### Patch: Wizard spell counts — spellbook, not daily-prepared (v0.6.6)

The Wizard's `cantripsKnown`/`rank1Known` were 5/2, matching what a 1st-level
Wizard *prepares each morning* — not what they actually know. Per AoN's
Wizard Spellcasting (Player Core pg. 192), the spellbook itself holds
**10 cantrips and 5 1st-rank spells** at 1st level; preparing only 5/2 of
those daily is a recurring in-play choice, not something that belongs on a
character-creation sheet. Fixed to 10/5.

Checked the other 5 spellcasting classes for the same mistake — none had
it: Bard/Oracle/Sorcerer's numbers already equal their spell *repertoire*
size (verified against each class's Spell Repertoire feature), which for
spontaneous casters genuinely is "what they know." Cleric/Druid have no
fixed "known" list at all — they prepare from their entire tradition's
common spell list each day, so there's nothing narrower to switch to.
Witch prepares from spells its familiar knows, which isn't modeled yet
(ROADMAP item 7) — same simplification as before, just now called out
explicitly next to the Wizard fix instead of implicitly.

### Roadmap item 4: custom PDF sheet printing — done (v0.7.0)

Full technical writeup lives in `ROADMAP.md`'s item 4 (implementation,
what's filled vs. deliberately blank, and the verification approach).
This note is specifically about **the PDF field-inspection technique**,
worth keeping for the next time a bundled PDF's fields need mapping:

1. Load the PDF with `pdf-lib`, call `form.getFields()`, and for each
   field walk `field.acroField.getWidgets()[0].P()` to get its page
   reference, then match that against `doc.getPages()` to find the page
   index. This is how the app confirmed the bundled sheet's page 1/page 3
   field counts (249 and 343) before writing any fill code.
2. **Some PDF fields have no real name** — the bundled sheet's page 3 had
   only 59 of 343 fields properly named; the rest were left as
   auto-generated `undefined_N` placeholders by whatever tool built the
   PDF. `field.getName()` alone can't distinguish "this field is really
   called that" from "this field was never named." Don't assume a field
   list's names are all meaningful without checking for that pattern.
3. To recover structure from unnamed fields, pull each widget's
   `getRectangle()` (x/y/width/height in PDF points) and cluster by
   position: group into rows by y (with a couple points of tolerance —
   fields in the "same" row aren't always pixel-exact), then sort each
   row by x to recover column order. This is how the spellbook table's
   real 20×2 grid was found underneath 284 unnamed fields — every row
   had an identical 10-field pattern (checkbox, name, type/level,
   actions, page-ref, repeated for two side-by-side columns), matching
   the pattern the 2 properly-named rows already showed.
4. Once field names are recovered this way, they're stable for that
   specific PDF file (position-based reconstruction was a one-time
   offline step, not something the app redoes at runtime) — hardcode the
   resulting name list, don't recompute it in the browser.
5. When testing fill logic against a real multi-hundred-field PDF,
   **prefer a Node script over browser automation**: `pdf-lib`'s pure-JS
   PDF parser is CPU-bound, and this session's automated browser test
   pane turned out to be resource-constrained enough that
   `PDFDocument.load()` on a ~1MB, 2213-field form didn't finish in a
   reasonable time, while the identical call in Node finished in under a
   second. A Vite script run via `createServer({ server: { middlewareMode:
   true } })` + `server.ssrLoadModule('/path/to/test.mjs')` gives a quick
   Node-side feedback loop that resolves the app's own import graph
   (extensionless relative imports, `import.meta.env`) exactly like the
   real app does, without needing a live browser at all.

## To-do list (small polish items, separate from ROADMAP.md) — done (v0.7.1)

Both items noted here were shipped in v0.7.1:

1. **Collapsible sections for Spells (by rank) and Equipment (by
   group)**. New shared `src/components/Collapsible.jsx` — a
   `.sub-section` whose heading (a `role="button"` div around an `<h3>`,
   same reasoning as `GlossaryTerm`'s span-not-button: it can end up
   nested inside other clickable containers) toggles its body open/closed,
   defaulting open. `SpellsStep.jsx`'s two `SpellPicker` sections and
   `EquipmentStep.jsx`'s four `ShopGroup`s (Weapons, Armor, Shields,
   Adventuring Gear — the latter two converted from a raw
   `<section>`/`<h3>` pair to `ShopGroup` so all four behave the same
   way) each now collapse independently.
2. **Inspect support in the Equipment shop.** Two new data pieces:
   - `traits` added to all 47 `WEAPONS` and 13 `ARMORS` entries in
     `equipment.js`, pulled from each item's AoN `trait_raw` field (the
     display string including its number/die/damage-letter suffix,
     e.g. "Thrown 10 ft.", "Deadly d8", "Versatile S") — verified the
     same way every other AoN pull this project has done, filtered to a
     Player-Core-sourced hit per item.
   - 26 weapon/armor trait entries + 3 damage-type entries (Piercing/
     Slashing/Bludgeoning) added to `glossary.js`. `EquipmentStep.jsx`'s
     `traitGlossaryId()` strips a trait string's trailing variable part
     (`/\s+(\d+\s*ft\.?|\d*d\d+|[A-Z])$/`) to get the lookup id, so
     "Deadly d8" and "Deadly d10" both resolve to one `deadly` entry.
     The existing `trip` entry (already covering the Athletics action)
     was extended rather than duplicated, since the weapon trait is a
     minor variant of the same concept ("...even without a free hand").
   - Trait tags reuse spell cards' `.trait-tag` badge look, but the
     `GlossaryTerm` goes *inside* the tag span rather than replacing it —
     `GlossaryTerm` renders bare `children` (no wrapper element at all)
     when Inspect is off, so wrapping the whole tag in it would have
     dropped the badge styling whenever Inspect wasn't active. Damage
     letters get the same treatment: `1d4 P` renders as `1d4 Piercing`,
     the type name wrapped in `GlossaryTerm`.

Verified live: toggling each of the four Equipment groups and both Spell
sections closed/reopened independently without affecting the others;
Inspect on, clicking a Dagger's "Thrown 10 ft." tag and the "Piercing"
damage-type word both opened the correct popover text; a Chain Shirt
correctly showed Flexible + Noisy tags.

## Patch: v0.7.2 — weapon trait filter, Inspect on filter chips

Shipped the trait-filter idea floated at the end of v0.7.1 the same
session, faster than expected — the "likely fast fix" noted at the time
worked as predicted:

1. **Multi-select trait filter for the Weapons shop section**, same
   pattern as `SpellsStep.jsx`'s spell-trait filter. Built on
   `traitGlossaryId()` exactly as anticipated: one filter chip per *base*
   trait id, matching a weapon if any of its raw trait strings (`Thrown
   10 ft.`, `Thrown 20 ft.`, `Thrown 30 ft.`, ...) normalize to the
   selected id — so "Thrown" is one chip covering all four range variants
   instead of fragmenting into separate options.
2. **Inspect now works on the filter chips themselves**, not just on
   trait tags in the item list. Wrapped each chip's label in
   `GlossaryTerm`: with Inspect off it renders bare `children` (no
   wrapper), so the chip's own click-to-filter behavior is untouched;
   with Inspect on, `GlossaryTerm`'s `activate()` calls
   `e.stopPropagation()` before opening the popover, so clicking a chip
   shows its definition *instead of* toggling the filter, with zero
   special-casing needed in the chip's own button — this is the same
   nested-clickable pattern already used for trait tags and card
   descriptions elsewhere in the app, just applied to a filter control
   for the first time.
3. **Three range-less "Thrown" weapons fixed for display consistency**:
   Dart, Javelin, and Bola are already-ranged weapons, so AoN's own
   `trait_raw` for their Thrown trait has no range increment (that lives
   in a separate Range field this app doesn't otherwise track) — unlike
   Club/Dagger/Spear/Hatchet/Light Hammer/Trident, where Thrown is the
   *only* place the range increment can live since they're melee
   weapons. That made those three the only bare "Thrown" tags in a shop
   where every other Thrown tag shows a distance, which read as a
   glitch. Fixed by pulling each one's actual Range field from AoN by
   hand and folding it into the trait string (Dart 20 ft., Javelin
   30 ft., Bola 20 ft.) — a display-only fix, not a rules change.

**Tried and reverted the same session**: a per-item purchase quantity cap
(20), added after live-testing exposed a Club purchased 117 times over
via rapid `+` clicks. Investigated first — Club's AoN price is genuinely
0 gp, not a display rounding artifact, so buying it in any quantity is
gold-neutral and not a data bug. Built a `MAX_QTY` ceiling anyway as a
UX sanity guard, then reverted on request: a free item bought in bulk
isn't a real problem worth a code-level restriction, and it's the kind
of thing better handled at the table than by the app second-guessing the
player. Worth remembering if this comes up again — the fix was cheap and
is easy to redo, but isn't wanted right now.

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
