import { describe, expect, it } from 'vitest';

import { NOTATION_NEUTRALS } from '../../consts/notation.js';

/**
 * The shared neutral scale is the Wardley map's own. These hexes are pinned
 * here, literally, so that a change to the scale is a visible decision in a
 * diff rather than a drift every framework inherits in silence.
 */
describe('NOTATION_NEUTRALS', () => {
  it('equals the Wardley reference values', () => {
    expect(NOTATION_NEUTRALS).toEqual({
      ink: '#1f2328',
      frameInk: '#3b3d42',
      label: '#6b7280',
      divider: '#9aa0a6',
      cardFill: '#ffffff',
      cardBorder: '#e3e2e4',
      legendBorder: '#cfd2d6',
      band: '#f7faff',
    });
  });

  it('holds only opaque 6-digit hexes, so every consumer can parse them', () => {
    for (const value of Object.values(NOTATION_NEUTRALS)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
