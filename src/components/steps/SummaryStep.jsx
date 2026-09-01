import { SKILLS, ABILITY_LABELS, PROFICIENCY_RANKS } from '../../data/skills';
import { CANTRIPS, SPELLS_RANK_1, TRADITION_LABELS } from '../../data/spells';
import { InspectText, GlossaryTerm } from '../../context/InspectContext';
import { ABILITY_TERM_ID } from '../../data/glossary';
import { useComputedCharacter } from '../../hooks/useComputedCharacter';

const LEVEL = 1;

function mod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function profBonus(rank) {
  return PROFICIENCY_RANKS[rank].bonus(LEVEL);
}

export default function SummaryStep({ character, update, onRestart }) {
  const {
    ancestry,
    background,
    cls,
    heritage,
    backgroundSkillId,
    weapon,
    armor,
    weapons,
    armors,
    gearItems,
    scores,
    mods,
    hp,
    ac,
    isProficientInArmor,
    perceptionMod,
    classDCAbility,
    classDC,
  } = useComputedCharacter(character);

  return (
    <div className="step summary">
      <h2>Character Summary</h2>

      <section className="sub-section">
        <label className="name-field">
          Character name
          <input
            type="text"
            value={character.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Type a name..."
          />
        </label>
      </section>

      <section className="sheet-grid">
        <div className="sheet-card">
          <h3>Identity</h3>
          <p>
            {ancestry.name} ({heritage?.name}) — {cls.name}
          </p>
          <p>Background: {background.name}</p>
          <p>
            Level {LEVEL} · <GlossaryTerm id="hit-points">HP</GlossaryTerm> {hp} · Size {ancestry.size} ·{' '}
            <GlossaryTerm id="speed">Speed</GlossaryTerm> {ancestry.speed} feet
          </p>
          <p>Languages: {ancestry.languages.join(', ')}</p>
          {ancestry.abilities?.length > 0 && (
            <p>
              {ancestry.abilities.map((ab, i) => (
                <span key={ab.name}>
                  {i > 0 ? ' ' : ''}
                  <strong>{ab.name}:</strong> <InspectText text={ab.desc} />
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="sheet-card">
          <h3>Ability Scores</h3>
          <div className="ability-grid">
            {ABILITY_LABELS &&
              Object.keys(ABILITY_LABELS).map((a) => (
                <div key={a} className="ability-box final" title={ABILITY_LABELS[a]}>
                  <span className="ability-label">
                    <GlossaryTerm id={ABILITY_TERM_ID[a]}>{a.toUpperCase()}</GlossaryTerm>
                  </span>
                  <span className="ability-score">{scores[a]}</span>
                  <span className="ability-mod">{mod(mods[a])}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="sheet-card">
          <h3>Defenses</h3>
          <p>
            <GlossaryTerm id="armor-class">Armor Class</GlossaryTerm> (approx.): {ac}
            {!isProficientInArmor && ' (untrained in this armor — your class doesn\'t train that category)'}
          </p>
          <p>
            <GlossaryTerm id="perception">Perception</GlossaryTerm>: {mod(perceptionMod)} (
            <GlossaryTerm id={cls.perception}>{PROFICIENCY_RANKS[cls.perception].label}</GlossaryTerm>)
          </p>
          <p>
            <GlossaryTerm id="saving-throw">Saving Throws</GlossaryTerm>:{' '}
            <GlossaryTerm id="fortitude">Fortitude</GlossaryTerm> {mod(mods.con + profBonus(cls.saves.fort))},{' '}
            <GlossaryTerm id="reflex">Reflex</GlossaryTerm> {mod(mods.dex + profBonus(cls.saves.ref))},{' '}
            <GlossaryTerm id="will">Will</GlossaryTerm> {mod(mods.wis + profBonus(cls.saves.will))}
          </p>
          <p>
            <GlossaryTerm id="class-dc">Class DC</GlossaryTerm>: {classDC} (
            <GlossaryTerm id={ABILITY_TERM_ID[classDCAbility]}>{ABILITY_LABELS[classDCAbility]}</GlossaryTerm>)
          </p>
        </div>

        <div className="sheet-card">
          <h3>Feats</h3>
          <p>
            <strong>Ancestry:</strong> {character.ancestryFeat?.name} — <InspectText text={character.ancestryFeat?.desc} />
          </p>
          {character.generalFeatChoice && (
            <p>
              <strong>General:</strong> {character.generalFeatChoice.name} — <InspectText text={character.generalFeatChoice.desc} />
            </p>
          )}
          <p>
            <strong>Background:</strong> {background.feat.name} — <InspectText text={background.feat.desc} />
          </p>
          <p>
            <strong>Class:</strong>{' '}
            {character.classFeat ? (
              <>
                {character.classFeat.name} — <InspectText text={character.classFeat.desc} />
              </>
            ) : (
              'None at 1st level (gained at 2nd level instead)'
            )}
          </p>
          {character.bonusClassFeat && (
            <p>
              <strong>Bonus (Natural Ambition):</strong> {character.bonusClassFeat.name} — <InspectText text={character.bonusClassFeat.desc} />
            </p>
          )}
        </div>

        {cls.spellcasting?.cantripsKnown && (
          <div className="sheet-card">
            <h3>Spells</h3>
            <p>
              Tradition: {TRADITION_LABELS[cls.spellcasting.traditionCode || character.spellTradition]}
            </p>
            <p>
              <strong><GlossaryTerm id="cantrip">Cantrips</GlossaryTerm>:</strong>{' '}
              {character.knownCantrips
                .map((id) => CANTRIPS.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(', ') || 'None chosen'}
            </p>
            <p>
              <strong>1st-rank:</strong>{' '}
              {character.knownSpells1
                .map((id) => SPELLS_RANK_1.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(', ') || 'None chosen'}
            </p>
          </div>
        )}

        <div className="sheet-card">
          <h3>Trained Skills</h3>
          <ul className="plain-list">
            {cls.fixedSkills.map((s) => {
              const skill = SKILLS.find((sk) => sk.id === s);
              return (
                <li key={s}>
                  <GlossaryTerm id={skill.id}>{skill.name}</GlossaryTerm>: {mod(mods[skill.ability] + profBonus('trained'))}
                </li>
              );
            })}
            {character.classSkillChoice && (
              <li>
                <GlossaryTerm id={character.classSkillChoice}>
                  {SKILLS.find((sk) => sk.id === character.classSkillChoice)?.name}
                </GlossaryTerm>:{' '}
                {mod(mods[SKILLS.find((sk) => sk.id === character.classSkillChoice)?.ability] + profBonus('trained'))}
              </li>
            )}
            <li>
              <GlossaryTerm id={backgroundSkillId}>{SKILLS.find((sk) => sk.id === backgroundSkillId)?.name}</GlossaryTerm>:{' '}
              {mod(mods[SKILLS.find((sk) => sk.id === backgroundSkillId)?.ability] + profBonus('trained'))}
            </li>
            {character.trainedSkills.map((id) => {
              const skill = SKILLS.find((sk) => sk.id === id);
              return (
                <li key={id}>
                  <GlossaryTerm id={skill.id}>{skill.name}</GlossaryTerm>: {mod(mods[skill.ability] + profBonus('trained'))}
                </li>
              );
            })}
            <li>
              {background.lore}: {mod(mods.int + profBonus('trained'))} (<GlossaryTerm id="lore">Lore</GlossaryTerm> uses Intelligence)
            </li>
          </ul>
        </div>

        <div className="sheet-card">
          <h3>Equipment</h3>
          <p>Weapon (equipped): {weapon ? `${weapon.name} (${weapon.damage})` : 'None'}</p>
          <p>Armor (worn): {armor.name}</p>
          {(weapons.length > 1 || armors.length > 1) && (
            <p className="hint">
              Also purchased: {[...weapons.slice(1), ...armors.slice(1)].map((i) => i.name).join(', ')} — AC/Strike
              math above uses only the first weapon/armor bought; the rest are just owned for now.
            </p>
          )}
          <p>Other items: {gearItems.map((g) => g.name).join(', ') || 'None'}</p>
        </div>
      </section>

      <div className="summary-actions no-print">
        <button className="btn primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <button className="btn secondary" onClick={onRestart}>
          Create another character
        </button>
      </div>
    </div>
  );
}
