import { useState } from 'react';
import { SKILLS, ABILITY_LABELS, PROFICIENCY_RANKS, getEffectiveFixedSkills, getAncestryGrantedSkills } from '../../data/skills';
import { CANTRIPS, SPELLS_RANK_1, TRADITION_LABELS } from '../../data/spells';
import { SUBCLASSES, getSubclassOption } from '../../data/subclasses';
import { InspectText, GlossaryTerm } from '../../context/InspectContext';
import { ABILITY_TERM_ID } from '../../data/glossary';
import { useComputedCharacter } from '../../hooks/useComputedCharacter';
import { fillCharacterSheet } from '../../utils/fillCharacterSheet';

const LEVEL = 1;

function mod(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

function profBonus(rank) {
  return PROFICIENCY_RANKS[rank].bonus(LEVEL);
}

export default function SummaryStep({ character, update, onRestart }) {
  const computed = useComputedCharacter(character);
  const {
    ancestry,
    background,
    cls,
    heritage,
    backgroundSkillId,
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
    perceptionMod,
    classDCAbility,
    classDC,
  } = computed;

  const subclassGroup = SUBCLASSES[cls.id];
  const subOption = subclassGroup ? getSubclassOption(cls.id, character.subclassChoice) : null;

  // Every skill already accounted for by one of the other rows below, so the
  // ancestry-granted and "additional trained" lists can be deduped against
  // it -- a character saved before trainedSkills started getting reset on
  // upstream changes (see App.jsx/AncestryStep/BackgroundStep/ClassStep)
  // could still have a stale pick that collides with a fixed skill, which
  // would otherwise print (and React-key) that skill twice.
  const fixedSkillIds = getEffectiveFixedSkills(character, cls);
  const alreadyShownIds = new Set([
    ...fixedSkillIds,
    ...(character.classSkillChoice ? [character.classSkillChoice] : []),
    ...(backgroundSkillId ? [backgroundSkillId] : []),
  ]);
  const ancestryGrantedSkills = getAncestryGrantedSkills(character).filter((id) => !alreadyShownIds.has(id));
  ancestryGrantedSkills.forEach((id) => alreadyShownIds.add(id));
  const extraTrainedSkills = character.trainedSkills.filter((id) => !alreadyShownIds.has(id));

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
            Level {LEVEL} · <GlossaryTerm id="hit-points">HP</GlossaryTerm> {hp} · Size {ancestry.size} ·{' '}
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
            {getEffectiveFixedSkills(character, cls).map((s) => {
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
            {ancestryGrantedSkills.map((id) => {
              const skill = SKILLS.find((sk) => sk.id === id);
              return (
                <li key={id}>
                  <GlossaryTerm id={skill.id}>{skill.name}</GlossaryTerm>: {mod(mods[skill.ability] + profBonus('trained'))}
                </li>
              );
            })}
            {extraTrainedSkills.map((id) => {
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
