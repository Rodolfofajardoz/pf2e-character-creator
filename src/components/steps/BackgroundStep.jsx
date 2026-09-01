import { BACKGROUNDS, getBackground } from '../../data/backgrounds';
import { ABILITIES, SKILLS } from '../../data/skills';
import { InspectText, GlossaryTerm, AbilityTerm } from '../../context/InspectContext';

export default function BackgroundStep({ character, update }) {
  const background = character.backgroundId ? getBackground(character.backgroundId) : null;
  const fixedSkillId = background?.skillChoice ? character.backgroundSkillChoice : background?.skill;
  const skillName = fixedSkillId ? SKILLS.find((s) => s.id === fixedSkillId)?.name : null;

  function selectBackground(id) {
    update({
      backgroundId: id,
      backgroundChosenBoost: null,
      backgroundFreeBoost: null,
      backgroundSkillChoice: null,
      backgroundSkillSubstitute: null,
    });
  }

  return (
    <div className="step">
      <h2>Choose your Background</h2>
      <p className="hint">
        Your background represents your life before adventuring: it grants two ability boosts, training in one
        skill + one Lore skill, and a background feat.
      </p>

      <div className="card-grid">
        {BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            className={`option-card ${character.backgroundId === b.id ? 'selected' : ''}`}
            onClick={() => selectBackground(b.id)}
          >
            <h3>{b.name}</h3>
            <p className="option-meta">
              Boost:{' '}
              {b.boostChoice.map((a, i) => (
                <span key={a}>
                  {i > 0 ? ' or ' : ''}
                  <AbilityTerm code={a} />
                </span>
              ))}{' '}
              + free
            </p>
            <p className="option-meta">
              Skill:{' '}
              {(b.skillChoice || [b.skill]).map((s, i) => (
                <span key={s}>
                  {i > 0 ? ' or ' : ''}
                  <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm>
                </span>
              ))}{' '}
              · <InspectText text={b.lore} />
            </p>
          </button>
        ))}
      </div>

      {background && (
        <div key={background.id} className="reveal-group">
          <section className="sub-section">
            <h3>Chosen boost</h3>
            <p className="hint">Choose one of your background's two options.</p>
            <div className="chip-row">
              {background.boostChoice.map((ab) => (
                <button
                  key={ab}
                  className={`chip ${character.backgroundChosenBoost === ab ? 'selected' : ''}`}
                  onClick={() => update({ backgroundChosenBoost: ab, backgroundFreeBoost: null })}
                >
                  <AbilityTerm code={ab} />
                </button>
              ))}
            </div>
          </section>

          {character.backgroundChosenBoost && (
            <section className="sub-section">
              <h3>Free boost</h3>
              <p className="hint">Choose any other ability score (different from the one above).</p>
              <div className="chip-row">
                {ABILITIES.filter((a) => a !== character.backgroundChosenBoost).map((ab) => (
                  <button
                    key={ab}
                    className={`chip ${character.backgroundFreeBoost === ab ? 'selected' : ''}`}
                    onClick={() => update({ backgroundFreeBoost: ab })}
                  >
                    <AbilityTerm code={ab} />
                  </button>
                ))}
              </div>
            </section>
          )}

          {background.skillChoice && (
            <section className="sub-section">
              <h3>Choice of skill</h3>
              <p className="hint">This background lets you choose which of these skills to train.</p>
              <div className="chip-row">
                {background.skillChoice.map((s) => (
                  <button
                    key={s}
                    className={`chip ${character.backgroundSkillChoice === s ? 'selected' : ''}`}
                    onClick={() => update({ backgroundSkillChoice: s })}
                  >
                    <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section">
            <h3>Background Feat</h3>
            <div className="option-card small selected" style={{ cursor: 'default' }}>
              <h4>{background.feat.name}</h4>
              <p className="option-desc"><InspectText text={background.feat.desc} /></p>
            </div>
          </section>

          <section className="sub-section">
            <h3>Training</h3>
            <p>
              Trained in{' '}
              <strong>
                {fixedSkillId ? <GlossaryTerm id={fixedSkillId}>{skillName}</GlossaryTerm> : '(choose above)'}
              </strong>{' '}
              and in <strong><InspectText text={background.lore} /></strong>.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
