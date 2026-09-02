import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import AncestryStep from './components/steps/AncestryStep';
import BackgroundStep from './components/steps/BackgroundStep';
import ClassStep from './components/steps/ClassStep';
import SpellsStep from './components/steps/SpellsStep';
import AbilityScoresStep from './components/steps/AbilityScoresStep';
import LanguagesStep, { getBonusLanguageCount } from './components/steps/LanguagesStep';
import SkillsStep from './components/steps/SkillsStep';
import EquipmentStep from './components/steps/EquipmentStep';
import SummaryStep from './components/steps/SummaryStep';
import LivePreviewPanel from './components/LivePreviewPanel';
import CatalogView from './components/CatalogView';
import { saveCharacter, loadCharacter, generateId } from './utils/characterCatalog';
import { getEffectiveBackground } from './data/backgrounds';
import { getClass } from './data/classes';
import { getAncestry } from './data/ancestries';
import { abilityMod, getSkillPoolSize, getBackgroundSkillInfo } from './data/skills';
import { computeFinalScores } from './utils/abilityScores';
import { InspectProvider, InspectToggle, InspectPopovers } from './context/InspectContext';
import { scrollIntoViewCentered } from './utils/scrollFocus';

const STEPS = [
  { id: 'ancestry', label: '1. Ancestry' },
  { id: 'background', label: '2. Background' },
  { id: 'class', label: '3. Class' },
  { id: 'spells', label: '4. Spells' },
  { id: 'abilities', label: '5. Ability Scores' },
  { id: 'languages', label: '6. Languages' },
  { id: 'skills', label: '7. Skills' },
  { id: 'equipment', label: '8. Equipment' },
  { id: 'summary', label: '9. Summary' },
];

const initialCharacter = {
  name: '',
  ancestryId: null,
  heritageId: null,
  ancestryFreeBoosts: [],
  useAlternateAncestryBoosts: false,
  ancestryFeat: null,
  generalFeatChoice: null,
  backgroundId: null,
  backgroundChosenBoost: null,
  backgroundFreeBoost: null,
  backgroundSkillChoice: null,
  backgroundSkillSubstitute: null,
  customBackgroundName: '',
  customBackgroundFeat: null,
  classId: null,
  classKeyAbility: null,
  classFeat: null,
  bonusClassFeat: null,
  classSkillChoice: null,
  spellTradition: null,
  knownCantrips: [],
  knownSpells1: [],
  freeBoosts: [],
  bonusLanguages: [],
  trainedSkills: [],
  lorePicked: '',
  weaponIds: [],
  ammoIds: [],
  armorIds: [],
  shieldIds: [],
  gearIds: [],
};

// Whether `character` satisfies everything a given step requires before
// moving on. Pulled out of the component (used to live inline inside
// canGoNext's useMemo) so openCharacter below can reuse the exact same
// logic to find where a loaded character actually left off, instead of
// always jumping to Summary -- which assumes every field is filled in and
// throws reading properties off a null class/ancestry/background
// otherwise, since it was previously only ever reached by finishing every
// step in order.
function isStepComplete(stepId, character) {
  switch (stepId) {
    case 'ancestry': {
      const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
      const heritage = ancestry?.heritages.find((h) => h.id === character.heritageId);
      const needsGeneralFeat = heritage?.grantsGeneralFeat || character.ancestryFeat?.grantsGeneralFeat;
      const generalFeatOk = !needsGeneralFeat || Boolean(character.generalFeatChoice);
      return Boolean(character.ancestryId && character.heritageId && character.ancestryFeat && generalFeatOk);
    }
    case 'background': {
      const bg = character.backgroundId ? getEffectiveBackground(character) : null;
      const skillOk = !bg?.skillChoice || Boolean(character.backgroundSkillChoice);
      const isCustom = character.backgroundId === 'custom';
      const customOk = !isCustom || (Boolean(character.lorePicked?.trim()) && Boolean(character.customBackgroundFeat));
      return Boolean(character.backgroundId && character.backgroundChosenBoost && character.backgroundFreeBoost && skillOk && customOk);
    }
    case 'class': {
      const cls = character.classId ? getClass(character.classId) : null;
      // classFeatAtLevel1 (not feats1.length) gates the required 1st-level pick: some
      // classes keep a feats1 catalog for Natural Ambition to draw from even though their
      // own progression doesn't grant a feat at 1st level — see classes.js's comments.
      const feat1Ok = !cls || cls.classFeatAtLevel1 === false || Boolean(character.classFeat);
      const needsBonusFeat = cls && cls.feats1.length > 0 && character.ancestryFeat?.grantsClassFeat;
      const bonusFeatOk = !needsBonusFeat || Boolean(character.bonusClassFeat);
      const skillChoiceOk = !cls?.fixedSkillChoiceOptions || Boolean(character.classSkillChoice);
      return Boolean(character.classId && character.classKeyAbility && feat1Ok && bonusFeatOk && skillChoiceOk);
    }
    case 'spells': {
      const cls = character.classId ? getClass(character.classId) : null;
      const sc = cls?.spellcasting;
      if (!sc || !sc.cantripsKnown) return true;
      const traditionOk = !sc.traditionOptions || Boolean(character.spellTradition);
      const cantripsOk = character.knownCantrips.length === sc.cantripsKnown;
      const spells1Ok = character.knownSpells1.length === sc.rank1Known;
      return traditionOk && cantripsOk && spells1Ok;
    }
    case 'abilities':
      return character.freeBoosts.length === 4;
    case 'languages': {
      const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
      if (!ancestry) return true;
      const scores = computeFinalScores(character, ancestry);
      const bonusCount = getBonusLanguageCount(ancestry, abilityMod(scores.int));
      return character.bonusLanguages.length === bonusCount;
    }
    case 'skills': {
      const cls = character.classId ? getClass(character.classId) : null;
      const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
      const background = character.backgroundId ? getEffectiveBackground(character) : null;
      if (!cls || !ancestry || !background) return true;
      const scores = computeFinalScores(character, ancestry);
      const poolSize = getSkillPoolSize(cls, abilityMod(scores.int));
      const { hasCollision, effectiveId } = getBackgroundSkillInfo(character, cls, background);
      const substituteOk = !hasCollision || Boolean(effectiveId);
      return character.trainedSkills.length === poolSize && substituteOk;
    }
    default:
      return true;
  }
}

// Where a loaded character actually left off -- the first step (in order,
// Summary excluded) that isn't complete, or the last real step if
// everything before Summary checks out. Used by openCharacter so resuming
// a partial build lands somewhere safe to render instead of on Summary,
// which assumes a finished character.
function findResumeStepIndex(character) {
  for (let i = 0; i < STEPS.length - 1; i += 1) {
    if (!isStepComplete(STEPS[i].id, character)) return i;
  }
  return STEPS.length - 1;
}

function App() {
  const [view, setView] = useState('catalog'); // 'catalog' | 'wizard'
  const [characterId, setCharacterId] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [character, setCharacter] = useState(initialCharacter);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Autosaves to the localStorage catalog (ROADMAP.md item 5) on every
  // change, keyed by characterId -- there's no separate "Save" step or
  // button, and no risk of losing work by navigating back to My
  // Characters or closing the tab mid-build. Only runs once a character
  // is actually being edited (characterId set by startNewCharacter/
  // openCharacter below); the catalog view itself never has one.
  useEffect(() => {
    if (characterId) saveCharacter(characterId, character);
  }, [characterId, character]);

  const step = STEPS[stepIndex];

  const canGoNext = useMemo(() => isStepComplete(step.id, character), [step, character]);

  // Scroll to the top of the page whenever the step changes. Lives in an
  // effect — which fires after React commits the new step's DOM — rather
  // than inside goNext/goBack/goToStep alongside the setStepIndex call,
  // which fires *before* that commit.
  //
  // Deliberately instant, not `{ behavior: 'smooth' }`: tested on a
  // mobile viewport and confirmed the smooth option doesn't just skip
  // the animation there, it does nothing at all — scrollY never moves.
  // Same root cause as scrollIntoViewCentered (see scrollFocus.js) —
  // real mobile browsers can't be assumed to support the Scroll Behavior
  // API, so nothing in this app should depend on it for actually
  // reaching a position, only (at most) for how it gets there.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [stepIndex]);

  // Once a step's last requirement is satisfied, scroll down to the Next
  // button automatically instead of leaving the player to notice it's now
  // enabled and scroll there themselves. Only fires on the false->true
  // transition (tracked via prevCanGoNextRef) so it doesn't yank the page
  // on steps that start out already satisfied — e.g. navigating back to a
  // step you'd already finished, or steps with nothing required at all.
  const nextBtnRef = useRef(null);
  const prevCanGoNextRef = useRef(canGoNext);
  useEffect(() => {
    const wasReady = prevCanGoNextRef.current;
    prevCanGoNextRef.current = canGoNext;
    if (!wasReady && canGoNext && step.id !== 'summary') {
      scrollIntoViewCentered(nextBtnRef);
    }
  }, [canGoNext, step.id]);

  function update(patch) {
    setCharacter((c) => ({ ...c, ...patch }));
  }

  function goNext() {
    if (stepIndex < STEPS.length - 1) {
      setDirection('forward');
      setStepIndex(stepIndex + 1);
    }
  }
  function goBack() {
    if (stepIndex > 0) {
      setDirection('back');
      setStepIndex(stepIndex - 1);
    }
  }
  function goToStep(i) {
    if (i <= stepIndex) {
      setDirection(i < stepIndex ? 'back' : 'forward');
      setStepIndex(i);
    }
  }
  function startNewCharacter() {
    setCharacterId(generateId());
    setCharacter(initialCharacter);
    setStepIndex(0);
    setDirection('forward');
    setView('wizard');
  }

  function openCharacter(id) {
    const saved = loadCharacter(id);
    if (!saved) return;
    setCharacterId(id);
    setCharacter(saved);
    // Resume exactly where this character left off -- the first
    // incomplete step, or Summary if every step before it already checks
    // out. Jumping straight to Summary unconditionally used to crash on a
    // partial character: it assumes a finished one (reads properties off
    // whichever class/ancestry/background is null) since it was
    // previously only ever reachable by finishing every step in order.
    setStepIndex(findResumeStepIndex(saved));
    setDirection('forward');
    setView('wizard');
  }

  function backToCatalog() {
    setView('catalog');
  }

  if (view === 'catalog') {
    return (
      <InspectProvider>
        <div className="app">
          <header className="app-header no-print">
            <h1>Pathfinder 2e Character Creator</h1>
            <p className="subtitle">Remastered rules (Player Core) · Level 1 character</p>
            <InspectToggle />
          </header>
          <CatalogView onOpenCharacter={openCharacter} onStartNew={startNewCharacter} />
          <InspectPopovers />
        </div>
      </InspectProvider>
    );
  }

  return (
    <InspectProvider>
      <div className="app">
        <header className="app-header no-print">
          <h1>Pathfinder 2e Character Creator</h1>
          <p className="subtitle">Remastered rules (Player Core) · Level 1 character</p>
          <button type="button" className="btn secondary small back-to-catalog no-print" onClick={backToCatalog}>
            ◂ My Characters
          </button>
          <InspectToggle />
        </header>

        <nav className="stepper no-print">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              className={`step-pill ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'done' : ''}`}
              onClick={() => goToStep(i)}
              disabled={i > stepIndex}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="layout-row">
          <main className={`step-content dir-${direction}`}>
            {step.id === 'ancestry' && <AncestryStep character={character} update={update} />}
            {step.id === 'background' && <BackgroundStep character={character} update={update} />}
            {step.id === 'class' && <ClassStep character={character} update={update} />}
            {step.id === 'spells' && <SpellsStep character={character} update={update} />}
            {step.id === 'abilities' && <AbilityScoresStep character={character} update={update} />}
            {step.id === 'languages' && <LanguagesStep character={character} update={update} />}
            {step.id === 'skills' && <SkillsStep character={character} update={update} />}
            {step.id === 'equipment' && <EquipmentStep character={character} update={update} />}
            {step.id === 'summary' && <SummaryStep character={character} update={update} onRestart={startNewCharacter} />}
          </main>

          {step.id !== 'summary' && (
            <LivePreviewPanel character={character} open={previewOpen} onToggle={() => setPreviewOpen((o) => !o)} />
          )}
        </div>

        <footer className="wizard-nav no-print">
          <button onClick={goBack} disabled={stepIndex === 0} className="btn secondary">
            Back
          </button>
          {step.id !== 'summary' && (
            <button ref={nextBtnRef} onClick={goNext} disabled={!canGoNext} className="btn primary">
              Next
            </button>
          )}
        </footer>
        <InspectPopovers />
      </div>
    </InspectProvider>
  );
}

export default App;
