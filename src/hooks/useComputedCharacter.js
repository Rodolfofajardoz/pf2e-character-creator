import { useMemo } from 'react';
import { getAncestry } from '../data/ancestries';
import { getEffectiveBackground } from '../data/backgrounds';
import { getClass } from '../data/classes';
import { abilityMod, getBackgroundSkillInfo } from '../data/skills';
import { computeFinalScores } from '../utils/abilityScores';
import { computeTotalHP, getCurrentRank, profBonus } from '../utils/leveling';
import { WEAPONS, ARMORS, SHIELDS, AMMUNITION, GEAR, groupPurchases, totalSpent, STARTING_GOLD } from '../data/equipment';

// Every derived stat SummaryStep and the live preview panel both need,
// computed once from raw `character` state. Ancestry/background/class are
// looked up lazily as their id gets picked, so this is safe to call from
// step 1 onward — fields that depend on a choice not made yet come back
// null rather than throwing, and callers render a placeholder for those.
export function useComputedCharacter(character) {
  return useMemo(() => {
    const level = character.level || 1;
    const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
    const background = character.backgroundId ? getEffectiveBackground(character) : null;
    const cls = character.classId ? getClass(character.classId) : null;
    const heritage = ancestry?.heritages.find((h) => h.id === character.heritageId) || null;

    const backgroundSkillId =
      cls && background ? getBackgroundSkillInfo(character, cls, background).effectiveId : null;

    // Buying is unrestricted (a shop sells you as many weapons/armor as
    // you can afford, and however many of each — see equipment.js's
    // addOne/removeOne/groupPurchases), but AC/Strike math still needs
    // exactly one worn armor and one wielded weapon. Simplification until
    // a real equip system exists: the first one purchased is treated as
    // equipped for calculations, while `weaponPurchases`/`armorPurchases`
    // (grouped, with quantities) list everything actually owned.
    const weaponPurchases = groupPurchases(character.weaponIds, WEAPONS);
    const armorPurchases = groupPurchases(character.armorIds, ARMORS);
    const shieldPurchases = groupPurchases(character.shieldIds, SHIELDS);
    const ammoPurchases = groupPurchases(character.ammoIds, AMMUNITION);
    const gearPurchases = groupPurchases(character.gearIds, GEAR);
    const weapon = weaponPurchases[0]?.item || null;
    const armor = armorPurchases[0]?.item || ARMORS[0];

    const goldSpent =
      totalSpent(character.weaponIds, WEAPONS) +
      totalSpent(character.armorIds, ARMORS) +
      totalSpent(character.shieldIds, SHIELDS) +
      totalSpent(character.ammoIds, AMMUNITION) +
      totalSpent(character.gearIds, GEAR);
    const goldRemaining = STARTING_GOLD - goldSpent;

    const scores = ancestry ? computeFinalScores(character, ancestry) : null;
    const mods = scores ? Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, abilityMod(v)])) : null;

    const hp = ancestry && cls && mods ? computeTotalHP(character, ancestry, cls) : null;

    let ac = null;
    let armorProfRank = null;
    let isProficientInArmor = null;
    if (cls && mods) {
      const dexCap = armor.dexCap === null ? Infinity : armor.dexCap;
      isProficientInArmor = armor.category === 'none' || (cls.armorProficiency || []).includes(armor.category);
      const baseArmorRank = armor.category === 'none' ? cls.unarmoredProficiency || 'trained' : isProficientInArmor ? 'trained' : 'untrained';
      // Only a rank the character actually has advances with level -- an
      // armor category they're untrained in stays untrained regardless of
      // cls.proficiencyProgression.armor (that table only ever bumps a rank
      // the class already has, never grants a wholly new proficiency).
      armorProfRank = baseArmorRank === 'untrained' ? 'untrained' : getCurrentRank(baseArmorRank, cls.proficiencyProgression?.armor, level);
      ac = 10 + Math.min(mods.dex, dexCap) + armor.acBonus + profBonus(armorProfRank, level);
    }

    const perceptionRank = cls ? getCurrentRank(cls.perception, cls.proficiencyProgression?.perception, level) : null;
    const perceptionMod = cls && mods ? mods.wis + profBonus(perceptionRank, level) : null;

    const classDCAbility = character.classKeyAbility;
    const classDCRank = cls ? getCurrentRank(cls.classDC, cls.proficiencyProgression?.classDC, level) : null;
    const classDC = cls && mods && classDCAbility ? 10 + profBonus(classDCRank, level) + mods[classDCAbility] : null;

    const saveRanks = cls
      ? {
          fort: getCurrentRank(cls.saves.fort, cls.proficiencyProgression?.saves?.fort, level),
          ref: getCurrentRank(cls.saves.ref, cls.proficiencyProgression?.saves?.ref, level),
          will: getCurrentRank(cls.saves.will, cls.proficiencyProgression?.saves?.will, level),
        }
      : null;
    const saves =
      cls && mods
        ? {
            fort: mods.con + profBonus(saveRanks.fort, level),
            ref: mods.dex + profBonus(saveRanks.ref, level),
            will: mods.wis + profBonus(saveRanks.will, level),
          }
        : null;

    // Spellcasting proficiency progression (e.g. a Wizard reaching Expert)
    // isn't modeled yet -- every caster is treated as Trained regardless of
    // level, same simplification the level-1 build already made (no class
    // has a higher STARTING rank). Fighter doesn't cast, so this doesn't
    // affect the pilot; it's a known gap for whichever caster class's
    // Level-Up data comes next.
    const spellAbility = cls?.spellcasting?.cantripsKnown ? character.classKeyAbility : null;
    const spellDC = spellAbility && mods ? 10 + profBonus('trained', level) + mods[spellAbility] : null;
    const spellAttack = spellAbility && mods ? profBonus('trained', level) + mods[spellAbility] : null;

    return {
      level,
      ancestry,
      background,
      cls,
      heritage,
      backgroundSkillId,
      weapon,
      armor,
      weaponPurchases,
      armorPurchases,
      shieldPurchases,
      ammoPurchases,
      gearPurchases,
      goldSpent,
      goldRemaining,
      scores,
      mods,
      hp,
      ac,
      armorProfRank,
      isProficientInArmor,
      perceptionRank,
      perceptionMod,
      spellAbility,
      spellDC,
      spellAttack,
      classDCAbility,
      classDCRank,
      classDC,
      saveRanks,
      saves,
    };
  }, [character]);
}
