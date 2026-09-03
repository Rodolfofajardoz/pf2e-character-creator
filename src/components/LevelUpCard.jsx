import { ABILITIES, PROFICIENCY_RANKS, RANK_ORDER, SKILLS, getSkillRank } from '../data/skills';
import { GENERAL_FEATS, SKILL_FEATS } from '../data/generalFeats';
import { WEAPON_GROUPS } from '../data/equipment';
import { getLevelRequirements, isLevelComplete, meetsPrereq } from '../utils/leveling';
import { GlossaryTerm, InspectText, AbilityTerm } from '../context/InspectContext';

// One level's worth of Level-Up choices (2nd-10th) -- rendered inside a
// Collapsible per level by SummaryStep's "Leveling Up" section. Every slot
// below is optional per-level (gated by getLevelRequirements): a level with
// none of them applicable (there is none between 2 and 10, but the pattern
// stays general) would render an empty card.
//
// Picks are stored as `{ level, ... }` entries in character's *ByLevel
// arrays, one entry per level per array -- editing an already-confirmed
// level's pick is allowed (not locked once `character.level` passes it):
// every derived stat (getSkillRank, computeTotalHP, etc.) recomputes from
// the raw arrays rather than caching a snapshot, so there's no stale state
// to invalidate the way changing an *upstream* level-1 choice can.
export default function LevelUpCard({ level, character, update, cls, ancestry, background, isFrontier }) {
  const req = getLevelRequirements(level);

  function replaceByLevel(field, entry) {
    update({ [field]: [...character[field].filter((e) => e.level !== level), entry] });
  }

  function toggleBoost(ability) {
    const field = level === 5 ? 'level5Boosts' : 'level10Boosts';
    const current = character[field];
    if (current.includes(ability)) {
      update({ [field]: current.filter((a) => a !== ability) });
    } else if (current.length < 4) {
      update({ [field]: [...current, ability] });
    }
  }

  const classFeatCatalog = cls[`feats${level}`] || [];
  const pickedClassFeatEntry = character.classFeatsByLevel.find((f) => f.level === level) || null;
  const pickedClassFeat = pickedClassFeatEntry?.feat || null;

  function setClassFeatSubChoice(value) {
    replaceByLevel('classFeatsByLevel', { level, feat: pickedClassFeat, subChoiceValue: value });
  }

  const pickedSkillFeat = character.skillFeatsByLevel.find((f) => f.level === level)?.feat || null;

  const pickedGeneralFeat = character.generalFeatsByLevel.find((f) => f.level === level)?.feat || null;

  const ancestryFeatCatalog = ancestry[`feats${level}`] || [];
  const pickedAncestryFeat = character.ancestryFeatsByLevel.find((f) => f.level === level)?.feat || null;

  const currentSkillPick = character.skillIncreases.find((s) => s.level === level)?.skillId || null;
  // Rank each skill would show *before* this level's own pick -- excluding
  // this level's entry from the lookup, so re-picking a different skill
  // (or the same one) always compares against the right baseline instead of
  // against a rank that already includes the in-progress choice.
  const priorCharacter = { ...character, skillIncreases: character.skillIncreases.filter((s) => s.level !== level) };
  const skillIncreaseOptions = req.skillIncrease
    ? SKILLS.map((s) => {
        const priorRank = getSkillRank(priorCharacter, cls, ancestry, background, s.id);
        const priorIdx = RANK_ORDER.indexOf(priorRank);
        // Master requires at least 7th level; nothing legally goes past
        // master within this app's 1-10 cap (legendary needs 15th).
        const legal = priorRank !== 'master' && priorRank !== 'legendary' && !(priorRank === 'expert' && level < 7);
        return { ...s, priorRank, nextRank: RANK_ORDER[Math.min(priorIdx + 1, RANK_ORDER.length - 1)], legal };
      })
    : [];

  const boostField = level === 5 ? 'level5Boosts' : 'level10Boosts';
  const boosts = character[boostField];

  const complete = isLevelComplete(character, level, cls, ancestry);

  // Prerequisites are checked (not just shown) here, unlike the level-1
  // pickers -- filtered out rather than shown-disabled, same call as the
  // ancestry/heritage skill-choice pickers make. The currently-picked feat
  // stays visible even if it no longer qualifies (e.g. a skill it needed
  // got swapped out later), so a valid-when-made choice never vanishes out
  // from under the player without an explicit action on their part.
  const availableClassFeats = classFeatCatalog.filter(
    (f) => f.name === pickedClassFeat?.name || meetsPrereq(character, cls, ancestry, background, f.prereq)
  );
  const availableSkillFeats = SKILL_FEATS.filter(
    (f) => f.id === pickedSkillFeat?.id || meetsPrereq(character, cls, ancestry, background, f.prereq)
  );
  const availableGeneralFeats = GENERAL_FEATS.filter(
    (f) => f.id === pickedGeneralFeat?.id || meetsPrereq(character, cls, ancestry, background, f.prereq)
  );
  const availableAncestryFeats = ancestryFeatCatalog.filter(
    (f) => f.name === pickedAncestryFeat?.name || meetsPrereq(character, cls, ancestry, background, f.prereq)
  );

  return (
    <div className="level-up-card">
      {req.classFeat && (
        <section className="sub-section">
          <h4>{cls.name} Feat</h4>
          {classFeatCatalog.length === 0 ? (
            <p className="hint">No curated {cls.name} feat catalog for this level yet -- coming in a follow-up pass.</p>
          ) : (
            <div className="card-grid">
              {availableClassFeats.map((f) => (
                <button
                  key={f.name}
                  className={`option-card small ${pickedClassFeat?.name === f.name ? 'selected' : ''}`}
                  onClick={() => replaceByLevel('classFeatsByLevel', { level, feat: f })}
                >
                  <h4>{f.name}</h4>
                  <p className="option-desc"><InspectText text={f.desc} /></p>
                </button>
              ))}
            </div>
          )}
          {pickedClassFeat?.subChoice === 'weaponGroup' && (
            <div className="chip-row">
              {WEAPON_GROUPS.map((g) => (
                <button
                  key={g}
                  className={`chip ${pickedClassFeatEntry?.subChoiceValue === g ? 'selected' : ''}`}
                  onClick={() => setClassFeatSubChoice(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {cls.id === 'fighter' && level === 5 && (
        <section className="sub-section">
          <h4>Fighter Weapon Mastery</h4>
          <p className="hint">Automatic at 5th level. Choose a weapon group: you become a master with every weapon in it.</p>
          <div className="chip-row">
            {WEAPON_GROUPS.map((g) => (
              <button
                key={g}
                className={`chip ${character.weaponMasteryGroup === g ? 'selected' : ''}`}
                onClick={() => update({ weaponMasteryGroup: g })}
              >
                {g}
              </button>
            ))}
          </div>
        </section>
      )}

      {req.skillFeat && (
        <section className="sub-section">
          <h4>Skill Feat</h4>
          <div className="card-grid">
            {availableSkillFeats.map((f) => (
              <button
                key={f.id}
                className={`option-card small ${pickedSkillFeat?.id === f.id ? 'selected' : ''}`}
                onClick={() => replaceByLevel('skillFeatsByLevel', { level, feat: f })}
              >
                <h4>{f.name}</h4>
                <p className="option-meta">{f.prereq}</p>
                <p className="option-desc">{f.desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {req.generalFeat && (
        <section className="sub-section">
          <h4>General Feat</h4>
          <div className="card-grid">
            {availableGeneralFeats.map((f) => (
              <button
                key={f.id}
                className={`option-card small ${pickedGeneralFeat?.id === f.id ? 'selected' : ''}`}
                onClick={() => replaceByLevel('generalFeatsByLevel', { level, feat: f })}
              >
                <h4>{f.name}</h4>
                {f.prereq && <p className="option-meta">Prerequisite: {f.prereq}</p>}
                <p className="option-desc">{f.desc}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {req.ancestryFeat && (
        <section className="sub-section">
          <h4>Ancestry Feat</h4>
          {ancestryFeatCatalog.length === 0 ? (
            <p className="hint">No curated {ancestry.name} feat catalog for this level yet -- coming in a follow-up pass.</p>
          ) : (
            <div className="card-grid">
              {availableAncestryFeats.map((f) => (
                <button
                  key={f.name}
                  className={`option-card small ${pickedAncestryFeat?.name === f.name ? 'selected' : ''}`}
                  onClick={() => replaceByLevel('ancestryFeatsByLevel', { level, feat: f })}
                >
                  <h4>{f.name}</h4>
                  <p className="option-desc"><InspectText text={f.desc} /></p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {req.skillIncrease && (
        <section className="sub-section">
          <h4>Skill Increase</h4>
          <p className="hint">Train a new skill, or increase one you're already trained in.</p>
          <div className="chip-row">
            {skillIncreaseOptions.map((s) => (
              <button
                key={s.id}
                className={`chip ${currentSkillPick === s.id ? 'selected' : ''}`}
                onClick={() => replaceByLevel('skillIncreases', { level, skillId: s.id })}
                disabled={currentSkillPick !== s.id && !s.legal}
              >
                <GlossaryTerm id={s.id}>{s.name}</GlossaryTerm> ({PROFICIENCY_RANKS[s.priorRank].label} {'→'}{' '}
                {PROFICIENCY_RANKS[s.nextRank].label})
              </button>
            ))}
          </div>
        </section>
      )}

      {req.abilityBoosts && (
        <section className="sub-section">
          <h4>4 Ability Boosts</h4>
          <p className="hint">Choose 4 different ability scores to each receive an additional boost.</p>
          <div className="chip-row">
            {ABILITIES.map((a) => (
              <button
                key={a}
                className={`chip ${boosts.includes(a) ? 'selected' : ''}`}
                onClick={() => toggleBoost(a)}
                disabled={!boosts.includes(a) && boosts.length >= 4}
              >
                <AbilityTerm code={a} />
              </button>
            ))}
          </div>
        </section>
      )}

      {isFrontier && (
        <button
          className="btn primary"
          disabled={!complete}
          onClick={() => update({ level })}
        >
          Confirm Level {level}
        </button>
      )}
    </div>
  );
}
