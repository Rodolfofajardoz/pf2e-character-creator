import { getSubclassOption } from './subclasses';

export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const ABILITY_LABELS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const SKILLS = [
  { id: 'acrobatics', name: 'Acrobatics', ability: 'dex' },
  { id: 'arcana', name: 'Arcana', ability: 'int' },
  { id: 'athletics', name: 'Athletics', ability: 'str' },
  { id: 'crafting', name: 'Crafting', ability: 'int' },
  { id: 'deception', name: 'Deception', ability: 'cha' },
  { id: 'diplomacy', name: 'Diplomacy', ability: 'cha' },
  { id: 'intimidation', name: 'Intimidation', ability: 'cha' },
  { id: 'medicine', name: 'Medicine', ability: 'wis' },
  { id: 'nature', name: 'Nature', ability: 'wis' },
  { id: 'occultism', name: 'Occultism', ability: 'int' },
  { id: 'performance', name: 'Performance', ability: 'cha' },
  { id: 'religion', name: 'Religion', ability: 'wis' },
  { id: 'society', name: 'Society', ability: 'int' },
  { id: 'stealth', name: 'Stealth', ability: 'dex' },
  { id: 'survival', name: 'Survival', ability: 'wis' },
  { id: 'thievery', name: 'Thievery', ability: 'dex' },
];

export const PROFICIENCY_RANKS = {
  untrained: { label: 'Untrained', bonus: (level) => 0 },
  trained: { label: 'Trained', bonus: (level) => level + 2 },
  expert: { label: 'Expert', bonus: (level) => level + 4 },
  master: { label: 'Master', bonus: (level) => level + 6 },
  legendary: { label: 'Legendary', bonus: (level) => level + 8 },
};

export function abilityMod(score) {
  return Math.floor((score - 10) / 2);
}

// Extra trained-skill slots granted by a class's "choose N skills" feature,
// beyond skillsBase + Int modifier. Classes with a concrete, enumerable
// choice (the Fighter's Acrobatics-or-Athletics, or a Sorcerer/Witch whose
// subclass has been picked — see getEffectiveFixedSkills) get those skills
// as fixed training instead and normally aren't counted here at all, since
// that slot isn't part of the free pool. But a subclass's `skills` array
// isn't always the FULL count the class's fixedSkillChoice text promises —
// the Draconic bloodline only lists 1 concrete skill (`skills: ['intimidation']`)
// because its second skill depends on an unmodeled exemplar sub-choice, so
// the gap between what's normally promised (2, for a Sorcerer) and what the
// subclass actually delivers is still added to the free pool here, rather
// than silently costing the player a trained skill. The
// `cls.id === 'sorcerer' ? 2 : 1` fallback (no subclass chosen yet) only
// matters for the brief window before one is — e.g. the live preview panel,
// which renders from step 1 onward.
export function getExtraSkillsFromChoice(cls, character) {
  if (cls.fixedSkillChoiceOptions) return 0;
  if (!cls.fixedSkillChoice) return 0;
  const normalCount = cls.id === 'sorcerer' ? 2 : 1;
  const sub = getSubclassOption(cls.id, character?.subclassChoice);
  if (!sub?.skills) return normalCount;
  return Math.max(0, normalCount - sub.skills.length);
}

export function getSkillPoolSize(cls, intMod, character) {
  return Math.max(0, cls.skillsBase + intMod) + getExtraSkillsFromChoice(cls, character);
}

// A class's automatically-trained skills, folding in whatever its subclass
// (Bloodline/Patron/Mystery — see subclasses.js) grants on top of
// cls.fixedSkills. The single place every consumer (SkillsStep,
// SummaryStep, LivePreviewPanel, ClassStep, fillCharacterSheet,
// getBackgroundSkillInfo below) should read instead of cls.fixedSkills
// directly, so a subclass's granted skills are never missed.
export function getEffectiveFixedSkills(character, cls) {
  const sub = getSubclassOption(cls.id, character?.subclassChoice);
  return [...(cls.fixedSkills || []), ...(sub?.skills || [])];
}

// Skills a Human's heritage (Skilled Heritage) or ancestry feat (Natural
// Skill) grants training in, player-chosen at the Ancestry step (see
// AncestryStep.jsx's heritageSkillChoices/ancestryFeatSkillChoices
// pickers). Kept out of getEffectiveFixedSkills on purpose: every consumer
// of that function labels its results "(from your class)", which would be
// wrong for these -- callers that need the full automatically-trained set
// (skill-pool exclusion, background-collision detection, the PDF's trained
// checkboxes) combine this with getEffectiveFixedSkills themselves instead.
export function getAncestryGrantedSkills(character) {
  return [...(character?.heritageSkillChoices || []), ...(character?.ancestryFeatSkillChoices || [])];
}

// PF2e rule: "If you would become trained in a skill you're already trained
// in, you instead become trained in a different skill of your choice." This
// can only be detected once both background and class are known (background
// comes first in the wizard), so it's resolved here rather than in
// BackgroundStep. Returns the background's *effective* trained skill: either
// its own skill/skillChoice, or `character.backgroundSkillSubstitute` if
// that skill collides with one the class already grants automatically (or
// one a Human heritage/ancestry feat already trained -- picked even earlier,
// at the Ancestry step).
export function getBackgroundSkillInfo(character, cls, background) {
  const rawId = background.skillChoice ? character.backgroundSkillChoice : background.skill;
  const classFixedIds = new Set([
    ...getEffectiveFixedSkills(character, cls),
    ...(character.classSkillChoice ? [character.classSkillChoice] : []),
    ...getAncestryGrantedSkills(character),
  ]);
  const hasCollision = Boolean(rawId) && classFixedIds.has(rawId);
  const effectiveId = hasCollision ? character.backgroundSkillSubstitute : rawId;
  return { rawId, hasCollision, effectiveId, classFixedIds };
}
