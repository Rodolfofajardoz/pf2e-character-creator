import { getClass } from '../../data/classes';
import { CANTRIPS, SPELLS_RANK_1, getSpellsForTradition, TRADITION_LABELS } from '../../data/spells';
import { GlossaryTerm, InspectText } from '../../context/InspectContext';

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
                <button
                  key={s.id}
                  className={`option-card small ${character.knownCantrips.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => toggleCantrip(s.id)}
                  disabled={!character.knownCantrips.includes(s.id) && character.knownCantrips.length >= sc.cantripsKnown}
                >
                  <h4>{s.name}</h4>
                  {s.cast && <p className="option-meta">{s.cast}</p>}
                  <p className="option-desc"><InspectText text={s.desc} /></p>
                </button>
              ))}
            </div>
          </section>

          <section className="sub-section">
            <h3>
              1st-rank spells ({character.knownSpells1.length}/{sc.rank1Known})
            </h3>
            <div className="card-grid">
              {spell1Pool.map((s) => (
                <button
                  key={s.id}
                  className={`option-card small ${character.knownSpells1.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => toggleSpell1(s.id)}
                  disabled={!character.knownSpells1.includes(s.id) && character.knownSpells1.length >= sc.rank1Known}
                >
                  <h4>{s.name}</h4>
                  {s.cast && <p className="option-meta">{s.cast}</p>}
                  <p className="option-desc"><InspectText text={s.desc} /></p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
