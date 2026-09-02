// Glossary of PF2e rules jargon, used by the "Inspect" feature (press T) to
// turn keywords in feat/heritage/ancestry text into clickable terms that
// pop up a plain-English definition — similar to Baldur's Gate 3's Inspect
// mode. Keep `term` capitalized exactly as it should appear in source text;
// matching is case-sensitive on purpose (avoids false positives like the
// common word "will" matching the Will save, or "hidden" in "hidden traps"
// matching the Hidden condition).
//
// A definition's `desc` can itself reference other glossary terms — they'll
// be auto-linked too, which is how the nested popover chains happen.

export const GLOSSARY = [
  // Proficiency ranks
  { id: 'untrained', term: 'Untrained', desc: "You have no formal training. You don't add your level to checks using this proficiency — just the bare Ability Modifier (and any item bonus)." },
  { id: 'trained', term: 'Trained', desc: 'The first rank of Proficiency. Adds your level + 2 to the relevant check or DC.' },
  { id: 'expert', term: 'Expert', desc: 'The second rank of Proficiency. Adds your level + 4 to the relevant check or DC.' },
  { id: 'master', term: 'Master', desc: 'The third rank of Proficiency. Adds your level + 6 to the relevant check or DC. Usually reached well past 1st level.' },
  { id: 'legendary', term: 'Legendary', desc: 'The highest rank of Proficiency. Adds your level + 8 to the relevant check or DC. Reached only at very high level.' },
  { id: 'proficiency', term: 'Proficiency', desc: 'How skilled you are at something, from Untrained up through Trained, Expert, Master, and Legendary. Higher ranks add more to the relevant Skill Check, save, or DC.' },

  // Bonuses & math
  { id: 'ability-modifier', term: 'Ability Modifier', desc: 'A bonus or penalty based on an Ability Score: (score − 10) ÷ 2, rounded down. This gets added to almost every check tied to that ability.' },
  { id: 'ability-score', term: 'Ability Score', desc: 'One of six core stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma) that everything else derives from via its Ability Modifier.' },
  { id: 'ability-boost', term: 'Ability Boost', desc: 'Raises an Ability Score by 2 (or by 1 if it was already 18 or higher). You get boosts from your ancestry, background, class, and free choices at character creation.' },
  { id: 'ability-flaw', term: 'Ability Flaw', desc: 'Lowers an Ability Score by 2. Some ancestries impose one alongside their boosts.' },
  { id: 'strength', term: 'Strength', desc: 'The Ability Score for raw physical power — melee damage, carrying capacity, and Athletics.' },
  { id: 'dexterity', term: 'Dexterity', desc: 'The Ability Score for agility and precision — AC, Reflex saves, and ranged/finesse attacks.' },
  { id: 'constitution', term: 'Constitution', desc: 'The Ability Score for toughness and endurance — Hit Points and Fortitude saves.' },
  { id: 'intelligence', term: 'Intelligence', desc: 'The Ability Score for reasoning and knowledge — bonus trained skills and Intelligence-based Skills.' },
  { id: 'wisdom', term: 'Wisdom', desc: 'The Ability Score for perceptiveness and intuition — Perception and Will saves.' },
  { id: 'charisma', term: 'Charisma', desc: 'The Ability Score for force of personality — social Skills and many spellcasting classes.' },
  { id: 'circumstance-bonus', term: 'circumstance bonus', desc: "A bonus from favorable conditions in the moment (positioning, cover, terrain, and the like). Doesn't stack with other circumstance bonuses to the same thing — only the best one applies." },
  { id: 'status-bonus', term: 'status bonus', desc: "A bonus from a spell, ability, or condition affecting you directly, separate from your gear or the situation. Doesn't stack with other status bonuses to the same thing." },
  { id: 'item-bonus', term: 'item bonus', desc: "A bonus from a piece of equipment, like armor or a runed weapon. Doesn't stack with other item bonuses to the same thing." },

  // Core numbers
  { id: 'skill-check', term: 'Skill Check', desc: "Whenever you use a Skill, a Skill Check tests whether it succeeds. It's based on a die roll, your Ability Modifier, your Proficiency in the Skill, and the check's Difficulty Class." },
  { id: 'difficulty-class', term: 'Difficulty Class', desc: "The target number (also written DC) a check's result needs to meet or beat to succeed." },
  { id: 'class-dc', term: 'Class DC', desc: 'A Difficulty Class based on your class, used as the target number for many of your class abilities. Equal to 10 + your Class DC Proficiency + your key Ability Modifier.' },
  { id: 'armor-class', term: 'Armor Class', desc: 'Your defense against being hit in combat (often written AC). Equal to 10 + your Dexterity Modifier (capped by heavier armor) + your armor Proficiency bonus + any item bonus from armor worn.' },
  { id: 'perception', term: 'Perception', desc: "Your ability to notice things and act first in combat. It isn't a Skill, but it works the same way — a Proficiency rank plus your Wisdom Modifier." },
  { id: 'saving-throw', term: 'Saving Throw', desc: 'A roll (often just called a "save") to resist or reduce the effect of something happening to you — a trap, a spell, poison, and so on. The three types are Fortitude, Reflex, and Will.' },
  { id: 'fortitude', term: 'Fortitude', desc: "A Saving Throw (Constitution-based) against poison, disease, and other bodily threats." },
  { id: 'reflex', term: 'Reflex', desc: 'A Saving Throw (Dexterity-based) against things you can dodge, like traps or explosions.' },
  { id: 'will', term: 'Will', desc: 'A Saving Throw (Wisdom-based) against mental effects, fear, and other attempts to influence your mind.' },
  { id: 'hit-points', term: 'Hit Points', desc: "How much punishment you can take before falling unconscious (often written HP). Reduced by damage, restored by healing and rest." },
  { id: 'speed', term: 'Speed', desc: 'How far you can move (in feet) with a single Stride.' },
  { id: 'bulk', term: 'Bulk', desc: 'How much space and weight an item takes up to carry. Carrying too much Bulk encumbers you.' },
  { id: 'ac', term: 'AC', desc: 'Short for Armor Class.' },
  { id: 'difficult-terrain', term: 'difficult terrain', desc: "Terrain (rubble, undergrowth, and the like) that costs an extra 5 feet of movement to enter — a normal Stride into it only gets you 5 feet unless you have a way around that cost." },
  { id: 'alternate-ancestry-boosts', term: 'Alternate Ancestry Boosts', desc: "An always-available option (not GM approval needed) to replace your ancestry's listed attribute boosts and flaw entirely with two fully free boosts, for a character whose ancestry doesn't push them toward the usual traits of their kind." },

  // Actions & spellcasting
  { id: 'strike', term: 'Strike', desc: "The basic attack action: swing a weapon or unarmed attack at a foe within reach or range." },
  { id: 'stance', term: 'Stance', desc: "A special combat mode (usually entered with a single action) that changes what Strikes you can make and grants passive benefits while active. You can only be in one stance at a time, and most end if you're knocked out or otherwise incapacitated." },
  { id: 'grapple', term: 'Grapple', desc: "An Athletics action to seize a foe (or keep holding one already Grabbed), leaving them grabbed or immobilized on a strong enough success." },
  { id: 'trip', term: 'Trip', desc: "An Athletics action to knock a foe off their feet, leaving them prone on a success." },
  { id: 'reactive-strike', term: 'Reactive Strike', desc: "A reaction (granted by some classes, notably the Fighter) letting you Strike a foe that leaves a threatened square, uses a manipulate action, or makes a ranged attack near you." },
  { id: 'reaction', term: 'Reaction', desc: 'An action you can take outside your own turn, triggered by a specific event, if you have an ability that grants one. You get one per turn by default.' },
  { id: 'free-action', term: 'Free Action', desc: "An action that doesn't use up any of your three actions per turn (though it may still have its own trigger or limit)." },
  { id: 'cantrip', term: 'cantrip', desc: 'A spell you can cast at will, without expending a spell slot. Automatically scales up in power as you gain levels.' },
  { id: 'innate-spell', term: 'innate spell', desc: "A spell you can cast without preparing it or spending a spell slot, usually granted by an ancestry or feat rather than your class's normal spellcasting." },
  { id: 'focus-spell', term: 'focus spell', desc: 'A spell fueled by Focus Points instead of a spell slot — you regain a spent Focus Point by spending 10 minutes in Refocus.' },
  { id: 'heightened', term: 'heightened', desc: "A spell cast using a higher-rank slot than its minimum (or that scales automatically, like a cantrip) becomes more powerful — it's heightened to that rank." },
  { id: 'unarmed-attack', term: 'unarmed attack', desc: 'A Strike made with a natural weapon (fists, claws, a bite, and so on) instead of a held weapon.' },

  // Conditions
  { id: 'critical-success', term: 'critical success', desc: 'The best degree of success on a check: you beat the DC by 10 or more (or rolled a natural 20 and at least met it). Usually grants an extra-strong effect.' },
  { id: 'critical-failure', term: 'critical failure', desc: 'The worst degree of success on a check: you fail the DC by 10 or more (or rolled a natural 1 and would otherwise have failed). Usually has an extra-bad effect.' },
  { id: 'off-guard', term: 'off-guard', desc: "A condition that gives you a −2 circumstance penalty to AC — you're not ready to defend yourself properly." },
  { id: 'concealed', term: 'concealed', desc: "A condition where you're hard to see but not fully hidden — attacks against you have a 5% chance to simply miss, regardless of the roll." },
  { id: 'hidden', term: 'Hidden', desc: 'A condition where your foe knows roughly where you are but can\'t actually see you — they can still target you, but at a steep chance to just miss.' },
  { id: 'undetected', term: 'undetected', desc: "A condition where a creature has no idea where you are at all. You're very hard for them to target." },
  { id: 'frightened', term: 'frightened', desc: 'A condition that gives a status penalty to most of your rolls, equal to its value; the value ticks down by 1 at the end of each of your turns.' },
  { id: 'clumsy', term: 'clumsy', desc: 'A condition that gives a status penalty (equal to its value) to Dexterity-based checks and DCs, including AC.' },
  { id: 'drained', term: 'drained', desc: 'A condition representing blood or life force loss — it gives a status penalty (equal to its value) to Constitution-based rolls, including your Fortitude save, and reduces your maximum Hit Points.' },
  { id: 'dying', term: 'dying', desc: "A condition tracking how close you are to death after hitting 0 Hit Points. It increases on a critical hit while you're down, and ends in death if it ever reaches a threshold (usually 4)." },
  { id: 'wounded', term: 'wounded', desc: "A condition you gain after recovering from dying, making you die faster (at a lower dying threshold) if you're knocked back down before recovering." },
  { id: 'resistance', term: 'resistance', desc: 'Reduces damage of a specific type you take by a set amount each time you take it.' },
  { id: 'weakness', term: 'weakness', desc: 'Increases damage of a specific type you take by a set amount each time you take it.' },
  { id: 'persistent-damage', term: 'persistent damage', desc: "Damage that keeps hurting you at the start of each of your turns until you succeed at a flat check to put it out (usually DC 15)." },

  // Character-building categories
  { id: 'skill-feat', term: 'skill feat', desc: 'A feat with the Skill trait — it requires training in a specific skill and improves what you can do with it.' },
  { id: 'general-feat', term: 'general feat', desc: 'A feat any character can take (subject to its own prerequisites), not tied to your ancestry or class. Skill feats are a subset of general feats.' },
  { id: 'ancestry-feat', term: 'ancestry feat', desc: 'A feat available only to characters of a specific ancestry (or heritage), reflecting traits passed down through your people.' },
  { id: 'class-feat', term: 'class feat', desc: 'A feat available only to characters of a specific class, expanding on what that class can do.' },
  { id: 'trait', term: 'trait', desc: "A short tag on a rules element (an action, item, spell, or creature) that triggers other rules interacting with it — for example, a spell with the fire trait is affected by things that key off fire." },
  { id: 'lore', term: 'Lore', desc: 'A narrow knowledge Skill about one specific topic (a city, an organization, a craft, and so on), trained separately from the 16 broad skills.' },
  { id: 'recall-knowledge', term: 'Recall Knowledge', desc: 'An action to dredge up known information about something using an appropriate Skill.' },
  { id: 'hardness', term: 'Hardness', desc: "An object's (or shield's) resistance to damage — incoming damage is reduced by this amount before affecting its Hit Points." },

  // Skills
  { id: 'acrobatics', term: 'Acrobatics', desc: 'A Dexterity-based Skill: balance, tumble, and contort your body to avoid danger. Used for a Skill Check like Balance or Squeeze.' },
  { id: 'arcana', term: 'Arcana', desc: 'An Intelligence-based Skill: recall knowledge about arcane magic, creatures, and phenomena, and identify arcane magic.' },
  { id: 'athletics', term: 'Athletics', desc: 'A Strength-based Skill: jump, climb, swim, and overpower foes with raw physical power.' },
  { id: 'crafting', term: 'Crafting', desc: 'An Intelligence-based Skill: build, repair, and identify the workings of mundane and magic items.' },
  { id: 'deception', term: 'Deception', desc: 'A Charisma-based Skill: lie, disguise yourself, or create a diversion.' },
  { id: 'diplomacy', term: 'Diplomacy', desc: 'A Charisma-based Skill: influence attitudes and gather information through conversation.' },
  { id: 'intimidation', term: 'Intimidation', desc: 'A Charisma-based Skill: bend others to your will through threats and force of presence.' },
  { id: 'medicine', term: 'Medicine', desc: 'A Wisdom-based Skill: treat wounds, diseases, and poisons.' },
  { id: 'nature', term: 'Nature', desc: 'A Wisdom-based Skill: recall knowledge about the natural world and command animals.' },
  { id: 'occultism', term: 'Occultism', desc: 'An Intelligence-based Skill: recall knowledge about ancient mysteries, secret societies, and esoteric lore.' },
  { id: 'performance', term: 'Performance', desc: 'A Charisma-based Skill: captivate an audience with music, acting, or oratory.' },
  { id: 'religion', term: 'Religion', desc: 'A Wisdom-based Skill: recall knowledge about deities, faith, and the workings of the universe.' },
  { id: 'society', term: 'Society', desc: 'An Intelligence-based Skill: navigate settlements, recall local knowledge, and pass as a local.' },
  { id: 'stealth', term: 'Stealth', desc: 'A Dexterity-based Skill: stay out of sight. Move unseen and hide from watching eyes.' },
  { id: 'survival', term: 'Survival', desc: 'A Wisdom-based Skill: track quarry, forage for food, and endure in the wild.' },
  { id: 'thievery', term: 'Thievery', desc: "A Dexterity-based Skill: pick locks, disarm traps, and steal without being noticed." },
];

export function getGlossaryTerm(id) {
  return GLOSSARY.find((g) => g.id === id);
}

// Maps the short ability codes used elsewhere in the app (str/dex/con/
// int/wis/cha) to their glossary entry id, for spots that build ability
// labels from ABILITY_LABELS instead of running raw text through
// InspectText (ancestry/class/background card stat lines, ability score
// boxes, etc).
export const ABILITY_TERM_ID = {
  str: 'strength',
  dex: 'dexterity',
  con: 'constitution',
  int: 'intelligence',
  wis: 'wisdom',
  cha: 'charisma',
};
