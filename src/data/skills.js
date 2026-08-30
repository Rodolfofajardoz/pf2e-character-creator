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
