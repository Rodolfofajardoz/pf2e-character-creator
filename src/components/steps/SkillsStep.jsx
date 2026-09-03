import { useMemo } from 'react';
import { getAncestry } from '../../data/ancestries';
import { getEffectiveBackground } from '../../data/backgrounds';
import { getClass } from '../../data/classes';
import { SKILLS, abilityMod, getExtraSkillsFromChoice, getSkillPoolSize, getBackgroundSkillInfo, getEffectiveFixedSkills, getAncestryGrantedSkills } from '../../data/skills';
import { computeFinalScores } from '../../utils/abilityScores';
import { GlossaryTerm, InspectText } from '../../context/InspectContext';
import { getGlossaryTerm } from '../../data/glossary';

export default function SkillsStep({ character, update }) {
  const ancestry = getAncestry(character.ancestryId);
  const background = getEffectiveBackground(character);
  const cls = getClass(character.classId);

  const finalScores = useMemo(() => computeFinalScores(character, ancestry), [character, ancestry]);
  const intMod = abilityMod(finalScores.int);

  const extraFromChoice = getExtraSkillsFromChoice(cls, character);
  const poolSize = getSkillPoolSize(cls, intMod, character);

  const { rawId: rawBackgroundSkillId, hasCollision, effectiveId: backgroundSkillId, classFixedIds } = getBackgroundSkillInfo(character, cls, background);
  const fixedIds = new Set([...classFixedIds, ...(backgroundSkillId ? [backgroundSkillId] : [])]);
  const selectable = SKILLS.filter((s) => !fixedIds.has(s.id));

  // Shown as their own "(from your ancestry)" line below rather than folded
  // into classFixedIds' loop, which is unconditionally labeled "from your
  // class" -- deduped against every other automatic-training source so a
  // skill more than one of them happens to land on (e.g. Natural Skill picks
  // Athletics, and the class's fixedSkillChoice also lands on Athletics)
  // isn't printed twice.
  const ancestryGrantedSkills = getAncestryGrantedSkills(character).filter(
    (id) =>
      !getEffectiveFixedSkills(character, cls).includes(id) &&
      id !== character.classSkillChoice &&
      id !== backgroundSkillId
  );
  const substituteOptions = SKILLS.filter((s) => !classFixedIds.has(s.id) && s.id !== rawBackgroundSkillId);

  // Picking a substitute that's already in the free pool has to release its
  // pool slot, or the same skill is counted twice: once as the background's
  // effective training and once as a free pick. The counter would then read
  // as satisfied with one fewer distinct skill than the character is owed,
  // and SummaryStep -- which lists the background skill separately and then
  // maps trainedSkills -- would print that skill on the sheet twice.
  function selectSubstitute(id) {
    update({
      backgroundSkillSubstitute: id,
      trainedSkills: character.trainedSkills.filter((s) => s !== id),
    });
  }

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
          {getEffectiveFixedSkills(character, cls).map((s) => (
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
          {ancestryGrantedSkills.map((s) => (
            <li key={s}>
              <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm> (from your ancestry)
            </li>
          ))}
          <li><InspectText text={background.lore} /> (from your background)</li>
        </ul>
      </section>

      {hasCollision && (
        <section className="sub-section">
          <h3>Background skill substitute</h3>
          <p className="hint">
            Your background would train <GlossaryTerm id={rawBackgroundSkillId}>{SKILLS.find((sk) => sk.id === rawBackgroundSkillId)?.name}</GlossaryTerm>,
            but you're already trained in it from your class or ancestry. Per the rules, choose a different skill to train instead.
          </p>
          <div className="chip-row">
            {substituteOptions.map((s) => (
              <button
                key={s.id}
                className={`chip ${character.backgroundSkillSubstitute === s.id ? 'selected' : ''}`}
                onClick={() => selectSubstitute(s.id)}
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
        <div className="card-grid">
          {selectable.map((s) => {
            const term = getGlossaryTerm(s.id);
            return (
              <button
                key={s.id}
                className={`option-card small ${character.trainedSkills.includes(s.id) ? 'selected' : ''}`}
                onClick={() => toggleSkill(s.id)}
                disabled={!character.trainedSkills.includes(s.id) && character.trainedSkills.length >= poolSize}
              >
                {/* Plain text, not a GlossaryTerm — the definition is
                    already right below, so an Inspect popover here would
                    just repeat what's already on the card. */}
                <h4>{s.name}</h4>
                {term && <p className="option-desc">{term.desc}</p>}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
