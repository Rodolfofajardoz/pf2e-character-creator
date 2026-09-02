import { useState } from 'react';

// A <section className="sub-section"> whose heading also toggles its body
// open/closed — used wherever a step grew enough same-shaped groups
// (Spells: Cantrips/1st-rank; Equipment: Weapons/Armor/Shields/Adventuring
// Gear) that collapsing the ones you're not currently shopping/picking in
// helps. The header is a <div role="button"> around the heading rather than
// a real <button> wrapping it, same reason GlossaryTerm uses a span instead
// of a button (see InspectContext.jsx): headings inside interactive
// controls that might themselves sit inside other buttons get messy.
export default function Collapsible({ title, meta, defaultOpen = true, className = '', children }) {
  const [open, setOpen] = useState(defaultOpen);

  function toggle() {
    setOpen((o) => !o);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <section className={`sub-section collapsible-section ${className}`}>
      <div
        className="collapsible-header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <h3 className="collapsible-title">{title}</h3>
        {meta}
        <span className="collapsible-chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </section>
  );
}
