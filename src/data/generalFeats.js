// General feats (1st level only — this is a level-1 builder). Verified
// against Archives of Nethys (Player Core, queried via its Elasticsearch
// index — see PROJECT_NOTES.md). Includes both "pure" general feats (no
// prereq beyond character level) and general feats that also carry the
// Skill trait (these require training in a specific skill; `prereq` says
// which). As elsewhere in this app, prerequisites are shown for reference
// but not hard-enforced — the player is trusted to pick something they
// qualify for.
//
// Used wherever the data grants "a general feat" as a free pick rather than
// naming a specific one: Human's Versatile Heritage and General Training.

export const GENERAL_FEATS = [
  { id: 'acrobatic-performer', name: 'Acrobatic Performer', prereq: 'Trained in Acrobatics', desc: 'You can use Acrobatics instead of Performance to Perform; with both trained, gain a +1 circumstance bonus.' },
  { id: 'additional-lore', name: 'Additional Lore', prereq: null, desc: 'Choose a Lore subcategory and become trained in it (improves further at 3rd, 7th, and 15th level).' },
  { id: 'adopted-ancestry', name: 'Adopted Ancestry', prereq: null, desc: 'Choose another ancestry; you can select its ancestry feats in addition to your own, physiology permitting.' },
  { id: 'alchemical-crafting', name: 'Alchemical Crafting', prereq: 'Trained in Crafting', desc: 'You can Craft alchemical items, and immediately add 4 common 1st-level alchemical formulas to your formula book.' },
  { id: 'arcane-sense', name: 'Arcane Sense', prereq: 'Trained in Arcana', desc: 'You can cast detect magic at will as an arcane innate spell (heightened by your Arcana proficiency).' },
  { id: 'armor-assist', name: 'Armor Assist', prereq: 'Trained in Athletics or Warfare Lore', desc: 'You can halve the time you (or an ally, working together) take to don armor with a successful check.' },
  { id: 'armor-proficiency', name: 'Armor Proficiency', prereq: null, desc: 'You become trained in the next armor category you lack (light, then medium, then heavy).' },
  { id: 'assurance', name: 'Assurance', prereq: 'Trained in at least one skill', desc: 'Choose a trained skill; you can forgo rolling to instead get 10 + your proficiency bonus (no other modifiers).' },
  { id: 'bargain-hunter', name: 'Bargain Hunter', prereq: 'Trained in Diplomacy', desc: 'You can Earn Income via bargain-hunting or buy items at a discount; start play with 2 extra gp if taken at 1st level.' },
  { id: 'battle-medicine', name: 'Battle Medicine', prereq: 'Trained in Medicine', desc: "Requires a healer's toolkit. Once per day per target, restore HP with a Medicine check as if you'd Treated Wounds." },
  { id: 'bon-mot', name: 'Bon Mot', prereq: 'Trained in Diplomacy', desc: "Roll Diplomacy against a foe's Will DC to impose a status penalty to their Perception and Will saves for 1 minute." },
  { id: 'breath-control', name: 'Breath Control', prereq: null, desc: 'You can hold your breath 25x as long, and gain a bonus (with upgraded success) on saves against inhaled threats.' },
  { id: 'canny-acumen', name: 'Canny Acumen', prereq: null, desc: 'Choose Fortitude, Reflex, Will, or Perception; you become an expert in it (master at 17th level).' },
  { id: 'cat-fall', name: 'Cat Fall', prereq: 'Trained in Acrobatics', desc: 'Treat falls as shorter based on your Acrobatics proficiency; at legendary, you always land safely on your feet.' },
  { id: 'charming-liar', name: 'Charming Liar', prereq: 'Trained in Deception', desc: 'A critical success to Lie also improves the target\'s attitude toward you by one step, once per conversation.' },
  { id: 'combat-climber', name: 'Combat Climber', prereq: 'Trained in Athletics', desc: "You aren't off-guard while Climbing, and can Climb with one hand occupied." },
  { id: 'concealing-legerdemain', name: 'Concealing Legerdemain', prereq: 'Trained in Thievery', desc: 'You can use Thievery instead of Stealth to Conceal a light object and against searches for it.' },
  { id: 'courtly-graces', name: 'Courtly Graces', prereq: 'Trained in Society', desc: 'Others assume you belong to the nobility; gain a bonus using Society/Impersonate in noble contexts.' },
  { id: 'crafters-appraisal', name: "Crafter's Appraisal", prereq: 'Trained in Crafting', desc: 'You can use Crafting instead of a tradition skill to Identify Magic on magic items.' },
  { id: 'deceptive-worship', name: 'Deceptive Worship', prereq: 'Trained in Occultism', desc: 'You can use Occultism instead of Deception to pass as a worshipper of another faith.' },
  { id: 'diehard', name: 'Diehard', prereq: null, desc: 'You die from the dying condition at dying 5 instead of dying 4.' },
  { id: 'dirty-trick', name: 'Dirty Trick', prereq: 'Trained in Thievery', desc: "Melee reach, hand free. Roll Thievery against a foe's Reflex DC to impose clumsy 1 for a round (or until they act, on a crit)." },
  { id: 'dubious-knowledge', name: 'Dubious Knowledge', prereq: 'Trained in a skill with Recall Knowledge', desc: 'On a failed (not critical) Recall Knowledge check, you learn a correct answer and a wrong one, indistinguishable.' },
  { id: 'experienced-professional', name: 'Experienced Professional', prereq: 'Trained in Lore', desc: 'Critical failures to Earn Income with Lore become failures; experts earn double on a failure.' },
  { id: 'experienced-smuggler', name: 'Experienced Smuggler', prereq: 'Trained in Stealth', desc: 'Passive observers use a minimum roll (10, or higher at master/legendary) against your Stealth to notice a hidden small item.' },
  { id: 'experienced-tracker', name: 'Experienced Tracker', prereq: 'Trained in Survival', desc: 'You can Track at full Speed with a penalty (removed at master); legendary removes the hourly reroll requirement.' },
  { id: 'express-rider', name: 'Express Rider', prereq: 'Trained in Nature', desc: "You can boost your mount's (and up to 6 allies' mounts') daily travel Speed with a Nature check." },
  { id: 'eye-for-numbers', name: 'Eye for Numbers', prereq: 'Trained in Society', desc: 'You can estimate the count of a group of similar items at a glance, and gain bonuses using counted info to Feint/Deceive.' },
  { id: 'fascinating-performance', name: 'Fascinating Performance', prereq: 'Trained in Performance', desc: 'On a successful Perform, fascinate one observer (more at higher proficiency) for 1 round.' },
  { id: 'fast-recovery', name: 'Fast Recovery', prereq: 'Constitution +2', desc: 'You regain double HP from resting, reduce disease/poison stage further on successful saves, and recover faster from drained.' },
  { id: 'feather-step', name: 'Feather Step', prereq: 'Dexterity +2', desc: 'You can Step into difficult terrain.' },
  { id: 'fleet', name: 'Fleet', prereq: null, desc: 'Your Speed increases by 5 feet.' },
  { id: 'forager', name: 'Forager', prereq: 'Trained in Survival', desc: 'Subsist checks with Survival can\'t fail outright, and you can feed several extra creatures (more at higher proficiency).' },
  { id: 'forensic-acumen', name: 'Forensic Acumen', prereq: 'Trained in Medicine', desc: 'Halve the time to examine a body for cause of death, and gain a bonus to a related follow-up Recall Knowledge check.' },
  { id: 'glean-contents', name: 'Glean Contents', prereq: 'Trained in Society', desc: 'You can Decipher Writing on a partially-glimpsed message, or read sealed letters without breaking the seal.' },
  { id: 'group-coercion', name: 'Group Coercion', prereq: 'Trained in Intimidation', desc: 'You can Coerce up to 5 targets at once (more at higher proficiency) instead of just one.' },
  { id: 'group-impression', name: 'Group Impression', prereq: 'Trained in Diplomacy', desc: 'You can Make an Impression on up to 10 targets at once (more at higher proficiency) without penalty.' },
  { id: 'hefty-hauler', name: 'Hefty Hauler', prereq: 'Trained in Athletics', desc: 'Increase your maximum and encumbered Bulk limits by 2.' },
  { id: 'hobnobber', name: 'Hobnobber', prereq: 'Trained in Diplomacy', desc: 'Gather Information takes half as long as normal.' },
  { id: 'impressive-performance', name: 'Impressive Performance', prereq: 'Trained in Performance', desc: 'You can Make an Impression using Performance, and target a whole audience after a long-enough show.' },
  { id: 'improvise-tool', name: 'Improvise Tool', prereq: 'Trained in Crafting', desc: 'You can Repair without a toolkit, and Craft several basic gear items as if you had their formulas.' },
  { id: 'incredible-initiative', name: 'Incredible Initiative', prereq: null, desc: 'You gain a +2 circumstance bonus to initiative rolls.' },
  { id: 'inoculation', name: 'Inoculation', prereq: 'Trained in Medicine', desc: 'A patient you fully cure of a disease gains a bonus to saves against that same disease for a week.' },
  { id: 'intimidating-glare', name: 'Intimidating Glare', prereq: 'Trained in Intimidation', desc: 'You can Demoralize with a glare instead of words, ignoring language barriers.' },
  { id: 'lengthy-diversion', name: 'Lengthy Diversion', prereq: 'Trained in Deception', desc: 'A critical success to Create a Diversion keeps you hidden past the end of your turn.' },
  { id: 'lie-to-me', name: 'Lie to Me', prereq: 'Trained in Deception', desc: 'In back-and-forth conversation, you can use your (higher) Deception DC instead of Perception DC to catch lies.' },
  { id: 'multilingual', name: 'Multilingual', prereq: 'Trained in Society', desc: 'You learn two new languages (more at master/legendary Society); repeatable.' },
  { id: 'natural-medicine', name: 'Natural Medicine', prereq: 'Trained in Nature', desc: 'You can use Nature instead of Medicine to Treat Wounds, with a wilderness bonus at the GM\'s discretion.' },
  { id: 'no-cause-for-alarm', name: 'No Cause for Alarm', prereq: 'Trained in Diplomacy', desc: 'Reduce the frightened value of nearby creatures with a Diplomacy check against their Will DC.' },
  { id: 'oddity-identification', name: 'Oddity Identification', prereq: 'Trained in Occultism', desc: 'You can spot mental/fortune/detection-type magical effects on sight, and get a bonus identifying them.' },
  { id: 'pet', name: 'Pet', prereq: null, desc: 'You gain a Tiny animal pet (minion) with 2 chosen abilities, scaling with your level.' },
  { id: 'pickpocket', name: 'Pickpocket', prereq: 'Trained in Thievery', desc: 'You can Steal a closely-guarded object without the usual penalty.' },
  { id: 'pilgrims-token', name: "Pilgrim's Token", prereq: 'Trained in Religion; follower of a specific faith', desc: 'A free attuned religious symbol lets you win initiative ties against adversaries.' },
  { id: 'quick-coercion', name: 'Quick Coercion', prereq: 'Trained in Intimidation', desc: 'You can Coerce after just 1 round of conversation instead of 1 minute.' },
  { id: 'quick-identification', name: 'Quick Identification', prereq: 'Trained in Arcana, Nature, Occultism, or Religion', desc: 'Identify Magic takes 1 minute instead of 10 (faster still at master/legendary).' },
  { id: 'quick-jump', name: 'Quick Jump', prereq: 'Trained in Athletics', desc: 'High Jump and Long Jump become single actions, skipping the initial Stride.' },
  { id: 'quick-repair', name: 'Quick Repair', prereq: 'Trained in Crafting', desc: 'Repair takes 1 minute instead of 10, loses the exploration trait (faster still at master/legendary).' },
  { id: 'quick-squeeze', name: 'Quick Squeeze', prereq: 'Trained in Acrobatics', desc: 'You Squeeze 5 feet per round (10 on a critical success).' },
  { id: 'read-lips', name: 'Read Lips', prereq: 'Trained in Society', desc: 'You can read lips in a language you know; harder and riskier in combat.' },
  { id: 'recognize-spell', name: 'Recognize Spell', prereq: 'Trained in Arcana, Nature, Occultism, or Religion', desc: 'Reaction: automatically identify common spells of low rank as they\'re cast, if trained in the right tradition skill.' },
  { id: 'ride', name: 'Ride', prereq: null, desc: 'Commanding a mount to move automatically succeeds; a newly-mounted animal acts as a minion.' },
  { id: 'risky-surgery', name: 'Risky Surgery', prereq: 'Trained in Medicine', desc: 'You can deal damage to a patient before Treating Wounds for a bonus (and upgraded success) on the check.' },
  { id: 'root-magic', name: 'Root Magic', prereq: 'Trained in Occultism', desc: "During daily prep, give an ally a ward granting a bonus to their first save against a spell or haunt that day." },
  { id: 'schooled-in-secrets', name: 'Schooled in Secrets', prereq: 'Trained in Occultism', desc: 'You can use Occultism to Gather Information about, or Impersonate members of, secret societies.' },
  { id: 'seasoned', name: 'Seasoned', prereq: 'Trained in Alcohol Lore, Cooking Lore, or Crafting', desc: 'You gain a bonus to Crafting checks for food and drink, including elixirs/potions if you have those feats.' },
  { id: 'shield-block', name: 'Shield Block', prereq: null, desc: 'Reaction: your raised shield absorbs physical damage up to its Hardness.' },
  { id: 'sign-language', name: 'Sign Language', prereq: 'Trained in Society', desc: 'You learn sign languages for the spoken languages you know.' },
  { id: 'skill-training', name: 'Skill Training', prereq: 'Intelligence +1', desc: 'You become trained in a skill of your choice; repeatable for different skills.' },
  { id: 'snare-crafting', name: 'Snare Crafting', prereq: 'Trained in Crafting', desc: 'You can Craft snares, and immediately add 4 common 1st-level snare formulas to your formula book.' },
  { id: 'specialty-crafting', name: 'Specialty Crafting', prereq: 'Trained in Crafting', desc: 'Choose a crafting specialty (e.g. blacksmithing, tailoring); gain a bonus to Crafting checks for that item type.' },
  { id: 'steady-balance', name: 'Steady Balance', prereq: 'Trained in Acrobatics', desc: "Successes to Balance become critical successes, and you're never off-guard while attempting it." },
  { id: 'streetwise', name: 'Streetwise', prereq: 'Trained in Society', desc: 'Use Society instead of Diplomacy to Gather Information, and Recall Knowledge on local rumors in familiar settlements.' },
  { id: 'student-of-the-canon', name: 'Student of the Canon', prereq: 'Trained in Religion', desc: 'Upgraded results on Religion checks about religious texts or the tenets of faiths (especially your own).' },
  { id: 'subtle-theft', name: 'Subtle Theft', prereq: 'Trained in Thievery', desc: 'Successful thefts are harder for bystanders to notice, and a Diversion can cover a Steal without breaking undetected.' },
  { id: 'survey-wildlife', name: 'Survey Wildlife', prereq: 'Trained in Survival', desc: 'Spend 10 minutes to learn what creatures are nearby from tracks and signs, then Recall Knowledge about them.' },
  { id: 'terrain-expertise', name: 'Terrain Expertise', prereq: 'Trained in Survival', desc: 'Choose a terrain type; gain a bonus to Survival checks there. Repeatable for different terrains.' },
  { id: 'terrain-stalker', name: 'Terrain Stalker', prereq: 'Trained in Stealth', desc: 'Choose a difficult-terrain type; Sneak through it slowly without a check while undetected.' },
  { id: 'titan-wrestler', name: 'Titan Wrestler', prereq: 'Trained in Athletics', desc: 'You can Disarm, Grapple, Reposition, Shove, or Trip creatures up to two sizes larger than you.' },
  { id: 'toughness', name: 'Toughness', prereq: null, desc: 'Increase your maximum Hit Points by your level, and reduce the DC of recovery checks by 1.' },
  { id: 'train-animal', name: 'Train Animal', prereq: 'Trained in Nature', desc: "Spend downtime teaching an animal a new Command-able action, or to perform a known one without a check." },
  { id: 'trick-magic-item', name: 'Trick Magic Item', prereq: 'Trained in Arcana, Nature, Occultism, or Religion', desc: "Attempt to activate a magic item you couldn't normally use, using the skill matching its tradition." },
  { id: 'underwater-marauder', name: 'Underwater Marauder', prereq: 'Trained in Athletics', desc: "You aren't off-guard in water, and avoid the usual penalties for bludgeoning/slashing melee weapons underwater." },
  { id: 'virtuosic-performer', name: 'Virtuosic Performer', prereq: 'Trained in Performance', desc: 'Choose a performance specialty; gain a bonus to Performance checks of that type.' },
  { id: 'weapon-proficiency', name: 'Weapon Proficiency', prereq: null, desc: 'You become trained in all martial weapons (or, if already trained, one advanced weapon of your choice).' },
];

export function getGeneralFeat(id) {
  return GENERAL_FEATS.find((f) => f.id === id);
}

// Skill feats -- the subset of GENERAL_FEATS that carry the Skill trait,
// identified the same way BackgroundStep.jsx's custom-background feat
// suggestions already did (every skill feat's prereq starts with "Trained
// in "). Extracted here so a skill-feat slot elsewhere (Level-Up's every-
// even-level skill feat, see leveling.js) reads from the same one list
// instead of re-deriving it.
export const SKILL_FEATS = GENERAL_FEATS.filter((f) => f.prereq && /^Trained in /i.test(f.prereq));
