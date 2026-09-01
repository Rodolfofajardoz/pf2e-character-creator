import { getClass } from '../../data/classes';
import { CANTRIPS, SPELLS_RANK_1, getSpellsForTradition, TRADITION_LABELS } from '../../data/spells';
import { GlossaryTerm, InspectText } from '../../context/InspectContext';

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
    <p className="spell-card-info">
      {fields.map(([label, value], i) => (
        <span key={label}>
          {i > 0 ? ', ' : ''}
          <strong>{label}</strong> {value}
        </span>
      ))}
    </p>
  );
}

function SpellCard({ spell, selected, disabled, onClick }) {
  return (
    <button
      className={`spell-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="spell-card-header">
        <h4>{spell.name}</h4>
        <span className="spell-card-badge">{actionBadge(spell.cast)}</span>
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
      </div>
    </button>
  );
}

export default function SpellsStep({ character, update }) {
  const cls = getClass(character.classId);
  const sc = cls.spellcasting;

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

  const traditionCode = sc.traditionCode || character.spellTradition;
  const cantripPool = traditionCode ? getSpellsForTradition(CANTRIPS, traditionCode) : [];
  const spell1Pool = traditionCode ? getSpellsForTradition(SPELLS_RANK_1, traditionCode) : [];

  function selectTradition(code) {
    update({ spellTradition: code, knownCantrips: [], knownSpells1: [] });
  }

  function toggleCantrip(id) {
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
        1st-rank spells only — this is a level-1 builder). This list only includes spells any {sc.traditionOptions ? 'caster of the chosen tradition' : `${sc.tradition} caster`} can
        freely pick; it excludes spells tied to a class sub-choice this app doesn't model (a Bard's Muse, a
        Cleric's Doctrine, a Witch's Patron theme, and the like).
      </p>

      {sc.traditionOptions && (
        <section className="sub-section">
          <h3>Tradition</h3>
          <p className="hint">
            {cls.name === 'Sorcerer'
              ? "Your bloodline (not modeled) determines your tradition — pick the one that fits your concept."
              : "Your patron (not modeled) determines your tradition — pick the one that fits your concept."}
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
          <section className="sub-section">
            <h3>
              Cantrips ({character.knownCantrips.length}/{sc.cantripsKnown})
            </h3>
            <div className="card-grid">
              {cantripPool.map((s) => (
                <SpellCard
                  key={s.id}
                  spell={s}
                  selected={character.knownCantrips.includes(s.id)}
                  disabled={!character.knownCantrips.includes(s.id) && character.knownCantrips.length >= sc.cantripsKnown}
                  onClick={() => toggleCantrip(s.id)}
                />
              ))}
            </div>
          </section>

          <section className="sub-section">
            <h3>
              1st-rank spells ({character.knownSpells1.length}/{sc.rank1Known})
            </h3>
            <div className="card-grid">
              {spell1Pool.map((s) => (
                <SpellCard
                  key={s.id}
                  spell={s}
                  selected={character.knownSpells1.includes(s.id)}
                  disabled={!character.knownSpells1.includes(s.id) && character.knownSpells1.length >= sc.rank1Known}
                  onClick={() => toggleSpell1(s.id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
