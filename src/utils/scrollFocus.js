// Smoothly centers a section in the viewport once it becomes the next
// thing to fill in — used by the wizard steps to guide the player through
// their sub-sections instead of leaving them to scroll and hunt for what
// unlocked next.
export function scrollIntoViewCentered(ref) {
  ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
