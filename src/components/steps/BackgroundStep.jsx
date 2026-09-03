import { useEffect, useRef, useState } from 'react';
import { BACKGROUNDS, getEffectiveBackground } from '../../data/backgrounds';
import { GENERAL_FEATS } from '../../data/generalFeats';
import { ABILITIES, SKILLS } from '../../data/skills';
import { InspectText, GlossaryTerm, AbilityTerm } from '../../context/InspectContext';
import { scrollIntoViewCentered } from '../../utils/scrollFocus';

// Skill feats -- the ones a background could plausibly grant -- are exactly
// the GENERAL_FEATS entries whose prereq is "Trained in X". A custom
// background's feat picker defaults to whichever of those match the skill
// just chosen (mirrors the real rule: your background's skill feat trains
// the same skill your background trains), with a "show all" escape hatch
// for concepts the trained-skill match doesn't fit.
const SKILL_FEATS = GENERAL_FEATS.filter((f) => f.prereq && /^Trained in /i.test(f.prereq));

export default function BackgroundStep({ character, update }) {
  const background = character.backgroundId ? getEffectiveBackground(character) : null;
  const isCustom = character.backgroundId === 'custom';
  const fixedSkillId = background?.skillChoice ? character.backgroundSkillChoice : background?.skill;
  const skillName = fixedSkillId ? SKILLS.find((s) => s.id === fixedSkillId)?.name : null;
  const [showAllFeats, setShowAllFeats] = useState(false);

  const chosenBoostRef = useRef(null);
  const freeBoostRef = useRef(null);
  const skillChoiceRef = useRef(null);
  const loreRef = useRef(null);
  const customFeatRef = useRef(null);

  const focusKey = !background
    ? null
    : !character.backgroundChosenBoost
    ? 'chosenBoost'
    : !character.backgroundFreeBoost
    ? 'freeBoost'
    : background.skillChoice && !character.backgroundSkillChoice
    ? 'skillChoice'
    : isCustom && !character.lorePicked?.trim()
    ? 'lore'
    : isCustom && !character.customBackgroundFeat
    ? 'customFeat'
    : null;

  useEffect(() => {
    const refs = { chosenBoost: chosenBoostRef, freeBoost: freeBoostRef, skillChoice: skillChoiceRef, lore: loreRef, customFeat: customFeatRef };
    if (focusKey) scrollIntoViewCentered(refs[focusKey]);
  }, [focusKey]);

  function selectBackground(id) {
    if (id === character.backgroundId) return;
    update({
      backgroundId: id,
      backgroundChosenBoost: null,
      backgroundFreeBoost: null,
      backgroundSkillChoice: null,
      backgroundSkillSubstitute: null,
      customBackgroundName: '',
      customBackgroundFeat: null,
      lorePicked: '',
      // A different background trains a different skill, which can free up
      // (or newly collide with) whatever the player already put in the free
      // pool -- same reasoning ClassStep's selectClass uses for this field.
      trainedSkills: [],
    });
  }

  const matchingFeats = fixedSkillId
    ? SKILL_FEATS.filter((f) => f.prereq.toLowerCase().includes(SKILLS.find((s) => s.id === fixedSkillId)?.name.toLowerCase()))
    : [];
  const displayedFeats = showAllFeats || matchingFeats.length === 0 ? SKILL_FEATS : matchingFeats;

  return (
    <div className="step">
      <h2>Choose your Background</h2>
      <p className="hint">
        Your background represents your life before adventuring: it grants two ability boosts, training in one
        skill + one Lore skill, and a background feat.
      </p>

      <div className="card-grid">
        {BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            className={`option-card ${character.backgroundId === b.id ? 'selected' : ''}`}
            onClick={() => selectBackground(b.id)}
          >
            <h3>{b.name}</h3>
            <p className="option-meta">
              Boost:{' '}
              {b.boostChoice.map((a, i) => (
                <span key={a}>
                  {i > 0 ? ' or ' : ''}
                  <AbilityTerm code={a} />
                </span>
              ))}{' '}
              + free
            </p>
            <p className="option-meta">
              Skill:{' '}
              {(b.skillChoice || [b.skill]).map((s, i) => (
                <span key={s}>
                  {i > 0 ? ' or ' : ''}
                  <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm>
                </span>
              ))}{' '}
              · <InspectText text={b.lore} />
            </p>
          </button>
        ))}
        <button
          className={`option-card custom-option ${character.backgroundId === 'custom' ? 'selected' : ''}`}
          onClick={() => selectBackground('custom')}
        >
          <h3>+ Create your own</h3>
          <p className="option-desc">
            None of these fit your concept? Build a background from scratch: two ability boosts, a skill of your
            choice, a Lore subcategory you name, and a matching skill feat.
          </p>
        </button>
      </div>

      {background && (
        <div key={background.id} className="reveal-group">
          <section className="sub-section" ref={chosenBoostRef}>
            <h3>Chosen boost</h3>
            <p className="hint">Choose one of your background's two options.</p>
            <div className="chip-row">
              {background.boostChoice.map((ab) => (
                <button
                  key={ab}
                  className={`chip ${character.backgroundChosenBoost === ab ? 'selected' : ''}`}
                  onClick={() => update({ backgroundChosenBoost: ab, backgroundFreeBoost: null })}
                >
                  <AbilityTerm code={ab} />
                </button>
              ))}
            </div>
          </section>

          {character.backgroundChosenBoost && (
            <section className="sub-section" ref={freeBoostRef}>
              <h3>Free boost</h3>
              <p className="hint">Choose any other ability score (different from the one above).</p>
              <div className="chip-row">
                {ABILITIES.filter((a) => a !== character.backgroundChosenBoost).map((ab) => (
                  <button
                    key={ab}
                    className={`chip ${character.backgroundFreeBoost === ab ? 'selected' : ''}`}
                    onClick={() => update({ backgroundFreeBoost: ab })}
                  >
                    <AbilityTerm code={ab} />
                  </button>
                ))}
              </div>
            </section>
          )}

          {background.skillChoice && (
            <section className="sub-section" ref={skillChoiceRef}>
              <h3>Choice of skill</h3>
              <p className="hint">This background lets you choose which of these skills to train.</p>
              <div className="chip-row">
                {background.skillChoice.map((s) => (
                  <button
                    key={s}
                    className={`chip ${character.backgroundSkillChoice === s ? 'selected' : ''}`}
                    onClick={() => update({ backgroundSkillChoice: s })}
                  >
                    <GlossaryTerm id={s}>{SKILLS.find((sk) => sk.id === s)?.name}</GlossaryTerm>
                  </button>
                ))}
              </div>
            </section>
          )}

          {isCustom && (
            <section className="sub-section">
              <h3>Name (optional)</h3>
              <p className="hint">Purely flavor — doesn't affect any calculation.</p>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Shipwrecked Cartographer"
                value={character.customBackgroundName}
                onChange={(e) => update({ customBackgroundName: e.target.value })}
              />
            </section>
          )}

          {isCustom && (
            <section className="sub-section" ref={loreRef}>
              <h3>Lore subcategory</h3>
              <p className="hint">
                Every background also grants training in a Lore skill — type the subcategory (e.g. "Pirate",
                "Astronomy", your hometown's name).
              </p>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Pirate"
                value={character.lorePicked}
                onChange={(e) => update({ lorePicked: e.target.value })}
              />
            </section>
          )}

          <section className="sub-section" ref={customFeatRef}>
            <h3>Background Feat</h3>
            {isCustom ? (
              <>
                <p className="hint">
                  {matchingFeats.length > 0
                    ? `Skill feats that train ${skillName || 'your chosen skill'} (same pattern every preset background uses).`
                    : 'No skill feat specifically trains that skill yet — showing every skill feat instead.'}
                  {matchingFeats.length > 0 && (
                    <>
                      {' '}
                      <button type="button" className="link-toggle" onClick={() => setShowAllFeats((v) => !v)}>
                        {showAllFeats ? 'Show matching only' : 'Show all skill feats'}
                      </button>
                    </>
                  )}
                </p>
                <div className="card-grid">
                  {displayedFeats.map((f) => (
                    <button
                      key={f.id}
                      className={`option-card small ${character.customBackgroundFeat?.name === f.name ? 'selected' : ''}`}
                      onClick={() => update({ customBackgroundFeat: f })}
                    >
                      <h4>{f.name}</h4>
                      <p className="option-meta">{f.prereq}</p>
                      <p className="option-desc">{f.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="option-card small selected" style={{ cursor: 'default' }}>
                <h4>{background.feat.name}</h4>
                <p className="option-desc"><InspectText text={background.feat.desc} /></p>
              </div>
            )}
          </section>

          <section className="sub-section">
            <h3>Training</h3>
            <p>
              Trained in{' '}
              <strong>
                {fixedSkillId ? <GlossaryTerm id={fixedSkillId}>{skillName}</GlossaryTerm> : '(choose above)'}
              </strong>{' '}
              and in <strong><InspectText text={background.lore} /></strong>.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
