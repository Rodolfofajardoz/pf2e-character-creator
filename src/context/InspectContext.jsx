import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { getGlossaryTerm, ABILITY_TERM_ID } from '../data/glossary';
import { ABILITY_LABELS } from '../data/skills';
import { tokenize } from '../utils/glossaryTokenizer';

const InspectCtx = createContext(null);

let popoverSeq = 0;

// Inspect Mode (press T, like Baldur's Gate 3): while active, glossary
// terms in feat/skill/ancestry text become clickable and open a popover
// with a plain-English definition. Definitions can reference other terms,
// which stack additional popovers — closed individually, with Escape, or
// by toggling Inspect Mode off.
export function InspectProvider({ children }) {
  const [active, setActive] = useState(false);
  const [popovers, setPopovers] = useState([]);

  const toggle = useCallback(() => {
    setActive((a) => !a);
    setPopovers([]);
  }, []);

  const closeAll = useCallback(() => setPopovers([]), []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setPopovers([]);
        return;
      }
      if (e.key.toLowerCase() !== 't' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      toggle();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  const openPopover = useCallback((id, rect) => {
    if (!getGlossaryTerm(id)) return;
    popoverSeq += 1;
    const popId = popoverSeq;
    setPopovers((prev) => {
      const depth = prev.length;
      const x = Math.max(8, Math.min(rect.left + depth * 24, window.innerWidth - 328));
      const y = Math.max(8, Math.min(rect.bottom + 8 + depth * 12, window.innerHeight - 120));
      return [...prev, { popId, id, x, y }];
    });
  }, []);

  const closePopover = useCallback((popId) => {
    setPopovers((prev) => prev.filter((p) => p.popId !== popId));
  }, []);

  return (
    <InspectCtx.Provider value={{ active, popovers, toggle, openPopover, closePopover, closeAll }}>
      {children}
    </InspectCtx.Provider>
  );
}

export function useInspect() {
  const ctx = useContext(InspectCtx);
  if (!ctx) throw new Error('useInspect must be used within InspectProvider');
  return ctx;
}

// Renders as a <span role="button"> rather than a real <button> because
// these get embedded inside description text that's often already inside a
// clickable <button> card (option-card) — nesting real buttons is invalid
// HTML and browsers mangle it. A span with role="button" stays clickable
// and keyboard-accessible without that problem.
export function GlossaryTerm({ id, children }) {
  const { active, openPopover } = useInspect();
  const ref = useRef(null);
  if (!active || !getGlossaryTerm(id)) return children;
  function activate(e) {
    e.stopPropagation();
    if (ref.current) openPopover(id, ref.current.getBoundingClientRect());
  }
  return (
    <span
      ref={ref}
      className="glossary-term"
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(e);
        }
      }}
    >
      {children}
    </span>
  );
}

// Shorthand for wrapping an ability code (str/dex/con/int/wis/cha) in a
// GlossaryTerm, for spots that build labels from ABILITY_LABELS directly
// (stat lines on cards, ability score boxes) instead of running prose
// through InspectText.
export function AbilityTerm({ code }) {
  return <GlossaryTerm id={ABILITY_TERM_ID[code]}>{ABILITY_LABELS[code]}</GlossaryTerm>;
}

// Renders a comma-separated list of AbilityTerms, e.g. for "Boosts:
// Constitution, Wisdom". Returns the em-dash fallback text if empty.
export function AbilityTermList({ codes, empty = '—' }) {
  if (!codes || codes.length === 0) return empty;
  return codes.map((code, i) => (
    <span key={code}>
      {i > 0 ? ', ' : ''}
      <AbilityTerm code={code} />
    </span>
  ));
}

// Renders free text with any glossary terms it contains turned into
// GlossaryTerm spans. Use this for feat/heritage/ancestry descriptions.
export function InspectText({ text }) {
  if (!text) return null;
  const parts = tokenize(text);
  return parts.map((p, i) =>
    p.type === 'term' ? (
      <GlossaryTerm key={i} id={p.id}>
        {p.value}
      </GlossaryTerm>
    ) : (
      <span key={i}>{p.value}</span>
    )
  );
}

// Fixed in a corner of the viewport (see .inspect-toggle-wrap in App.css)
// rather than inline in the header, so it's reachable without scrolling
// back to the top — on a long step (e.g. the Ancestry grid) the header
// scrolls out of view almost immediately. The "what this does" caption
// used to be a separate pill sitting right under the button — visually it
// read as two tappable things, and the caption isn't clickable at all, so
// a tap there did nothing. Now it's a second line *inside* the same
// button, so the whole rounded shape is one obvious target.
export function InspectToggle() {
  const { active, toggle } = useInspect();
  return (
    <button type="button" className={`inspect-toggle no-print ${active ? 'active' : ''}`} onClick={toggle}>
      <span className="inspect-toggle-main">
        <kbd>T</kbd> Inspect {active ? 'ON' : 'OFF'}
      </span>
      <span className="inspect-toggle-caption">Tap terms for definitions</span>
    </button>
  );
}

export function InspectPopovers() {
  const { popovers, closePopover, closeAll } = useInspect();
  if (popovers.length === 0) return null;
  return (
    <div className="no-print">
      <div className="inspect-overlay" onClick={closeAll} />
      {popovers.map((p) => {
        const term = getGlossaryTerm(p.id);
        if (!term) return null;
        return (
          <div key={p.popId} className="inspect-popover" style={{ left: p.x, top: p.y }}>
            <div className="inspect-popover-header">
              <strong>{term.term}</strong>
              <button type="button" className="inspect-popover-close" onClick={() => closePopover(p.popId)}>
                ×
              </button>
            </div>
            <div className="inspect-popover-body">
              <InspectText text={term.desc} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
