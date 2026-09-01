import { SKILLS, ABILITY_LABELS, PROFICIENCY_RANKS } from '../data/skills';
import { CANTRIPS, SPELLS_RANK_1 } from '../data/spells';
import { GlossaryTerm } from '../context/InspectContext';
import { ABILITY_TERM_ID } from '../data/glossary';
import { useComputedCharacter } from '../hooks/useComputedCharacter';

function mod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function profBonus(rank) {
  return PROFICIENCY_RANKS[rank].bonus(1);
}

// A live-updating recap of the character as it's being built — the same
// derived stats SummaryStep shows, via the shared useComputedCharacter
// hook, rendered continuously instead of only on the last step. Every
// section guards on the choice it needs existing yet, since this panel is
// visible from step 1 onward when most of `character` is still empty.
export default function LivePreviewPanel({ character, open, onToggle }) {
  const { ancestry, background, cls, heritage, backgroundSkillId, weapon, armor, weapons, armors, scores, mods, hp, ac, perceptionMod, classDC, saves } =
    useComputedCharacter(character);
  const extraGearCount = Math.max(0, weapons.length - 1) + Math.max(0, armors.length - 1);

  const trainedSkillIds = Array.from(
    new Set(
      [
        ...(cls?.fixedSkills || []),
        character.classSkillChoice,
        backgroundSkillId,
        ...character.trainedSkills,
      ].filter(Boolean)
    )
  );

  return (
    <aside className={`live-preview no-print ${open ? 'open' : ''}`}>
      <button type="button" className="live-preview-toggle" onClick={onToggle}>
        {character.name || 'Preview'} {open ? '▾' : '▸'}
      </button>

      <div className="live-preview-body">
        <h3 className="live-preview-title">{character.name || 'Your Character'}</h3>
        <p className="live-preview-line">
          {ancestry ? ancestry.name : 'Ancestry —'}
          {heritage ? ` (${heritage.name})` : ''}
          {cls ? ` · ${cls.name}` : ''}
        </p>
        {background && <p className="live-preview-line">Background: {background.name}</p>}

        {scores && mods && (
          <div className="live-preview-abilities">
            {Object.keys(ABILITY_LABELS).map((a) => (
              <div key={a} className="live-preview-ability">
                <span className="live-preview-ability-label">
                  <GlossaryTerm id={ABILITY_TERM_ID[a]}>{a.toUpperCase()}</GlossaryTerm>
                </span>
                <strong>{mod(mods[a])}</strong>
              </div>
            ))}
          </div>
        )}

        {cls && (
          <div className="live-preview-stats">
            <div>
              <span><GlossaryTerm id="hit-points">HP</GlossaryTerm></span>
              <strong>{hp}</strong>
            </div>
            <div>
              <span><GlossaryTerm id="armor-class">AC</GlossaryTerm></span>
              <strong>{ac}</strong>
            </div>
            <div>
              <span><GlossaryTerm id="perception">Perception</GlossaryTerm></span>
              <strong>{mod(perceptionMod)}</strong>
            </div>
            <div>
              <span><GlossaryTerm id="class-dc">Class DC</GlossaryTerm></span>
              <strong>{classDC}</strong>
            </div>
          </div>
        )}

        {saves && (
          <p className="live-preview-line">
            <GlossaryTerm id="fortitude">Fort</GlossaryTerm> {mod(saves.fort)} ·{' '}
            <GlossaryTerm id="reflex">Ref</GlossaryTerm> {mod(saves.ref)} ·{' '}
            <GlossaryTerm id="will">Will</GlossaryTerm> {mod(saves.will)}
          </p>
        )}

        {trainedSkillIds.length > 0 && mods && (
          <div className="live-preview-section">
            <span className="live-preview-label">Trained Skills</span>
            <ul className="live-preview-skill-list">
              {trainedSkillIds.map((id) => {
                const skill = SKILLS.find((s) => s.id === id);
                if (!skill) return null;
                return (
                  <li key={id}>
                    <GlossaryTerm id={skill.id}>{skill.name}</GlossaryTerm> {mod(mods[skill.ability] + profBonus('trained'))}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {(weapon || (armor && armor.category !== 'none')) && (
          <p className="live-preview-line">
            {weapon ? weapon.name : 'No weapon'} · {armor && armor.category !== 'none' ? armor.name : 'Unarmored'}
            {extraGearCount > 0 ? ` (+${extraGearCount} more owned)` : ''}
          </p>
        )}

        {cls?.spellcasting?.cantripsKnown ? (
          <div className="live-preview-section">
            <span className="live-preview-label">Spells</span>
            <p className="live-preview-line">
              {character.knownCantrips
                .map((id) => CANTRIPS.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(', ') || 'No cantrips yet'}
            </p>
            {character.knownSpells1.length > 0 && (
              <p className="live-preview-line">
                {character.knownSpells1.map((id) => SPELLS_RANK_1.find((s) => s.id === id)?.name).filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        ) : null}

        {!ancestry && <p className="live-preview-empty">Pick an ancestry to start filling this in.</p>}
      </div>
    </aside>
  );
}
