import { ANCESTRIES, getAncestry } from '../../data/ancestries';
import { ABILITY_LABELS, ABILITIES } from '../../data/skills';

export default function AncestryStep({ character, update }) {
  const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;

  function selectAncestry(id) {
    update({
      ancestryId: id,
      heritageId: null,
      ancestryFeat: null,
      ancestryFreeBoosts: [],
    });
  }

  function toggleFreeBoost(ability) {
    const current = character.ancestryFreeBoosts;
    const max = ancestry.boosts.free;
    if (current.includes(ability)) {
      update({ ancestryFreeBoosts: current.filter((a) => a !== ability) });
    } else if (current.length < max) {
      update({ ancestryFreeBoosts: [...current, ability] });
    }
  }

  return (
    <div className="step">
      <h2>Choose your Ancestry</h2>
      <p className="hint">Your ancestry sets your heritage, size, Speed, and base ability boosts.</p>

      <div className="card-grid">
        {ANCESTRIES.map((a) => (
          <button
            key={a.id}
            className={`option-card ${character.ancestryId === a.id ? 'selected' : ''}`}
            onClick={() => selectAncestry(a.id)}
          >
            <h3>{a.name}</h3>
            <p className="option-desc">{a.description}</p>
            <p className="option-meta">
              HP {a.hp} · {a.size} · Speed {a.speed} feet
            </p>
            <p className="option-meta">
              Boosts: {a.boosts.fixed.map((b) => ABILITY_LABELS[b]).join(', ') || '—'}
              {a.boosts.free > 0 ? ` + ${a.boosts.free} free` : ''}
              {a.flaw ? ` · Flaw: ${ABILITY_LABELS[a.flaw]}` : ' · No flaw'}
            </p>
          </button>
        ))}
      </div>

      {ancestry && (
        <>
          {ancestry.boosts.free > 0 && (
            <section className="sub-section">
              <h3>Free Ancestry Boost(s)</h3>
              <p className="hint">
                Choose {ancestry.boosts.free} ability score(s) other than the fixed ones ({ancestry.boosts.fixed.map((b) => ABILITY_LABELS[b]).join(', ') || 'none'}).
              </p>
              <div className="chip-row">
                {ABILITIES.filter((ab) => !ancestry.boosts.fixed.includes(ab)).map((ab) => (
                  <button
                    key={ab}
                    className={`chip ${character.ancestryFreeBoosts.includes(ab) ? 'selected' : ''}`}
                    onClick={() => toggleFreeBoost(ab)}
                    disabled={!character.ancestryFreeBoosts.includes(ab) && character.ancestryFreeBoosts.length >= ancestry.boosts.free}
                  >
                    {ABILITY_LABELS[ab]}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section">
            <h3>Heritage</h3>
            <div className="card-grid">
              {ancestry.heritages.map((h) => (
                <button
                  key={h.id}
                  className={`option-card small ${character.heritageId === h.id ? 'selected' : ''}`}
                  onClick={() => update({ heritageId: h.id })}
                >
                  <h4>{h.name}</h4>
                  <p className="option-desc">{h.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="sub-section">
            <h3>Ancestry Feat (1st level)</h3>
            <div className="card-grid">
              {ancestry.feats1.map((f) => (
                <button
                  key={f.name}
                  className={`option-card small ${character.ancestryFeat?.name === f.name ? 'selected' : ''}`}
                  onClick={() => update({ ancestryFeat: f })}
                >
                  <h4>{f.name}</h4>
                  <p className="option-desc">{f.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="sub-section">
            <h3>Languages and senses</h3>
            <p>Languages: {ancestry.languages.join(', ')}</p>
            <p>Senses: {ancestry.senses.join(', ') || 'None special'}</p>
          </section>
        </>
      )}
    </div>
  );
}
