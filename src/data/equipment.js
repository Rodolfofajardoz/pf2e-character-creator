// Starting equipment. Prices verified against Table 6-4 (Armor), 6-7/6-8
// (Weapons), and 6-9 (Adventuring Gear) of the Pathfinder Core Rulebook.

export const STARTING_GOLD = 15;

export const WEAPONS = [
  { id: 'dagger', name: 'Dagger', price: 0.2, category: 'simple', damage: '1d4 P' },
  { id: 'club', name: 'Club', price: 0, category: 'simple', damage: '1d6 B' },
  { id: 'mace', name: 'Mace', price: 1, category: 'simple', damage: '1d6 B' },
  { id: 'spear', name: 'Spear', price: 0.1, category: 'simple', damage: '1d6 P' },
  { id: 'staff', name: 'Staff', price: 0, category: 'simple', damage: '1d4 B' },
  { id: 'shortbow', name: 'Shortbow', price: 3, category: 'simple', damage: '1d6 P (ranged)' },
  { id: 'longsword', name: 'Longsword', price: 1, category: 'martial', damage: '1d8 S' },
  { id: 'rapier', name: 'Rapier', price: 2, category: 'martial', damage: '1d6 P' },
  { id: 'shortsword', name: 'Shortsword', price: 0.9, category: 'martial', damage: '1d6 P' },
  { id: 'greataxe', name: 'Greataxe', price: 2, category: 'martial', damage: '1d12 S' },
  { id: 'warhammer', name: 'Warhammer', price: 1, category: 'martial', damage: '1d8 B' },
  { id: 'longbow', name: 'Longbow', price: 6, category: 'martial', damage: '1d8 P (ranged)' },
];

export const ARMORS = [
  { id: 'none', name: 'No armor', price: 0, category: 'none', acBonus: 0, dexCap: null },
  { id: 'padded', name: 'Padded', price: 0.2, category: 'light', acBonus: 1, dexCap: 3 },
  { id: 'leather', name: 'Leather', price: 2, category: 'light', acBonus: 1, dexCap: 4 },
  { id: 'studded-leather', name: 'Studded Leather', price: 3, category: 'light', acBonus: 2, dexCap: 3 },
  { id: 'chain-shirt', name: 'Chain Shirt', price: 5, category: 'medium', acBonus: 2, dexCap: 3 },
  { id: 'hide', name: 'Hide', price: 2, category: 'medium', acBonus: 3, dexCap: 2 },
  { id: 'scale-mail', name: 'Scale Mail', price: 4, category: 'medium', acBonus: 3, dexCap: 2 },
  { id: 'chain-mail', name: 'Chain Mail', price: 6, category: 'medium', acBonus: 4, dexCap: 1 },
  { id: 'breastplate', name: 'Breastplate', price: 8, category: 'medium', acBonus: 4, dexCap: 1 },
  { id: 'splint-mail', name: 'Splint Mail', price: 13, category: 'heavy', acBonus: 5, dexCap: 1 },
  { id: 'half-plate', name: 'Half Plate', price: 18, category: 'heavy', acBonus: 5, dexCap: 1 },
  { id: 'full-plate', name: 'Full Plate', price: 30, category: 'heavy', acBonus: 6, dexCap: 0 },
];

export const GEAR = [
  { id: 'backpack', name: 'Backpack', price: 0.1 },
  { id: 'bedroll', name: 'Bedroll', price: 0.02 },
  { id: 'rope', name: 'Rope (50 feet)', price: 0.5 },
  { id: 'torch', name: 'Torches (x5)', price: 0.05 },
  { id: 'rations', name: 'Rations (1 week)', price: 0.4 },
  { id: 'waterskin', name: 'Waterskin', price: 0.05 },
  { id: 'healers-tools', name: "Healer's Tools", price: 5 },
  { id: 'thieves-tools', name: "Thieves' Tools", price: 3 },
  { id: 'crafting-tools', name: "Artisan's Tools", price: 4 },
  { id: 'grappling-hook', name: 'Grappling Hook', price: 0.1 },
  { id: 'lantern', name: 'Lantern', price: 1 },
  { id: 'climbing-kit', name: 'Climbing Kit', price: 0.5 },
];

export function formatGold(amount) {
  if (amount === 0) return 'Free';
  if (amount < 0.1) return `${Math.round(amount * 100)} cp`;
  if (amount < 1) return `${Math.round(amount * 10)} sp`;
  return `${amount} gp`;
}
