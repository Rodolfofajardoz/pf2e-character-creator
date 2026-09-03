# Personalization Roadmap

Everything below was requested as a wishlist after Phase 3 (spellcasting)
shipped: printing to a custom sheet, level-up, a live preview panel,
multiclass, a save/load catalog, language selection, archetypes, familiars,
custom backgrounds, and modeling the class sub-choices the app currently
skips. This document turns that wishlist into scoped work, ordered by
difficulty — quickest/simplest first, longest/hardest last — with the
reasoning behind each ranking and the open questions each item still has.

Once every phase below is done, the plan is to add app versioning and cut
the first GitHub Release, arriving at **v1.0**. Versioning isn't its own
phase — it's the wrap-up once the roadmap is actually finished, not a
milestone to schedule in the middle of it.

## Ordered by difficulty

| # | Item | Size | Notes |
|---|------|------|-------|
| 1 | ~~Live side-panel preview~~ | S | ✅ Done (v0.6.0). |
| 2 | ~~Language selection~~ | S | ✅ Done (v0.6.7). |
| 3 | ~~Custom backgrounds~~ | S–M | ✅ Done (v0.6.8). |
| 4 | ~~Custom PDF sheet printing~~ | S–M | ✅ Done (v0.7.0). |
| 5 | ~~Save/load character catalog~~ | M | ✅ Done (v0.8.0). |
| 6 | ~~Class sub-choices~~ | M | ✅ Done (v0.9.0) — the choice + its 1st-level benefit; unlocking the spells it gates access to is a follow-up (see item 6's writeup). |
| 7 | Familiars | M | ⚠ blocked — full scope needs item 9 (Level-up) done first. |
| 8 | Multiclass & Archetypes | L | ⚠ blocked — needs item 9 (Level-up) done first; also the largest data surface after leveling itself. |
| 9 | Level-up (2–20) | XL | 🔧 In progress (v0.10.0) — generic engine + Fighter's own data shipped for levels 1–10; other 15 classes and levels 11–20 still open. See below. |

**Important caveat on items 7 and 8**: they're ranked by how much work
*they themselves* involve, not by when they can actually be picked up.
Both genuinely require Level-up (item 9) to exist first — Familiars needs
the per-level ability-growth table, Multiclass/Archetypes needs class
feat slots past 1st level to spend a Dedication feat on. So the real
buildable order, if going strictly smallest-first while respecting
dependencies, is 1 → 2 → 3 → 4 → 5 → 6 → 9 → 7 → 8. Listed here by raw
difficulty as asked, with the dependency called out rather than hidden.

---

## 1. Live side-panel preview — ✅ Done (v0.6.0)

Shipped as `useComputedCharacter` (`src/hooks/useComputedCharacter.js`) —
`SummaryStep`'s derived-stat math (scores/mods, HP, AC, Perception,
Class DC, saves) factored out of that component into a shared hook, so
`SummaryStep` and the new `LivePreviewPanel` read from one source of
truth. The panel renders alongside the wizard step (`App.jsx`'s new
`.layout-row`) on every step except Summary (redundant there — Summary
already *is* the full sheet), with graceful placeholders for choices not
made yet instead of hiding until the character is complete. On narrow
viewports it collapses into a `Preview ▸` toggle above the step content
instead of a fixed side column. Verified end-to-end in the browser:
values update live while stepping through Ancestry → Background → Class,
match `SummaryStep`'s numbers exactly, and the mobile collapse/expand
works.

## 2. Language selection — ✅ Done (v0.6.7)

Rule confirmed via AoN's remaster "Languages" rules page (Player Core pg.
89 — note this superseded the Core Rulebook pg. 65 version cited when
this item was first scoped; the table itself changed in the remaster,
not just the page number, see below): a positive Intelligence modifier
grants that many bonus languages, chosen from the ancestry's own list
plus the general Common/Uncommon tables. Human is the one exception —
"1 + your Intelligence modifier," so it always gets at least 1 bonus
language.

Shipped as a new step (`LanguagesStep.jsx`, positioned after Ability
Scores since it needs the Intelligence modifier) with three new data
pieces in `src/data/languages.js` and `ancestries.js`:
- `COMMON_LANGUAGES` (11) and `UNCOMMON_LANGUAGES` (13), fetched from
  AoN's own `Language`-type entries (155 total, most irrelevant splatbook
  regional languages) filtered to Player Core's specific two tables.
  **The remaster table is genuinely different from the legacy one** —
  Fey and Sakvroth became Common, Sylvan and Undercommon dropped off it,
  and several outsider/elemental languages were renamed (Celestial->
  Empyrean, Infernal->Diabolic, Abyssal->Chthonian, Terran->Petran,
  Ignan->Pyric, Auran->Sussuran, Aquan->Thalassic) or added new (Kholo,
  Muan, Talican). Worth noting since this item's own original scoping
  note (above) cited the old table by mistake before this was verified.
- `bonusLanguages: [...]` added to all 16 ancestries — each one's
  specific bonus list from its own AoN entry. Human is a special case
  (its entry says "choose from the list of common languages" rather than
  naming a short list) and got the full `COMMON_LANGUAGES` array instead.
- Picker offers ancestry's list + both general tables, minus anything
  already known automatically; **uncommon options are shown, not
  hidden**, each flagged "⚠ Uncommon — needs your GM's approval"
  (explicit request — trust-the-player like unenforced feat
  prerequisites, not a hard block).

Verification note: AoN's search returns legacy (Core Rulebook/Advanced
Player's Guide) ancestry entries alongside the Player Core ones for
several ancestries, with *different* bonus-language lists on each — every
fetch here was filtered to a `primary_source_raw` starting with "Player
Core" before reading its language data, after an initial pass without
that filter produced a wrong answer for Kobold (Draconic from the legacy
entry, instead of Sakvroth from Player Core 2) that got caught before
shipping.

## 3. Custom backgrounds — ✅ Done (v0.6.8)

Confirmed against AoN's "Step 4: Pick a Background" (Core Rulebook pg.
24): every background reduces to the same shape — an ability boost pair
plus one free boost, training in one skill, training in one Lore skill,
and one specific skill feat. Shipped as a "+ Create your own" card
alongside the 39-card grid in `BackgroundStep.jsx`.

Implementation shortcut that turned out cleaner than the original plan:
rather than an artificial "define a 2-ability pair, then pick 1 of them"
step, a custom background just lets the player pick any ability outright
for the chosen boost, then any other for the free boost — since the
player *is* the background's author here, there's no meaningful
difference between defining the pair and picking from it. Same idea for
skill: `skillChoice` is set to *every* skill instead of a curated
2–4-option list, so the existing "Choice of skill" section (unmodified)
just offers all 16.

This landed as one new function, `buildCustomBackground()` in
`backgrounds.js`, that assembles a synthetic background object in the
exact same shape (`{boostChoice, skillChoice, lore, feat}`) as a preset
— so every existing consumer (`BackgroundStep`, `SkillsStep`,
`SummaryStep`, `useComputedCharacter`) needed zero special-casing beyond
calling a new `getEffectiveBackground(character)` instead of
`getBackground(id)` directly. Verified this generality live: a custom
background's chosen skill collided with the test Fighter's own
class-granted skill, and the existing background-skill-substitute
handling (built for preset backgrounds) caught and resolved it correctly
without any custom-background-specific code.

New pieces: a free-text Lore input (reusing an already-declared-but-
never-wired `character.lorePicked` field instead of adding a new one), a
skill-feat picker pulling from `GENERAL_FEATS`' "Trained in X" entries
(filtered to whichever match the chosen skill by default, with a "show
all" toggle for concepts that don't fit — same trust-the-player pattern
already used for unenforced feat prerequisites), and an optional
free-text Name field (the open question this item shipped with — decided
yes, cheap and purely cosmetic).

## 4. Custom PDF sheet printing — ✅ Done (v0.7.0)

Fills the user's own character sheet PDF with the builder's output,
alongside the existing `window.print()` on-page summary — a "Download
filled character sheet" button on `SummaryStep`.

Confirmed it's a genuine **fillable AcroForm PDF** — 22 pages, 2213 form
fields. Only the first 2 relevant pages get filled (a level-1 sheet has
nothing to put on the other 20 — crafting, downtime, higher-rank
spellbook pages, etc.):

- **Page 1** (249 fields): identity, all 6 ability mods, HP, AC,
  Perception, Class DC, saves, all 17 skills (total + trained checkbox),
  languages, Hero Points, armor/weapon proficiency checkboxes, the
  equipped weapon's name/damage, and the shield block (hardness/HP/BT/AC
  bonus) if one was bought.
- **Page 3** (343 fields, spellcasting): tradition checkbox, spell
  DC/attack (new `spellDC`/`spellAttack`/`spellAbility` fields added to
  `useComputedCharacter`, same `10 + trained + ability mod` pattern
  Class DC already used), and every known cantrip/1st-rank spell written
  into the spellbook table.

**A real surprise found during implementation**: only 59 of page 3's 343
fields have real names (`NAME`, `TYPE  LEVEL`, `SDC1_TOTAL`, etc.) — the
other 284 were left as PDF-authoring-tool defaults (`undefined_151`,
`undefined_152`, ...), which ROADMAP's original scoping note above
("also maps cleanly") didn't anticipate. Recovered them anyway: every
page-3 field's widget rect was pulled via `pdf-lib` and clustered by
y-position into rows, by x-position into columns, which revealed a
clean, fully addressable **20-row × 2-column spellbook table** (40 slots)
underneath the auto-generated names. That row/column reconstruction was
a one-time offline step (see `PROJECT_NOTES.md`'s PDF section for the
technique) — the resulting 40 field-name pairs are hardcoded in
`fillCharacterSheet.js` as `SPELLBOOK_SLOTS`, since they're fixed for
this specific bundled PDF file, not something to recompute at runtime.

Deliberately left blank, with reasons: per-strike attack bonus and the
`ATK MOD` ability dropdowns (weapon proficiency isn't tracked per
category/finesse yet — showing a guessed number risks being wrong,
which this project treats as worse than a blank field); strikes 2–4 and
a second Lore skill (the app only tracks one weapon and one Lore at
character creation); pages 2/4/5+ (nothing to put there yet).

`pdf-lib` is dynamically imported inside the fill function rather than
statically at the top of the module — it's a large library needed only
on this one click, and a static import grew the main JS bundle from
~450kB to ~880kB gzipped; the dynamic import keeps it a separate chunk
fetched on demand instead.

Verified with a Node script (`server.ssrLoadModule` via Vite's own
programmatic API, so the exact same code path the app uses resolves
correctly) across two character builds — a full caster with every
optional field populated, and a bare-minimum non-caster with a custom
background and zero purchases — filling every field pdf-lib reported
back with **zero name mismatches** in either case, confirmed by reading
the saved PDF's field values back and checking them against expected
output. A live in-browser click wasn't verified this session: the
automated browser pane used for testing turned out to be too CPU
constrained to run `pdf-lib`'s PDF parser in reasonable time (`PDFDocument
.load()` alone exceeded several seconds there against ~700ms in Node on
the same file) — a sandbox resource limit, not a code issue, but real
device performance for actual users is still worth a first real click
to confirm.

## 5. Save/load character catalog — ✅ Done (v0.8.0)

A "My Characters" screen (`CatalogView.jsx`) is now the app's landing
view: list saved characters, open one back into the builder, duplicate,
export, delete, or start a new one. Storage via `localStorage`
(`src/utils/characterCatalog.js`) as one `{ [id]: { character, savedAt }
}` map — a level-1 character is tiny, so rewriting the whole map on every
save is simplest and cheap.

No separate "Save" button: `App.jsx` autosaves on every `character`
change once a character is actively being edited (a `characterId`,
generated when you start or open one, tracked outside `character` itself
so it never leaks into exports). Closing the tab or navigating back to
the catalog mid-build loses nothing.

**A real bug caught before shipping**: opening a saved character
originally jumped straight to the Summary step unconditionally, which
crashed (`Cannot read properties of null`) on any character that wasn't
fully finished — Summary was previously only ever reachable by
completing every step in order, so it never had to handle a null class/
ancestry/background. Fixed by extracting the step-completion checks
already living inline in `canGoNext`'s switch into a standalone
`isStepComplete(stepId, character)`, and adding `findResumeStepIndex()`
that walks the steps to find the first incomplete one. Opening a
character now resumes exactly where it was left off — Summary only if
everything before it actually checks out.

Export/import shipped as scoped: an Export button downloads a `.json`
file (standard Blob + object-URL + hidden `<a>` pattern, no server
round-trip); Import reads a file back with `FileReader`, does a light
shape check (rejects anything that doesn't look like a character export,
with a clear message) rather than full schema validation, and adds it as
a new catalog entry. Answers the open question above: `localStorage` +
export/import shipped as-is, real account-based cloud sync stays out of
scope.

Verified live: empty-state → new character → autosave confirmed by
reading `localStorage` directly mid-build → back to catalog shows the
in-progress entry correctly labeled by ancestry → Open resumes on the
exact step it was left on (tested both an incomplete character, which
lands back on Ancestry, and a fully completed one, which lands on
Summary with every field intact) → Duplicate, Delete (with its two-click
confirm), and Export all work with no console errors.

## 6. Class sub-choices — ✅ Done (v0.9.0)

Added the Bard Muse, Cleric Doctrine, Druid Order, Oracle Mystery,
Sorcerer Bloodline, Witch Patron, Wizard Arcane School, and Champion
Cause as an explicit "Choose your X" step for each of those 8 classes,
in `ClassStep.jsx` right after Key Ability. All 49 options (4 Muses, 2
Doctrines, 4 Orders, 8 Mysteries, 10 Bloodlines, 7 Patrons, 8 Arcane
Schools, 7 Causes) verified against AoN, filtered to Player Core /
Player Core 2 sources, in a new `src/data/subclasses.js`.

Shipped:
- **Tradition is now derived, not asked**, for Sorcerer and Witch — the
  chosen Bloodline/Patron carries a `tradition` field that
  `SpellsStep.jsx` reads directly. The old direct tradition question
  (`sc.traditionOptions`) survives only as a fallback for the one option
  where it's genuinely still needed: the Draconic bloodline, whose
  tradition depends on a further "draconic exemplar" sub-choice this app
  doesn't model.
- **Bloodline/Patron/Mystery-granted skills train automatically**,
  folded into `cls.fixedSkills` via a new `getEffectiveFixedSkills()` in
  `skills.js` that every consumer (ClassStep, SkillsStep, SummaryStep,
  LivePreviewPanel, fillCharacterSheet, and `getBackgroundSkillInfo`'s
  own collision check) now calls instead of reading `cls.fixedSkills`
  directly — so a background-skill collision with, say, a Fey Sorcerer's
  Nature training is caught correctly with no subclass-specific code.
  `getSkillPoolSize()`/`getExtraSkillsFromChoice()` stopped double
  -counting once concrete skills exist (Sorcerer's old "+2 abstract
  skills from bloodline" placeholder bonus is now 0, since the 2 skills
  are concrete and already counted via fixedSkills).
- Fixed a legacy-naming bug found while writing Druid's Order
  descriptions: `classes.js`'s Wild Shape feat still said "Requires the
  Wild Order" — the remaster renamed that 4th order to **Untamed**.

**Caught and fixed before shipping**: the first pass at this emptied
`feats1` for the newly-`classFeatAtLevel1: false` classes as part of the
RULE-04 fix (see the "External audit" section above) without realizing
Human's Natural Ambition ("a 1st-level class feat", no class exception)
still needs a catalog to grant from — verified live with a Human Wizard
+ Natural Ambition, which now correctly shows the Bonus Class Feat
picker instead of "no feats to choose from."

**Deliberately not in this pass** (documented gap, not silently
dropped):
- The specific bonus cantrips/spells each option grants (a Muse's "Muse
  Spell", a Bloodline's cantrip, a Patron's hex + familiar spell, a
  School's curriculum spells) are named in the option's description but
  not auto-added to `knownCantrips`/`knownSpells1` — that's a state-model
  change (a "bonus known spell beyond your normal count" concept doesn't
  exist yet) layered on top of real content work per class.
- Doctrine-gated spells (Cleric font cantrips) still aren't unlocked in
  the `SpellsStep` catalog — the Phase 3 caveat this item was meant to
  remove, blocked on Deity modeling. **Bard Compositions and Witch
  Patron hexes were both done in v0.9.1** (see below) — Witch turned out
  not to need Familiars after all, since each Patron's granted hex is a
  closed, fully-specified 1st-level case.
- Universalist/School of Unified Magical Theory's bonus wizard class
  feat isn't auto-granted (would need a second independent
  `bonusClassFeat`-style slot, since a Human Wizard could have both this
  *and* Natural Ambition active at once).
- Draconic Sorcerer's exemplar choice and Elemental Sorcerer's element
  choice are described as sub-choices in the option text but don't have
  their own nested picker — a real gap for those two specifically, not
  every bloodline.
- Champion Cause descriptions cover the *Relentless* reaction tier only
  (what applies at 1st level); the *Exalted* tier (gained later) isn't
  included, same reasoning as Doctrine only covering its 1st-level tier.
- Witch's pre-existing `feats1: []` gap (noted when `classFeatAtLevel1`
  was added — no AoN-verified Witch Feat-1 data exists yet, so Natural
  Ambition still grants nothing for a Human Witch) remains open;
  unrelated to this item but adjacent enough to note here again.

Verified live end-to-end for Sorcerer (Fey bloodline: skills correctly
show Deception/Nature with no double-counted pool bonus, tradition
auto-resolves to Primal with no manual picker, spell pool and Summary
both reflect it) and Champion (Cause picker renders, its `feats1`
entries' "Requires the Justice/Liberation/Iniquity/Obedience cause" text
lines up with the real cause names). `npm run lint` (0 errors, same
baseline warnings) and `npm run build` both clean.

### Follow-up: Bard Composition cantrips + Witch Patron hexes unlocked (v0.9.1)

Investigated all 8 classes' gated spells before picking a starting point
(explicitly "least complicated first"), starting with Bard.

**Bard**: Composition cantrips turned out to be the simplest — Uncommon +
Bard-trait occult spells every Bard has access to *regardless of which
Muse*, not spells tied to one specific Muse option. That meant no new UI
or state was needed, just extending the existing pool with
correctly-gated entries. Added 9 cantrip-rank compositions (Allegro,
Courageous Anthem, Dirge of Doom, House of Imaginary Walls, Rallying
Anthem, Song of Marching, Song of Strength, Triple Time, Uplifting
Overture) to `CANTRIPS` in `spells.js`, each carrying a new optional
`classId: 'bard'` field. `getSpellsForTradition()` gained a third
`classId` parameter — a spell with a `classId` only surfaces for that
exact class, everything else is unaffected. (8 more Player Core
compositions exist but carry the Focus trait instead of Cantrip — Focus
Points aren't modeled at all, so those stay out; they're feat-granted
rather than freely known anyway, e.g. Lingering Composition already
grants one.)

**Witch**: initially assumed blocked on Familiars (a Witch's cantrips
come from "the spells your familiar knows," an open-ended list this app
doesn't model) — but on closer reading, at 1st level that list isn't
actually open-ended. Each Patron's own description already names exactly
one hex cantrip it grants ("you gain the [x] hex cantrip"); the
familiar's *other* learned spell ("your familiar learns [y]") is
something the familiar itself casts, a separate mechanic correctly still
deferred to item 7. That made the Patron hex a closed, fully-specified
case, not something requiring real Familiar modeling. Added all 7
Player Core hex cantrips (Clinging Ice, Discern Secrets, Evil Eye, Nudge
Fate, Shroud of Night, Stoke the Heart, Wilding Word) to `CANTRIPS`,
each tagged `classId: 'witch'` and a new `patronId` field (matching
`subclasses.js`'s option ids) — `getSpellsForTradition()` excludes any
`patronId`-tagged entry from the general pool, since none of them are a
free pick. `SpellsStep.jsx` instead looks up the one matching the
character's actual Patron directly (`getPatronHex()`, new in
`spells.js`) and injects it into the cantrip grid pre-selected and
locked (a new `locked` prop on `SpellCard`, shown with a "Granted"
badge instead of its action-cost badge) — counted toward the normal 5
cantrips known, not a bonus 6th, matching the rule's "prepare... from
the spells your familiar knows" phrasing. A `useEffect` guarantees it
stays in `knownCantrips` even for a character saved before this shipped,
or right after switching Patron.

**Caught by lint before shipping, twice**: (1) a straight copy-paste
mistake landed the 9 Bard cantrips inside `SPELLS_RANK_1` instead of
`CANTRIPS` — the anchor text used for the insertion edit matched the
wrong array's closing bracket, and a same-session browser check gave a
false positive by only confirming the spell *name* appeared on the page
without checking which picker it was under. Moved to the correct array
and re-verified by checking `CANTRIPS`/`SPELLS_RANK_1`'s line boundaries
directly, not just page text. (2) The Witch hex's `useEffect` initially
sat after `SpellsStep`'s two early `return` statements (for non-casters
and feat-only casters), which is a real Rules-of-Hooks violation — oxlint
caught it immediately (`react-hooks/rules-of-hooks`), fixed by hoisting
the hook (and the `patronHex` lookup it depends on) above both early
returns.

Verified live for both: a Bard's cantrip pool includes Allegro and
Courageous Anthem while a same-tradition (occult) Sorcerer's doesn't; a
Silence in Snow Witch's cantrip grid shows Clinging Ice pre-selected,
disabled, and badged "Granted," counted as 1 of 5, with Nature trained
automatically from the same Patron — confirmed through to Summary
(`Cantrips: Clinging Ice, Acid Splash, ...`). No console errors, `npm
run lint`/`npm run build` clean.

**Still open** for the remaining 6 classes, roughly in rising order of
complexity: Wizard's Arcane School curriculum spells (data-only, same
pattern as Bard — next likely candidate), Sorcerer/Oracle's
Bloodline/Mystery-granted bonus spell (needs a "known beyond your normal
count" state concept, since unlike Witch's single guaranteed hex, these
are *extra* spells on top of a full freely-chosen repertoire), Druid
Order feats' gating (already shown, just needs the same `classId`-style
check extended to feats), Champion's per-Cause base reaction (needs the
actual reaction text per Cause, not just the Relentless-tier bonus
already captured), and Cleric font/domain spells (blocked on Deity
modeling, not currently scoped anywhere).

## 7. Familiars

**Size: M, ⚠ blocked on item 9.** Wizard's Familiar feat and Witch's
patron-granted familiar already exist as choices in the app (1st-level
feat selection); this phase adds the actual familiar: its stat block, the
familiar-abilities list a player picks from (with some abilities gated to
a specific master class, e.g. Wizard-only ones), and how that list grows
as the master levels up.

Depends on Level-up (item 9) for the "gains more abilities per level"
part; the base 1st-level familiar (name, base abilities) could
technically start earlier but is more useful shipped alongside leveling.

Open question: none beyond the dependency above.

## 8. Multiclass & Archetypes

**Size: L, ⚠ blocked on item 9.** In the remaster, these are **the same
system**: there's no separate "multiclass" mechanic — you multiclass by
taking a class's Dedication feat (an archetype), which is gained through
a normal class feat slot and unlocks a chain of follow-up archetype feats
over further levels. Building generic archetype support (a dedication
feat + its feat chain, prerequisite-gated, consuming class feat slots)
delivers multiclassing and archetypes as one feature, not two.

Depends on Level-up (item 9) being in place, since dedication feats are
picked from class feat slots that don't exist until then. Ranked last but
one because, once unblocked, it's still a large data-entry project in its
own right — dozens of archetypes across three books.

Open question: scope which archetypes ship first — there are dozens
across Player Core, Player Core 2, and GM Core. Recommend starting with
the class-Dedication archetypes (Fighter Dedication, Wizard Dedication,
etc. — one per existing class) before broader non-class archetypes
(Alchemist-adjacent, Marshal, etc.), mirroring how Phase 3 scoped spells
to "universal" ones first and flagged the rest for later.

## 9. Level-up (2–20)

**Size: XL — the biggest single item by a wide margin, and effectively
its own multi-part project rather than one phase.** This is the leveling
engine everything else in this list either depends on or benefits from:

- Proficiency progression per class (Perception, saves, Class DC, skills,
  weapons, armor) as level increases — this is also exactly what's
  needed to fix the known **AC Expert+ armor gap**: once a class's armor
  proficiency actually advances past Trained at the levels PF2e specifies,
  the AC formula already in `SummaryStep.jsx` just needs the right rank
  fed in per level, no formula rewrite.
- Ability boosts at 5th/10th/15th/20th.
- Skill increases at every level past 1st (trained → expert → master →
  legendary, per the normal skill-increase rules).
- Feat slots: ancestry feats (5/9/13/17), class feats (every even level),
  skill feats (every even level from 2nd), general feats (3/7/11/15/19)
  — each needs the *actual* feat catalog for that slot at that level,
  which for classes means extending `feats1`-style verified data up
  through the relevant level for all 16 classes. This alone is a large,
  AoN-verification-heavy undertaking, same rigor as the Phase 1
  correctness pass, just much bigger in surface area.
- Spellcasting scaling: more cantrips/spells known, new spell ranks
  unlocking on the normal caster progression, spell slot counts per rank.

Recommended approach: build the generic engine (proficiency tables,
ability boost step, skill increase step, the feat-slot framework) against
one or two classes first — verified end-to-end — then extend the feat/
spell data class-by-class rather than trying to land all 16 classes to
level 20 in one pass.

Open question: whether to cap at a lower level first (e.g. ship 2–10,
then 11–20 as a follow-up) to get real usage sooner — worth deciding once
this phase is actually being scoped in detail.

### Fighter-first pass, levels 1-10 (v0.10.0)

Scoped per explicit direction: cap at level 10 first (11-20 later), build
the generic engine against Fighter only (no spellcasting, simplest class),
verify end-to-end, then extend to the other 15 classes one at a time.

Shipped the generic engine, all in new `src/utils/leveling.js` unless
noted: `getLevelRequirements()` (the universal cadence — class/skill feat
every even level, general feat 3/7, ancestry feat 5/9, skill increase odd
levels from 3rd, 4 ability boosts at 5/10 — confirmed identical across
classes via AoN, not assumed), `computeScoresAtLevel()`/`computeTotalHP()`
(in `abilityScores.js` and `leveling.js` respectively — HP is a 3-segment
step function, not `hp*level`, since a Con boost at 5th/10th changes the
modifier used from that level on without retroactively changing earlier
levels), `getSkillRank()` (`skills.js` — walks `skillIncreases` on top of
the existing level-1 trained/not logic), `getCurrentRank()` (per-class
proficiency-rank progression, falling back to the level-1 baseline rather
than fabricating a bump for a class with no data yet), and `meetsPrereq()`
(checks a feat's `prereq` text — trained-in-skill, ability floor, rank
floor, or a named-feat chain — filtering the Level-Up feat pickers to only
what's actually available; deliberately *not* applied to the level-1
Ancestry/Background pickers, since background/class/skills don't exist yet
at that point in the wizard and filtering there would wrongly hide
legitimately-available future options).

New "Leveling Up" section in `SummaryStep.jsx`: one `Collapsible` card per
level 2 through `min(character.level+1, 10)`, each rendering the new
`LevelUpCard.jsx` with whatever slots that level calls for. Editing an
already-confirmed level's pick is allowed (not locked) since every derived
stat recomputes from the raw per-level arrays rather than caching a
snapshot.

Fighter's own data, verified against AoN (`2e.aonprd.com/Classes.aspx?ID=35`,
Feats search via the Elasticsearch technique — see PROJECT_NOTES.md):
`proficiencyProgression` (Perception Expert→Master at 7th, Will
Trained→Expert at 3rd, Fortitude Expert→Master at 9th; Class DC and armor
stay at their 1st-level rank through 10th — Fighter's own bumps for those
land at 11th, outside this cap), and a curated 5-feat catalog per even
level 2-10. Also added Human's real `feats5`/`feats9` ancestry catalog
(all 3 and all 5 of them — nothing trimmed, Player Core pg. 64-65) so the
pilot's ancestry-feat slot isn't just a placeholder, and a `Fighter Weapon
Mastery` section (automatic at 5th, not part of the universal cadence) plus
a `subChoice` mechanism on `Advanced Weapon Training` (6th) — both pick
from a real 17-entry `WEAPON_GROUPS` list (`equipment.js`, pulled from
AoN's own `weapon_group` field across all 300 weapons, not guessed).

**Bugs found and fixed while dogfooding this against a real Fighter
build**, most severe first:

1. **Every "_TEML" proficiency checkbox on the bundled PDF was silently
   always rendering Trained, regardless of actual rank** — Perception,
   every save, Class DC, every skill, Lore, spell DC/attack, and every
   armor/weapon proficiency box. Confirmed by inspecting the PDF's AcroForm
   directly: each of these fields isn't a real single-value checkbox, it's
   one field with 4 separate widgets (one per rank), each with its own
   on-value (either literal "2/4/6/8" or "T/E/M/L" depending on the
   field) — `form.getCheckBox(name).check()` with no argument always
   selects the *first* widget. This predates leveling entirely (Fighter is
   Expert in Perception/Fortitude/Reflex at 1st level already) — every
   character's PDF export has shown the wrong rank since v0.7.0. Fixed in
   `fillCharacterSheet.js`: sorts each field's widgets left-to-right and
   selects by rank-index position instead of calling `.check()` blind.
   Verified by intercepting the real download's Blob (patching
   `URL.createObjectURL`) and re-parsing it with pdf-lib to confirm the
   correct widget's `/AS` state, not just eyeballing the rendered PDF.
2. Picking the same feat for both a class's normal 1st-level feat and a
   Natural Ambition bonus feat was allowed and both cards showed selected
   — PF2e doesn't let you take a non-repeatable feat twice. Fixed in
   `ClassStep.jsx` by having each of the two grids filter out whatever the
   *other* one currently holds, so a claimed feat simply can't be clicked
   in the other slot (same mutual-exclusion pattern already used for
   Skilled Heritage vs. Natural Skill's skill choices).
3. Shields never showed their AC bonus in the Equipment step — the
   display condition required both `acBonus` and `category`, but only
   armor has `category` (shields don't). Fixed in `EquipmentStep.jsx`,
   worded "+N AC when raised" (not the same always-on bonus armor gives)
   to avoid implying it's passive.
4. Hardness/BT (Broken Threshold) had no Inspect definition — plain text,
   never wrapped in a `GlossaryTerm`; `broken-threshold` didn't even exist
   in `glossary.js` yet. Added the entry and wrapped both terms (plus HP)
   in the shield/armor shop rows.

Verified live end-to-end: built a Human Fighter with Natural Ambition,
leveled 1→9 confirming HP/Perception/saves/Class DC/skill ranks at every
rank-change boundary by hand, confirmed the master-skill-increase gate
(disabled before 7th, enabled at 7th+), confirmed a Barreling Charge-style
prereq (Trained in Athletics) correctly shows/hides based on actual
training, confirmed Adaptive Adept (needs the Adapted Cantrip feat this
build didn't take) is correctly filtered out of the 5th-level ancestry
options, and confirmed the Weapon Mastery / Advanced Weapon Training
weapon-group pickers block level confirmation until answered. `npm run
lint` clean (same baseline warnings only) throughout.

**Deliberately out of scope this pass**: `LivePreviewPanel.jsx` (only
rendered before leveling exists, steps 1-9); spellcasting proficiency
progression (every caster stays pinned at Trained regardless of level —
irrelevant to Fighter, a real gap for whichever caster's data comes next);
weapon-category proficiency *rank* (Simple/Martial/Unarmed on the PDF
still show Trained-if-proficient rather than Fighter's real Expert, since
no per-category rank progression is modeled yet — narrower than the
`_TEML` bug just fixed, which was about reading the wrong widget, not
missing data); every other class's `proficiencyProgression` and
`feats2`-`feats10`; every ancestry's `feats5`/`feats9` except Human;
levels 11-20.

---

## Known gap folded into this roadmap

The previously-noted **AC Expert+ armor** gap (a class's armor
proficiency advancing past Trained isn't reflected in the AC formula) is
not a standalone fix — it's simply missing proficiency-progression data,
which is exactly what Level-up (item 9) builds. No separate work needed.
