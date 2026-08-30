import { CLASSES, getClass } from '../../data/classes';
import { ABILITY_LABELS } from '../../data/skills';
import { SKILLS } from '../../data/skills';

const RANK_LABELS = {
  trained: 'Trained',
  expert: 'Expert',
  master: 'Master',
};

export default function ClassStep({ character, update }) {
  const cls = character.classId ? getClass(character.classId) : null;

  function selectClass(id) {
    const c = getClass(id);
    update({
      classId: id,
      classKeyAbility: c.keyAbility.length === 1 ? c.keyAbility[0] : null,
      classFeat: null,
    });
  }

  return (
    <div className="step">
      <h2>Choose your Class</h2>
      <p className="hint">Your class defines your main role, your proficiencies, and your class feats.</p>

      <div className="card-grid">
        {CLASSES.map((c) => (
          <button
            key={c.id}
            className={`option-card ${character.classId === c.id ? 'selected' : ''}`}
            onClick={() => selectClass(c.id)}
          >
            <h3>{c.name}</h3>
            <p className="option-desc">{c.summary}</p>
            <p className="option-meta">
              Key ability: {c.keyAbility.map((a) => ABILITY_LABELS[a]).join(' or ')} · HP {c.hp}
            </p>
            {c.unverifiedFeats && (
              <p className="option-warning">⚠ Proficiencies verified on Archives of Nethys, but its 1st-level feat names are approximate (this class isn't in any of your books).</p>
            )}
          </button>
        ))}
      </div>

      {cls && (
        <>
          {cls.keyAbility.length > 1 && (
            <section className="sub-section">
              <h3>Key ability</h3>
              <p className="hint">Choose which of the following will be your class's key ability score.</p>
              <div className="chip-row">
                {cls.keyAbility.map((a) => (
                  <button
                    key={a}
                    className={`chip ${character.classKeyAbility === a ? 'selected' : ''}`}
                    onClick={() => update({ classKeyAbility: a })}
                  >
                    {ABILITY_LABELS[a]}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section">
            <h3>Initial Proficiencies (1st level)</h3>
            <div className="prof-grid">
              <div>
                <strong>Perception:</strong> {RANK_LABELS[cls.perception]}
              </div>
              <div>
                <strong>Saving Throws:</strong> Fortitude {RANK_LABELS[cls.saves.fort]}, Reflex {RANK_LABELS[cls.saves.ref]}, Will {RANK_LABELS[cls.saves.will]}
              </div>
              <div>
                <strong>Class DC:</strong> {RANK_LABELS[cls.classDC]}
              </div>
              <div>
                <strong>Weapons:</strong> {cls.weapons}
              </div>
              <div>
                <strong>Armor:</strong> {cls.armor}
              </div>
              {cls.spellcasting && (
                <div>
                  <strong>Spellcasting:</strong> {cls.spellcasting.tradition} ({cls.spellcasting.type})
                </div>
              )}
              <div>
                <strong>Trained skills:</strong>{' '}
                {cls.fixedSkills.map((s) => SKILLS.find((sk) => sk.id === s)?.name).join(', ')}
                {cls.fixedSkills.length > 0 ? ' + ' : ''}
                {cls.skillsBase} additional (+ your Intelligence modifier)
                {cls.fixedSkillChoice ? ` · ${cls.fixedSkillChoice}` : ''}
              </div>
            </div>
          </section>

          <section className="sub-section">
            <h3>Class Feat (1st level)</h3>
            <div className="card-grid">
              {cls.feats1.map((f) => (
                <button
                  key={f.name}
                  className={`option-card small ${character.classFeat?.name === f.name ? 'selected' : ''}`}
                  onClick={() => update({ classFeat: f })}
                >
                  <h4>{f.name}</h4>
                  <p className="option-desc">{f.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
