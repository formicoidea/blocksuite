import { NOTATION_NEUTRALS } from '@labre/affine-shared/consts';
import { describe, expect, it } from 'vitest';

import { otherTemplateCategory } from '../builtin/other.js';

const COLOUR_KEYS = new Set(['fillColor', 'strokeColor', 'color', 'stroke']);

/** Every hex colour a template writes, whatever depth the snapshot nests it at. */
function coloursOf(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) coloursOf(item, out);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (
        COLOUR_KEYS.has(key) &&
        typeof child === 'string' &&
        child.startsWith('#')
      ) {
        out.add(child.toLowerCase());
      } else {
        coloursOf(child, out);
      }
    }
  }
  return out;
}

/**
 * The generic diagrams belong to no framework, and their greys are therefore
 * nobody's but the shared notation scale's. What is left once the scale is
 * taken out is the diagrams' own HUES — the kanban cards and the gantt bars —
 * and nothing else: a stray near-black or near-white here is a neutral that
 * escaped the scale.
 */
describe('the generic ("Other") templates', () => {
  it('draw every neutral from the shared notation scale', () => {
    const scale = new Set<string>(Object.values(NOTATION_NEUTRALS));
    const hues = new Set([
      // Kanban cards: fill and border per column.
      '#fde6c8',
      '#e0a23a',
      '#d6e4fb',
      '#4574c4',
      '#d5efd9',
      '#43a06b',
      // Gantt bars.
      '#2f9e95',
      '#d99a2b',
    ]);

    const { templates } = otherTemplateCategory;
    // The built-in category is authored eagerly; a lazy loader would be a
    // change of shape this test should hear about.
    if (!Array.isArray(templates)) throw new Error('expected eager templates');
    const found = coloursOf(templates.map(t => t.content));
    // The walk does reach the elements: the ink, the kanban column's band and
    // the gantt's label grey are all in there.
    expect(found).toContain(NOTATION_NEUTRALS.ink);
    expect(found).toContain(NOTATION_NEUTRALS.band);
    expect(found).toContain(NOTATION_NEUTRALS.label);

    const outside = [...found].filter(
      colour => !scale.has(colour) && !hues.has(colour)
    );
    expect(outside).toEqual([]);
  });
});
