// localStorage-backed save/load catalog (ROADMAP.md item 5). Everything
// lives under one key as an { [id]: { character, savedAt } } map -- level-1
// characters are tiny, so rewriting the whole map on every save is cheap
// and avoids the complexity of per-character keys.
//
// Known limitation, worth surfacing in the UI, not just here: localStorage
// is per-browser, per-device. A character saved on a phone won't show up
// on a laptop. exportCharacterFile()/parseImportedCharacter() exist
// specifically to make characters portable across devices without a real
// backend.

const STORAGE_KEY = 'pf2e-character-creator:catalog';

function readCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // Corrupted JSON, or localStorage unavailable (private browsing in some
    // browsers throws on access). Treat as an empty catalog rather than
    // crashing the app.
    return {};
  }
}

function writeCatalog(catalog) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  } catch {
    // Quota exceeded or localStorage unavailable -- save silently no-ops.
    // A level-1 character is a few KB, so this should only happen in
    // private-browsing modes that block storage entirely.
  }
}

export function generateId() {
  return `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Newest-first, so the character you're actively working on (or most
// recently touched) is always at the top of "My Characters".
export function listCharacters() {
  const catalog = readCatalog();
  return Object.entries(catalog)
    .map(([id, entry]) => ({ id, character: entry.character, savedAt: entry.savedAt }))
    .sort((a, b) => b.savedAt - a.savedAt);
}

export function saveCharacter(id, character) {
  const catalog = readCatalog();
  catalog[id] = { character, savedAt: Date.now() };
  writeCatalog(catalog);
}

export function loadCharacter(id) {
  return readCatalog()[id]?.character ?? null;
}

export function deleteCharacter(id) {
  const catalog = readCatalog();
  delete catalog[id];
  writeCatalog(catalog);
}

// Returns the new entry's id, or null if the source id doesn't exist.
export function duplicateCharacter(id) {
  const catalog = readCatalog();
  const source = catalog[id];
  if (!source) return null;
  const newId = generateId();
  const name = source.character.name ? `${source.character.name} (copy)` : '';
  catalog[newId] = { character: { ...source.character, name }, savedAt: Date.now() };
  writeCatalog(catalog);
  return newId;
}

// Triggers a browser download of the character as a standalone .json file
// -- the export half of moving a character between devices without a
// backend. Uses the same object-URL-plus-hidden-<a> pattern as any other
// client-side file download; no server round-trip.
export function exportCharacterFile(character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const slug = (character.name || 'character').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'character';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.pf2e.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Parses and lightly sanity-checks an imported character file -- not a
// full schema validation (this app has no schema library), just enough to
// reject "this obviously isn't a character export" (wrong file, corrupted
// paste) with a clear message instead of loading a broken object into the
// wizard and failing confusingly somewhere downstream.
export function parseImportedCharacter(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data) || !('trainedSkills' in data) || !('weaponIds' in data)) {
    throw new Error("That file doesn't look like a character exported from this app.");
  }
  return data;
}
