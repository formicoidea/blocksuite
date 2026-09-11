import { HEADING_LEVELS } from '@labre/affine-shared/consts';
import { describe, expect, it } from 'vitest';

import { headingPreviewBodyLines } from '../configs/tooltips.js';

/** The slash-menu card is 170×68; the body is set 10px on a 12px line. */
const FRAME_HEIGHT = 68;
/** How far a 10px Inter descender reaches below its baseline, rounded up. */
const DESCENT = 2.5;

describe('the slash-menu heading previews', () => {
  it('draw only body lines that fit whole inside the card', () => {
    for (const level of HEADING_LEVELS) {
      const lines = headingPreviewBodyLines(level);
      expect(lines.length, level).toBeGreaterThan(0);
      for (const { y } of lines) {
        expect(y + DESCENT, level).toBeLessThanOrEqual(FRAME_HEIGHT);
      }
    }
  });

  it('keeps H2 as it was drawn: two body lines on the same baselines', () => {
    expect(headingPreviewBodyLines('h2').map(line => line.y)).toEqual([
      51.6364, 63.6364,
    ]);
  });
});
