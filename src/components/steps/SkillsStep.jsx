import { useMemo } from 'react';
import { getAncestry } from '../../data/ancestries';
import { getBackground } from '../../data/backgrounds';
import { getClass } from '../../data/classes';
import { SKILLS, abilityMod, getExtraSkillsFromChoice, getSkillPoolSize, getBackgroundSkillInfo } from '../../data/skills';
import { computeFinalScores } from '../../utils/abilityScores';
import { GlossaryTerm, InspectText } from '../../context/InspectContext';

export default function SkillsStep({ character, update }) {
  const ancestry = getAncestry(character.ancestryId);
  const background = getBackground(character.backgroundId);
  const cls = getClass(character.classId);

  const finalScores = useMemo(() => computeFinalScores(character, ancestry), [character, ancestry]);
  const intMod = abilityMod(finalScores.int);

  const extraFromChoice = getExtraSkillsFromChoice(cls);
  const poolSize = getSkillPoolSize(cls, intMod);

  const { rawId: rawBackgroundSkillId, hasCollision, effectiveId: backgroundSkillId, classFixedIds } = getBackgroundSkillInfo(character, cls, background);
  const fixedIds = new Set([...classFixedIds, ...(backgroundSkillId ? [backgroundSkillId] : [])]);
  const selectable = SKILLS.filter((s) => !fixedIds.has(s.id));
  const substituteOptions = SKILLS.filter((s) => !classFixedIds.has(s.id) && s.id !== rawBackgroundSkillId);

  function toggleSkill(id) {
    const current = character.trainedSkills;
    if (current.includes(id)) {
      update({ trainedSkills: current.filter((s) => s !== id) });
    } else if (current.length < poolSize) {
      update({ trainedSkills: [...current, id] });
    }
  }

  return (
    <div className="step">
      <h2>Skills</h2>

      <section className="sub-section">
        <h3>Automatic training</h3>
        <ul className="plain-list">
          {cls.fixedSkills.map((s) => (
            <li key={s}>
              <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm> (from your class)
            </li>
          ))}
          {character.classSkillChoice && (
            <li>
              <GlossaryTerm id={character.classSkillChoice}>
                {SKILLS.find((sk) => sk.id === character.classSkillChoice)?.name}
              </GlossaryTerm>{' '}
              (from your class)
            </li>
          )}
          {backgroundSkillId && (
            <li>
              <GlossaryTerm id={backgroundSkillId}>{SKILLS.find((sk) => sk.id === backgroundSkillId)?.name}</GlossaryTerm>{' '}
              (from your background{hasCollision ? ', substituted — see below' : ''})
            </li>
          )}
          <li><InspectText text={background.lore} /> (from your background)</li>
        </ul>
        {cls.fixedSkillChoice && !cls.fixedSkillChoiceOptions && (
          <p className="hint">Your class also grants: {cls.fixedSkillChoice} (choose from the skills below).</p>
        )}
      </section>

      {hasCollision && (
        <section className="sub-section">
          <h3>Background skill substitute</h3>
          <p className="hint">
            Your background would train <GlossaryTerm id={rawBackgroundSkillId}>{SKILLS.find((sk) => sk.id === rawBackgroundSkillId)?.name}</GlossaryTerm>,
            but your class already trains it automatically. Per the rules, choose a different skill to train instead.
          </p>
          <div className="chip-row">
            {substituteOptions.map((s) => (
              <button
                key={s.id}
                className={`chip ${character.backgroundSkillSubstitute === s.id ? 'selected' : ''}`}
                onClick={() => update({ backgroundSkillSubstitute: s.id })}
              >
                <GlossaryTerm id={s.id}>{s.name}</GlossaryTerm>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="sub-section">
        <h3>
          Additional trained skills ({character.trainedSkills.length}/{poolSize})
        </h3>
        <p className="hint">
          {cls.skillsBase} + your Intelligence modifier ({intMod >= 0 ? '+' : ''}
          {intMod}){extraFromChoice > 0 ? ` + ${extraFromChoice} from your class` : ''} = {poolSize} skills.
        </p>
        <div className="chip-row">
          {selectable.map((s) => (
            <button
              key={s.id}
              className={`chip ${character.trainedSkills.includes(s.id) ? 'selected' : ''}`}
              onClick={() => toggleSkill(s.id)}
              disabled={!character.trainedSkills.includes(s.id) && character.trainedSkills.length >= poolSize}
            >
              <GlossaryTerm id={s.id}>{s.name}</GlossaryTerm>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
