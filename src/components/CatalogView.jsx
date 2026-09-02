import { useRef, useState } from 'react';
import { getAncestry } from '../data/ancestries';
import { getClass } from '../data/classes';
import {
  listCharacters,
  deleteCharacter,
  duplicateCharacter,
  exportCharacterFile,
  parseImportedCharacter,
  saveCharacter,
  generateId,
} from '../utils/characterCatalog';

function formatSavedAt(ms) {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function CatalogCard({ entry, onLoad, onDuplicate, onDelete }) {
  const { id, character } = entry;
  const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
  const cls = character.classId ? getClass(character.classId) : null;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="option-card catalog-card">
      <h4>{character.name?.trim() || 'Untitled character'}</h4>
      <p className="option-desc">
        {ancestry ? ancestry.name : 'No ancestry yet'}
        {cls ? ` · ${cls.name}` : ''}
      </p>
      <p className="option-meta">Saved {formatSavedAt(entry.savedAt)}</p>
      <div className="catalog-card-actions">
        <button type="button" className="btn secondary small" onClick={() => onLoad(id)}>
          Open
        </button>
        <button type="button" className="btn secondary small" onClick={() => onDuplicate(id)}>
          Duplicate
        </button>
        <button type="button" className="btn secondary small" onClick={() => exportCharacterFile(character)}>
          Export
        </button>
        {confirmingDelete ? (
          <button type="button" className="btn danger small" onClick={() => onDelete(id)} onBlur={() => setConfirmingDelete(false)}>
            Confirm delete?
          </button>
        ) : (
          <button type="button" className="btn danger small" onClick={() => setConfirmingDelete(true)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// The app's landing screen (ROADMAP.md item 5): list saved characters,
// open one back into the wizard, duplicate, delete, or start fresh.
// Reads localStorage fresh on every render via `refreshKey` bumping after
// any mutating action, rather than holding its own copy of the list in
// state that could drift from what's actually stored.
export default function CatalogView({ onOpenCharacter, onStartNew }) {
  // Bumped after any mutating action purely to force a re-render; the list
  // itself always comes fresh from listCharacters() below, never from
  // state, so it can't drift from what's actually in localStorage.
  const [, setRefreshKey] = useState(0);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);
  const characters = listCharacters();

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleDelete(id) {
    deleteCharacter(id);
    refresh();
  }

  function handleDuplicate(id) {
    duplicateCharacter(id);
    refresh();
  }

  function handleImportClick() {
    setImportError('');
    fileInputRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file next time
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const character = parseImportedCharacter(reader.result);
        saveCharacter(generateId(), character);
        setImportError('');
        refresh();
      } catch (err) {
        setImportError(err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="step">
      <div className="catalog-header">
        <div>
          <h2>My Characters</h2>
          <p className="hint">
            Saved automatically in this browser as you build. A character saved here won't show up on another
            device — use Export/Import to move one across devices.
          </p>
        </div>
        <div className="catalog-header-actions">
          <button type="button" className="btn secondary" onClick={handleImportClick}>
            Import
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleImportFile} hidden />
          <button type="button" className="btn primary" onClick={onStartNew}>
            + New Character
          </button>
        </div>
      </div>

      {importError && <p className="option-warning">{importError}</p>}

      {characters.length === 0 ? (
        <p className="catalog-empty">No characters yet — create your first one, or import a `.json` file exported from this app.</p>
      ) : (
        <div className="card-grid">
          {characters.map((entry) => (
            <CatalogCard key={entry.id} entry={entry} onLoad={onOpenCharacter} onDuplicate={handleDuplicate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
