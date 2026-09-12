import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The generic edgeless toolbar's own wordings — not a specific tool's, the
 * toolbar chrome itself. `STYLE_GENERAL`/`STYLE_SCRIBBLED` (`config/consts.ts`'s
 * `LINE_STYLE_LIST`) and `FONT_WEIGHT_*`/`FONT_STYLE_ITALIC`
 * (`panel/font-weight-and-style-panel.ts`) are declared once in `chrome.ts`
 * (shared with `gfx/shape` and `gfx/text`) and imported directly there rather
 * than re-declared here.
 */
export const EDGELESS_TOOLBAR_COMING_SOON: ChromeWording = [
  'com.labre.edgeless-toolbar.coming-soon',
  '(Coming soon)',
];

export const EDGELESS_TOOLBAR_MORE_TOOLS: ChromeWording = [
  'com.labre.edgeless-toolbar.more-tools',
  'More Tools',
];

/** Every wording this package declares, in the order it renders them. */
export const EDGELESS_TOOLBAR_WORDINGS: readonly ChromeWording[] = [
  EDGELESS_TOOLBAR_COMING_SOON,
  EDGELESS_TOOLBAR_MORE_TOOLS,
];
