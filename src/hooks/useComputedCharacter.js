import { useMemo } from 'react';
import { getAncestry } from '../data/ancestries';
import { getBackground } from '../data/backgrounds';
import { getClass } from '../data/classes';
import { abilityMod, getBackgroundSkillInfo, PROFICIENCY_RANKS } from '../data/skills';
import { computeFinalScores } from '../utils/abilityScores';
import { WEAPONS, ARMORS, SHIELDS, AMMUNITION, GEAR, groupPurchases, totalSpent, STARTING_GOLD } from '../data/equipment';

const LEVEL = 1;

function profBonus(rank) {
  return PROFICIENCY_RANKS[rank].bonus(LEVEL);
}

// Every derived stat SummaryStep and the live preview panel both need,
// computed once from raw `character` state. Ancestry/background/class are
// looked up lazily as their id gets picked, so this is safe to call from
// step 1 onward — fields that depend on a choice not made yet come back
// null rather than throwing, and callers render a placeholder for those.
export function useComputedCharacter(character) {
  return useMemo(() => {
    const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
    const background = character.backgroundId ? getBackground(character.backgroundId) : null;
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

    const hp = ancestry && cls && mods ? ancestry.hp + cls.hp + mods.con : null;

    let ac = null;
    let armorProfRank = null;
    let isProficientInArmor = null;
    if (cls && mods) {
      const dexCap = armor.dexCap === null ? Infinity : armor.dexCap;
      isProficientInArmor = armor.category === 'none' || (cls.armorProficiency || []).includes(armor.category);
      armorProfRank = armor.category === 'none' ? cls.unarmoredProficiency || 'trained' : isProficientInArmor ? 'trained' : 'untrained';
      ac = 10 + Math.min(mods.dex, dexCap) + armor.acBonus + profBonus(armorProfRank);
    }

    const perceptionMod = cls && mods ? mods.wis + profBonus(cls.perception) : null;

    const classDCAbility = character.classKeyAbility;
    const classDC = cls && mods && classDCAbility ? 10 + profBonus(cls.classDC) + mods[classDCAbility] : null;

    const saves =
      cls && mods
        ? {
            fort: mods.con + profBonus(cls.saves.fort),
            ref: mods.dex + profBonus(cls.saves.ref),
            will: mods.wis + profBonus(cls.saves.will),
          }
        : null;

    return {
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
      perceptionMod,
      classDCAbility,
      classDC,
      saves,
    };
  }, [character]);
}
