import { useEffect, useMemo, useState } from 'react';
import { getClass } from '../../data/classes';
import { CANTRIPS, SPELLS_RANK_1, getSpellsForTradition, getPatronHex, TRADITION_LABELS } from '../../data/spells';
import { SUBCLASSES, getSubclassOption } from '../../data/subclasses';
import { GlossaryTerm, InspectText } from '../../context/InspectContext';
import Collapsible from '../Collapsible';

// AoN writes casting time as a number of action icons (or a named badge for
// Reaction/Free Action/longer activities). `cast` is only set on entries
// that aren't the default two actions — see spells.js.
function actionBadge(cast) {
  if (!cast) return '2 Actions';
  if (cast === 'Single Action') return '1 Action';
  return cast;
}

// The Source/Range/Area/Target/Duration/Defense line — only the fields a
// given spell actually has (e.g. most cantrips have no Duration, an area
// spell has no Target). Rendered as "Label value" pairs, comma-separated.
function InfoLine({ spell }) {
  const fields = [
    ['Range', spell.range],
    ['Area', spell.area],
    ['Target', spell.target],
    ['Duration', spell.duration],
    ['Defense', spell.defense],
  ].filter(([, v]) => v);
  if (fields.length === 0) return null;
  return (
    <div className="spell-card-info">
      {fields.map(([label, value]) => (
        <p key={label}>
          <strong>{label}</strong> {value}
        </p>
      ))}
    </div>
  );
}

function SpellCard({ spell, selected, disabled, locked, onClick }) {
  return (
    <button
      className={`spell-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      disabled={disabled || locked}
    >
      <div className="spell-card-header">
        <h4>{spell.name}</h4>
        {locked ? (
          <span className="spell-card-badge">Granted</span>
        ) : (
          <span className="spell-card-badge">{actionBadge(spell.cast)}</span>
        )}
      </div>
      <div className="spell-card-traits">
        {spell.traits.map((t) => (
          <span key={t} className="trait-tag">{t}</span>
        ))}
      </div>
      <div className="spell-card-body">
        <p className="spell-card-source">{spell.source}</p>
        <InfoLine spell={spell} />
        <hr className="spell-card-rule" />
        <p className="option-desc"><InspectText text={spell.desc} /></p>
        {spell.heightened && (
          <>
            <hr className="spell-card-rule" />
            <div className="spell-card-heightened">
              <strong><GlossaryTerm id="heightened">Heightened</GlossaryTerm></strong>
              {/* Multi-tier entries repeat the word "Heightened" before each
                  "(3rd)"/"(5th)"/etc. Split on that marker and drop the
                  repeated word so each tier renders as its own short line
                  under one heading, instead of one run-on paragraph. */}
              {spell.heightened
                .split(/(?=Heightened \()/)
                .map((s) => s.trim().replace(/^Heightened\s*/, ''))
                .filter(Boolean)
                .map((tier, i) => (
                  <p key={i} className="option-desc spell-card-heightened-tier">
                    <InspectText text={tier} />
                  </p>
                ))}
            </div>
          </>
        )}
      </div>
    </button>
  );
}

function SpellPicker({ title, pool, known, maxKnown, onToggle, idPrefix, lockedId }) {
  const [search, setSearch] = useState('');
  const [traitFilters, setTraitFilters] = useState([]);

  const traitOptions = useMemo(() => {
    const set = new Set();
    pool.forEach((s) => s.traits.forEach((t) => set.add(t)));
    // "Cantrip" is true of every entry in the cantrip pool (and absent from
    // the 1st-rank pool), so it never actually narrows anything — drop it.
    set.delete('Cantrip');
    return Array.from(set).sort();
  }, [pool]);

  function toggleTraitFilter(t) {
    setTraitFilters((current) => (current.includes(t) ? current.filter((x) => x !== t) : [...current, t]));
  }

  const filtered = pool.filter((s) => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase());
    const matchesTrait = traitFilters.length === 0 || traitFilters.some((t) => s.traits.includes(t));
    return matchesSearch && matchesTrait;
  });

  const knownNames = known.map((id) => pool.find((s) => s.id === id)?.name).filter(Boolean);

  return (
    <Collapsible title={`${title} (${known.length}/${maxKnown})`}>
      <p className="hint spell-selected-summary">
        <strong>Selected:</strong> {knownNames.length > 0 ? knownNames.join(', ') : 'None yet'}
      </p>
      <input
        type="text"
        className="spell-search-input"
        placeholder={`Search ${title.toLowerCase()}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="spell-trait-filter-row">
        <span className="spell-trait-filter-label">
          Filter by trait{traitFilters.length > 0 ? ` (${traitFilters.length})` : ''}:
        </span>
        {traitOptions.map((t) => (
          <button
            key={t}
            type="button"
            className={`chip small ${traitFilters.includes(t) ? 'selected' : ''}`}
            onClick={() => toggleTraitFilter(t)}
          >
            {t}
          </button>
        ))}
        {traitFilters.length > 0 && (
          <button type="button" className="chip small ghost" onClick={() => setTraitFilters([])}>
            Clear
          </button>
        )}
      </div>
      {filtered.length === 0 && <p className="hint">No spells match that search/filter.</p>}
      <div className="spell-grid">
        {filtered.map((s) => (
          <SpellCard
            key={s.id}
            spell={s}
            selected={known.includes(s.id)}
            disabled={!known.includes(s.id) && known.length >= maxKnown}
            locked={s.id === lockedId}
            onClick={() => onToggle(s.id)}
          />
        ))}
      </div>
    </Collapsible>
  );
}

// Big, easy-to-scan recap of everything picked across both pickers — each
// spell as its own pill instead of a comma-run sentence, so a player can
// tell their full loadout apart at a glance.
function SpellsSummaryGroup({ label, names, known, maxKnown }) {
  return (
    <div className="spells-summary-group">
      <span className="spells-summary-label">
        {label} <span className="spells-summary-count">({known}/{maxKnown})</span>
      </span>
      {names.length > 0 ? (
        <div className="spells-summary-chips">
          {names.map((name) => (
            <span key={name} className="spells-summary-chip">{name}</span>
          ))}
        </div>
      ) : (
        <p className="spells-summary-empty">None chosen yet</p>
      )}
    </div>
  );
}

function SpellsSummaryCard({ cantripNames, cantripsKnown, spell1Names, rank1Known }) {
  return (
    <section className="sub-section">
      <div className="spells-summary-card">
        <h3 className="spells-summary-title">Spells Selected</h3>
        <SpellsSummaryGroup label="Cantrips" names={cantripNames} known={cantripNames.length} maxKnown={cantripsKnown} />
        <SpellsSummaryGroup label="1st-rank" names={spell1Names} known={spell1Names.length} maxKnown={rank1Known} />
      </div>
    </section>
  );
}

export default function SpellsStep({ character, update }) {
  const cls = getClass(character.classId);
  const sc = cls.spellcasting;

  // A Witch's chosen Patron grants exactly one hex cantrip automatically —
  // computed (and its useEffect placed) before the early returns below so
  // the hook always runs in the same order, per Rules of Hooks, even though
  // it's only ever non-null for a Witch mid-build.
  const patronHex = cls.id === 'witch' ? getPatronHex(character.subclassChoice) : null;
  useEffect(() => {
    if (patronHex && !character.knownCantrips.includes(patronHex.id)) {
      update({ knownCantrips: [...character.knownCantrips, patronHex.id] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patronHex?.id]);

  if (!sc) {
    return (
      <div className="step">
        <h2>Spells</h2>
        <p className="hint">The {cls.name} doesn't cast spells.</p>
      </div>
    );
  }

  if (!sc.cantripsKnown) {
    return (
      <div className="step">
        <h2>Spells</h2>
        <p className="hint">
          The {cls.name} doesn't pick from a normal spell list at 1st level — its {sc.type} spellcasting works
          through class feats instead (e.g. a domain spell from a feat like Deity's Domain, shown on your Class
          step and Summary).
        </p>
      </div>
    );
  }

  // A subclass's Bloodline/Patron sets the tradition directly (see
  // subclasses.js) for every option except the Draconic bloodline, whose
  // tradition depends on a further exemplar choice this app doesn't model
  // — sc.traditionOptions stays as a manual fallback picker for that one
  // case only.
  const subOption = getSubclassOption(cls.id, character.subclassChoice);
  const traditionCode = sc.traditionCode || subOption?.tradition || character.spellTradition;
  const needsManualTradition = Boolean(sc.traditionOptions) && !subOption?.tradition;
  // patronHex is injected into the pool directly (rather than via
  // getSpellsForTradition's classId filter, which excludes every
  // patronId-tagged entry) and locked once known — it isn't a free pick.
  // See the CANTRIPS comment above the Witch hex entries in spells.js.
  const cantripPool = traditionCode
    ? [...getSpellsForTradition(CANTRIPS, traditionCode, cls.id), ...(patronHex ? [patronHex] : [])]
    : [];
  const spell1Pool = traditionCode ? getSpellsForTradition(SPELLS_RANK_1, traditionCode, cls.id) : [];

  function selectTradition(code) {
    update({ spellTradition: code, knownCantrips: [], knownSpells1: [] });
  }

  function toggleCantrip(id) {
    if (patronHex && id === patronHex.id) return; // granted, not a free pick
    const current = character.knownCantrips;
    if (current.includes(id)) {
      update({ knownCantrips: current.filter((s) => s !== id) });
    } else if (current.length < sc.cantripsKnown) {
      update({ knownCantrips: [...current, id] });
    }
  }

  function toggleSpell1(id) {
    const current = character.knownSpells1;
    if (current.includes(id)) {
      update({ knownSpells1: current.filter((s) => s !== id) });
    } else if (current.length < sc.rank1Known) {
      update({ knownSpells1: [...current, id] });
    }
  }

  return (
    <div className="step">
      <h2>Spells</h2>
      <p className="hint">
        {cls.name} ({sc.type}, <GlossaryTerm id="cantrip">cantrips</GlossaryTerm> +{' '}
        1st-rank spells only — this is a level-1 builder). This list includes every spell any{' '}
        {sc.traditionOptions ? 'caster of the chosen tradition' : `${sc.tradition} caster`} can freely pick
        {cls.id === 'bard' && ' plus every Bard Composition cantrip (available regardless of Muse)'}
        {cls.id === 'witch' && subOption && " plus the one hex cantrip your Patron grants automatically (shown locked below)"}
        . {cls.id !== 'bard' && cls.id !== 'witch' && SUBCLASSES[cls.id] && (
          <>
            It excludes spells specifically granted by your {SUBCLASSES[cls.id].label.toLowerCase()}
            {subOption ? ` (${subOption.name})` : ''} — those are named on the Class step, but not yet added to
            this picker's catalog.{' '}
          </>
        )}
        Descriptions here are the complete rules text, not a summary, so you shouldn't need to look anything up
        elsewhere.
      </p>

      {subOption?.tradition && (
        <p className="hint">
          Your {SUBCLASSES[cls.id].label.toLowerCase()} ({subOption.name}) sets your tradition to{' '}
          <strong>{TRADITION_LABELS[subOption.tradition]}</strong>.
        </p>
      )}

      {needsManualTradition && (
        <section className="sub-section">
          <h3>Tradition</h3>
          <p className="hint">
            The Draconic bloodline's tradition depends on which draconic exemplar you choose (not modeled) — pick
            the tradition that fits your concept.
          </p>
          <div className="chip-row">
            {sc.traditionOptions.map((code) => (
              <button
                key={code}
                className={`chip ${character.spellTradition === code ? 'selected' : ''}`}
                onClick={() => selectTradition(code)}
              >
                {TRADITION_LABELS[code]}
              </button>
            ))}
          </div>
        </section>
      )}

      {traditionCode && (
        <>
          <SpellPicker
            title="Cantrips"
            pool={cantripPool}
            known={character.knownCantrips}
            maxKnown={sc.cantripsKnown}
            onToggle={toggleCantrip}
            idPrefix="cantrip"
            lockedId={patronHex?.id}
          />
          <SpellPicker
            title="1st-rank spells"
            pool={spell1Pool}
            known={character.knownSpells1}
            maxKnown={sc.rank1Known}
            onToggle={toggleSpell1}
            idPrefix="spell1"
          />
          <SpellsSummaryCard
            cantripNames={character.knownCantrips.map((id) => cantripPool.find((s) => s.id === id)?.name).filter(Boolean)}
            cantripsKnown={sc.cantripsKnown}
            spell1Names={character.knownSpells1.map((id) => spell1Pool.find((s) => s.id === id)?.name).filter(Boolean)}
            rank1Known={sc.rank1Known}
          />
        </>
      )}
    </div>
  );
}
