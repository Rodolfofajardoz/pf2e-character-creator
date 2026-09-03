import { useEffect, useRef } from 'react';
import { ANCESTRIES, getAncestry } from '../../data/ancestries';
import { ABILITIES, SKILLS } from '../../data/skills';
import { GENERAL_FEATS } from '../../data/generalFeats';
import { InspectText, GlossaryTerm, AbilityTerm, AbilityTermList } from '../../context/InspectContext';
import { scrollIntoViewCentered } from '../../utils/scrollFocus';

export default function AncestryStep({ character, update }) {
  const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
  const heritage = ancestry?.heritages.find((h) => h.id === character.heritageId);
  const needsGeneralFeat = Boolean(heritage?.grantsGeneralFeat || character.ancestryFeat?.grantsGeneralFeat);
  const needsHeritageSkill = Boolean(heritage?.grantsSkillChoice);
  const needsFeatSkill = Boolean(character.ancestryFeat?.grantsSkillChoice);

  const boostsRef = useRef(null);
  const heritageRef = useRef(null);
  const heritageSkillRef = useRef(null);
  const featRef = useRef(null);
  const featSkillRef = useRef(null);
  const generalFeatRef = useRef(null);

  // The next sub-section still missing a choice, in reading order — the
  // player is guided to it automatically instead of having to scroll and
  // hunt for what just unlocked. Only advances when a requirement flips
  // from unmet to met, so it doesn't re-scroll on every click within the
  // same section.
  const focusKey = !ancestry
    ? null
    : ancestry.boosts.free > 0 && character.ancestryFreeBoosts.length < ancestry.boosts.free
    ? 'boosts'
    : !character.heritageId
    ? 'heritage'
    : needsHeritageSkill && character.heritageSkillChoices.length < heritage.grantsSkillChoice
    ? 'heritageSkill'
    : !character.ancestryFeat
    ? 'feat'
    : needsFeatSkill && character.ancestryFeatSkillChoices.length < character.ancestryFeat.grantsSkillChoice
    ? 'featSkill'
    : needsGeneralFeat && !character.generalFeatChoice
    ? 'generalFeat'
    : null;

  useEffect(() => {
    const refs = {
      boosts: boostsRef,
      heritage: heritageRef,
      heritageSkill: heritageSkillRef,
      feat: featRef,
      featSkill: featSkillRef,
      generalFeat: generalFeatRef,
    };
    if (focusKey) scrollIntoViewCentered(refs[focusKey]);
  }, [focusKey]);

  // Re-clicking the ancestry you already have is a no-op, not a reset. The
  // card stays enabled once selected (so it still reads as the active
  // choice), which without this guard made a second click silently wipe
  // heritage, feat and boosts.
  function selectAncestry(id) {
    if (id === character.ancestryId) return;
    update({
      ancestryId: id,
      heritageId: null,
      ancestryFeat: null,
      ancestryFreeBoosts: [],
      useAlternateAncestryBoosts: false,
      generalFeatChoice: null,
      // Natural Ambition's bonus class feat is granted by the ancestry
      // feat, so it can't outlive the ancestry that offered it.
      bonusClassFeat: null,
      // heritageSkillChoices/ancestryFeatSkillChoices and trainedSkills all
      // go with it too: a different ancestry may not offer a skill-granting
      // heritage/feat at all, and even a same-named one's picks shouldn't
      // survive changing what ancestry (and thus what else is trained) they
      // apply on top of -- same reasoning selectClass already uses below.
      heritageSkillChoices: [],
      ancestryFeatSkillChoices: [],
      bonusLanguages: [],
      trainedSkills: [],
    });
  }

  function selectHeritage(id) {
    if (id === character.heritageId) return;
    update({ heritageId: id, generalFeatChoice: null, heritageSkillChoices: [], trainedSkills: [] });
  }

  // The bonus class feat exists only while an ancestry feat that grants one
  // (Natural Ambition) is the active choice. Switching to any other feat
  // takes the grant away, so the pick it produced goes with it -- otherwise
  // it survives to the summary sheet as a feat with no source.
  function selectAncestryFeat(feat) {
    if (feat.name === character.ancestryFeat?.name) return;
    update({
      ancestryFeat: feat,
      generalFeatChoice: null,
      bonusClassFeat: feat.grantsClassFeat ? character.bonusClassFeat : null,
      ancestryFeatSkillChoices: [],
      trainedSkills: [],
    });
  }

  function toggleHeritageSkill(id) {
    const current = character.heritageSkillChoices;
    if (current.includes(id)) {
      update({ heritageSkillChoices: current.filter((s) => s !== id) });
    } else if (current.length < heritage.grantsSkillChoice) {
      update({ heritageSkillChoices: [...current, id] });
    }
  }

  function toggleFeatSkill(id) {
    const current = character.ancestryFeatSkillChoices;
    if (current.includes(id)) {
      update({ ancestryFeatSkillChoices: current.filter((s) => s !== id) });
    } else if (current.length < character.ancestryFeat.grantsSkillChoice) {
      update({ ancestryFeatSkillChoices: [...current, id] });
    }
  }

  // Player Core's "Alternate Ancestry Boosts" (pg. 23): always available,
  // not an optional/GM-approval rule like voluntary flaws — replaces the
  // ancestry's listed boosts and flaw entirely with two fully free boosts.
  const boostMax = character.useAlternateAncestryBoosts ? 2 : ancestry?.boosts.free;
  const boostFixedList = character.useAlternateAncestryBoosts ? [] : ancestry?.boosts.fixed;

  function toggleAlternateBoosts() {
    update({ useAlternateAncestryBoosts: !character.useAlternateAncestryBoosts, ancestryFreeBoosts: [] });
  }

  function toggleFreeBoost(ability) {
    const current = character.ancestryFreeBoosts;
    if (current.includes(ability)) {
      update({ ancestryFreeBoosts: current.filter((a) => a !== ability) });
    } else if (current.length < boostMax) {
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
            <p className="option-desc"><InspectText text={a.description} /></p>
            <p className="option-meta">
              <GlossaryTerm id="hit-points">HP</GlossaryTerm> {a.hp} · {a.size} · <GlossaryTerm id="speed">Speed</GlossaryTerm> {a.speed} feet
            </p>
            <p className="option-meta">
              Boosts: <AbilityTermList codes={a.boosts.fixed} />
              {a.boosts.free > 0 ? ` + ${a.boosts.free} free` : ''}
              {a.flaw ? (
                <>
                  {' '}
                  · Flaw: <AbilityTerm code={a.flaw} />
                </>
              ) : (
                ' · No flaw'
              )}
            </p>
          </button>
        ))}
      </div>

      {ancestry && (
        <div key={ancestry.id} className="reveal-group">
          {ancestry.boosts.free > 0 && (
            <section className="sub-section" ref={boostsRef}>
              <h3>Free Ancestry Boost(s)</h3>
              <label className="option-toggle">
                <input
                  type="checkbox"
                  checked={character.useAlternateAncestryBoosts}
                  onChange={toggleAlternateBoosts}
                />
                Use <GlossaryTerm id="alternate-ancestry-boosts">Alternate Ancestry Boosts</GlossaryTerm> instead
                (two fully free boosts, replacing {ancestry.name}'s usual pattern and flaw entirely)
              </label>
              <p className="hint">
                {character.useAlternateAncestryBoosts ? (
                  'Choose 2 ability scores — any combination.'
                ) : (
                  <>
                    Choose {ancestry.boosts.free} ability score(s) other than the fixed ones (
                    <AbilityTermList codes={ancestry.boosts.fixed} empty="none" />).
                  </>
                )}
              </p>
              <div className="chip-row">
                {ABILITIES.filter((ab) => !boostFixedList.includes(ab)).map((ab) => (
                  <button
                    key={ab}
                    className={`chip ${character.ancestryFreeBoosts.includes(ab) ? 'selected' : ''}`}
                    onClick={() => toggleFreeBoost(ab)}
                    disabled={!character.ancestryFreeBoosts.includes(ab) && character.ancestryFreeBoosts.length >= boostMax}
                  >
                    <AbilityTerm code={ab} />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section" ref={heritageRef}>
            <h3>Heritage</h3>
            <div className="card-grid">
              {ancestry.heritages.map((h) => (
                <button
                  key={h.id}
                  className={`option-card small ${character.heritageId === h.id ? 'selected' : ''}`}
                  onClick={() => selectHeritage(h.id)}
                >
                  <h4>{h.name}</h4>
                  <p className="option-desc"><InspectText text={h.desc} /></p>
                </button>
              ))}
            </div>
          </section>

          {needsHeritageSkill && (
            <section className="sub-section" ref={heritageSkillRef}>
              <h3>Choose {heritage.name}'s skill{heritage.grantsSkillChoice > 1 ? 's' : ''}</h3>
              <p className="hint">
                {heritage.name} trains you in {heritage.grantsSkillChoice} skill{heritage.grantsSkillChoice > 1 ? 's' : ''} of your choice.
              </p>
              <div className="chip-row">
                {SKILLS.filter((s) => !character.ancestryFeatSkillChoices.includes(s.id)).map((s) => (
                  <button
                    key={s.id}
                    className={`chip ${character.heritageSkillChoices.includes(s.id) ? 'selected' : ''}`}
                    onClick={() => toggleHeritageSkill(s.id)}
                    disabled={
                      !character.heritageSkillChoices.includes(s.id) &&
                      character.heritageSkillChoices.length >= heritage.grantsSkillChoice
                    }
                  >
                    <GlossaryTerm id={s.id}>{s.name}</GlossaryTerm>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section" ref={featRef}>
            <h3>Ancestry Feat (1st level)</h3>
            <div className="card-grid">
              {ancestry.feats1.map((f) => (
                <button
                  key={f.name}
                  className={`option-card small ${character.ancestryFeat?.name === f.name ? 'selected' : ''}`}
                  onClick={() => selectAncestryFeat(f)}
                >
                  <h4>{f.name}</h4>
                  <p className="option-desc"><InspectText text={f.desc} /></p>
                </button>
              ))}
            </div>
          </section>

          {needsFeatSkill && (
            <section className="sub-section" ref={featSkillRef}>
              <h3>Choose {character.ancestryFeat.name}'s skill{character.ancestryFeat.grantsSkillChoice > 1 ? 's' : ''}</h3>
              <p className="hint">
                {character.ancestryFeat.name} trains you in {character.ancestryFeat.grantsSkillChoice} skill
                {character.ancestryFeat.grantsSkillChoice > 1 ? 's' : ''} of your choice.
              </p>
              <div className="chip-row">
                {SKILLS.filter((s) => !character.heritageSkillChoices.includes(s.id)).map((s) => (
                  <button
                    key={s.id}
                    className={`chip ${character.ancestryFeatSkillChoices.includes(s.id) ? 'selected' : ''}`}
                    onClick={() => toggleFeatSkill(s.id)}
                    disabled={
                      !character.ancestryFeatSkillChoices.includes(s.id) &&
                      character.ancestryFeatSkillChoices.length >= character.ancestryFeat.grantsSkillChoice
                    }
                  >
                    <GlossaryTerm id={s.id}>{s.name}</GlossaryTerm>
                  </button>
                ))}
              </div>
            </section>
          )}

          {needsGeneralFeat && (
            <section className="sub-section" ref={generalFeatRef}>
              <h3>Choose a General Feat</h3>
              <p className="hint">
                {heritage?.grantsGeneralFeat ? heritage.name : character.ancestryFeat.name} lets you pick any
                general feat you qualify for. Prerequisites are shown for reference but not enforced here.
              </p>
              <div className="card-grid">
                {GENERAL_FEATS.map((f) => (
                  <button
                    key={f.id}
                    className={`option-card small ${character.generalFeatChoice?.id === f.id ? 'selected' : ''}`}
                    onClick={() => update({ generalFeatChoice: f })}
                  >
                    <h4>{f.name}</h4>
                    {f.prereq && <p className="option-meta">Prerequisite: {f.prereq}</p>}
                    <p className="option-desc"><InspectText text={f.desc} /></p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="sub-section">
            <h3>Languages and senses</h3>
            <p>Languages: {ancestry.languages.join(', ')}</p>
            <p>Senses: {ancestry.senses.join(', ') || 'None special'}</p>
          </section>

          {ancestry.abilities?.length > 0 && (
            <section className="sub-section">
              <h3>Innate Abilities</h3>
              {ancestry.abilities.map((ab) => (
                <p key={ab.name}>
                  <strong>{ab.name}:</strong> <InspectText text={ab.desc} />
                </p>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
