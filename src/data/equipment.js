// Starting equipment. Originally verified against Table 6-4 (Armor), 6-7/6-8
// (Weapons), and 6-9 (Adventuring Gear) of the Pathfinder Core Rulebook;
// expanded and re-verified against Archives of Nethys (Player Core /
// Player Core 2 remaster data, queried directly via AoN's Elasticsearch
// index — see PROJECT_NOTES.md for the technique). Two early bugs were
// fixed during that pass: Shortbow is a Martial weapon, not Simple (its
// category was wrong), and the toolkits were misnamed "Tools" instead of
// "Toolkit" (prices were already correct on both).
//
// GEAR and AMMUNITION were rebuilt from a full pull of every level-0 item
// AoN lists under item_category "Adventuring Gear" (equipment) sourced to
// Player Core, deduplicated by name+price — this is the complete Table 6-9
// catalog, not a curated subset, per an explicit request to stock
// everything the book lists as available in a starting shop. SHIELDS is a
// new category (wasn't modeled at all before) pulled from AoN's separate
// "shield" item type. Mount-only gear (Barding) was excluded — a level-1
// character doesn't have a mount to put it on.

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

export const WEAPON_CATEGORY_LABELS = {
  simple: 'Simple Weapons',
  martial: 'Martial Weapons',
};

// Ammunition is its own line-item type in the book (sold in bundles of 10,
// consumed as you shoot) rather than a Simple/Martial weapon, so it's kept
// separate from WEAPONS. Priced per bundle-of-10, same convention as the
// bundled Adventuring Gear entries below (Chalk, etc.) — buying "2" of
// "Arrows (10)" gets you 20 arrows.
export const AMMUNITION = [
  { id: 'arrows', name: 'Arrows (10)', price: 0.1 },
  { id: 'bolts', name: 'Bolts (10)', price: 0.1 },
  { id: 'sling-bullets', name: 'Sling Bullets (10)', price: 0.01 },
  { id: 'blowgun-darts', name: 'Blowgun Darts (10)', price: 0.05 },
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

export const ARMOR_CATEGORY_LABELS = {
  none: 'Unarmored',
  light: 'Light Armor',
  medium: 'Medium Armor',
  heavy: 'Heavy Armor',
};

// Shields aren't armor — you can wear armor and carry a shield at the same
// time — so they get their own character.shieldIds field rather than
// competing with ARMORS for the "first purchased is worn" slot. Their AC
// bonus only applies while you Raise a Shield (a per-turn action), so
// unlike armor it's deliberately *not* folded into the passive AC formula
// in useComputedCharacter — it's shown for reference only.
export const SHIELDS = [
  { id: 'buckler', name: 'Buckler', price: 1, acBonus: 1, hardness: 3, hp: 6, bt: 3, bulk: 'L', speedPenalty: null },
  { id: 'wooden-shield', name: 'Wooden Shield', price: 1, acBonus: 2, hardness: 3, hp: 12, bt: 6, bulk: '1', speedPenalty: null },
  { id: 'steel-shield', name: 'Steel Shield', price: 2, acBonus: 2, hardness: 5, hp: 20, bt: 10, bulk: '1', speedPenalty: null },
  { id: 'tower-shield', name: 'Tower Shield', price: 10, acBonus: 2, hardness: 5, hp: 20, bt: 10, bulk: '4', speedPenalty: '-5 ft.' },
];

export const GEAR = [
  { id: 'adventurers-pack', name: "Adventurer's Pack", price: 1.5 },
  { id: 'alchemists-lab', name: "Alchemist's Lab", price: 5 },
  { id: 'alchemists-toolkit', name: "Alchemist's Toolkit", price: 3 },
  { id: 'artisans-toolkit', name: "Artisan's Toolkit", price: 4 },
  { id: 'backpack', name: 'Backpack', price: 0.1 },
  { id: 'basic-crafters-book', name: "Basic Crafter's Book", price: 0.1 },
  { id: 'bedroll', name: 'Bedroll', price: 0.02 },
  { id: 'brass-ear', name: 'Brass Ear', price: 1 },
  { id: 'caltrops', name: 'Caltrops', price: 0.3 },
  { id: 'candle', name: 'Candle', price: 0.01 },
  { id: 'chain', name: 'Chain (10 feet)', price: 4 },
  { id: 'chalk', name: 'Chalk (10 pieces)', price: 0.01 },
  { id: 'chest', name: 'Chest', price: 0.6 },
  { id: 'climbing-kit', name: 'Climbing Kit', price: 0.5 },
  { id: 'clothing-cold-weather', name: 'Clothing (Cold-Weather)', price: 0.4 },
  { id: 'clothing-explorers', name: "Clothing (Explorer's)", price: 0.1 },
  { id: 'clothing-fine', name: 'Clothing (Fine)', price: 2 },
  { id: 'clothing-ordinary', name: 'Clothing (Ordinary)', price: 0.1 },
  { id: 'compass', name: 'Compass', price: 1 },
  { id: 'cookware', name: 'Cookware', price: 1 },
  { id: 'crowbar', name: 'Crowbar', price: 0.5 },
  { id: 'disguise-kit', name: 'Disguise Kit', price: 2 },
  { id: 'disguise-kit-cosmetics', name: 'Disguise Kit (Replacement Cosmetics)', price: 0.1 },
  { id: 'dueling-cape', name: 'Dueling Cape', price: 0.5 },
  { id: 'fishing-tackle', name: 'Fishing Tackle', price: 0.8 },
  { id: 'flint-and-steel', name: 'Flint and Steel', price: 0.05 },
  { id: 'formula-book', name: 'Formula Book (Blank)', price: 1 },
  { id: 'grappling-hook', name: 'Grappling Hook', price: 0.1 },
  { id: 'hammer', name: 'Hammer', price: 0.1 },
  { id: 'healers-toolkit', name: "Healer's Toolkit", price: 5 },
  { id: 'hourglass', name: 'Hourglass', price: 3 },
  { id: 'ladder', name: 'Ladder (10 feet)', price: 0.03 },
  { id: 'lantern-bullseye', name: "Lantern (Bull's-Eye)", price: 1 },
  { id: 'lantern-hooded', name: 'Lantern (Hooded)', price: 0.7 },
  { id: 'lock-poor', name: 'Lock (Poor)', price: 0.2 },
  { id: 'manacles-poor', name: 'Manacles (Poor)', price: 0.3 },
  { id: 'merchants-scale', name: "Merchant's Scale", price: 0.2 },
  { id: 'mirror', name: 'Mirror', price: 1 },
  { id: 'mug', name: 'Mug', price: 0.01 },
  { id: 'musical-instrument-handheld', name: 'Musical Instrument (Handheld)', price: 0.8 },
  { id: 'musical-instrument-heavy', name: 'Musical Instrument (Heavy)', price: 2 },
  { id: 'net', name: 'Net', price: 1 },
  { id: 'oil', name: 'Oil', price: 0.01 },
  { id: 'parrying-scabbard', name: 'Parrying Scabbard', price: 0.5 },
  { id: 'piton', name: 'Piton', price: 0.01 },
  { id: 'primal-symbol', name: 'Primal Symbol', price: 0 },
  { id: 'rations', name: 'Rations (1 week)', price: 0.4 },
  { id: 'religious-symbol-silver', name: 'Religious Symbol (Silver)', price: 2 },
  { id: 'religious-symbol-wooden', name: 'Religious Symbol (Wooden)', price: 0.1 },
  { id: 'religious-text', name: 'Religious Text', price: 1 },
  { id: 'repair-toolkit', name: 'Repair Toolkit', price: 2 },
  { id: 'rope', name: 'Rope (50 feet)', price: 0.5 },
  { id: 'sack', name: 'Sack', price: 0.01 },
  { id: 'saddlebags', name: 'Saddlebags', price: 0.2 },
  { id: 'signal-whistle', name: 'Signal Whistle', price: 0.08 },
  { id: 'soap', name: 'Soap', price: 0.02 },
  { id: 'spellbook', name: 'Spellbook (Blank)', price: 1 },
  { id: 'spyglass', name: 'Spyglass', price: 20 },
  { id: 'tack', name: 'Tack', price: 4 },
  { id: 'ten-foot-pole', name: 'Ten-Foot Pole', price: 0.01 },
  { id: 'tent-four-person', name: 'Tent (Four-Person)', price: 5 },
  { id: 'tent-pup', name: 'Tent (Pup)', price: 0.8 },
  { id: 'thieves-toolkit', name: "Thieves' Toolkit", price: 3 },
  { id: 'thieves-toolkit-picks', name: "Thieves' Toolkit (Replacement Picks)", price: 0.3 },
  { id: 'tool-long', name: 'Tool (Long)', price: 1 },
  { id: 'tool-short', name: 'Tool (Short)', price: 0.4 },
  { id: 'torch', name: 'Torch', price: 0.01 },
  { id: 'waterskin', name: 'Waterskin', price: 0.05 },
  { id: 'writing-set', name: 'Writing Set', price: 1 },
  { id: 'writing-set-extra', name: 'Writing Set (Extra Ink and Paper)', price: 0.1 },
];

// Decomposes fully into gp/sp/cp instead of rounding to the coarsest unit
// under 1gp — the old version collapsed anything under a gold piece down
// to a single rounded sp figure (e.g. 48 copper became "5 sp" instead of
// "4 sp, 8 cp"), which was harmless while purchases were one-of-each but
// started actively misreporting totals once quantities could push a sum
// to an odd copper remainder (2 daggers + 8 torches = 48 cp, not 50).
export function formatGold(amount) {
  if (amount === 0) return 'Free';
  const totalCp = Math.round(amount * 100);
  const gp = Math.floor(totalCp / 100);
  const sp = Math.floor((totalCp % 100) / 10);
  const cp = totalCp % 10;
  const parts = [];
  if (gp > 0) parts.push(`${gp} gp`);
  if (sp > 0) parts.push(`${sp} sp`);
  if (cp > 0) parts.push(`${cp} cp`);
  return parts.length > 0 ? parts.join(', ') : 'Free';
}

// --- Quantity-aware purchase helpers ---
// Purchases are stored as flat arrays of ids *with repetition* (buying two
// daggers means the id 'dagger' appears twice in weaponIds) rather than a
// separate {id, qty} structure, so the existing budget math (sum of prices
// across the array) and the "first one purchased is equipped" logic in
// useComputedCharacter both keep working unchanged — these helpers just
// add/remove/count/group instances within that same array shape.

export function countOwned(ids, itemId) {
  return ids.filter((id) => id === itemId).length;
}

export function addOne(ids, itemId) {
  return [...ids, itemId];
}

export function removeOne(ids, itemId) {
  const idx = ids.indexOf(itemId);
  if (idx === -1) return ids;
  return [...ids.slice(0, idx), ...ids.slice(idx + 1)];
}

export function totalSpent(ids, catalog) {
  return ids.reduce((sum, id) => {
    const item = catalog.find((i) => i.id === id);
    return sum + (item ? item.price : 0);
  }, 0);
}

// Collapses a flat (possibly repeated) id array into one row per distinct
// item, in first-purchased order, for receipts and summaries.
export function groupPurchases(ids, catalog) {
  const seenOrder = [];
  const counts = {};
  ids.forEach((id) => {
    if (!(id in counts)) seenOrder.push(id);
    counts[id] = (counts[id] || 0) + 1;
  });
  return seenOrder
    .map((id) => {
      const item = catalog.find((i) => i.id === id);
      if (!item) return null;
      const qty = counts[id];
      return { item, qty, lineTotal: item.price * qty };
    })
    .filter(Boolean);
}
