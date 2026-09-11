import { describe, expect, it } from 'vitest';

import {
  HEADING_LEVELS,
  HEADING_SCALE,
  headingLineBox,
} from '../../consts/heading.js';

/** The doc title (`fragments/doc-title/src/doc-title.ts`: `font-size: 40px`). */
const DOC_TITLE_SIZE = 40;
/** Body text (`--affine-font-base`, the paragraph's `text` type). */
const BODY_SIZE = 15;

const sizes = HEADING_LEVELS.map(level => HEADING_SCALE[level].fontSize);

/**
 * What the heading scale promises, as properties rather than as a copy of the
 * table: a change of value is free as long as the hierarchy it draws survives.
 */
describe('HEADING_SCALE', () => {
  it('keeps H1 clearly below the doc title', () => {
    expect(HEADING_SCALE.h1.fontSize).toBeLessThan(DOC_TITLE_SIZE);
    // A clear gap, not a pixel or two: the title must never read as an H1.
    expect(HEADING_SCALE.h1.fontSize).toBeLessThanOrEqual(34);
  });

  it('steps strictly down from H1 to H6', () => {
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i], HEADING_LEVELS[i]).toBeLessThan(sizes[i - 1]);
    }
  });

  it('keeps H6 at least the size of body text', () => {
    expect(HEADING_SCALE.h6.fontSize).toBeGreaterThanOrEqual(BODY_SIZE);
  });

  it('steps title → H1 → H2 → H3 by a ratio of about 1.25', () => {
    const chain = [
      DOC_TITLE_SIZE,
      HEADING_SCALE.h1.fontSize,
      HEADING_SCALE.h2.fontSize,
      HEADING_SCALE.h3.fontSize,
    ];
    for (let i = 1; i < chain.length; i++) {
      const ratio = chain[i - 1] / chain[i];
      expect(ratio, `step ${i}`).toBeGreaterThanOrEqual(1.2);
      expect(ratio, `step ${i}`).toBeLessThanOrEqual(1.3 + 1e-9);
    }
  });

  it('leaves H2 as it was', () => {
    expect(HEADING_SCALE.h2).toMatchObject({
      fontSize: 26,
      fontWeight: 600,
      lineHeightExtra: 10,
      marginTop: 14,
    });
  });

  it('measures a line box as the font size plus the line-height extra', () => {
    for (const level of HEADING_LEVELS) {
      const { fontSize, lineHeightExtra } = HEADING_SCALE[level];
      expect(headingLineBox(level), level).toBe(fontSize + lineHeightExtra);
    }
  });
});
