import { SKILLS, getSkillRank } from '../data/skills';
import { CANTRIPS, SPELLS_RANK_1 } from '../data/spells';
import { getSubclassOption } from '../data/subclasses';
import { profBonus, getCurrentRank } from './leveling';

const SHEET_URL = `${import.meta.env.BASE_URL}pf2e-character-sheet.pdf`;

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
    level, ancestry, background, cls, heritage, weapon, armor, shieldPurchases,
    mods, hp, ac, armorProfRank, perceptionRank, perceptionMod, classDCRank, classDC,
    saveRanks, saves, spellAbility, spellDC, spellAttack,
  } = computed;

  const text = {};
  const checks = {};
  const ranks = {};
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
  text['LVL'] = String(level);
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
    ranks['AC_TEML'] = armorProfRank;
  }
  if (perceptionMod !== null) {
    text['PERCEPTION_TOTAL'] = signed(perceptionMod);
    ranks['PERCEPTION_TEML'] = perceptionRank;
  }
  if (classDC !== null) {
    text['CLASS DC_TOTAL'] = String(classDC);
    ranks['CLASS DC_TEML'] = classDCRank;
  }
  if (saves) {
    text['FORTITUDE_TOTAL'] = signed(saves.fort);
    text['REFLEX_TOTAL'] = signed(saves.ref);
    text['WILL_TOTAL'] = signed(saves.will);
    ranks['FORTITUDE_TEML'] = saveRanks.fort;
    ranks['REFLEX_TEML'] = saveRanks.ref;
    ranks['WILL_TEML'] = saveRanks.will;
  }

  // Armor/weapon proficiency -- everyone is at least Untrained (shown
  // unchecked) or Trained+ per the class's armorProficiency list and its
  // free-text weapons description. Unarmored is always at least Trained
  // under the remaster's Unarmored Defense progression. Armor ranks follow
  // the class's proficiencyProgression.armor table (same one armorProfRank
  // uses -- a class's Armor Expertise-style bump raises every category it's
  // already proficient in together, never grants a wholly new one, so
  // reusing armorProfRank's baseline here is correct, not a coincidence).
  // Weapon categories (Unarmed/Simple/Martial) don't have that per-category
  // rank data modeled yet -- only whether the class has ANY proficiency in
  // each, per its free-text `weapons` description -- so those stay pinned
  // at Trained-if-proficient rather than their real (possibly higher) rank;
  // a documented gap, not a regression from the fields this pass does fix.
  if (cls) {
    const armorRank = (base) => (base === 'untrained' ? 'untrained' : getCurrentRank(base, cls.proficiencyProgression?.armor, level));
    ranks['UNARMORED_TEML'] = armorRank('trained');
    ranks['LIGHT_TEML'] = armorRank((cls.armorProficiency || []).includes('light') ? 'trained' : 'untrained');
    ranks['MEDIUM_TEML'] = armorRank((cls.armorProficiency || []).includes('medium') ? 'trained' : 'untrained');
    ranks['HEAVY_TEML'] = armorRank((cls.armorProficiency || []).includes('heavy') ? 'trained' : 'untrained');
    const w = (cls.weapons || '').toLowerCase();
    ranks['UNARMED_TEML'] = w.includes('unarmed') ? 'trained' : 'untrained';
    ranks['SIMPLE_TEML'] = w.includes('simple') ? 'trained' : 'untrained';
    ranks['MARTIAL_TEML'] = w.includes('martial') ? 'trained' : 'untrained';
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

  // Skills: every skill gets a total (untrained = ability mod alone), and
  // an untrained one gets no rank box selected at all. A skill increase
  // (see leveling.js) changes both the total AND which of the four T/E/M/L
  // boxes gets selected now that ranks[] drives that instead of a flat
  // trained/not-trained checkbox.
  if (mods && cls) {
    SKILLS.forEach((s) => {
      const prefix = SKILL_FIELD_PREFIX[s.id];
      if (!prefix) return;
      const rank = getSkillRank(character, cls, ancestry, background, s.id);
      const isTrained = rank !== 'untrained';
      const total = mods[s.ability] + (isTrained ? profBonus(rank, level) : 0);
      text[`${prefix}_TOTAL`] = signed(total);
      ranks[`${SKILL_TEML_PREFIX[s.id]}_TEML`] = rank;
    });
    if (background) {
      text['LORE_1'] = background.lore;
      text['LORE 1_TOTAL'] = signed(mods.int + profBonus('trained', level));
      ranks['LORE 1_TEML'] = 'trained';
    }
  }

  // Spellcasting (page 3): tradition checkbox, spell DC/attack, and every
  // known cantrip/1st-rank spell into the spellbook table, cantrips first.
  if (spellAbility) {
    // Same fallback chain as SpellsStep.jsx/SummaryStep.jsx: a subclass's
    // Bloodline/Patron sets the tradition directly for every option except
    // the Draconic bloodline, whose manual character.spellTradition picker
    // is the last resort.
    const subOption = getSubclassOption(cls.id, character.subclassChoice);
    const traditionCode = cls.spellcasting.traditionCode || subOption?.tradition || character.spellTradition;
    if (traditionCode && TRADITION_CHECKBOX[traditionCode]) checks[TRADITION_CHECKBOX[traditionCode]] = true;
    text['SDC1_TOTAL'] = String(spellDC);
    text['SATK1_TOTAL'] = signed(spellAttack);
    ranks['SDC1_TEML'] = 'trained';
    ranks['SATK1_TEML'] = 'trained';
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

  return { text, checks, ranks, dropdowns };
}

// Every "_TEML" field on this PDF (skills, saves, Perception, Class DC,
// Lore, spell DC/attack, and every armor/weapon proficiency box) LOOKS like
// a single checkbox but is actually one field with 4 separate widgets --
// one per rank -- each with its own on-value (either "2/4/6/8", matching
// the proficiency-rank bonus table, or literal "T/E/M/L" depending on the
// field). Confirmed by inspecting the bundled PDF's AcroForm directly (see
// PROJECT_NOTES.md's PDF section): `form.getCheckBox(name).check()` with no
// argument always selects the FIRST widget regardless of rank -- which is
// why every rank used to render as "Trained" no matter what it actually
// was. Selecting by each widget's on-value would require knowing which
// convention (2/4/6/8 vs T/E/M/L) a given field uses, so `fillCharacterSheet`
// below instead sorts the widgets left-to-right (their natural T/E/M/L
// reading order on the page) and picks by that position -- works for either
// convention, and for any bundled-PDF edit that might reorder or rename the
// on-values later.
const RANK_TO_INDEX = { trained: 0, expert: 1, master: 2, legendary: 3 };

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
  const [{ PDFDocument, PDFName }, res] = await Promise.all([import('pdf-lib'), fetch(SHEET_URL)]);
  const bytes = await res.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  const { text, checks, ranks, dropdowns } = buildFieldValues(character, computed);

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
  Object.entries(ranks).forEach(([name, rank]) => {
    try {
      const field = form.getCheckBox(name);
      const widgets = [...field.acroField.getWidgets()].sort((a, b) => a.getRectangle().x - b.getRectangle().x);
      const targetIndex = RANK_TO_INDEX[rank]; // undefined for 'untrained' -- every widget goes Off below
      let selectedOn = null;
      widgets.forEach((w, i) => {
        if (i === targetIndex) {
          selectedOn = w.getOnValue();
          w.dict.set(PDFName.of('AS'), selectedOn);
        } else {
          w.dict.set(PDFName.of('AS'), PDFName.of('Off'));
        }
      });
      field.acroField.dict.set(PDFName.of('V'), selectedOn ?? PDFName.of('Off'));
    } catch (e) {
      console.warn(`PDF field not found or not a 4-rank checkbox: ${name}`, e);
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
