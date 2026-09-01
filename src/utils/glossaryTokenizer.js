import { GLOSSARY } from '../data/glossary';

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sorted longest-first so e.g. "Skill Check" matches before the bare "Skill".
const sortedTerms = [...GLOSSARY].sort((a, b) => b.term.length - a.term.length);
const TERM_BY_STRING = new Map(GLOSSARY.map((t) => [t.term, t.id]));
const TERM_REGEX = new RegExp(`\\b(${sortedTerms.map((t) => escapeRegExp(t.term)).join('|')})\\b`, 'g');

// Splits `text` into { type: 'text', value } / { type: 'term', value, id }
// chunks. Matching is case-sensitive (see glossary.js for why).
export function tokenize(text) {
  if (!text) return [];
  const parts = [];
  let lastIndex = 0;
  TERM_REGEX.lastIndex = 0;
  let match = TERM_REGEX.exec(text);
  while (match) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    parts.push({ type: 'term', value: match[0], id: TERM_BY_STRING.get(match[0]) });
    lastIndex = match.index + match[0].length;
    match = TERM_REGEX.exec(text);
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });
  return parts;
}
