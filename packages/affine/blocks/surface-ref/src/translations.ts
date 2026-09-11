import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The "/ Mind Map" slash-menu entry's seeds: the root and child node captions
 * a freshly inserted mindmap is written with (`configs/slash-menu.ts`).
 * Resolved at PLACEMENT and never again — a node renamed by its author keeps
 * its name, and a mindmap inserted before these keys existed keeps the plain
 * text it was given.
 */
export const SURFACE_REF_SEED_MINDMAP_ROOT: ChromeWording = [
  'com.labre.surface-ref.seed.mindmap-root',
  'Mind Map',
];
export const SURFACE_REF_SEED_MINDMAP_NODE: ChromeWording = [
  'com.labre.surface-ref.seed.mindmap-node',
  'Text',
];

/**
 * This package's contribution to the translation-key manifest, listed in
 * `PACKAGE_SEED_WORDINGS` under source `seed`
 * (`packages/affine/all/src/translations.ts`).
 */
export const SURFACE_REF_WORDINGS: readonly ChromeWording[] = [
  SURFACE_REF_SEED_MINDMAP_ROOT,
  SURFACE_REF_SEED_MINDMAP_NODE,
];
