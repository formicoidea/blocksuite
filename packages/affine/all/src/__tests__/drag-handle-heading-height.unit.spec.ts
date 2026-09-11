import {
  HEADING_LEVELS,
  type HeadingLevel,
  headingLineBox,
} from '@labre/affine-shared/consts';
import { getDragHandleContainerHeight } from '@labre/affine-widget-drag-handle';
import type { BlockModel } from '@labre/store';
import { describe, expect, it } from 'vitest';

/**
 * The drag-handle grabber is centred on a block's first line, and for a
 * heading that line is the heading scale's line box. The widget package has no
 * unit-test runner of its own; this suite runs here, where the widget is
 * already a dependency. The helper only reads `flavour` and `props.type`, so a
 * plain object stands in for the model.
 */
const paragraph = (type: string) =>
  ({ flavour: 'affine:paragraph', props: { type } }) as unknown as BlockModel;

const heightOf = (level: HeadingLevel) =>
  getDragHandleContainerHeight(paragraph(level));

describe('the drag-handle height of a heading', () => {
  it('follows the heading scale at every level', () => {
    for (const level of HEADING_LEVELS) {
      const lineBox = headingLineBox(level);
      // Centred on the first line; the upstream hand tunings (H1, H4) drop
      // the grabber by at most 2px from that centre.
      expect(heightOf(level), level).toBeGreaterThanOrEqual(lineBox);
      expect(heightOf(level), level).toBeLessThanOrEqual(lineBox + 4);
    }
  });

  it('shrinks, never grows, from H1 to H6', () => {
    for (let i = 1; i < HEADING_LEVELS.length; i++) {
      expect(
        heightOf(HEADING_LEVELS[i]),
        HEADING_LEVELS[i]
      ).toBeLessThanOrEqual(heightOf(HEADING_LEVELS[i - 1]));
    }
  });

  it('pins the values the grabber is placed with', () => {
    expect(
      Object.fromEntries(HEADING_LEVELS.map(l => [l, heightOf(l)]))
    ).toEqual({ h1: 44, h2: 36, h3: 28, h4: 28, h5: 24, h6: 23 });
  });

  it('keeps body text at its own height', () => {
    expect(getDragHandleContainerHeight(paragraph('text'))).toBe(23);
  });
});
