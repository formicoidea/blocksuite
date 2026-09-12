import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * This package's own wordings, joined into `PACKAGE_WORDINGS` in
 * `@labre/affine/translations` — see that file and
 * `packages/affine/shared/src/services/translation-service/README.md`.
 *
 * `senior-tool.ts`'s own `name: 'Pen'` is NOT here: `SeniorTool.labelKey`
 * exists only for a framework's own button — the core tools (note, shape,
 * template, pen…) declare no framework descriptor and therefore no key, by
 * design (`packages/affine/widgets/edgeless-toolbar/src/extension/index.ts`).
 */

export const BRUSH_TOOLTIP_ERASER: ChromeWording = [
  'com.labre.brush.tooltip.eraser',
  'Eraser',
];

export const BRUSH_TOOLTIP_PEN: ChromeWording = [
  'com.labre.brush.tooltip.pen',
  'Pen',
];

export const BRUSH_TOOLTIP_HIGHLIGHTER: ChromeWording = [
  'com.labre.brush.tooltip.highlighter',
  'Highlighter',
];

/** The colour-picker button's label, shared by the brush and highlighter panels. */
export const BRUSH_LABEL_COLOR: ChromeWording = [
  'com.labre.brush.label.color',
  'Color',
];

export const BRUSH_WORDINGS: readonly ChromeWording[] = [
  BRUSH_TOOLTIP_ERASER,
  BRUSH_TOOLTIP_PEN,
  BRUSH_TOOLTIP_HIGHLIGHTER,
  BRUSH_LABEL_COLOR,
];
