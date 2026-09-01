import { useMemo, useState } from 'react';
import './App.css';
import AncestryStep from './components/steps/AncestryStep';
import BackgroundStep from './components/steps/BackgroundStep';
import ClassStep from './components/steps/ClassStep';
import AbilityScoresStep from './components/steps/AbilityScoresStep';
import SkillsStep from './components/steps/SkillsStep';
import EquipmentStep from './components/steps/EquipmentStep';
import SummaryStep from './components/steps/SummaryStep';
import { getBackground } from './data/backgrounds';
import { getClass } from './data/classes';
import { getAncestry } from './data/ancestries';
import { abilityMod, getSkillPoolSize, getBackgroundSkillInfo } from './data/skills';
import { computeFinalScores } from './utils/abilityScores';
import { InspectProvider, InspectToggle, InspectPopovers } from './context/InspectContext';

const STEPS = [
  { id: 'ancestry', label: '1. Ancestry' },
  { id: 'background', label: '2. Background' },
  { id: 'class', label: '3. Class' },
  { id: 'abilities', label: '4. Ability Scores' },
  { id: 'skills', label: '5. Skills' },
  { id: 'equipment', label: '6. Equipment' },
  { id: 'summary', label: '7. Summary' },
];

const initialCharacter = {
  name: '',
  ancestryId: null,
  heritageId: null,
  ancestryFreeBoosts: [],
  ancestryFeat: null,
  generalFeatChoice: null,
  backgroundId: null,
  backgroundChosenBoost: null,
  backgroundFreeBoost: null,
  backgroundSkillChoice: null,
  backgroundSkillSubstitute: null,
  classId: null,
  classKeyAbility: null,
  classFeat: null,
  bonusClassFeat: null,
  classSkillChoice: null,
  freeBoosts: [],
  trainedSkills: [],
  lorePicked: null,
  weaponId: null,
  armorId: null,
  gearIds: [],
};

function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [character, setCharacter] = useState(initialCharacter);

  const step = STEPS[stepIndex];

  const canGoNext = useMemo(() => {
    switch (step.id) {
      case 'ancestry': {
        const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
        const heritage = ancestry?.heritages.find((h) => h.id === character.heritageId);
        const needsGeneralFeat = heritage?.grantsGeneralFeat || character.ancestryFeat?.grantsGeneralFeat;
        const generalFeatOk = !needsGeneralFeat || Boolean(character.generalFeatChoice);
        return Boolean(character.ancestryId && character.heritageId && character.ancestryFeat && generalFeatOk);
      }
      case 'background': {
        const bg = character.backgroundId ? getBackground(character.backgroundId) : null;
        const skillOk = !bg?.skillChoice || Boolean(character.backgroundSkillChoice);
        return Boolean(character.backgroundId && character.backgroundChosenBoost && character.backgroundFreeBoost && skillOk);
      }
      case 'class': {
        const cls = character.classId ? getClass(character.classId) : null;
        const feat1Ok = !cls || cls.feats1.length === 0 || Boolean(character.classFeat);
        const needsBonusFeat = cls && cls.feats1.length > 0 && character.ancestryFeat?.grantsClassFeat;
        const bonusFeatOk = !needsBonusFeat || Boolean(character.bonusClassFeat);
        const skillChoiceOk = !cls?.fixedSkillChoiceOptions || Boolean(character.classSkillChoice);
        return Boolean(character.classId && character.classKeyAbility && feat1Ok && bonusFeatOk && skillChoiceOk);
      }
      case 'abilities':
        return character.freeBoosts.length === 4;
      case 'skills': {
        const cls = character.classId ? getClass(character.classId) : null;
        const ancestry = character.ancestryId ? getAncestry(character.ancestryId) : null;
        const background = character.backgroundId ? getBackground(character.backgroundId) : null;
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
  }, [step, character]);

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
  function restart() {
    setCharacter(initialCharacter);
    setStepIndex(0);
  }

  return (
    <InspectProvider>
      <div className="app">
        <header className="app-header no-print">
          <h1>Pathfinder 2e Character Creator</h1>
          <p className="subtitle">Remastered rules (Player Core) · Level 1 character</p>
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

        <main className={`step-content dir-${direction}`}>
          {step.id === 'ancestry' && <AncestryStep character={character} update={update} />}
          {step.id === 'background' && <BackgroundStep character={character} update={update} />}
          {step.id === 'class' && <ClassStep character={character} update={update} />}
          {step.id === 'abilities' && <AbilityScoresStep character={character} update={update} />}
          {step.id === 'skills' && <SkillsStep character={character} update={update} />}
          {step.id === 'equipment' && <EquipmentStep character={character} update={update} />}
          {step.id === 'summary' && <SummaryStep character={character} update={update} onRestart={restart} />}
        </main>

        <footer className="wizard-nav no-print">
          <button onClick={goBack} disabled={stepIndex === 0} className="btn secondary">
            Back
          </button>
          {step.id !== 'summary' && (
            <button onClick={goNext} disabled={!canGoNext} className="btn primary">
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
