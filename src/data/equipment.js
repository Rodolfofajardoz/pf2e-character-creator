// Starting equipment. Originally verified against Table 6-4 (Armor), 6-7/6-8
// (Weapons), and 6-9 (Adventuring Gear) of the Pathfinder Core Rulebook;
// expanded and re-verified against Archives of Nethys (Player Core /
// Player Core 2 remaster data, queried directly via AoN's Elasticsearch
// index — see PROJECT_NOTES.md for the technique). Two bugs were fixed
// during that pass: Shortbow is a Martial weapon, not Simple (its category
// was wrong), and the toolkits were misnamed "Tools" instead of "Toolkit"
// (prices were already correct on both).

export const STARTING_GOLD = 15;

export const WEAPONS = [
  // Simple
  { id: 'club', name: 'Club', price: 0, category: 'simple', damage: '1d6 B' },
  { id: 'dagger', name: 'Dagger', price: 0.2, category: 'simple', damage: '1d4 P' },
  { id: 'gauntlet', name: 'Gauntlet', price: 0.2, category: 'simple', damage: '1d4 B' },
  { id: 'light-mace', name: 'Light Mace', price: 0.4, category: 'simple', damage: '1d4 B' },
  { id: 'longspear', name: 'Longspear', price: 0.5, category: 'simple', damage: '1d8 P' },
  { id: 'mace', name: 'Mace', price: 1, category: 'simple', damage: '1d6 B' },
  { id: 'morningstar', name: 'Morningstar', price: 1, category: 'simple', damage: '1d6 B' },
  { id: 'sickle', name: 'Sickle', price: 0.2, category: 'simple', damage: '1d4 S' },
  { id: 'spiked-gauntlet', name: 'Spiked Gauntlet', price: 0.3, category: 'simple', damage: '1d4 P' },
  { id: 'spear', name: 'Spear', price: 0.1, category: 'simple', damage: '1d6 P' },
  { id: 'staff', name: 'Staff', price: 0, category: 'simple', damage: '1d4 B' },
  { id: 'blowgun', name: 'Blowgun', price: 0.1, category: 'simple', damage: '1 P (ranged)' },
  { id: 'crossbow', name: 'Crossbow', price: 3, category: 'simple', damage: '1d8 P (ranged)' },
  { id: 'dart', name: 'Dart', price: 0.01, category: 'simple', damage: '1d4 P (ranged)' },
  { id: 'hand-crossbow', name: 'Hand Crossbow', price: 3, category: 'simple', damage: '1d6 P (ranged)' },
  { id: 'javelin', name: 'Javelin', price: 0.1, category: 'simple', damage: '1d6 P (ranged)' },
  { id: 'sling', name: 'Sling', price: 0, category: 'simple', damage: '1d6 B (ranged)' },
  // Martial
  { id: 'battle-axe', name: 'Battle Axe', price: 1, category: 'martial', damage: '1d8 S' },
  { id: 'bastard-sword', name: 'Bastard Sword', price: 4, category: 'martial', damage: '1d8 S' },
  { id: 'falchion', name: 'Falchion', price: 3, category: 'martial', damage: '1d10 S' },
  { id: 'flail', name: 'Flail', price: 0.8, category: 'martial', damage: '1d6 B' },
  { id: 'greataxe', name: 'Greataxe', price: 2, category: 'martial', damage: '1d12 S' },
  { id: 'greatclub', name: 'Greatclub', price: 1, category: 'martial', damage: '1d10 B' },
  { id: 'greatpick', name: 'Greatpick', price: 1, category: 'martial', damage: '1d10 P' },
  { id: 'greatsword', name: 'Greatsword', price: 2, category: 'martial', damage: '1d12 S' },
  { id: 'guisarme', name: 'Guisarme', price: 2, category: 'martial', damage: '1d10 S' },
  { id: 'halberd', name: 'Halberd', price: 2, category: 'martial', damage: '1d10 P' },
  { id: 'hatchet', name: 'Hatchet', price: 0.4, category: 'martial', damage: '1d6 S' },
  { id: 'lance', name: 'Lance', price: 1, category: 'martial', damage: '1d8 P' },
  { id: 'light-hammer', name: 'Light Hammer', price: 0.3, category: 'martial', damage: '1d6 B' },
  { id: 'light-pick', name: 'Light Pick', price: 0.4, category: 'martial', damage: '1d4 P' },
  { id: 'longsword', name: 'Longsword', price: 1, category: 'martial', damage: '1d8 S' },
  { id: 'main-gauche', name: 'Main-gauche', price: 0.5, category: 'martial', damage: '1d4 P' },
  { id: 'maul', name: 'Maul', price: 3, category: 'martial', damage: '1d12 B' },
  { id: 'pick', name: 'Pick', price: 0.7, category: 'martial', damage: '1d6 P' },
  { id: 'rapier', name: 'Rapier', price: 2, category: 'martial', damage: '1d6 P' },
  { id: 'sap', name: 'Sap', price: 0.1, category: 'martial', damage: '1d6 B' },
  { id: 'scimitar', name: 'Scimitar', price: 1, category: 'martial', damage: '1d6 S' },
  { id: 'scythe', name: 'Scythe', price: 2, category: 'martial', damage: '1d10 S' },
  { id: 'shortsword', name: 'Shortsword', price: 0.9, category: 'martial', damage: '1d6 P' },
  { id: 'trident', name: 'Trident', price: 1, category: 'martial', damage: '1d8 P' },
  { id: 'war-flail', name: 'War Flail', price: 2, category: 'martial', damage: '1d10 B' },
  { id: 'warhammer', name: 'Warhammer', price: 1, category: 'martial', damage: '1d8 B' },
  { id: 'whip', name: 'Whip', price: 0.1, category: 'martial', damage: '1d4 S' },
  { id: 'arbalest', name: 'Arbalest', price: 8, category: 'martial', damage: '1d10 P (ranged)' },
  { id: 'bola', name: 'Bola', price: 0.5, category: 'martial', damage: '1d6 B (ranged)' },
  { id: 'longbow', name: 'Longbow', price: 6, category: 'martial', damage: '1d8 P (ranged)' },
  { id: 'shortbow', name: 'Shortbow', price: 3, category: 'martial', damage: '1d6 P (ranged)' },
];

export const ARMORS = [
  { id: 'none', name: 'No armor', price: 0, category: 'none', acBonus: 0, dexCap: null },
  { id: 'explorers-clothing', name: "Explorer's Clothing", price: 0.1, category: 'none', acBonus: 0, dexCap: 5 },
  { id: 'padded', name: 'Padded', price: 0.2, category: 'light', acBonus: 1, dexCap: 3 },
  { id: 'leather', name: 'Leather', price: 2, category: 'light', acBonus: 1, dexCap: 4 },
  { id: 'studded-leather', name: 'Studded Leather', price: 3, category: 'light', acBonus: 2, dexCap: 3 },
  { id: 'chain-shirt', name: 'Chain Shirt', price: 5, category: 'light', acBonus: 2, dexCap: 3 },
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
  { id: 'healers-toolkit', name: "Healer's Toolkit", price: 5 },
  { id: 'thieves-toolkit', name: "Thieves' Toolkit", price: 3 },
  { id: 'artisans-toolkit', name: "Artisan's Toolkit", price: 4 },
  { id: 'grappling-hook', name: 'Grappling Hook', price: 0.1 },
  { id: 'hooded-lantern', name: 'Hooded Lantern', price: 0.7 },
  { id: 'climbing-kit', name: 'Climbing Kit', price: 0.5 },
  { id: 'chalk', name: 'Chalk (1 piece)', price: 0.01 },
  { id: 'crowbar', name: 'Crowbar', price: 0.5 },
  { id: 'flint-and-steel', name: 'Flint and Steel', price: 0.05 },
  { id: 'manacles', name: 'Manacles', price: 0.3 },
  { id: 'merchants-scale', name: "Merchant's Scale", price: 0.2 },
  { id: 'mirror', name: 'Mirror', price: 1 },
  { id: 'oil-flask', name: 'Oil (Flask)', price: 0.01 },
  { id: 'piton', name: 'Piton', price: 0.01 },
  { id: 'sack', name: 'Sack', price: 0.01 },
  { id: 'signal-whistle', name: 'Signal Whistle', price: 0.08 },
  { id: 'soap', name: 'Soap', price: 0.02 },
  { id: 'ten-foot-pole', name: 'Ten-Foot Pole', price: 0.01 },
  { id: 'writing-set', name: 'Writing Set', price: 1 },
  { id: 'compass', name: 'Compass', price: 1 },
  { id: 'fishing-tackle', name: 'Fishing Tackle', price: 0.8 },
  { id: 'tent-pup', name: 'Tent (Pup)', price: 0.8 },
  { id: 'adventurers-pack', name: "Adventurer's Pack", price: 1.5 },
];

export function formatGold(amount) {
  if (amount === 0) return 'Free';
  if (amount < 0.1) return `${Math.round(amount * 100)} cp`;
  if (amount < 1) return `${Math.round(amount * 10)} sp`;
  const gp = Math.floor(amount);
  const sp = Math.round((amount - gp) * 10);
  return sp > 0 ? `${gp} gp, ${sp} sp` : `${gp} gp`;
}
