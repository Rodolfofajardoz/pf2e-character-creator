import { SKILLS, PROFICIENCY_RANKS } from '../data/skills';
import { CANTRIPS, SPELLS_RANK_1 } from '../data/spells';

const LEVEL = 1;
const SHEET_URL = `${import.meta.env.BASE_URL}pf2e-character-sheet.pdf`;

function profBonus(rank) {
  return PROFICIENCY_RANKS[rank].bonus(LEVEL);
}

function signed(n) {
  if (n === null || n === undefined) return '';
  return n >= 0 ? `+${n}` : `${n}`;
}

// The spellbook table on page 3 is a 20-row x 2-column grid, but only the
// first row of each column has a clean field name (NAME/TYPE  LEVEL and
// NAME_2/TYPE  LEVEL_2) -- the other 38 rows were left auto-named
// ("undefined_151" etc.) by whoever built the PDF. Extracted once by
// clustering every page-3 field's widget rect into rows by y-position and
// columns by x-position (see PROJECT_NOTES.md's PDF section) -- these are
// fixed for this specific bundled PDF file, not something to recompute at
// runtime.
const SPELLBOOK_SLOTS = [
  { name: 'NAME', typeLevel: 'TYPE  LEVEL' },
  { name: 'undefined_151', typeLevel: 'undefined_152' },
  { name: 'undefined_161', typeLevel: 'undefined_162' },
  { name: 'undefined_171', typeLevel: 'undefined_172' },
  { name: 'undefined_181', typeLevel: 'undefined_182' },
  { name: 'undefined_191', typeLevel: 'undefined_192' },
  { name: 'undefined_201', typeLevel: 'undefined_202' },
  { name: 'undefined_211', typeLevel: 'undefined_212' },
  { name: 'undefined_221', typeLevel: 'undefined_222' },
  { name: 'undefined_231', typeLevel: 'undefined_232' },
  { name: 'undefined_241', typeLevel: 'undefined_242' },
  { name: 'undefined_251', typeLevel: 'undefined_252' },
  { name: 'undefined_261', typeLevel: 'undefined_262' },
  { name: 'undefined_271', typeLevel: 'undefined_272' },
  { name: 'undefined_281', typeLevel: 'undefined_282' },
  { name: 'undefined_291', typeLevel: 'undefined_292' },
  { name: 'undefined_301', typeLevel: 'undefined_302' },
  { name: 'undefined_311', typeLevel: 'undefined_312' },
  { name: 'undefined_321', typeLevel: 'undefined_322' },
  { name: 'undefined_331', typeLevel: 'undefined_332' },
  { name: 'NAME_2', typeLevel: 'TYPE  LEVEL_2' },
  { name: 'undefined_156', typeLevel: 'undefined_157' },
  { name: 'undefined_166', typeLevel: 'undefined_167' },
  { name: 'undefined_176', typeLevel: 'undefined_177' },
  { name: 'undefined_186', typeLevel: 'undefined_187' },
  { name: 'undefined_196', typeLevel: 'undefined_197' },
  { name: 'undefined_206', typeLevel: 'undefined_207' },
  { name: 'undefined_216', typeLevel: 'undefined_217' },
  { name: 'undefined_226', typeLevel: 'undefined_227' },
  { name: 'undefined_236', typeLevel: 'undefined_237' },
  { name: 'undefined_246', typeLevel: 'undefined_247' },
  { name: 'undefined_256', typeLevel: 'undefined_257' },
  { name: 'undefined_266', typeLevel: 'undefined_267' },
  { name: 'undefined_276', typeLevel: 'undefined_277' },
  { name: 'undefined_286', typeLevel: 'undefined_287' },
  { name: 'undefined_296', typeLevel: 'undefined_297' },
  { name: 'undefined_306', typeLevel: 'undefined_307' },
  { name: 'undefined_316', typeLevel: 'undefined_317' },
  { name: 'undefined_326', typeLevel: 'undefined_327' },
  { name: 'undefined_336', typeLevel: 'undefined_337' },
];

const TRADITION_CHECKBOX = { arcane: 'ARCANE_TEML', divine: 'DIVINE_TEML', occult: 'OCCULT_TEML', primal: 'PRIMAL_TEML' };

// Almost every skill's fields share one prefix (X_TOTAL, X_TEML, ...), but
// the PDF author was inconsistent for Acrobatics specifically -- its total
// field is "ACROBATIC_TOTAL" (no S) while every other field for it keeps
// the S ("ACROBATICS_TEML", "ACROBATICS_ITEM", "ACROBATICS_MISC"). Confirmed
// by filling every field once and checking which ones pdf-lib couldn't find.
const SKILL_FIELD_PREFIX = {
  acrobatics: 'ACROBATIC', // sic -- but see SKILL_TEML_PREFIX below for _TEML
  arcana: 'ARCANA',
  athletics: 'ATHLETICS',
  crafting: 'CRAFTING',
  deception: 'DECEPTION',
  diplomacy: 'DIPLOMACY',
  intimidation: 'INTIMIDATION',
  medicine: 'MEDICINE',
  nature: 'NATURE',
  occultism: 'OCCULTISM',
  performance: 'PERFORMANCE',
  religion: 'RELIGION',
  society: 'SOCIETY',
  stealth: 'STEALTH',
  survival: 'SURVIVAL',
  thievery: 'THIEVERY',
};

const SKILL_TEML_PREFIX = { ...SKILL_FIELD_PREFIX, acrobatics: 'ACROBATICS' };

// Builds { fieldName: value } for every field this app can confidently
// compute -- see PROJECT_NOTES.md's "Custom PDF sheet printing" section for
// what's deliberately left blank and why (mainly: per-strike attack bonus,
// since weapon proficiency isn't tracked per category/finesse yet).
export function buildFieldValues(character, computed) {
  const {
    ancestry, background, cls, heritage, weapon, armor, shieldPurchases,
    mods, hp, ac, perceptionMod, classDC, saves, spellAbility, spellDC, spellAttack,
  } = computed;

  const text = {};
  const checks = {};
  const dropdowns = {};

  if (character.name) text['CHARACTER NAME'] = character.name;
  if (ancestry) {
    text['ANCESTRY  HERITAGE'] = heritage ? `${ancestry.name} (${heritage.name})` : ancestry.name;
    text['SIZE'] = ancestry.size;
    text['TRAITS'] = ancestry.traits.join(', ');
    text['SPEED'] = `${ancestry.speed} feet`;
    text['SENSES'] = ancestry.senses.join(', ');
    text['LANGUAGES'] = [...ancestry.languages, ...character.bonusLanguages].join(', ');
  }
  if (background) text['BACKGROUND'] = background.name;
  if (cls) text['CLASS  PATH ARCHETYPE'] = cls.name;
  text['LVL'] = String(LEVEL);
  text['XP'] = '0';
  checks['HERO POINTS 1'] = true; // every character starts play with 1 Hero Point

  if (mods) {
    text['STR MOD'] = signed(mods.str);
    text['DEX MOD'] = signed(mods.dex);
    text['CON MOD'] = signed(mods.con);
    text['INT MOD'] = signed(mods.int);
    text['WIS MOD'] = signed(mods.wis);
    text['CHA MOD'] = signed(mods.cha);
  }

  if (hp !== null) {
    text['MAX HP'] = String(hp);
    text['CURRENT HP'] = String(hp);
  }

  if (ac !== null) {
    text['ARMOR CLASS'] = String(ac);
    checks['AC_TEML'] = true;
  }
  if (perceptionMod !== null) {
    text['PERCEPTION_TOTAL'] = signed(perceptionMod);
    checks['PERCEPTION_TEML'] = true;
  }
  if (classDC !== null) {
    text['CLASS DC_TOTAL'] = String(classDC);
    checks['CLASS DC_TEML'] = true;
  }
  if (saves) {
    text['FORTITUDE_TOTAL'] = signed(saves.fort);
    text['REFLEX_TOTAL'] = signed(saves.ref);
    text['WILL_TOTAL'] = signed(saves.will);
    checks['FORTITUDE_TEML'] = true;
    checks['REFLEX_TEML'] = true;
    checks['WILL_TEML'] = true;
  }

  // Armor/weapon proficiency checkboxes -- everyone is at least Untrained
  // (shown unchecked) or Trained+ (checked) per the class's armorProficiency
  // list and its free-text weapons description. Unarmored is always at
  // least Trained under the remaster's Unarmored Defense progression.
  if (cls) {
    checks['UNARMORED_TEML'] = true;
    checks['LIGHT_TEML'] = (cls.armorProficiency || []).includes('light');
    checks['MEDIUM_TEML'] = (cls.armorProficiency || []).includes('medium');
    checks['HEAVY_TEML'] = (cls.armorProficiency || []).includes('heavy');
    const w = (cls.weapons || '').toLowerCase();
    checks['UNARMED_TEML'] = w.includes('unarmed');
    checks['SIMPLE_TEML'] = w.includes('simple');
    checks['MARTIAL_TEML'] = w.includes('martial');
  }

  if (armor && armor.category !== 'none') text['OTHER ARMOR'] = armor.name;

  const shield = shieldPurchases[0]?.item;
  if (shield) {
    text['HARDNESS'] = String(shield.hardness);
    text['MAX HP_2'] = String(shield.hp);
    text['BT'] = String(shield.bt);
    text['AC BONUS'] = String(shield.acBonus);
  }

  if (weapon) {
    text['WEAPON NAME'] = weapon.name;
    text['DAMAGE'] = weapon.damage;
  }

  // Skills: every skill gets a total (untrained = ability mod alone), but
  // only the actually-trained ones get their checkbox marked.
  if (mods) {
    const trainedIds = new Set([
      ...(cls?.fixedSkills || []),
      ...(character.classSkillChoice ? [character.classSkillChoice] : []),
      ...(computed.backgroundSkillId ? [computed.backgroundSkillId] : []),
      ...character.trainedSkills,
    ]);
    SKILLS.forEach((s) => {
      const prefix = SKILL_FIELD_PREFIX[s.id];
      if (!prefix) return;
      const isTrained = trainedIds.has(s.id);
      const total = mods[s.ability] + (isTrained ? profBonus('trained') : 0);
      text[`${prefix}_TOTAL`] = signed(total);
      checks[`${SKILL_TEML_PREFIX[s.id]}_TEML`] = isTrained;
    });
    if (background) {
      text['LORE_1'] = background.lore;
      text['LORE 1_TOTAL'] = signed(mods.int + profBonus('trained'));
      checks['LORE 1_TEML'] = true;
    }
  }

  // Spellcasting (page 3): tradition checkbox, spell DC/attack, and every
  // known cantrip/1st-rank spell into the spellbook table, cantrips first.
  if (spellAbility) {
    const traditionCode = cls.spellcasting.traditionCode || character.spellTradition;
    if (traditionCode && TRADITION_CHECKBOX[traditionCode]) checks[TRADITION_CHECKBOX[traditionCode]] = true;
    text['SDC1_TOTAL'] = String(spellDC);
    text['SATK1_TOTAL'] = signed(spellAttack);
    checks['SDC1_TEML'] = true;
    checks['SATK1_TEML'] = true;
    dropdowns['SMOD1'] = spellAbility.toUpperCase();

    const cantripNames = character.knownCantrips.map((id) => CANTRIPS.find((s) => s.id === id)?.name).filter(Boolean);
    const spell1Names = character.knownSpells1.map((id) => SPELLS_RANK_1.find((s) => s.id === id)?.name).filter(Boolean);
    const entries = [
      ...cantripNames.map((name) => ({ name, typeLevel: 'Cantrip' })),
      ...spell1Names.map((name) => ({ name, typeLevel: '1st' })),
    ];
    entries.slice(0, SPELLBOOK_SLOTS.length).forEach((entry, i) => {
      text[SPELLBOOK_SLOTS[i].name] = entry.name;
      text[SPELLBOOK_SLOTS[i].typeLevel] = entry.typeLevel;
    });
  }

  return { text, checks, dropdowns };
}

// Fetches the bundled blank sheet, fills in every field this app can
// compute, and returns the filled PDF as bytes ready for download. Missing
// fields are skipped with a console warning rather than thrown -- a future
// edit to the bundled PDF shouldn't hard-crash character creation.
//
// pdf-lib is dynamically imported here rather than statically at the top of
// this module: it's a large library only needed on the one click that
// triggers this function, and a static import pulled it into the main
// bundle for every visitor, growing it from ~450kB to ~880kB gzipped-JS
// terms aside -- this way it's a separate chunk, fetched only on demand.
export async function fillCharacterSheet(character, computed) {
  const [{ PDFDocument }, res] = await Promise.all([import('pdf-lib'), fetch(SHEET_URL)]);
  const bytes = await res.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  const { text, checks, dropdowns } = buildFieldValues(character, computed);

  Object.entries(text).forEach(([name, value]) => {
    try {
      form.getTextField(name).setText(value);
    } catch (e) {
      console.warn(`PDF field not found or not a text field: ${name}`, e);
    }
  });
  Object.entries(checks).forEach(([name, value]) => {
    try {
      const field = form.getCheckBox(name);
      if (value) field.check();
    } catch (e) {
      console.warn(`PDF field not found or not a checkbox: ${name}`, e);
    }
  });
  Object.entries(dropdowns).forEach(([name, value]) => {
    try {
      form.getDropdown(name).select(value);
    } catch (e) {
      console.warn(`PDF field not found or not a dropdown: ${name}`, e);
    }
  });

  return doc.save();
}
