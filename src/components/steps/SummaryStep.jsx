import { useState } from 'react';
import { SKILLS, ABILITY_LABELS, PROFICIENCY_RANKS, getSkillRank } from '../../data/skills';
import { CANTRIPS, SPELLS_RANK_1, TRADITION_LABELS } from '../../data/spells';
import { SUBCLASSES, getSubclassOption } from '../../data/subclasses';
import { InspectText, GlossaryTerm } from '../../context/InspectContext';
import { ABILITY_TERM_ID } from '../../data/glossary';
import { useComputedCharacter } from '../../hooks/useComputedCharacter';
import { fillCharacterSheet } from '../../utils/fillCharacterSheet';
import { profBonus } from '../../utils/leveling';
import Collapsible from '../Collapsible';
import LevelUpCard from '../LevelUpCard';

const MAX_MODELED_LEVEL = 10;

function mod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

// The header/meta line for an already-passed level's (collapsed) card --
// just the picked feat/skill-increase names, so scrolling back through a
// build's history doesn't require re-opening every card.
function summarizeLevel(character, level) {
  const parts = [];
  const classFeatEntry = character.classFeatsByLevel.find((f) => f.level === level);
  if (classFeatEntry) {
    parts.push(classFeatEntry.subChoiceValue ? `${classFeatEntry.feat.name} (${classFeatEntry.subChoiceValue})` : classFeatEntry.feat.name);
  }
  const skillFeat = character.skillFeatsByLevel.find((f) => f.level === level)?.feat;
  if (skillFeat) parts.push(skillFeat.name);
  const generalFeat = character.generalFeatsByLevel.find((f) => f.level === level)?.feat;
  if (generalFeat) parts.push(generalFeat.name);
  const ancestryFeat = character.ancestryFeatsByLevel.find((f) => f.level === level)?.feat;
  if (ancestryFeat) parts.push(ancestryFeat.name);
  const skillIncrease = character.skillIncreases.find((s) => s.level === level)?.skillId;
  if (skillIncrease) parts.push(`${SKILLS.find((sk) => sk.id === skillIncrease)?.name} increase`);
  const boostField = level === 5 ? 'level5Boosts' : level === 10 ? 'level10Boosts' : null;
  if (boostField && character[boostField].length > 0) parts.push('4 ability boosts');
  if (level === 5 && character.weaponMasteryGroup) parts.push(`Weapon Mastery (${character.weaponMasteryGroup})`);
  return parts.length > 0 ? parts.join(', ') : 'Not yet confirmed';
}

export default function SummaryStep({ character, update, onRestart }) {
  const computed = useComputedCharacter(character);
  const {
    level,
    ancestry,
    background,
    cls,
    heritage,
    weapon,
    armor,
    weaponPurchases,
    armorPurchases,
    shieldPurchases,
    ammoPurchases,
    gearPurchases,
    scores,
    mods,
    hp,
    ac,
    isProficientInArmor,
    perceptionRank,
    perceptionMod,
    classDCAbility,
    classDCRank,
    classDC,
    saveRanks,
    saves,
  } = computed;

  const subclassGroup = SUBCLASSES[cls.id];
  const subOption = subclassGroup ? getSubclassOption(cls.id, character.subclassChoice) : null;

  const trainedSkillList = SKILLS.map((s) => ({ ...s, rank: getSkillRank(character, cls, ancestry, background, s.id) })).filter(
    (s) => s.rank !== 'untrained'
  );

  const [sheetStatus, setSheetStatus] = useState('idle');

  async function handleDownloadSheet() {
    setSheetStatus('working');
    try {
      const bytes = await fillCharacterSheet(character, computed);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${character.name || 'character'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSheetStatus('idle');
    } catch (e) {
      console.error('Failed to fill character sheet PDF', e);
      setSheetStatus('error');
    }
  }

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
          {subOption && (
            <p>
              <strong>{subclassGroup.label}:</strong> {subOption.name} — <InspectText text={subOption.desc} />
            </p>
          )}
          <p>
            Level {level} · <GlossaryTerm id="hit-points">HP</GlossaryTerm> {hp} · Size {ancestry.size} ·{' '}
            <GlossaryTerm id="speed">Speed</GlossaryTerm> {ancestry.speed} feet
          </p>
          <p>Languages: {[...ancestry.languages, ...character.bonusLanguages].join(', ')}</p>
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
            <GlossaryTerm id={perceptionRank}>{PROFICIENCY_RANKS[perceptionRank].label}</GlossaryTerm>)
          </p>
          <p>
            <GlossaryTerm id="saving-throw">Saving Throws</GlossaryTerm>:{' '}
            <GlossaryTerm id="fortitude">Fortitude</GlossaryTerm> {mod(saves.fort)} ({PROFICIENCY_RANKS[saveRanks.fort].label}),{' '}
            <GlossaryTerm id="reflex">Reflex</GlossaryTerm> {mod(saves.ref)} ({PROFICIENCY_RANKS[saveRanks.ref].label}),{' '}
            <GlossaryTerm id="will">Will</GlossaryTerm> {mod(saves.will)} ({PROFICIENCY_RANKS[saveRanks.will].label})
          </p>
          <p>
            <GlossaryTerm id="class-dc">Class DC</GlossaryTerm>: {classDC} (
            <GlossaryTerm id={ABILITY_TERM_ID[classDCAbility]}>{ABILITY_LABELS[classDCAbility]}</GlossaryTerm>,{' '}
            {PROFICIENCY_RANKS[classDCRank].label})
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
              Tradition: {TRADITION_LABELS[cls.spellcasting.traditionCode || subOption?.tradition || character.spellTradition]}
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
            {trainedSkillList.map((s) => (
              <li key={s.id}>
                <GlossaryTerm id={s.id}>{s.name}</GlossaryTerm>: {mod(mods[s.ability] + profBonus(s.rank, level))}
                {s.rank !== 'trained' && ` (${PROFICIENCY_RANKS[s.rank].label})`}
              </li>
            ))}
            <li>
              {background.lore}: {mod(mods.int + profBonus('trained', level))} (<GlossaryTerm id="lore">Lore</GlossaryTerm> uses Intelligence)
            </li>
          </ul>
        </div>

        <div className="sheet-card">
          <h3>Equipment</h3>
          <p>Weapon (equipped): {weapon ? `${weapon.name} (${weapon.damage})` : 'None'}</p>
          <p>Armor (worn): {armor.name}</p>
          {(weaponPurchases.length > 1 || armorPurchases.length > 1) && (
            <p className="hint">
              AC/Strike math above uses only the first weapon/armor bought — the rest are just owned for now.
            </p>
          )}
          <ul className="plain-list">
            {[...weaponPurchases, ...ammoPurchases, ...armorPurchases, ...shieldPurchases, ...gearPurchases].map(
              ({ item, qty }) => (
                <li key={item.id}>
                  {item.name}
                  {qty > 1 ? ` ×${qty}` : ''}
                </li>
              )
            )}
            {weaponPurchases.length + ammoPurchases.length + armorPurchases.length + shieldPurchases.length + gearPurchases.length === 0 && (
              <li>Nothing purchased</li>
            )}
          </ul>
        </div>
      </section>

      <section className="sub-section leveling-up no-print">
        <h3>Leveling Up</h3>
        <p className="hint">
          This character is level {level}. Levels 2-10 are modeled so far; 11-20 are a planned follow-up.
        </p>
        {Array.from({ length: Math.min(level + 1, MAX_MODELED_LEVEL) - 1 }, (_, i) => i + 2).map((lvl) => (
          <Collapsible
            key={lvl}
            title={`Level ${lvl}`}
            meta={<span className="option-meta">{summarizeLevel(character, lvl)}</span>}
            defaultOpen={lvl === level + 1}
          >
            <LevelUpCard
              level={lvl}
              character={character}
              update={update}
              cls={cls}
              ancestry={ancestry}
              background={background}
              isFrontier={lvl === level + 1}
            />
          </Collapsible>
        ))}
        {level >= MAX_MODELED_LEVEL && (
          <p className="hint">Level {MAX_MODELED_LEVEL} of {MAX_MODELED_LEVEL} — levels 11-20 are a planned follow-up.</p>
        )}
      </section>

      <div className="summary-actions no-print">
        <button className="btn primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <button className="btn secondary" onClick={handleDownloadSheet} disabled={sheetStatus === 'working'}>
          {sheetStatus === 'working' ? 'Filling sheet…' : 'Download filled character sheet'}
        </button>
        <button className="btn secondary" onClick={onRestart}>
          Create another character
        </button>
      </div>
      {sheetStatus === 'error' && (
        <p className="option-warning">Couldn't fill the sheet — check the browser console for details.</p>
      )}
    </div>
  );
}
