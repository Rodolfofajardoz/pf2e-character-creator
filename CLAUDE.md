# Working agreements for this repo

Written in English to match `PROJECT_NOTES.md` and `ROADMAP.md`. Read this
first, then `PROJECT_NOTES.md` for project state and `ROADMAP.md` for what's
planned.

## Workflow rules

**Never push without explicit confirmation.** Show the diff and wait for an
OK. This applies to every push, including docs-only changes.

**Work on a branch, open a PR — never commit straight to `master`.** The
review happens in the PR. Releases are cut afterwards, from `master`:

```
branch → PR → user reviews and merges → tag vX.Y.Z → GitHub Release
```

The tag and the Release therefore land in a **second step after the merge**,
not inside the PR. Don't skip them: every version is a restore point, so the
release history is deliberately kept complete.

Pushing to `master` triggers the GitHub Pages deploy
(`.github/workflows/deploy.yml`), so a merge is also a production deploy.

## Versioning

Informal semver. Currently `0.6.4`.

| Change | Bump | Example |
|---|---|---|
| A `ROADMAP.md` item lands | **minor** | item 1 → `v0.6.0` |
| UX fix or polish after a release | **patch** | `v0.6.1`–`v0.6.4` |
| Every roadmap item done | `v1.0` | — |

Each release needs all four of these:

1. **`package.json` `version`** bumped in the same commit as the change.
2. **Commit message**: `vX.Y.Z: lowercase summary, comma separated`
   — e.g. `v0.6.4: shop rebuild (quantities, categories, shields), scroll fixes`.
   Non-release commits (docs, roadmap edits) use a plain descriptive
   sentence with no version prefix.
3. **Git tag** `vX.Y.Z` on the release commit.
4. **GitHub Release** named `vX.Y.Z — Title Case Name`
   — e.g. `v0.6.4 — Equipment Shop Rebuild`.

**Always update `PROJECT_NOTES.md`** in the same PR: add a
`### Patch: vX.Y.Z — …` or `### Roadmap item N: … — done (vX.Y.Z)` section
covering what changed and *why*. This is the most consistent convention in
the repo — the notes are how the next session picks the project back up.

## Before every push

```bash
npm run lint    # oxlint — 0 errors; 4 pre-existing warnings are the baseline
npm run build   # must succeed
```

## Architecture

React 19 + Vite 8, plain JS (no TypeScript), oxlint. An 8-step wizard.

- **One state object.** The whole character is a flat object defined as
  `initialCharacter` in `src/App.jsx`. Steps receive `{ character, update }`
  and call `update({ field: value })`. Adding a choice means adding a field
  there.
- **`canGoNext` in `src/App.jsx` is the single gate** for advancing a step.
  A new required choice must be validated there or it can be skipped.
- **`src/hooks/useComputedCharacter.js` is the single source of truth for
  every derived stat** (scores/mods, HP, AC, Perception, Class DC, saves,
  gold). `SummaryStep` and `LivePreviewPanel` both read from it — never
  recompute a stat in a component. Every field returns `null` rather than
  throwing when the choice it depends on hasn't been made yet, because the
  preview panel renders from step 1 onward.
- **`src/data/`** holds the rules content: ancestries (16), classes (16),
  backgrounds (35), equipment, spells, general feats (84), skills, glossary.

## Rules data must be verified against Archives of Nethys

Never write feat/spell/ancestry text from memory, however plausible it
sounds. An earlier pass fabricated a noticeable fraction of feat
descriptions — mechanics that read correctly but did not match the real
feat — and every one had to be found and rewritten. Query AoN's search
index and compare each entry against its actual text. See the "AoN scraping
notes" section of `PROJECT_NOTES.md` for how, and prefer remaster (Player
Core) sources over legacy ones.

## UI conventions

- **Dark theme is committed**, set directly on `:root` in `src/index.css` —
  not behind a `prefers-color-scheme` media query. There is no light mode.
- **The print stylesheet (`@media print` in `src/App.css`) forces
  white/black.** If you add a panel-styled component that appears on the
  summary sheet, add its print rules too or it prints unreadable.
- **Inspect mode** (`src/context/InspectContext.jsx`) makes glossary jargon
  clickable. Glossary matching is **case-sensitive on purpose** — terms must
  be capitalized exactly as they appear in source text, which avoids false
  positives like "will" matching the Will save. `GlossaryTerm` renders as a
  `<span role="button">` rather than a real `<button>` because it gets
  embedded inside description text that is often already inside a clickable
  `<button>`.
- **Don't rely on `{ behavior: 'smooth' }`** for actually reaching a scroll
  position. It was tested on mobile and confirmed to be a no-op there —
  scrollY never moves. See `src/utils/scrollFocus.js`.

## Dev server

```bash
npm install   # first time, or after dependency changes
npm run dev   # http://localhost:5173/
```
