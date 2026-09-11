import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The outline (plan) panel's own wordings: the placeholder text a preview
 * card shows in place of an empty bookmark title, code language, database
 * title, image caption or attachment name.
 *
 * Declared here rather than restated in `outline-preview.ts` so the manifest
 * (`@labre/affine/translations`, `PACKAGE_WORDINGS`) can walk them — see
 * `packages/affine/shared/src/services/translation-service/README.md`.
 */
export const OUTLINE_PLACEHOLDER_BOOKMARK: ChromeWording = [
  'com.labre.outline.placeholder.bookmark',
  'Bookmark',
];

export const OUTLINE_PLACEHOLDER_CODE: ChromeWording = [
  'com.labre.outline.placeholder.code',
  'Code Block',
];

export const OUTLINE_PLACEHOLDER_DATABASE: ChromeWording = [
  'com.labre.outline.placeholder.database',
  'Database',
];

export const OUTLINE_PLACEHOLDER_IMAGE: ChromeWording = [
  'com.labre.outline.placeholder.image',
  'Image',
];

export const OUTLINE_PLACEHOLDER_ATTACHMENT: ChromeWording = [
  'com.labre.outline.placeholder.attachment',
  'Attachment',
];

/** Every wording this package declares, in the order it renders them. */
export const OUTLINE_WORDINGS: readonly ChromeWording[] = [
  OUTLINE_PLACEHOLDER_BOOKMARK,
  OUTLINE_PLACEHOLDER_CODE,
  OUTLINE_PLACEHOLDER_DATABASE,
  OUTLINE_PLACEHOLDER_IMAGE,
  OUTLINE_PLACEHOLDER_ATTACHMENT,
];
