import { useMemo } from 'react';
import { getAncestry } from '../../data/ancestries';
import { ABILITIES, abilityMod } from '../../data/skills';
import { boostScore, computeScoresBeforeFreeBoosts } from '../../utils/abilityScores';
import { AbilityTerm } from '../../context/InspectContext';

export default function AbilityScoresStep({ character, update }) {
  const ancestry = getAncestry(character.ancestryId);

  const preFreeScores = useMemo(
    () => computeScoresBeforeFreeBoosts(character, ancestry),
    [ancestry, character.ancestryFreeBoosts, character.useAlternateAncestryBoosts, character.backgroundChosenBoost, character.backgroundFreeBoost, character.classKeyAbility]
  );

  const finalScores = useMemo(() => {
    let scores = { ...preFreeScores };
    character.freeBoosts.forEach((a) => {
      scores = boostScore(scores, a);
    });
    return scores;
  }, [preFreeScores, character.freeBoosts]);

  function toggleFreeBoost(ability) {
    const current = character.freeBoosts;
    if (current.includes(ability)) {
      update({ freeBoosts: current.filter((a) => a !== ability) });
    } else if (current.length < 4) {
      update({ freeBoosts: [...current, ability] });
    }
  }

  return (
    <div className="step">
      <h2>Ability Scores</h2>
      <p className="hint">
        These apply in order: ancestry boosts, ancestry flaw, background boosts, class boost, and finally 4 free
        boosts of your choice (you can't repeat an ability score in this last step).
      </p>

      <section className="sub-section">
        <h3>Before free boosts</h3>
        <div className="ability-grid">
          {ABILITIES.map((a) => (
            <div key={a} className="ability-box">
              <span className="ability-label"><AbilityTerm code={a} /></span>
              <span className="ability-score">{preFreeScores[a]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sub-section">
        <h3>4 Free Boosts</h3>
        <p className="hint">Choose 4 different ability scores to each receive an additional boost.</p>
        <div className="chip-row">
          {ABILITIES.map((a) => (
            <button
              key={a}
              className={`chip ${character.freeBoosts.includes(a) ? 'selected' : ''}`}
              onClick={() => toggleFreeBoost(a)}
              disabled={!character.freeBoosts.includes(a) && character.freeBoosts.length >= 4}
            >
              <AbilityTerm code={a} />
            </button>
          ))}
        </div>
      </section>

      <section className="sub-section">
        <h3>Final Scores (level 1)</h3>
        <div className="ability-grid">
          {ABILITIES.map((a) => (
            <div key={a} className="ability-box final">
              <span className="ability-label"><AbilityTerm code={a} /></span>
              <span className="ability-score">{finalScores[a]}</span>
              <span className="ability-mod">
                {abilityMod(finalScores[a]) >= 0 ? '+' : ''}
                {abilityMod(finalScores[a])}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
