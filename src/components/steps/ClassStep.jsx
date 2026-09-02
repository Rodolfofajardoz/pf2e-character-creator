import { useEffect, useRef } from 'react';
import { CLASSES, getClass } from '../../data/classes';
import { SKILLS } from '../../data/skills';
import { InspectText, GlossaryTerm, AbilityTerm } from '../../context/InspectContext';
import { scrollIntoViewCentered } from '../../utils/scrollFocus';

const RANK_LABELS = {
  trained: 'Trained',
  expert: 'Expert',
  master: 'Master',
};

export default function ClassStep({ character, update }) {
  const cls = character.classId ? getClass(character.classId) : null;

  const keyAbilityRef = useRef(null);
  const skillChoiceRef = useRef(null);
  const classFeatRef = useRef(null);
  const bonusFeatRef = useRef(null);

  const needsBonusFeat = Boolean(cls && cls.feats1.length > 0 && character.ancestryFeat?.grantsClassFeat);

  const focusKey = !cls
    ? null
    : cls.keyAbility.length > 1 && !character.classKeyAbility
    ? 'keyAbility'
    : cls.fixedSkillChoiceOptions && !character.classSkillChoice
    ? 'skillChoice'
    : cls.feats1.length > 0 && !character.classFeat
    ? 'classFeat'
    : needsBonusFeat && !character.bonusClassFeat
    ? 'bonusFeat'
    : null;

  useEffect(() => {
    const refs = { keyAbility: keyAbilityRef, skillChoice: skillChoiceRef, classFeat: classFeatRef, bonusFeat: bonusFeatRef };
    if (focusKey) scrollIntoViewCentered(refs[focusKey]);
  }, [focusKey]);

  function selectClass(id) {
    if (id === character.classId) return;
    const c = getClass(id);
    update({
      classId: id,
      classKeyAbility: c.keyAbility.length === 1 ? c.keyAbility[0] : null,
      classFeat: null,
      bonusClassFeat: null,
      classSkillChoice: null,
      backgroundSkillSubstitute: null,
      spellTradition: null,
      knownCantrips: [],
      knownSpells1: [],
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
            <p className="option-desc"><InspectText text={c.summary} /></p>
            <p className="option-meta">
              Key ability:{' '}
              {c.keyAbility.map((a, i) => (
                <span key={a}>
                  {i > 0 ? ' or ' : ''}
                  <AbilityTerm code={a} />
                </span>
              ))}{' '}
              · <GlossaryTerm id="hit-points">HP</GlossaryTerm> {c.hp}
            </p>
          </button>
        ))}
      </div>

      {cls && (
        <div key={cls.id} className="reveal-group">
          {cls.keyAbility.length > 1 && (
            <section className="sub-section" ref={keyAbilityRef}>
              <h3>Key ability</h3>
              <p className="hint">Choose which of the following will be your class's key ability score.</p>
              <div className="chip-row">
                {cls.keyAbility.map((a) => (
                  <button
                    key={a}
                    className={`chip ${character.classKeyAbility === a ? 'selected' : ''}`}
                    onClick={() => update({ classKeyAbility: a })}
                  >
                    <AbilityTerm code={a} />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section">
            <h3>Initial Proficiencies (1st level)</h3>
            <div className="prof-grid">
              <div>
                <strong><GlossaryTerm id="perception">Perception</GlossaryTerm>:</strong>{' '}
                <GlossaryTerm id={cls.perception}>{RANK_LABELS[cls.perception]}</GlossaryTerm>
              </div>
              <div>
                <strong>Saving Throws:</strong>{' '}
                <GlossaryTerm id="fortitude">Fortitude</GlossaryTerm>{' '}
                <GlossaryTerm id={cls.saves.fort}>{RANK_LABELS[cls.saves.fort]}</GlossaryTerm>,{' '}
                <GlossaryTerm id="reflex">Reflex</GlossaryTerm>{' '}
                <GlossaryTerm id={cls.saves.ref}>{RANK_LABELS[cls.saves.ref]}</GlossaryTerm>,{' '}
                <GlossaryTerm id="will">Will</GlossaryTerm>{' '}
                <GlossaryTerm id={cls.saves.will}>{RANK_LABELS[cls.saves.will]}</GlossaryTerm>
              </div>
              <div>
                <strong><GlossaryTerm id="class-dc">Class DC</GlossaryTerm>:</strong>{' '}
                <GlossaryTerm id={cls.classDC}>{RANK_LABELS[cls.classDC]}</GlossaryTerm>
              </div>
              <div>
                <strong>Weapons:</strong> <InspectText text={cls.weapons} />
              </div>
              <div>
                <strong>Armor:</strong> <InspectText text={cls.armor} />
              </div>
              {cls.spellcasting && (
                <div>
                  <strong>Spellcasting:</strong> {cls.spellcasting.tradition} ({cls.spellcasting.type})
                </div>
              )}
              <div>
                <strong>Trained skills:</strong>{' '}
                {cls.fixedSkills.map((s, i) => (
                  <span key={s}>
                    {i > 0 ? ', ' : ''}
                    <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm>
                  </span>
                ))}
                {cls.fixedSkills.length > 0 ? ' + ' : ''}
                {cls.skillsBase} additional (+ your Intelligence modifier)
                {cls.fixedSkillChoice ? ` · ${cls.fixedSkillChoice}` : ''}
              </div>
            </div>
          </section>

          {cls.fixedSkillChoiceOptions && (
            <section className="sub-section" ref={skillChoiceRef}>
              <h3>Choose your class-granted skill</h3>
              <p className="hint">{cls.fixedSkillChoice}</p>
              <div className="chip-row">
                {cls.fixedSkillChoiceOptions.map((id) => (
                  <button
                    key={id}
                    className={`chip ${character.classSkillChoice === id ? 'selected' : ''}`}
                    onClick={() => update({ classSkillChoice: id })}
                  >
                    <GlossaryTerm id={id}>{SKILLS.find((s) => s.id === id)?.name}</GlossaryTerm>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section" ref={classFeatRef}>
            <h3>Class Feat (1st level)</h3>
            {cls.feats1.length === 0 ? (
              <p className="option-desc">
                The {cls.name} doesn't gain a class feat at 1st level — it gains its first one at
                2nd level instead.
              </p>
            ) : (
              <div className="card-grid">
                {cls.feats1.map((f) => (
                  <button
                    key={f.name}
                    className={`option-card small ${character.classFeat?.name === f.name ? 'selected' : ''}`}
                    onClick={() => update({ classFeat: f })}
                  >
                    <h4>{f.name}</h4>
                    <p className="option-desc"><InspectText text={f.desc} /></p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {character.ancestryFeat?.grantsClassFeat && (
            <section className="sub-section" ref={bonusFeatRef}>
              <h3>Bonus Class Feat (from Natural Ambition)</h3>
              {cls.feats1.length === 0 ? (
                <p className="option-desc">
                  Natural Ambition grants no feat here — the {cls.name} has no 1st-level class feats to
                  choose from (it gains its first one at 2nd level instead).
                </p>
              ) : (
                <div className="card-grid">
                  {cls.feats1.map((f) => (
                    <button
                      key={f.name}
                      className={`option-card small ${character.bonusClassFeat?.name === f.name ? 'selected' : ''}`}
                      onClick={() => update({ bonusClassFeat: f })}
                    >
                      <h4>{f.name}</h4>
                      <p className="option-desc"><InspectText text={f.desc} /></p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
