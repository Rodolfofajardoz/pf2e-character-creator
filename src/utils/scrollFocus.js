// Centers a section in the viewport once it becomes the next thing to
// fill in — used by the wizard steps to guide the player through their
// sub-sections instead of leaving them to scroll and hunt for what
// unlocked next.
//
// Deliberately *not* `behavior: 'smooth'`: tested on a mobile viewport,
// smooth scrollTo/scrollIntoView calls silently did nothing at all
// (scrollY never moved) rather than just skipping the animation — this
// is a real gap in some mobile browsers' Scroll Behavior support, not a
// timing issue. An instant jump that reliably works beats a smooth one
// that sometimes doesn't move at all.
export function scrollIntoViewCentered(ref) {
  ref?.current?.scrollIntoView({ block: 'center' });
}
