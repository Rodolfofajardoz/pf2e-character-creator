import { SKILLS, abilityMod, getSkillRank, PROFICIENCY_RANKS, RANK_ORDER } from '../data/skills';
import { computeScoresAtLevel } from './abilityScores';

// The universal PF2e leveling cadence (Player Core's class tables): every
// class grants exactly these slots at exactly these levels, 2nd through
// 10th -- confirmed against Fighter's own AoN class page (Player Core pg.
// 140), which (aside from its own class features) matches this cadence
// exactly. Only proficiency-rank timing and the actual feat catalog per
// level are class-specific (see classes.js's proficiencyProgression/
// featsN fields) -- the cadence itself isn't, so it lives here once rather
// than being repeated per class.
export function getLevelRequirements(level) {
  return {
    classFeat: level >= 2 && level % 2 === 0,
    skillFeat: level >= 2 && level % 2 === 0,
    generalFeat: level === 3 || level === 7,
    ancestryFeat: level === 5 || level === 9,
    skillIncrease: level >= 3 && level % 2 === 1,
    abilityBoosts: level === 5 || level === 10,
  };
}

// class HP + your Constitution modifier at the time, gained every level --
// including level 1, so this replaces (not just extends) the flat
// `ancestry.hp + cls.hp + mods.con` line useComputedCharacter used to have.
// A Con boost at level 5 or 10 changes the modifier used from that level
// onward without retroactively changing earlier levels, hence the 3-segment
// sum (1-4, 5-9, 10) instead of a single `cls.hp * level + conMod * level`.
export function computeTotalHP(character, ancestry, cls) {
  const level = character.level || 1;
  const segment1 = Math.min(level, 4);
  const segment5 = Math.max(0, Math.min(level, 9) - 4);
  const segment10 = Math.max(0, level - 9);
  const conMod1 = abilityMod(computeScoresAtLevel(character, ancestry, 1).con);
  const conMod5 = level >= 5 ? abilityMod(computeScoresAtLevel(character, ancestry, 5).con) : 0;
  const conMod10 = level >= 10 ? abilityMod(computeScoresAtLevel(character, ancestry, 10).con) : 0;
  return ancestry.hp + cls.hp * level + conMod1 * segment1 + conMod5 * segment5 + conMod10 * segment10;
}

// A class's current rank on some track (Perception, a save, Class DC, or
// armor) at a given level: the level-1 baseline (`baseRank`, still read
// directly off classes.js -- unchanged, still the single source of truth
// for 1st level) unless the class's own `proficiencyProgression` names a
// later level at or before `level` that bumps it further. A class with no
// progression data for a track (every non-Fighter class today) simply never
// advances past its 1st-level rank -- correct-by-default rather than a
// fabricated guess, until that class's own AoN-verified table is added.
export function getCurrentRank(baseRank, progression, level) {
  if (!progression || progression.length === 0) return baseRank;
  let rank = baseRank;
  progression.forEach(([atLevel, newRank]) => {
    if (level >= atLevel) rank = newRank;
  });
  return rank;
}

// A class's current proficiency rank with a given weapon category
// ('simple'/'martial', matching WEAPONS' own `category` field). Only
// Fighter has real structured `weaponProficiency`/`weaponProficiencyProgression`
// data so far (see classes.js); every other class falls back to the same
// "mentioned at all in the free-text `weapons` description -> Trained"
// detection `fillCharacterSheet.js`'s proficiency checkboxes already used,
// since no other class's prose distinguishes a higher starting rank.
// Doesn't account for Fighter Weapon Mastery's per-weapon-group Master rank
// (5th level) -- that needs a per-weapon `group` field this app doesn't
// track yet, a separate, documented gap.
export function getWeaponProficiencyRank(cls, category, level) {
  const base = cls.weaponProficiency?.[category];
  if (base) return getCurrentRank(base, cls.weaponProficiencyProgression?.[category], level);
  const text = (cls.weapons || '').toLowerCase();
  return text.includes(category) ? 'trained' : 'untrained';
}

// Shared by useComputedCharacter.js, SummaryStep.jsx, and
// fillCharacterSheet.js -- previously each had its own copy (flagged, not
// yet fixed, by the prior full-codebase audit); worth collapsing to one now
// that `level` is no longer always 1.
export function profBonus(rank, level) {
  return PROFICIENCY_RANKS[rank].bonus(level);
}

// Whether every choice a given level's slots require (per
// getLevelRequirements) has actually been made -- mirrors App.jsx's
// isStepComplete pattern, gating that level's "Confirm Level N" button in
// SummaryStep's Leveling Up section.
//
// A class/skill/ancestry feat slot backed by an empty (not-yet-written)
// catalog doesn't block confirming the level -- there's nothing to pick
// from yet for that class/ancestry (only Fighter has feats2..feats10 this
// pass; no ancestry has feats5/feats9 yet), and blocking every class but
// Fighter from ever reaching level 2 would defeat "extend one class at a
// time." `cls`/`ancestry` are optional so callers that already know a slot
// doesn't apply (e.g. skill/general feats, always backed by GENERAL_FEATS)
// can omit them.
export function isLevelComplete(character, level, cls, ancestry) {
  const req = getLevelRequirements(level);
  const classFeatCatalog = cls?.[`feats${level}`] || [];
  const pickedClassFeat = character.classFeatsByLevel.find((f) => f.level === level);
  const classFeatOk =
    !req.classFeat ||
    classFeatCatalog.length === 0 ||
    (Boolean(pickedClassFeat) && (!pickedClassFeat.feat.subChoice || Boolean(pickedClassFeat.subChoiceValue)));
  const skillFeatOk = !req.skillFeat || Boolean(character.skillFeatsByLevel.find((f) => f.level === level));
  const generalFeatOk = !req.generalFeat || Boolean(character.generalFeatsByLevel.find((f) => f.level === level));
  const ancestryFeatCatalog = ancestry?.[`feats${level}`] || [];
  const ancestryFeatOk =
    !req.ancestryFeat ||
    ancestryFeatCatalog.length === 0 ||
    Boolean(character.ancestryFeatsByLevel.find((f) => f.level === level));
  const skillIncreaseOk = !req.skillIncrease || Boolean(character.skillIncreases.find((s) => s.level === level));
  const abilityBoostsOk =
    !req.abilityBoosts ||
    (level === 5 ? character.level5Boosts.length === 4 : character.level10Boosts.length === 4);
  // Fighter Weapon Mastery isn't part of the universal cadence (it's an
  // automatic Fighter-only class feature, not a picked feat slot -- see
  // LevelUpCard's dedicated section for it) but still needs its own choice
  // made before 5th level can be confirmed, same as any other required pick.
  const weaponMasteryOk = !(cls?.id === 'fighter' && level === 5) || Boolean(character.weaponMasteryGroup);
  return classFeatOk && skillFeatOk && generalFeatOk && ancestryFeatOk && skillIncreaseOk && abilityBoostsOk && weaponMasteryOk;
}

const ABILITY_NAME_TO_CODE = { strength: 'str', dexterity: 'dex', constitution: 'con', intelligence: 'int', wisdom: 'wis', charisma: 'cha' };

// Every feat/class-feature name already on the sheet, from every slot this
// app tracks a pick in -- used to check a "Requires <Feat Name>" chain
// prerequisite (e.g. Triple Shot requiring Double Shot).
function allPickedFeatNames(character) {
  const names = [];
  if (character.ancestryFeat) names.push(character.ancestryFeat.name);
  if (character.generalFeatChoice) names.push(character.generalFeatChoice.name);
  if (character.classFeat) names.push(character.classFeat.name);
  if (character.bonusClassFeat) names.push(character.bonusClassFeat.name);
  if (character.customBackgroundFeat) names.push(character.customBackgroundFeat.name);
  (character.classFeatsByLevel || []).forEach((e) => names.push(e.feat.name));
  (character.skillFeatsByLevel || []).forEach((e) => names.push(e.feat.name));
  (character.generalFeatsByLevel || []).forEach((e) => names.push(e.feat.name));
  (character.ancestryFeatsByLevel || []).forEach((e) => names.push(e.feat.name));
  return names;
}

// A prereq string looks like a bare feat name (e.g. "Double Shot") when
// every word starts capitalized and nothing else marks it as prose -- used
// to tell "reference to a specific feat the character may not have yet"
// (fail closed: hide it) apart from genuinely unparseable narrative prereq
// text this app doesn't try to check (e.g. "the Dragon instinct") -- fail
// open there, since wrongly hiding a legal option is worse than showing an
// extra one prerequisites are already trusted, not enforced, elsewhere.
const FEAT_NAME_SHAPE = /^[A-Z][\w']*(?:[\s-]+(?:[A-Z][\w'-]*|of|the|a|and))*$/;

// Whether `character` (at its current build state -- ancestry/background/
// class already resolved by the caller) satisfies a feat's `prereq` text.
// Handles the shapes this app's own data actually uses: skill training
// ("Trained in X", "Trained in X or Y", "Trained in at least one skill"),
// an ability-modifier floor ("Constitution +2"), a save/Perception rank
// floor ("master in Perception"), and a named-feat chain ("Double Shot").
// Anything else is left visible rather than guessed at.
export function meetsPrereq(character, cls, ancestry, background, prereq) {
  if (!prereq) return true;
  const text = prereq.trim();

  if (/^Trained in at least one skill$/i.test(text)) {
    return SKILLS.some((s) => getSkillRank(character, cls, ancestry, background, s.id) !== 'untrained');
  }
  let m = text.match(/^Trained in (.+)$/i);
  if (m) {
    const names = m[1].split(/,|;| or /i).map((s) => s.trim().toLowerCase()).filter(Boolean);
    return names.some((name) => {
      const skill = SKILLS.find((s) => s.name.toLowerCase() === name);
      return skill && getSkillRank(character, cls, ancestry, background, skill.id) !== 'untrained';
    });
  }
  m = text.match(/^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) \+(\d+)$/i);
  if (m) {
    const code = ABILITY_NAME_TO_CODE[m[1].toLowerCase()];
    const scores = computeScoresAtLevel(character, ancestry, character.level || 1);
    return abilityMod(scores[code]) >= Number(m[2]);
  }
  m = text.match(/^(expert|master|legendary) in (Perception|Fortitude|Reflex|Will)$/i);
  if (m) {
    const requiredIdx = RANK_ORDER.indexOf(m[1].toLowerCase());
    const level = character.level || 1;
    const track = m[2].toLowerCase();
    const currentRank =
      track === 'perception'
        ? getCurrentRank(cls.perception, cls.proficiencyProgression?.perception, level)
        : getCurrentRank(cls.saves[track], cls.proficiencyProgression?.saves?.[track], level);
    return RANK_ORDER.indexOf(currentRank) >= requiredIdx;
  }
  if (allPickedFeatNames(character).includes(text)) return true;
  if (FEAT_NAME_SHAPE.test(text)) return false; // a specific feat, not yet picked
  return true; // unparseable/narrative -- fail open
}
