import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The mindmap's own seeds: the captions a freshly placed mindmap is written
 * with, wherever the gesture draws one directly (the toolbar's built-in
 * templates, the drag-from-basket tool, a `.mm`/`.opml` import that meets an
 * empty node). Resolved at PLACEMENT and never again (ADR 0016) — a node
 * renamed by its author keeps its name, and a mindmap created before these
 * keys existed keeps the plain text it was given.
 *
 * `root` and `child` are shared by every gesture that draws a plain mindmap
 * with no real content yet (the built-in templates and the basket tool both
 * write the same two words); `topic1`–`topic3` are the three placeholder
 * children the STARTER TEMPLATES draw, one key per position; `imported-node`
 * is what a `.mm` / `.opml` file's own untitled node becomes.
 */
export const MINDMAP_SEED_ROOT: ChromeWording = [
  'com.labre.mindmap.seed.root',
  'Mind Map',
];
export const MINDMAP_SEED_CHILD: ChromeWording = [
  'com.labre.mindmap.seed.child',
  'Text',
];
export const MINDMAP_SEED_TOPIC_1: ChromeWording = [
  'com.labre.mindmap.seed.topic-1',
  'Topic 1',
];
export const MINDMAP_SEED_TOPIC_2: ChromeWording = [
  'com.labre.mindmap.seed.topic-2',
  'Topic 2',
];
export const MINDMAP_SEED_TOPIC_3: ChromeWording = [
  'com.labre.mindmap.seed.topic-3',
  'Topic 3',
];
export const MINDMAP_SEED_IMPORTED_NODE: ChromeWording = [
  'com.labre.mindmap.seed.imported-node',
  'MINDMAP',
];

/**
 * This package's contribution to the translation-key manifest, listed in
 * `PACKAGE_SEED_WORDINGS` under source `seed`
 * (`packages/affine/all/src/translations.ts`).
 */
export const MINDMAP_WORDINGS: readonly ChromeWording[] = [
  MINDMAP_SEED_ROOT,
  MINDMAP_SEED_CHILD,
  MINDMAP_SEED_TOPIC_1,
  MINDMAP_SEED_TOPIC_2,
  MINDMAP_SEED_TOPIC_3,
  MINDMAP_SEED_IMPORTED_NODE,
];
