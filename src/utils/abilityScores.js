import { ABILITIES } from '../data/skills';

// Remastered Player Core "boost" system:
// - All abilities start at 10.
// - Boosting a score below 18 gives +2; boosting a score at 18+ gives +1.
// - Application order: ancestry -> background -> class -> 4 free boosts.
export function boostScore(scores, ability) {
  const next = { ...scores };
  next[ability] += next[ability] >= 18 ? 1 : 2;
  return next;
}

export function applyFlaw(scores, ability) {
  const next = { ...scores };
  next[ability] -= 2;
  return next;
}

export function baseScores() {
  return ABILITIES.reduce((acc, a) => ({ ...acc, [a]: 10 }), {});
}

export function applyBoosts(scores, abilityList) {
  return abilityList.reduce((acc, ability) => boostScore(acc, ability), scores);
}

export function computeScoresBeforeFreeBoosts(character, ancestry) {
  let scores = baseScores();
  // Alternate Ancestry Boosts (Player Core pg. 23): replaces the ancestry's
  // listed boosts and flaw entirely with two fully free boosts — so unlike
  // the normal path, ancestry.boosts.fixed and ancestry.flaw are skipped.
  if (!character.useAlternateAncestryBoosts) {
    ancestry.boosts.fixed.forEach((a) => {
      scores = boostScore(scores, a);
    });
  }
  character.ancestryFreeBoosts.forEach((a) => {
    scores = boostScore(scores, a);
  });
  if (ancestry.flaw && !character.useAlternateAncestryBoosts) scores = applyFlaw(scores, ancestry.flaw);
  if (character.backgroundChosenBoost) scores = boostScore(scores, character.backgroundChosenBoost);
  if (character.backgroundFreeBoost) scores = boostScore(scores, character.backgroundFreeBoost);
  if (character.classKeyAbility) scores = boostScore(scores, character.classKeyAbility);
  return scores;
}

export function computeFinalScores(character, ancestry) {
  let scores = computeScoresBeforeFreeBoosts(character, ancestry);
  character.freeBoosts.forEach((a) => {
    scores = boostScore(scores, a);
  });
  return scores;
}
