import { useMemo } from 'react';
import { getAncestry } from '../../data/ancestries';
import { getBackground } from '../../data/backgrounds';
import { getClass } from '../../data/classes';
import { SKILLS, ABILITY_LABELS, PROFICIENCY_RANKS, abilityMod } from '../../data/skills';
import { computeFinalScores } from '../../utils/abilityScores';
import { WEAPONS, ARMORS, GEAR } from '../../data/equipment';

const LEVEL = 1;

function mod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function profBonus(rank) {
  return PROFICIENCY_RANKS[rank].bonus(LEVEL);
}

export default function SummaryStep({ character, update, onRestart }) {
  const ancestry = getAncestry(character.ancestryId);
  const background = getBackground(character.backgroundId);
  const cls = getClass(character.classId);
  const heritage = ancestry.heritages.find((h) => h.id === character.heritageId);
  const backgroundSkillId = background.skillChoice ? character.backgroundSkillChoice : background.skill;
  const weapon = WEAPONS.find((w) => w.id === character.weaponId);
  const armor = ARMORS.find((a) => a.id === character.armorId) || ARMORS[0];
  const gearItems = GEAR.filter((g) => character.gearIds.includes(g.id));

  const scores = useMemo(() => computeFinalScores(character, ancestry), [character, ancestry]);
  const mods = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, abilityMod(v)]));

  const hp = ancestry.hp + cls.hp + mods.con;
  const dexCap = armor.dexCap === null ? Infinity : armor.dexCap;
  const armorProfRank = armor.category === 'none' ? cls.unarmoredProficiency || 'trained' : 'trained';
  const ac = 10 + Math.min(mods.dex, dexCap) + armor.acBonus + profBonus(armorProfRank);
  const perceptionMod = mods.wis + profBonus(cls.perception);
  const classDCAbility = character.classKeyAbility;
  const classDC = 10 + profBonus(cls.classDC) + mods[classDCAbility];

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
          <p>Level {LEVEL} · HP {hp} · Size {ancestry.size} · Speed {ancestry.speed} feet</p>
          <p>Languages: {ancestry.languages.join(', ')}</p>
        </div>

        <div className="sheet-card">
          <h3>Ability Scores</h3>
          <div className="ability-grid">
            {ABILITY_LABELS &&
              Object.keys(ABILITY_LABELS).map((a) => (
                <div key={a} className="ability-box final" title={ABILITY_LABELS[a]}>
                  <span className="ability-label">{a.toUpperCase()}</span>
                  <span className="ability-score">{scores[a]}</span>
                  <span className="ability-mod">{mod(mods[a])}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="sheet-card">
          <h3>Defenses</h3>
          <p>Armor Class (approx.): {ac}</p>
          <p>Perception: {mod(perceptionMod)} ({PROFICIENCY_RANKS[cls.perception].label})</p>
          <p>
            Saving Throws: Fortitude {mod(mods.con + profBonus(cls.saves.fort))}, Reflex{' '}
            {mod(mods.dex + profBonus(cls.saves.ref))}, Will {mod(mods.wis + profBonus(cls.saves.will))}
          </p>
          <p>
            Class DC: {classDC} ({ABILITY_LABELS[classDCAbility]})
          </p>
        </div>

        <div className="sheet-card">
          <h3>Feats</h3>
          <p>
            <strong>Ancestry:</strong> {character.ancestryFeat?.name} — {character.ancestryFeat?.desc}
          </p>
          <p>
            <strong>Background:</strong> {background.feat.name} — {background.feat.desc}
          </p>
          <p>
            <strong>Class:</strong> {character.classFeat?.name} — {character.classFeat?.desc}
          </p>
        </div>

        <div className="sheet-card">
          <h3>Trained Skills</h3>
          <ul className="plain-list">
            {cls.fixedSkills.map((s) => {
              const skill = SKILLS.find((sk) => sk.id === s);
              return (
                <li key={s}>
                  {skill.name}: {mod(mods[skill.ability] + profBonus('trained'))}
                </li>
              );
            })}
            <li>
              {SKILLS.find((sk) => sk.id === backgroundSkillId)?.name}:{' '}
              {mod(mods[SKILLS.find((sk) => sk.id === backgroundSkillId)?.ability] + profBonus('trained'))}
            </li>
            {character.trainedSkills.map((id) => {
              const skill = SKILLS.find((sk) => sk.id === id);
              return (
                <li key={id}>
                  {skill.name}: {mod(mods[skill.ability] + profBonus('trained'))}
                </li>
              );
            })}
            <li>
              {background.lore}: {mod(mods.int + profBonus('trained'))} (Lore uses Intelligence)
            </li>
          </ul>
        </div>

        <div className="sheet-card">
          <h3>Equipment</h3>
          <p>Weapon: {weapon ? `${weapon.name} (${weapon.damage})` : 'None'}</p>
          <p>Armor: {armor.name}</p>
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
