import { useMemo } from 'react';
import { getAncestry } from '../../data/ancestries';
import { getBackground } from '../../data/backgrounds';
import { getClass } from '../../data/classes';
import { SKILLS, abilityMod } from '../../data/skills';
import { computeFinalScores } from '../../utils/abilityScores';

export default function SkillsStep({ character, update }) {
  const ancestry = getAncestry(character.ancestryId);
  const background = getBackground(character.backgroundId);
  const cls = getClass(character.classId);

  const finalScores = useMemo(() => computeFinalScores(character, ancestry), [character, ancestry]);
  const intMod = abilityMod(finalScores.int);

  const extraFromChoice = cls.fixedSkillChoice ? (cls.id === 'sorcerer' ? 2 : 1) : 0;
  const poolSize = Math.max(0, cls.skillsBase + intMod) + extraFromChoice;

  const backgroundSkillId = background.skillChoice ? character.backgroundSkillChoice : background.skill;
  const fixedIds = new Set([...(cls.fixedSkills || []), backgroundSkillId]);
  const selectable = SKILLS.filter((s) => !fixedIds.has(s.id));

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
            <li key={s}>{SKILLS.find((sk) => sk.id === s)?.name} (from your class)</li>
          ))}
          <li>{SKILLS.find((sk) => sk.id === backgroundSkillId)?.name} (from your background)</li>
          <li>{background.lore} (from your background)</li>
        </ul>
        {cls.fixedSkillChoice && <p className="hint">Your class also grants: {cls.fixedSkillChoice} (choose from the skills below).</p>}
      </section>

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
              {s.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
