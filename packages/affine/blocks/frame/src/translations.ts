import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The frame's own seed: the default title a newly created frame is stamped
 * with (`Frame 3`), written into the document at creation
 * (`EdgelessFrameManager._addFrameBlock`, `FrameTool.dragMove`). Resolved at
 * PLACEMENT and never again — a frame renamed by its author keeps its name,
 * and a frame created before this key existed keeps the plain text it was
 * given.
 *
 * `{{n}}` is the frame's 1-based ordinal among the frames already on the doc;
 * the host interpolates it, and the fallback keeps it neutral for the same
 * reason a count never gets its own key (see the translation-service README).
 */
export const FRAME_SEED_NAME: ChromeWording = [
  'com.labre.frame.seed.name',
  'Frame {{n}}',
];

/**
 * This package's contribution to the translation-key manifest — a single seed,
 * listed in `PACKAGE_SEED_WORDINGS` under source `seed`
 * (`packages/affine/all/src/translations.ts`).
 */
export const FRAME_WORDINGS: readonly ChromeWording[] = [FRAME_SEED_NAME];
