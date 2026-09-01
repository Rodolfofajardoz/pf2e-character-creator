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
// choice (currently only the Fighter's Acrobatics-or-Athletics) get a
// dedicated required pick in ClassStep instead (see fixedSkillChoiceOptions)
// and aren't counted here, since that slot isn't part of the free pool.
export function getExtraSkillsFromChoice(cls) {
  if (cls.fixedSkillChoiceOptions) return 0;
  if (!cls.fixedSkillChoice) return 0;
  return cls.id === 'sorcerer' ? 2 : 1;
}

export function getSkillPoolSize(cls, intMod) {
  return Math.max(0, cls.skillsBase + intMod) + getExtraSkillsFromChoice(cls);
}

// PF2e rule: "If you would become trained in a skill you're already trained
// in, you instead become trained in a different skill of your choice." This
// can only be detected once both background and class are known (background
// comes first in the wizard), so it's resolved here rather than in
// BackgroundStep. Returns the background's *effective* trained skill: either
// its own skill/skillChoice, or `character.backgroundSkillSubstitute` if
// that skill collides with one the class already grants automatically.
export function getBackgroundSkillInfo(character, cls, background) {
  const rawId = background.skillChoice ? character.backgroundSkillChoice : background.skill;
  const classFixedIds = new Set([
    ...(cls.fixedSkills || []),
    ...(character.classSkillChoice ? [character.classSkillChoice] : []),
  ]);
  const hasCollision = Boolean(rawId) && classFixedIds.has(rawId);
  const effectiveId = hasCollision ? character.backgroundSkillSubstitute : rawId;
  return { rawId, hasCollision, effectiveId, classFixedIds };
}
