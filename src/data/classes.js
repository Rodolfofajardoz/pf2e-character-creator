// The 16 classes from Player Core 1 and 2 (remastered rules). Proficiency
// data verified against the Pathfinder Core Rulebook and Player Core 2
// (Alchemist, Barbarian, Champion, Investigator, Monk, Oracle, Sorcerer,
// and Swashbuckler come from Player Core 2; Bard, Cleric, Druid, Fighter,
// Ranger, Rogue, and Wizard come from the Core Rulebook, with the same
// mechanics in their remastered version). The Witch isn't in either owned
// book; its proficiencies and class features are verified against Archives
// of Nethys instead (see its entry below).
//
// Every feats1 entry across all 16 classes has been individually verified
// against Archives of Nethys (name + real mechanical text, not just
// plausible-sounding flavor). An earlier pass had several outright
// fabricated descriptions (e.g. Monk's Tiger Stance, Cleric's Harming
// Hands/Healing Hands, Champion's Unimpeded Step, Oracle's Foretell Harm
// and Nudge the Scales, Rogue/Swashbuckler's You're Next, and the shared
// Reach Spell/Widen Spell text used by 6 classes) — those have all been
// rewritten to match the real rules text.

export const CLASSES = [
  {
    id: 'alchemist',
    name: 'Alchemist',
    keyAbility: ['int'],
    hp: 8,
    perception: 'trained',
    saves: { fort: 'expert', ref: 'expert', will: 'trained' },
    classDC: 'trained',
    skillsBase: 3,
    fixedSkills: ['crafting'],
    weapons: 'Simple weapons, alchemist bombs, and unarmed attacks',
    armor: 'Light and medium armor',
    armorProficiency: ['light', 'medium'],
    summary: 'A master of volatile formulas who throws bombs, harasses foes, and supports the party with potent elixirs.',
    feats1: [
      { name: 'Alchemical Familiar', desc: 'You gain a familiar that assists you with your alchemical preparations.' },
      { name: 'Alchemical Assessment', desc: 'Requires training in Crafting: you can Identify Alchemy on an item you hold as a single action instead of 10 minutes.' },
      { name: 'Blowgun Poisoner', desc: "Your blowgun Strikes can apply injury poisons even through resistance; a critical hit worsens the poison's save, and you can try to stay hidden after a Strike made while undetected." },
      { name: 'Far Lobber', desc: 'You increase the range of your thrown bombs.' },
      { name: 'Quick Bomber', desc: 'You can draw and throw a bomb as a single action.' },
      { name: 'Soothing Vials', desc: 'Requires the Chirurgeon research field: when your versatile vial heals a creature with a mental effect, it gets a bonus save to end one such effect.' },
    ],
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    keyAbility: ['str'],
    hp: 12,
    perception: 'expert',
    saves: { fort: 'expert', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 3,
    fixedSkills: ['athletics'],
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'Light and medium armor',
    armorProficiency: ['light', 'medium'],
    summary: 'Channels an instinctive rage that boosts combat power at the cost of defense.',
    feats1: [
      { name: 'Acute Vision', desc: 'While raging, you gain darkvision.' },
      { name: 'Adrenaline Rush', desc: 'While raging, your Bulk limits increase by 2, and you gain a bonus to Athletics checks to lift heavy objects, Escape, or Force Open.' },
      { name: 'Draconic Arrogance', desc: 'Requires the Dragon instinct: while raging, you gain a bonus to saves against emotion effects.' },
      { name: 'Moment of Clarity', desc: 'You push back your rage: until the end of the turn, you can use concentrate actions even without the rage trait.' },
      { name: 'Raging Intimidation', desc: 'While raging, your Demoralize and Scare to Death gain the rage trait so you can use them mid-rage, and you gain those feats early once you qualify.' },
      { name: 'Raging Thrower', desc: "You apply your rage's damage bonus to thrown weapon attacks too." },
      { name: 'Sudden Charge', desc: 'You move and make a melee Strike in a single two-action activity.' },
    ],
  },
  {
    id: 'bard',
    name: 'Bard',
    keyAbility: ['cha'],
    hp: 8,
    perception: 'expert',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 4,
    fixedSkills: ['occultism', 'performance'],
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'Light armor',
    armorProficiency: ['light'],
    spellcasting: { tradition: 'Occult', type: 'spontaneous (compositions)', traditionCode: 'occult', cantripsKnown: 5, rank1Known: 2 },
    summary: 'Weaves magic through music and words, supporting allies with Compositions.',
    // Verified against AoN (Player Core pg. 94): the Bard's 1st-level class features are
    // spellcasting, spell repertoire, composition spells, and muse — it doesn't gain its
    // first bard feat until 2nd level, hence classFeatAtLevel1: false below. Weapon
    // proficiency also corrected here: the enumerated legacy list (longsword/rapier/sap/
    // shortbow/shortsword) was Core Rulebook; Player Core simplified the Bard to full
    // simple + martial weapon proficiency.
    //
    // feats1 stays populated despite classFeatAtLevel1 being false: Human's Natural
    // Ambition grants "a 1st-level class feat" with no class exception, so a Bard who
    // takes it still needs a catalog to pick from even though the class's own progression
    // doesn't grant one at 1st level. See needsBonusFeat in App.jsx/ClassStep.jsx.
    classFeatAtLevel1: false,
    feats1: [
      { name: 'Bardic Lore', desc: 'Requires the Enigma muse: you become trained in Bardic Lore, a special Lore that can Recall Knowledge on any topic.' },
      { name: 'Lingering Composition', desc: 'Requires the Maestro muse: you learn the Lingering Composition focus spell, which extends one of your compositions.' },
      { name: 'Reach Spell', desc: "Single action before Casting a Spell: increase that spell's range by 30 feet (a touch spell reaches 30 feet)." },
      { name: 'Versatile Performance', desc: 'You can use Performance in place of another skill for certain actions related to your art.' },
    ],
  },
  {
    id: 'champion',
    name: 'Champion',
    keyAbility: ['str', 'dex'],
    hp: 10,
    perception: 'trained',
    saves: { fort: 'expert', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 2,
    fixedSkills: ['religion'],
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'All armor and shields',
    armorProficiency: ['light', 'medium', 'heavy'],
    spellcasting: { tradition: 'Divine (devotion spells)', type: 'focus' },
    summary: 'A holy warrior bound to a Cause who protects allies with divine reactions.',
    feats1: [
      { name: "Deity's Domain", desc: "You gain your deity's initial domain spell as a devotion spell." },
      { name: 'Desperate Prayer', desc: "Free action, once per day. Trigger: you begin your turn with no Focus Points. You gain 1 Focus Point, usable only for a devotion spell this turn (lost if unspent)." },
      { name: 'Faithful Steed', desc: 'You gain a young animal companion as a mount (it and its Strikes gain your holy/unholy trait, if any).' },
      { name: 'Iron Repercussions', desc: 'Requires the Obedience cause: if an enemy refuses to kneel to your Iron Command, you can make the mental damage persistent instead of instant.' },
      { name: 'Nimble Reprisal', desc: "Requires the Justice cause: your Retributive Strike can be a ranged Strike at range, or you can Step to reach a foe just outside your melee reach before striking." },
      { name: 'Unimpeded Step', desc: "Requires the Liberation cause: the ally you move with Liberating Step ignores difficult terrain, narrow surfaces, and uneven ground during that movement." },
      { name: 'Vicious Vengeance', desc: 'Requires the Iniquity cause: your Destructive Vengeance deals extra damage equal to the number of damage dice the reaction rolled.' },
    ],
  },
  {
    id: 'cleric',
    name: 'Cleric',
    keyAbility: ['wis'],
    hp: 8,
    perception: 'trained',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 2,
    fixedSkills: ['religion'],
    weapons: "Simple weapons and your deity's favored weapon",
    armor: 'Depends on your doctrine (Warpriest: up to medium armor; Cloistered Cleric: no extra armor proficiency)',
    // Doctrine isn't modeled (no Warpriest/Cloistered choice in this app), so this
    // defaults to the Cloistered Cleric baseline (no armor proficiency beyond
    // unarmored) rather than overstating AC for a doctrine the player may not have.
    armorProficiency: [],
    spellcasting: { tradition: 'Divine', type: 'prepared', traditionCode: 'divine', cantripsKnown: 5, rank1Known: 2 },
    summary: 'A channel of divine will for their deity, with access to spells and sacred miracles.',
    // Verified against AoN (Player Core pg. 108): Cleric spellcasting is prepared-only (no
    // spontaneous option) — "prepare two 1st-rank spells and five cantrips each morning".
    // 1st-level class features are deity, cleric spellcasting, divine font, and doctrine
    // (sanctification is described inside the Deity entry, not a separate feature); the
    // first cleric feat isn't gained until 2nd level, hence classFeatAtLevel1: false below.
    //
    // feats1 stays populated despite classFeatAtLevel1 being false: Human's Natural
    // Ambition grants "a 1st-level class feat" with no class exception, so a Cleric who
    // takes it still needs a catalog to pick from. See needsBonusFeat in App.jsx/ClassStep.jsx.
    classFeatAtLevel1: false,
    feats1: [
      { name: 'Deadly Simplicity', desc: "Requires a deity with a simple/unarmed favored weapon, and training in it: increase that weapon's damage die by one step." },
      { name: 'Domain Initiate', desc: 'You gain a domain spell from your deity as a focus spell.' },
      { name: 'Harming Hands', desc: 'Requires the harmful font: your harm spell rolls d10s instead of d8s.' },
      { name: 'Healing Hands', desc: 'Requires the healing font: your heal spell rolls d10s instead of d8s.' },
      { name: 'Holy Castigation', desc: 'Requires good alignment: your heal spells damage fiends as though they were undead.' },
      { name: 'Reach Spell', desc: "Single action before Casting a Spell: increase that spell's range by 30 feet (a touch spell reaches 30 feet)." },
    ],
  },
  {
    id: 'druid',
    name: 'Druid',
    keyAbility: ['wis'],
    hp: 8,
    perception: 'trained',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 2,
    fixedSkills: ['nature'],
    weapons: 'Simple weapons and unarmed attacks',
    armor: 'Light and medium nonmetallic armor',
    armorProficiency: ['light', 'medium'],
    spellcasting: { tradition: 'Primal', type: 'prepared', traditionCode: 'primal', cantripsKnown: 5, rank1Known: 2 },
    summary: 'Guardian of the natural cycles, with an Order that shapes how they wield that power.',
    // Verified against AoN (Player Core pg. 122): 1st-level class features are anathema,
    // druidic order, Shield Block, voice of nature, and Wildsong — the first druid feat
    // isn't gained until 2nd level, hence classFeatAtLevel1: false below (most of the
    // feats below are Order-locked, e.g. "Requires the Wild Order", and Order isn't
    // modeled yet — see ROADMAP item 5).
    //
    // feats1 stays populated despite classFeatAtLevel1 being false: Human's Natural
    // Ambition grants "a 1st-level class feat" with no class exception, so a Druid who
    // takes it still needs a catalog to pick from. See needsBonusFeat in App.jsx/ClassStep.jsx.
    classFeatAtLevel1: false,
    feats1: [
      { name: 'Animal Companion', desc: 'Requires the Animal Order: you gain an animal companion that fights at your side.' },
      { name: 'Leshy Familiar', desc: 'Requires the Leaf Order: you gain a familiar in the shape of a small leshy.' },
      { name: 'Reach Spell', desc: "Single action before Casting a Spell: increase that spell's range by 30 feet (a touch spell reaches 30 feet)." },
      { name: 'Storm Born', desc: "Requires the Storm Order: weather doesn't penalize your ranged spell attacks or Perception, and you ignore the flat check to target a creature concealed by weather." },
      { name: 'Widen Spell', desc: "Single action before Casting a Spell with a burst, cone, or line area (and no duration): increase that area by 5-10 feet." },
      { name: 'Wild Shape', desc: 'Requires the Wild Order: you can transform into basic animal shapes.' },
    ],
  },
  {
    id: 'fighter',
    name: 'Fighter',
    keyAbility: ['str', 'dex'],
    hp: 10,
    perception: 'expert',
    saves: { fort: 'expert', ref: 'expert', will: 'trained' },
    classDC: 'trained',
    skillsBase: 3,
    fixedSkills: [],
    fixedSkillChoice: 'Acrobatics or Athletics (your choice)',
    fixedSkillChoiceOptions: ['acrobatics', 'athletics'],
    weapons: 'Expert in simple and martial weapons; trained in advanced weapons; expert in unarmed attacks',
    armor: 'All armor and shields',
    armorProficiency: ['light', 'medium', 'heavy'],
    summary: 'The ultimate master of weapons: precise, versatile, and lethal in any fighting style. The only class that starts as Expert (not just Trained) with its weapons.',
    feats1: [
      { name: 'Double Slice', desc: 'Requires two melee weapons, one in each hand: make one Strike with each, both against the same target, then combine their damage.' },
      { name: 'Point-Blank Shot', desc: "Stance, requires a ranged weapon: volley weapons lose their close-range penalty, and other ranged weapons gain a damage bonus within their first range increment." },
      { name: 'Reactive Shield', desc: 'Reaction, requires a shield. Trigger: a melee Strike hits you. You Raise a Shield in time for its AC bonus to apply to that attack.' },
      { name: 'Snagging Strike', desc: 'Requires a hand free with the target in its reach: your Strike leaves the target off-guard until your next turn or until it leaves your reach.' },
      { name: 'Sudden Charge', desc: 'You move and make a melee Strike in a single two-action activity.' },
    ],
  },
  {
    id: 'investigator',
    name: 'Investigator',
    keyAbility: ['int'],
    hp: 8,
    perception: 'expert',
    saves: { fort: 'trained', ref: 'expert', will: 'expert' },
    classDC: 'trained',
    skillsBase: 4,
    fixedSkills: ['society'],
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'Light armor',
    armorProficiency: ['light'],
    summary: 'Applies a deductive method (Devise a Stratagem) to anticipate the outcome of their actions.',
    feats1: [
      { name: 'Eliminate Red Herrings', desc: "A critical failure to Recall Knowledge about one of your active investigations becomes a failure instead." },
      { name: 'Flexible Studies', desc: 'During daily preparations, you can cram to become temporarily trained in one skill of your choice until you prepare again.' },
      { name: 'Known Weaknesses', desc: "When you Devise a Stratagem, you can also Recall Knowledge as part of it; a critical success lets you share a +1 circumstance bonus against the subject with your allies." },
      { name: 'Takedown Expert', desc: "You can use your Intelligence modifier with one-handed club-group weapons for an attack stratagem, and make any Strike nonlethal without the usual penalty." },
      { name: "That's Odd", desc: "When you enter a new location, the GM tells you one suspicious thing worth investigating there (though not why it's suspicious)." },
      { name: 'Trap Finder', desc: 'A bonus to Perception to find traps, and to saves and AC against them.' },
      { name: 'Underworld Investigator', desc: 'You become trained in Underworld Lore, and can apply your Pursue a Lead bonus to Thievery checks made to investigate a case.' },
    ],
  },
  {
    id: 'monk',
    name: 'Monk',
    keyAbility: ['str', 'dex'],
    hp: 10,
    perception: 'trained',
    saves: { fort: 'expert', ref: 'expert', will: 'expert' },
    classDC: 'trained',
    skillsBase: 4,
    fixedSkills: [],
    weapons: 'Simple weapons and unarmed attacks',
    armor: 'Unarmored (expert Unarmored Defense starting at 1st level)',
    armorProficiency: [],
    unarmoredProficiency: 'expert',
    summary: 'Trains body and spirit to turn their own hands and feet into deadly weapons through combat stances.',
    feats1: [
      { name: 'Crane Stance', desc: 'Stance: your crane wing unarmed attacks give a +1 circumstance bonus to AC; you also jump farther and higher.' },
      { name: 'Dragon Stance', desc: 'Stance: your dragon tail unarmed attacks deal 1d10 bludgeoning, and you ignore the first square of difficult terrain while Striding.' },
      { name: 'Monastic Archer Stance', desc: 'Stance, requires an unarmored longbow/shortbow/monk bow: you gain training with it, can use Flurry of Blows with it, and can use unarmed-only monk feats/abilities with it at close range.' },
      { name: 'Monastic Weaponry', desc: 'You become trained in simple and martial monk weapons, and can use them with monk feats/abilities that normally require unarmed attacks.' },
      { name: 'Mountain Stance', desc: "Stance, requires being unarmored and grounded: your falling stone unarmed attacks deal 1d8 bludgeoning, you gain a +4 item bonus to AC and a bonus against forced movement, but lose your Dexterity bonus to AC and your Speed is reduced by 5 feet." },
      { name: 'Qi Spells', desc: 'You gain Inner Upheaval, Qi Rush, or another 1st-rank monk qi spell you have access to, as a focus spell.' },
      { name: 'Stumbling Stance', desc: 'Stance, prerequisite: trained in Deception. You gain a +1 circumstance bonus to Deception checks to Feint; your stumbling swing unarmed attacks deal 1d8 bludgeoning, and a hit with any melee Strike leaves the target off-guard against your next stumbling swing.' },
      { name: 'Tiger Stance', desc: "Stance: your tiger claw unarmed attacks deal 1d8 slashing with persistent bleed on a critical hit, and you can Step 10 feet if your Speed is at least 20 feet." },
      { name: 'Wolf Stance', desc: 'Stance: your wolf jaw unarmed attacks deal 1d8 piercing, and gain the trip trait while you\'re flanking the target.' },
    ],
  },
  {
    id: 'oracle',
    name: 'Oracle',
    keyAbility: ['cha'],
    hp: 8,
    perception: 'trained',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 3,
    fixedSkills: ['religion'],
    weapons: 'Simple weapons, and unarmed attacks',
    armor: 'Light armor',
    armorProficiency: ['light'],
    spellcasting: { tradition: 'Divine', type: 'spontaneous', traditionCode: 'divine', cantripsKnown: 5, rank1Known: 3 },
    summary: 'Receives visions and divine power directly, paying the price of a Curse tied to their Mystery.',
    // Verified against AoN (Player Core 2 pg. 128): 1st-level class features are oracle
    // spellcasting, spell repertoire, and mystery — the first oracle feat isn't gained
    // until 2nd level, hence classFeatAtLevel1: false below.
    //
    // feats1 stays populated despite classFeatAtLevel1 being false: Human's Natural
    // Ambition grants "a 1st-level class feat" with no class exception, so an Oracle who
    // takes it still needs a catalog to pick from. See needsBonusFeat in App.jsx/ClassStep.jsx.
    classFeatAtLevel1: false,
    feats1: [
      { name: 'Foretell Harm', desc: 'Free action, once per round, requires your last action was a damaging spell: at the start of your target\'s next turn, it takes bonus damage matching that spell\'s type.' },
      { name: 'Glean Lore', desc: 'You attempt a Religion check to glean useful (or, on a worse result, misleading) information from the collected lore of the divine.' },
      { name: 'Nudge the Scales', desc: 'You heal a creature (living or undead) at range for 2 + double your level HP; during daily prep you can also align yourself with life or death to change what can heal you.' },
      { name: 'Oracular Warning', desc: "Free action, trigger: you're about to roll initiative. Allies within 20 feet gain a status bonus to their initiative roll and temporary HP." },
      { name: 'Reach Spell', desc: "Single action before Casting a Spell: increase that spell's range by 30 feet (a touch spell reaches 30 feet)." },
      { name: 'Whispers of Weakness', desc: "You learn a target's weaknesses and lowest save, and gain a status bonus to your own next attack against it." },
      { name: 'Widen Spell', desc: "Single action before Casting a Spell with a burst, cone, or line area (and no duration): increase that area by 5-10 feet." },
    ],
  },
  {
    id: 'ranger',
    name: 'Ranger',
    keyAbility: ['str', 'dex'],
    hp: 10,
    perception: 'expert',
    saves: { fort: 'expert', ref: 'expert', will: 'trained' },
    classDC: 'trained',
    skillsBase: 4,
    fixedSkills: ['nature', 'survival'],
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'Light and medium armor',
    armorProficiency: ['light', 'medium'],
    summary: "An expert hunter who marks prey (Hunt Prey) and masters wild terrain.",
    feats1: [
      { name: 'Crossbow Ace', desc: 'Requires a crossbow with reload 1+: Create a Diversion or Take Cover, then Interact to reload without exposing yourself.' },
      { name: 'Hunted Shot', desc: 'You make two ranged Strikes against your hunted prey with a single action.' },
      { name: 'Monster Hunter', desc: "As part of Hunting your Prey, you can Recall Knowledge about it; a critical success grants you (and any ally you tell) a circumstance bonus to your next attack against it, once per day per creature." },
      { name: 'Twin Takedown', desc: 'You make two melee Strikes with two different weapons against your prey with a single action.' },
    ],
  },
  {
    id: 'rogue',
    name: 'Rogue',
    keyAbility: ['dex'],
    hp: 8,
    perception: 'expert',
    saves: { fort: 'trained', ref: 'expert', will: 'expert' },
    classDC: 'trained',
    skillsBase: 7,
    fixedSkills: ['stealth'],
    // Verified against AoN (Player Core pg. 164): the enumerated legacy weapon list
    // (rapier/sap/shortbow/shortsword) was Core Rulebook; Player Core simplified the
    // Rogue to full simple + martial weapon proficiency.
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'Light armor',
    armorProficiency: ['light'],
    summary: "A versatile specialist who strikes with deadly precision (Sneak Attack) when they have the advantage.",
    feats1: [
      { name: 'Nimble Dodge', desc: 'Reaction: when a creature you can see attacks you, you gain +2 circumstance to AC against that attack.' },
      { name: 'Trap Finder', desc: 'A bonus to Perception and AC/saves against traps; you can attempt to find them even without Seeking.' },
      { name: 'Twin Feint', desc: 'Requires wielding two melee weapons: you attack with both, leaving the target off-guard for the second hit.' },
      { name: "You're Next", desc: 'Reaction, requires training in Intimidation. Trigger: you reduce an enemy to 0 HP. You Demoralize another creature within 60 feet with a +2 circumstance bonus.' },
    ],
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    keyAbility: ['cha'],
    hp: 6,
    perception: 'trained',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 2,
    fixedSkills: [],
    fixedSkillChoice: 'Two skills determined by your bloodline',
    weapons: 'Simple weapons, and unarmed attacks',
    armor: 'No armor',
    armorProficiency: [],
    spellcasting: { tradition: 'Depends on bloodline (Arcane, Divine, Occult, or Primal)', type: 'spontaneous', traditionOptions: ['arcane', 'divine', 'occult', 'primal'], cantripsKnown: 5, rank1Known: 3 },
    summary: 'Their magic springs from an innate bloodline that determines the tradition and flavor of their spells.',
    // Verified against AoN (Player Core 2 pg. 144): 1st-level class features are bloodline,
    // sorcerer spellcasting, spell repertoire, and sorcerous potency — the first sorcerer
    // feat isn't gained until 2nd level, hence classFeatAtLevel1: false below.
    //
    // feats1 stays populated despite classFeatAtLevel1 being false: Human's Natural
    // Ambition grants "a 1st-level class feat" with no class exception, so a Sorcerer who
    // takes it still needs a catalog to pick from. See needsBonusFeat in App.jsx/ClassStep.jsx.
    classFeatAtLevel1: false,
    feats1: [
      { name: 'Familiar', desc: 'You gain a familiar that assists you with your magical tasks.' },
      { name: 'Reach Spell', desc: "Single action before Casting a Spell: increase that spell's range by 30 feet (a touch spell reaches 30 feet)." },
      { name: 'Widen Spell', desc: "Single action before Casting a Spell with a burst, cone, or line area (and no duration): increase that area by 5-10 feet." },
      { name: 'Blood Rising', desc: "Reaction, trigger: a foe targets you with a spell of your bloodline's tradition. You trigger a blood magic effect you know, against you or the caster." },
      { name: 'Tap Into Blood', desc: "Requires an active blood magic effect: you get a minor tradition-specific trick (e.g. a Nature check to Demoralize for a primal bloodline, or an Arcana-based Recall Knowledge for arcane)." },
    ],
  },
  {
    id: 'swashbuckler',
    name: 'Swashbuckler',
    keyAbility: ['dex'],
    hp: 10,
    perception: 'expert',
    saves: { fort: 'trained', ref: 'expert', will: 'expert' },
    classDC: 'trained',
    skillsBase: 4,
    fixedSkills: ['acrobatics'],
    weapons: 'Simple and martial weapons, and unarmed attacks',
    armor: 'Light armor',
    armorProficiency: ['light'],
    summary: 'Combines style and skill to gain Panache and pull off devastating Precise Strikes.',
    feats1: [
      { name: 'Disarming Flair', desc: "Your Disarm action gains the bravado trait, so a success can grant you Panache like your other swashbuckler tricks (usable only while you don't already have Panache)." },
      { name: 'Elegant Buckler', desc: "Your buckler's circumstance bonus to AC from Raise a Shield increases from +1 to +2, and you gain Panache when a foe critically misses you while it's raised." },
      { name: 'Extravagant Parry', desc: "Single action, requires a one-handed weapon: gain a circumstance bonus to AC until your next turn (bigger with a free hand or a parry weapon); a foe missing you while it's active grants you Panache." },
      { name: 'Flashy Dodge', desc: "Reaction, requires you're not encumbered. Trigger: a creature you can see attacks you. You gain a circumstance bonus to AC against that attack, and Panache if it misses." },
      { name: 'Flying Blade', desc: "Requires the Precise Strike class feature: you can apply Precise Strike damage to thrown agile/finesse weapon Strikes within their first range increment." },
      { name: 'Focused Fascination', desc: "Requires Fascinating Performance: in combat, a plain success (not just a critical success) is enough to fascinate a single target." },
      { name: 'Goading Feint', desc: "Requires training in Deception: your successful Feint can instead impose a circumstance penalty on the target's attacks against you (bigger, and to all such attacks, on a critical success)." },
      { name: 'One for All', desc: "Requires training in Diplomacy: you designate an ally to Aid, then can roll Diplomacy instead of the usual skill for that Aid." },
      { name: 'Plummeting Roll', desc: "Requires training in Acrobatics: you gain the Cat Fall skill feat, plus a reaction to land on your feet and Stride half your Speed whenever a 10+ foot fall deals you no damage." },
      { name: "You're Next", desc: 'Reaction, requires training in Intimidation. Trigger: you reduce an enemy to 0 HP. You Demoralize another creature within 60 feet with a +2 circumstance bonus.' },
    ],
  },
  {
    id: 'witch',
    name: 'Witch',
    keyAbility: ['int'],
    hp: 6,
    perception: 'trained',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 3,
    fixedSkills: [],
    fixedSkillChoice: 'One skill determined by your patron',
    weapons: 'Simple weapons, and unarmed attacks',
    armor: 'No armor',
    armorProficiency: [],
    spellcasting: { tradition: 'Depends on patron (Arcane, Divine, Occult, or Primal)', type: 'prepared', traditionOptions: ['arcane', 'divine', 'occult', 'primal'], cantripsKnown: 5, rank1Known: 2 },
    summary: 'Serves a mysterious Patron who grants a familiar and magic in exchange for a pact.',
    // Verified against AoN (Player Core pg. 178): unlike most classes, the Witch's 1st-level
    // class features are patron, familiar, spellcasting, and hexes — it doesn't gain its first
    // witch feat until 2nd level, hence classFeatAtLevel1: false.
    //
    // KNOWN GAP: feats1 stays empty here (unlike the other classFeatAtLevel1: false classes,
    // which keep a Feat-1 catalog so Natural Ambition still has something to grant) because no
    // AoN-verified Witch Feat-1 data has been entered yet — inventing feat text from memory
    // would violate this project's data-verification rule (see PROJECT_NOTES.md). Net effect: a
    // Human Witch who takes Natural Ambition currently gets nothing from it (the "Bonus Class
    // Feat" section shows "no feats to choose from" instead of offering one). Same underlying
    // issue as the other classFeatAtLevel1: false classes had before this comment was written;
    // fixing it here just needs the actual Witch Feat-1 list added to this array.
    classFeatAtLevel1: false,
    feats1: [],
  },
  {
    id: 'wizard',
    name: 'Wizard',
    keyAbility: ['int'],
    hp: 6,
    perception: 'trained',
    saves: { fort: 'trained', ref: 'trained', will: 'expert' },
    classDC: 'trained',
    skillsBase: 2,
    fixedSkills: ['arcana'],
    weapons: 'Simple weapons, and unarmed attacks',
    armor: 'No armor',
    armorProficiency: [],
    // cantripsKnown/rank1Known are the SPELLBOOK's contents, not the 5 cantrips + 2
    // rank-1 spells a 1st-level Wizard actually prepares each morning — this app is a
    // character-creation tool, so the right question is "what does the character know",
    // not "what's castable today" (which changes every morning and isn't a creation-time
    // choice anyway). Per AoN's Wizard Spellcasting (Player Core pg. 192): "The spellbook
    // contains your choice of 10 arcane cantrips and five 1st-rank arcane spells" — hence
    // 10/5 below, not the 5/2 daily-prepared count. (Bard/Oracle/Sorcerer's numbers are
    // already their spell *repertoire* size, which for spontaneous casters genuinely is
    // what they know — no similar fix needed there. Cleric/Druid have no fixed "known"
    // list at all, just "prepare from the whole common list" — also nothing to fix.)
    spellcasting: { tradition: 'Arcane', type: 'prepared', traditionCode: 'arcane', cantripsKnown: 10, rank1Known: 5 },
    summary: 'A scholar of arcane magic, bound to an Arcane School and their Spellbook.',
    // Verified against AoN (Player Core pg. 192): 1st-level class features are wizard
    // spellcasting, arcane thesis, arcane school, and arcane bond — the first wizard feat
    // isn't gained until 2nd level, hence classFeatAtLevel1: false below. Weapon
    // proficiency also corrected here: the enumerated legacy list (club/crossbow/dagger/
    // heavy crossbow/staff) was Core Rulebook; Player Core simplified the Wizard to
    // simple weapons + unarmed attacks only.
    //
    // feats1 stays populated despite classFeatAtLevel1 being false: Human's Natural
    // Ambition grants "a 1st-level class feat" with no class exception, so a Wizard who
    // takes it still needs a catalog to pick from. See needsBonusFeat in App.jsx/ClassStep.jsx.
    classFeatAtLevel1: false,
    feats1: [
      { name: 'Eschew Materials', desc: "You can provide a spell's ordinary material components (a free hand, no pouch needed) with gestures instead — costly listed materials are still required." },
      { name: 'Familiar', desc: 'You gain a familiar that assists you with your magical tasks.' },
      { name: 'Hand of the Apprentice', desc: 'Requires the Universalist school: you gain a focus spell that lets you magically hurl the weapon you wield at a foe.' },
      { name: 'Counterspell', desc: 'Reaction, trigger: a creature casts a spell you have prepared. You expend that prepared spell to attempt to counteract the casting.' },
      { name: 'Reach Spell', desc: "Single action before Casting a Spell: increase that spell's range by 30 feet (a touch spell reaches 30 feet)." },
      { name: 'Widen Spell', desc: "Single action before Casting a Spell with a burst, cone, or line area (and no duration): increase that area by 5-10 feet." },
    ],
  },
];

export function getClass(id) {
  return CLASSES.find((c) => c.id === id);
}
