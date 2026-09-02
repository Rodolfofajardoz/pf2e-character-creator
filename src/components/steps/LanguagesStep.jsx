import { useMemo } from 'react';
import { getAncestry } from '../../data/ancestries';
import { abilityMod } from '../../data/skills';
import { computeFinalScores } from '../../utils/abilityScores';
import { COMMON_LANGUAGES, UNCOMMON_LANGUAGES } from '../../data/languages';

// Human's own AoN entry grants "1 + your Intelligence modifier" bonus
// languages, not just the Intelligence modifier like every other ancestry —
// so it always gets at least 1 bonus language, even at Intelligence 10.
export function getBonusLanguageCount(ancestry, intMod) {
  if (!ancestry) return 0;
  const base = ancestry.id === 'human' ? 1 : 0;
  return base + Math.max(0, intMod);
}

export default function LanguagesStep({ character, update }) {
  const ancestry = getAncestry(character.ancestryId);

  const finalScores = useMemo(() => computeFinalScores(character, ancestry), [character, ancestry]);
  const intMod = abilityMod(finalScores.int);
  const bonusCount = getBonusLanguageCount(ancestry, intMod);

  // Pool: this ancestry's specific bonus list (from its AoN entry) plus the
  // general common AND uncommon tables, deduped, minus anything already
  // known automatically. Uncommon ones stay in the pool (shown, not hidden)
  // but flagged -- picking one here is a placeholder for "ask your GM", the
  // same trust-the-player spirit already used for unenforced feat
  // prerequisites.
  const pool = useMemo(() => {
    const known = new Set(ancestry.languages);
    const all = new Set([...ancestry.bonusLanguages, ...COMMON_LANGUAGES, ...UNCOMMON_LANGUAGES]);
    return Array.from(all)
      .filter((l) => !known.has(l))
      .sort();
  }, [ancestry]);

  function toggle(lang) {
    const current = character.bonusLanguages;
    if (current.includes(lang)) {
      update({ bonusLanguages: current.filter((l) => l !== lang) });
    } else if (current.length < bonusCount) {
      update({ bonusLanguages: [...current, lang] });
    }
  }

  if (bonusCount === 0) {
    return (
      <div className="step">
        <h2>Languages</h2>
        <p className="hint">
          You automatically know: <strong>{ancestry.languages.join(', ')}</strong>.
        </p>
        <p className="hint">
          A positive Intelligence modifier grants bonus languages — yours is{' '}
          {intMod >= 0 ? `+${intMod}` : intMod}, so you don't gain any extra languages at 1st
          level.
        </p>
      </div>
    );
  }

  return (
    <div className="step">
      <h2>Languages</h2>
      <p className="hint">
        You automatically know: <strong>{ancestry.languages.join(', ')}</strong>. Your
        Intelligence modifier ({intMod >= 0 ? `+${intMod}` : intMod}){ancestry.id === 'human' ? ' + 1 (Human)' : ''} grants{' '}
        <strong>{bonusCount}</strong> bonus language{bonusCount === 1 ? '' : 's'} — choose from
        your ancestry's list and the languages common throughout the region below.
      </p>

      <section className="sub-section">
        <h3>
          Bonus languages ({character.bonusLanguages.length}/{bonusCount})
        </h3>
        <div className="card-grid">
          {pool.map((lang) => {
            const uncommon = !COMMON_LANGUAGES.includes(lang);
            const selected = character.bonusLanguages.includes(lang);
            return (
              <button
                key={lang}
                className={`option-card small ${selected ? 'selected' : ''}`}
                onClick={() => toggle(lang)}
                disabled={!selected && character.bonusLanguages.length >= bonusCount}
              >
                <h4>{lang}</h4>
                {uncommon && <p className="option-warning">⚠ Uncommon — needs your GM's approval</p>}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
