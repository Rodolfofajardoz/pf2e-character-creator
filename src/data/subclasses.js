// Roadmap item 6: the 8 classes that pick a 1st-level "sub-choice"
// (Muse/Doctrine/Order/Mystery/Bloodline/Patron/Arcane School/Cause) that
// Phase 3 explicitly deferred, gating some of their spell options and
// standing in for a real tradition pick (Sorcerer/Witch). All 49 options
// verified against AoN, filtered to Player Core / Player Core 2 sources
// (see PROJECT_NOTES.md for the technique).
//
// Each option's `desc` covers the 1st-level benefit only — later-level
// benefits (Doctrine's 3rd/7th/11th/15th/19th tiers, a Cause's Exalted
// Reaction, a Mystery's higher-cursebound stages) are out of scope for a
// level-1 builder and aren't included, same reasoning as `feats1` only
// covering what's chosen at character creation.
//
// `skills`: ability-agnostic skill ids this option trains automatically,
// on top of `cls.fixedSkills` — see `getEffectiveFixedSkills()` in
// `skills.js`, the single place that combines the two.
// `tradition`: only set on Sorcerer/Witch options, where it *replaces* the
// old direct tradition question (`sc.traditionOptions`) — see ROADMAP.md
// item 6's "derive rather than ask separately" note.
//
// Deliberately NOT modeled this pass (documented gap, not silently
// dropped): the specific bonus cantrips/spells each option grants
// (Muse Spell, Bloodline's cantrip, a Patron's hex + familiar spell,
// an Arcane School's curriculum spells) aren't auto-added to
// knownCantrips/knownSpells1, and Muse/Doctrine/Patron-gated spells
// aren't unlocked in the SpellsStep catalog — both are real content
// work (verifying and adding the actual spell entries), not something
// this data shape alone can wire up. Named in each option's `desc` so a
// player knows what to write on the sheet by hand in the meantime.
export const SUBCLASSES = {
  bard: {
    label: 'Muse',
    fieldLabel: 'Muse',
    options: [
      { id: 'enigma', name: 'Enigma', desc: 'You uncover hidden secrets of life and the multiverse, supporting allies with knowledge alongside inspiration. Grants the Bardic Lore feat (trained in a special Lore that can Recall Knowledge on any topic) and adds sure strike to your spell repertoire.' },
      { id: 'maestro', name: 'Maestro', desc: 'Your muse constantly inspires you to greater artistic heights, making you a confident inspiration to your allies. Grants the Lingering Composition feat and adds soothe to your spell repertoire.' },
      { id: 'polymath', name: 'Polymath', desc: "Your muse is a jack of all trades, and you're drawn to a wide array of topics rather than any one. Grants the Versatile Performance feat and adds phantasmal minion to your spell repertoire." },
      { id: 'warrior', name: 'Warrior', desc: 'The battlefield is your stage — you train for battle alongside performance and prepare your allies for combat. Grants the Martial Performance feat and adds fear to your spell repertoire.' },
    ],
  },
  cleric: {
    label: 'Doctrine',
    fieldLabel: 'Doctrine',
    options: [
      { id: 'cloistered-cleric', name: 'Cloistered Cleric', desc: "A cleric of the cloth, focused on divine magic and your deity's domains. First Doctrine (1st level): gain the Domain Initiate cleric feat (a domain spell from your deity as a focus spell)." },
      { id: 'warpriest', name: 'Warpriest', desc: "Trained in the more militant doctrine of your church, blending spells and battle. First Doctrine (1st level): trained in light and medium armor, expert in Fortitude saves, and you gain the Shield Block general feat. If your deity's favored weapon is simple or unarmed, you also gain the Deadly Simplicity cleric feat." },
    ],
  },
  druid: {
    label: 'Order',
    fieldLabel: 'Druidic Order',
    options: [
      { id: 'animal', name: 'Animal', desc: 'A strong connection to beasts — you stand for the animals of nature, with a powerful animal companion at your side. Order feats like Animal Companion require this order.' },
      { id: 'leaf', name: 'Leaf', desc: 'Gardener and warden of the wilderness, helping it regrow after disasters, with a leshy familiar at your side. Order feats like Leshy Familiar require this order.' },
      { id: 'storm', name: 'Storm', desc: 'You carry the fury of the storm in your heart, channeling thunder to destructive effect and riding the winds. Order feats like Storm Born require this order.' },
      { id: 'untamed', name: 'Untamed', desc: 'The uncontrollable call of the natural world courses through you, granting the ability to wear the form of an untamed creature. Order feats like Wild Shape require this order.' },
    ],
  },
  oracle: {
    label: 'Mystery',
    fieldLabel: 'Mystery',
    options: [
      { id: 'ancestors', name: 'Ancestors', desc: 'The voices of generations past speak to you. Mystery Skill: Society. Initial Revelation Spell: Ancestral Touch (focus spell). Comes with a Curse of Ancestral Meddling — while cursebound, you become clumsy equal to your cursebound value.' },
      { id: 'battle', name: 'Battle', desc: 'Warlike forces fill you with physical might and tactical knowledge. Mystery Skill: Athletics. Initial Revelation Spell: Weapon Trance. Comes with a Curse of the Mortal Warrior — while cursebound, you take weakness to spell damage and a penalty to saves against spells.' },
      { id: 'bones', name: 'Bones', desc: 'Your mystery imparts an understanding of death and undeath. Mystery Skill: Medicine. Initial Revelation Spell: Soul Siphon. Comes with a Curse of Living Death — while cursebound, you take weakness to vitality and void damage and a penalty to Fortitude saves.' },
      { id: 'cosmos', name: 'Cosmos', desc: 'Celestial bodies great and small exert influence on you. Mystery Skill: Nature. Initial Revelation Spell: Spray of Stars. Comes with a Curse of the Sky\'s Call — while cursebound, you become enfeebled and penalized against forced movement.' },
      { id: 'flames', name: 'Flames', desc: 'Fire lives at the center of the world, and you revere or siphon its power. Mystery Skill: Acrobatics. Initial Revelation Spell: Incendiary Aura. Comes with a Curse of Engulfing Flames — while cursebound, you catch fire and take persistent fire damage.' },
      { id: 'life', name: 'Life', desc: "The never-ending flow of life force within living beings is palpable to you. Mystery Skill: Medicine. Initial Revelation Spell: Life Link. Comes with a Curse of Outpouring Life — while cursebound, magic that restores your own Hit Points is weakened." },
      { id: 'lore', name: 'Lore', desc: 'Knowledge and information come freely to you. Mystery Skill: Occultism and one Lore skill of your choice. Initial Revelation Spell: Brain Drain. Comes with a Curse of Torrential Knowledge — while cursebound, you take a penalty to Perception and Will saves.' },
      { id: 'tempest', name: 'Tempest', desc: 'The fury of wind and waves pounds in your heart. Mystery Skill: Nature. Initial Revelation Spell: Tempest Touch. Comes with a Curse of Inclement Headwinds — while cursebound, you take electricity weakness, a ranged attack penalty, and a Speed penalty.' },
    ],
  },
  sorcerer: {
    label: 'Bloodline',
    fieldLabel: 'Bloodline',
    options: [
      { id: 'aberrant', name: 'Aberrant', tradition: 'occult', skills: ['intimidation', 'occultism'], desc: 'Something ancient and unknowable speaks to you from beyond the stars or below the earth. Tradition: Occult. Bloodline Skills: Intimidation, Occultism. Blood Magic — Eerie Veil (a Will save penalty or bonus, 1 round).' },
      { id: 'angelic', name: 'Angelic', tradition: 'divine', skills: ['diplomacy', 'religion'], desc: "One of your forebears hailed from a celestial realm, or your ancestors' devotion blessed their lineage. Tradition: Divine. Bloodline Skills: Diplomacy, Religion. Blood Magic — Divine Aura (a saving throw bonus, 1 round)." },
      { id: 'demonic', name: 'Demonic', tradition: 'divine', skills: ['intimidation', 'religion'], desc: "Demons debase all they touch, and one of your ancestors fell to their corruption. Tradition: Divine. Bloodline Skills: Intimidation, Religion. Blood Magic — Corruption of Sin (an AC penalty or an Intimidation bonus, 1 round)." },
      { id: 'diabolic', name: 'Diabolic', tradition: 'divine', skills: ['deception', 'religion'], desc: "Devils are evil with a silver tongue, and one of your ancestors dallied in darkness or made an infernal pact. Tradition: Divine. Bloodline Skills: Deception, Religion. Blood Magic — Tongue of Flame (fire damage or a Deception bonus, 1 round)." },
      { id: 'draconic', name: 'Draconic', skills: ['intimidation'], desc: "The blood of dragons flows through your veins. At 1st level, choose a draconic exemplar tradition (Arcane, Divine, Occult, or Primal) — this sets both your spellcasting tradition and your second Bloodline Skill (Arcana/Religion/Occultism/Nature respectively). Blood Magic — Scaly Hide (+1 status bonus to AC, 1 round)." },
      { id: 'elemental', name: 'Elemental', tradition: 'primal', skills: ['intimidation', 'nature'], desc: "An elemental influence has imbued your blood with primal fury. At 1st level, choose an element (air, earth, fire, metal, water, or wood), which sets your bloodline's cantrip and Blood Magic damage type. Tradition: Primal. Bloodline Skills: Intimidation, Nature." },
      { id: 'fey', name: 'Fey', tradition: 'primal', skills: ['deception', 'nature'], desc: "Fey whimsy put the bewitching magic of the First World into your bloodline. Tradition: Primal. Bloodline Skills: Deception, Nature. Blood Magic — Cloak of Ribbons (a Performance bonus or brief concealment, 1 round)." },
      { id: 'hag', name: 'Hag', tradition: 'occult', skills: ['deception', 'occultism'], desc: 'A hag cursed your family long ago, or you descend from a hag or changeling. Tradition: Occult. Bloodline Skills: Deception, Occultism. Blood Magic — Retributive Spite (mental damage to whoever next damages you, or temporary HP).' },
      { id: 'imperial', name: 'Imperial', tradition: 'arcane', skills: ['arcana', 'society'], desc: 'One of your ancestors was a mortal who mastered magic. Tradition: Arcane. Bloodline Skills: Arcana, Society. Blood Magic — Imperious Defense (a status bonus to AC or saves, 1 round).' },
      { id: 'undead', name: 'Undead', tradition: 'divine', skills: ['intimidation', 'religion'], desc: 'The touch of undeath runs through your blood — your family tree might contain powerful undead. Tradition: Divine. Bloodline Skills: Intimidation, Religion. Blood Magic — Stolen Life (temporary HP or void damage to a target).' },
    ],
  },
  witch: {
    label: 'Patron',
    fieldLabel: 'Patron',
    options: [
      { id: 'faiths-flamekeeper', name: "Faith's Flamekeeper", tradition: 'divine', skills: ['religion'], desc: 'Your patron reassured you in a moment your willpower was close to sputtering out — likely a divine being acting covertly. Spell List: Divine. Patron Skill: Religion. Grants the stoke the heart hex cantrip; your familiar learns command.' },
      { id: 'inscribed-one', name: 'The Inscribed One', tradition: 'arcane', skills: ['arcana'], desc: 'Words and glyphs danced across your patron\'s skin as they spelled out their will — perhaps a powerful archmage or one of their artifacts. Spell List: Arcane. Patron Skill: Arcana. Grants the discern secrets hex cantrip; your familiar learns runic weapon.' },
      { id: 'resentment', name: 'The Resentment', tradition: 'occult', skills: ['occultism'], desc: 'Your patron radiates a desire to see the powerful felled — likely far from the upper echelons of its own kind. Spell List: Occult. Patron Skill: Occultism. Grants the evil eye hex cantrip; your familiar learns enfeeble.' },
      { id: 'silence-in-snow', name: 'Silence in Snow', tradition: 'primal', skills: ['nature'], desc: 'Bitter cold heralded your patron\'s appearance — a winter hag, ice yai, or other spirit of the cold. Spell List: Primal. Patron Skill: Nature. Grants the clinging ice hex cantrip; your familiar learns gust of wind.' },
      { id: 'spinner-of-threads', name: 'Spinner of Threads', tradition: 'occult', skills: ['occultism'], desc: 'You met your patron as they untangled and re-spun the tapestry of time and fate. Spell List: Occult. Patron Skill: Occultism. Grants the nudge fate hex cantrip; your familiar learns sure strike.' },
      { id: 'starless-shadow', name: 'Starless Shadow', tradition: 'occult', skills: ['occultism'], desc: 'Your patron first contacted you at the witching hour, offering power from the darkness. Spell List: Occult. Patron Skill: Occultism. Grants the shroud of night hex cantrip; your familiar learns fear.' },
      { id: 'wilding-steward', name: 'Wilding Steward', tradition: 'primal', skills: ['nature'], desc: 'Your patron moved with the grace and ferocity of the wilderness — a dryad queen or primeval beast, all of nature theirs to defend. Spell List: Primal. Patron Skill: Nature. Grants the wilding word hex cantrip; your familiar learns summon animal or summon plant or fungus.' },
    ],
  },
  wizard: {
    label: 'Arcane School',
    fieldLabel: 'Arcane School',
    options: [
      { id: 'ars-grammatica', name: 'School of Ars Grammatica', desc: 'Runes, wards, numbers and letters underpin all magic. Curriculum cantrips: Message, Sigil. Two curriculum 1st-rank spells (from Command, Disguise Magic, Runic Body, Runic Weapon) are added to your spellbook. Initial school spell: Protective Wards.' },
      { id: 'boundary', name: 'School of the Boundary', desc: 'You turn your magic past the physical world, to the forces beyond. Curriculum cantrips: Telekinetic Hand, Void Warp. Two curriculum 1st-rank spells (from Grim Tendrils, Phantasmal Minion, Summon Undead) are added to your spellbook. Initial school spell: Fortify Summoning.' },
      { id: 'civic-wizardry', name: 'School of Civic Wizardry', desc: 'The fruits of arcane study should help the common citizen — construction, finding lost things, and swift movement. Curriculum cantrips: Prestidigitation, Read Aura. Two curriculum 1st-rank spells (from Hydraulic Push, Pummeling Rubble, Summon Construct) are added to your spellbook. Initial school spell: Earthworks.' },
      { id: 'mentalism', name: 'School of Mentalism', desc: 'You study the arts of befuddling lesser minds with figments, illusions, and implanted sensations. Curriculum cantrips: Daze, Figment. Two curriculum 1st-rank spells (from Dizzying Colors, Sleep, Sure Strike) are added to your spellbook. Initial school spell: Charming Push.' },
      { id: 'protean-form', name: 'School of Protean Form', desc: 'Your magic focuses on convincing living matter into another shape. Curriculum cantrips: Gouging Claw, Tangle Vine. Two curriculum 1st-rank spells (from Jump, Pest Form, Spider Sting) are added to your spellbook. Initial school spell: Scramble Body.' },
      { id: 'unified-magical-theory', name: 'School of Unified Magical Theory', desc: "You study the best of every school rather than specializing. No curriculum, but instead: gain an additional 1st-level wizard class feat, and add one 1st-rank spell of your choice to your spellbook. Initial school spell: Hand of the Apprentice." },
      { id: 'battle-magic', name: 'School of Battle Magic', desc: 'Magic is power, and you turn it to the art of battle. Curriculum cantrips: Shield, Telekinetic Projectile. Two curriculum 1st-rank spells (from Breathe Fire, Force Barrage, Mystic Armor) are added to your spellbook. Initial school spell: Force Bolt.' },
      { id: 'universalist', name: 'Universalist', desc: 'Instead of specializing, you study all the schools equally. Gain an extra wizard class feat, add one 1st-level spell of your choice to your spellbook, and you can use Drain Bonded Item once per day per level of wizard spell slot you have (instead of once per day total).' },
    ],
  },
  champion: {
    label: 'Cause',
    fieldLabel: 'Cause',
    options: [
      { id: 'desecration', name: 'Desecration', desc: "You take what pleases you and spread a malign influence, corrupting everything pure or holy in your path. Grants the Champion's Reaction (Relentless tier): if your Charisma modifier is +3 or greater, your resistance against the triggering damage equals your Charisma modifier + half your level." },
      { id: 'grandeur', name: 'Grandeur', desc: "The glowing grandeur of celestial realms inspires you to bring humility to others. Grants the Champion's Reaction (Relentless tier): the enemy also takes persistent spirit damage equal to your Charisma modifier, unable to recover from it while affected by your reaction's light." },
      { id: 'iniquity', name: 'Iniquity', desc: "You're dishonorable and committed to breaking the false hopes of kindness. Grants the Champion's Reaction (Relentless tier): a damaged enemy also takes persistent spirit damage equal to your Charisma modifier." },
      { id: 'justice', name: 'Justice', desc: "In your deity's name you seek justice, following the law and punishing transgressors. Grants the Champion's Reaction (Relentless tier — Retributive Strike): if your Strike hits, the target takes persistent spirit damage equal to your Charisma modifier." },
      { id: 'liberation', name: 'Liberation', desc: "You will see all people free from bondage and prohibitions. Grants the Champion's Reaction (Relentless tier — Liberating Step): an enemy that had your freed ally grabbed, restrained, immobilized, or paralyzed takes persistent spirit damage equal to your Charisma modifier." },
      { id: 'obedience', name: 'Obedience', desc: "Society is ordered with good reason, and people should conduct themselves as befits their place. Grants the Champion's Reaction (Relentless tier — Iron Command): if the enemy refuses your command, it takes persistent spirit damage equal to your Charisma modifier." },
      { id: 'redemption', name: 'Redemption', desc: "Yearning for all to live in harmony, you try to redeem those others would slay or dismiss. Grants the Champion's Reaction (Relentless tier): if the enemy refuses redemption, it takes persistent spirit damage equal to your Charisma modifier." },
    ],
  },
};

export function getSubclassOption(classId, optionId) {
  const group = SUBCLASSES[classId];
  return group?.options.find((o) => o.id === optionId);
}
