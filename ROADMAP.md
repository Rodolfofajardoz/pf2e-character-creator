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
| 1 | Live side-panel preview | S | Zero new PF2e data — pure refactor + layout. |
| 2 | Language selection | S | Rule confirmed; small, contained data + a simple choice step. |
| 3 | Custom backgrounds | S–M | Reuses existing data (abilities, skills, `GENERAL_FEATS`); just a form. |
| 4 | Custom PDF sheet printing | S–M | File inspected — real fillable AcroForm PDF, no longer blocked. |
| 5 | Save/load character catalog | M | Pure engineering (storage + CRUD screens), no rules research. |
| 6 | Class sub-choices | M | AoN verification across 8 classes, plus new spell data it unlocks. |
| 7 | Familiars | M | ⚠ blocked — full scope needs item 9 (Level-up) done first. |
| 8 | Multiclass & Archetypes | L | ⚠ blocked — needs item 9 (Level-up) done first; also the largest data surface after leveling itself. |
| 9 | Level-up (2–20) | XL | The biggest item by far — see below for why it's basically its own multi-part project. |

**Important caveat on items 7 and 8**: they're ranked by how much work
*they themselves* involve, not by when they can actually be picked up.
Both genuinely require Level-up (item 9) to exist first — Familiars needs
the per-level ability-growth table, Multiclass/Archetypes needs class
feat slots past 1st level to spend a Dedication feat on. So the real
buildable order, if going strictly smallest-first while respecting
dependencies, is 1 → 2 → 3 → 4 → 5 → 6 → 9 → 7 → 8. Listed here by raw
difficulty as asked, with the dependency called out rather than hidden.

---

## 1. Live side-panel preview

**Size: S.** A persistent panel (desktop: fixed side column; mobile:
collapsible drawer) showing the character sheet as it's being built,
updating live as `character` state changes — essentially `SummaryStep`'s
output rendered continuously instead of only on the last step.

Work: factor `SummaryStep.jsx`'s derived-stat math (HP, AC, saves,
Perception, Class DC — currently computed inline in that component) into
a shared hook (e.g. `useComputedCharacter(character)`), so both
`SummaryStep` and the new preview panel read from one source of truth
instead of duplicating the formulas. Then build the panel as a layout
change in `App.jsx`. No new game data, no AoN verification — the easiest
item on this list.

Open question: confirm whether the preview should be visible on every
step or only from some step onward (e.g. it's fairly empty during
Ancestry/Background) — a UX call, easy to adjust once it's up and being
tried out live.

## 2. Language selection

**Size: S.** Rule confirmed via AoN (Rules pg. 65, `2e.aonprd.com`
rules-131): *"Having a positive Intelligence modifier grants a number of
additional languages equal to your Intelligence modifier."* Chosen from
the ancestry's own bonus-language list plus the Common/Uncommon tables
(Table 2-1/2-2), with GM approval needed for anything off those lists —
which this app can simplify to "anything on the standard tables," noting
the GM-approval case as a caveat like the subclass-spell one.

Work: add a bonus-language list per ancestry to `ancestries.js` (not
currently modeled — a real data gap, verified against AoN's ancestry
pages the same way `languages` was), add a language-choice step gated on
`abilityMod(int) > 0`, letting the player pick exactly that many extra
languages. Ties in cleanly at 1st level; no dependency on level-up.

Open question: none.

## 3. Custom backgrounds

**Size: S–M.** Lets a player build their own background from scratch
instead of picking one of the 35 fixed ones — for a concept none of the
existing backgrounds fit. Confirmed against AoN's "Step 4: Pick a
Background" (Core Rulebook pg. 24): every background reduces to the same
shape — an ability boost pair (one of two named abilities, player's
choice) plus one free boost, training in one specific skill, training in
one Lore skill, and one specific skill feat. A custom background is just
a UI for filling in that same shape by hand instead of picking a preset
that already fills it in.

Work: a "Custom" option alongside the 35-card grid in `BackgroundStep.jsx`
that lets the player (1) pick any two abilities for the boost-choice pair,
(2) pick any trained skill, (3) type a free-text Lore subcategory (same
free-text pattern already used for the fixed backgrounds' Lore field),
and (4) pick a skill feat. That last part doesn't need new data — the
`GENERAL_FEATS` catalog from Phase 2 already includes the Skill-trait
feats (the ones with a `prereq` like "Trained in X"), so the picker can
just offer that list, ideally filtered to feats whose prereq matches the
skill chosen in step 2 (with an "show all" escape hatch, same
trust-the-player spirit as how prereqs are already handled elsewhere in
this app — shown, not hard-enforced).

Open question: whether the custom background also needs a free-text name/
description field for flavor (cheap to add, purely cosmetic — doesn't
affect any calculation) — worth deciding when this is actually built.

## 4. Custom PDF sheet printing

**Size: S–M (downgraded from M — file inspected, turned out to be the
easy case).** Filling the user's own character sheet PDF with the
builder's output instead of the current `window.print()` of the on-page
summary.

The file was inspected with `pdf-lib` (now installed as a project
dependency): it's a genuine **fillable AcroForm PDF** — 22 pages, Letter
size, 2213 form fields (2001 text fields, 201 checkboxes, 9 dropdowns, no
radio groups). No coordinate-guessing needed; `pdf-lib` can set each named
field directly and export the filled PDF for download.

It's a full lifetime sheet (crafting, downtime, backstory, and enough
spellbook pages for a 10th-rank caster), far more than this level-1
builder currently produces — but only **two of the 22 pages** are
relevant right now:
- **Page 1** (249 fields): the main stat block — name, ancestry,
  background, class, level, ability scores/mods, AC, Perception, Class
  DC, saves, all 17 skills (total + a single "trained" checkbox each —
  conveniently, no expert/master/legendary bubbles to worry about, since
  this app doesn't produce those ranks yet either), up to 4 weapon
  Strikes, armor/weapon proficiency checkboxes, and languages. Field
  names are clean and self-describing (`ANCESTRY  HERITAGE`,
  `ARMOR CLASS`, `ACROBATICS_TOTAL`, `ACROBATICS_TEML`, etc.) and map
  almost 1:1 onto the `character` state and `SummaryStep`'s computed
  stats.
- **Page 3** (343 fields): spellcasting — cantrip/1st-rank spell name
  slots, a tradition checkbox row, and spell DC/attack fields. Also maps
  cleanly, with one small gap: this app doesn't currently compute a
  spell DC/attack number anywhere — cheap to add, same `10 + proficiency
  + ability mod` pattern already used for Class DC.

Everything else (page 2's backstory/flavor fields, page 4's crafting
formulas, and pages 5 onward — feat grids, inventory tracking, and
spellbook pages for higher ranks) stays blank in the output until later
roadmap items (leveling, crafting, more equipment slots) give this app
data to put there — which is fine; a level-1 sheet with only the first
two pages filled in is exactly what a level-1 builder should produce.

Work: a field-name mapping table (roughly 80–100 relevant fields, not
2213) from `character`/computed-stats to PDF field name, a fill function
using `pdf-lib`, and a "Download filled sheet" button alongside (or
replacing) the current print button.

Open question: none — this is scoped and ready to start whenever picked
up next, no longer blocked.

## 5. Save/load character catalog

**Size: M.** A "My Characters" screen: list saved characters, load one
back into the builder, duplicate, delete, and start a new one. Storage
via `localStorage` (simplest, no backend) keyed by a generated id per
character, holding the full `character` state object plus a
last-modified timestamp. No rules research involved — this is pure
engineering, which is why it ranks ahead of the content-heavy items of
the same nominal size.

Important limitation to flag to the user directly: `localStorage` is
per-browser, per-device — a character saved on a phone won't appear on a
laptop. Since this project is already being worked on from multiple
devices via GitHub, that's worth calling out before building it. Adding
a **JSON export/import** button (download the character as a `.json`
file, re-upload it elsewhere) is a cheap way to make characters portable
across devices without standing up real cloud storage/accounts — worth
including in this phase rather than as a separate one.

Open question: confirm `localStorage` + export/import is enough, versus
wanting real account-based cloud sync (a materially bigger project —
needs auth and a backend, not just frontend work).

## 6. Class sub-choices

**Size: M.** Adds the Bard Muse, Cleric Doctrine, Druid Order, Oracle
Mystery, Sorcerer Bloodline, Witch Patron, Wizard Arcane School, and
Champion Cause as an explicit choice step for each of those 8 classes,
the same pattern already used for heritage/background feat choice
(a `chip-row` or `card-grid` of options stored on `character`). Ranks
below Save/load despite being the same nominal size because it needs a
full AoN-verification pass across 8 classes plus new spell data, not
just engineering.

What it unlocks:
- Removes the Phase 3 caveat that spell lists only include
  tradition-universal spells — Muse compositions, Doctrine font spells,
  Patron hexes, etc. become selectable once their gating choice exists.
- Sorcerer/Witch currently ask the player to pick a tradition directly
  (`sc.traditionOptions`) as a stand-in for Bloodline/Patron — once the
  real choice exists, tradition should be *derived* from it instead of
  asked separately.
- Each choice typically also grants a small 1st-level benefit (e.g. a
  Bloodline grants a bonus spell and a resistance; a Doctrine changes a
  Cleric's font options) that needs its own verified AoN data, same
  rigor as the Phase 1 feat-text correctness pass.

Open question: none — this is scoped and ready to start whenever picked
up next.

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

---

## Known gap folded into this roadmap

The previously-noted **AC Expert+ armor** gap (a class's armor
proficiency advancing past Trained isn't reflected in the AC formula) is
not a standalone fix — it's simply missing proficiency-progression data,
which is exactly what Level-up (item 9) builds. No separate work needed.
