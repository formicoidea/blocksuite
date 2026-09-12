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

/* ── Notice banner (edgeless-only content hidden in page mode) ────────── */

export const OUTLINE_NOTICE_HIDDEN_LABEL: ChromeWording = [
  'com.labre.outline.notice.hidden-label',
  'SOME CONTENTS HIDDEN',
];

export const OUTLINE_NOTICE_HIDDEN_TEXT: ChromeWording = [
  'com.labre.outline.notice.hidden-text',
  'Some contents are not visible on edgeless.',
];

/**
 * The banner's call to action, said around a sort icon. The icon carries no
 * text of its own and cannot be interpolated into a `translateKey` param, so
 * rather than translate the two half-sentences either side of it separately
 * — the split `manifest.unit.spec.ts` and the brief both warn against — the
 * icon is rendered BEFORE the (now whole) sentence instead of in the middle
 * of it.
 */
export const OUTLINE_NOTICE_ORGANIZE: ChromeWording = [
  'com.labre.outline.notice.organize',
  'Click here or to organize content.',
];

/* ── Panel body ─────────────────────────────────────────────────────────── */

export const OUTLINE_EMPTY_PANEL: ChromeWording = [
  'com.labre.outline.empty-panel',
  'Use headings to create a table of contents.',
];

export const OUTLINE_HIDDEN_CONTENTS: ChromeWording = [
  'com.labre.outline.hidden-contents',
  'Hidden Contents',
];

/* ── Note card ──────────────────────────────────────────────────────────── */

export const OUTLINE_MODE_BOTH: ChromeWording = [
  'com.labre.outline.card.mode.both',
  'Both',
];

export const OUTLINE_MODE_EDGELESS: ChromeWording = [
  'com.labre.outline.card.mode.edgeless',
  'Edgeless',
];

export const OUTLINE_MODE_PAGE: ChromeWording = [
  'com.labre.outline.card.mode.page',
  'Page',
];

export const OUTLINE_CARD_SHOW_IN: ChromeWording = [
  'com.labre.outline.card.show-in',
  'Show in',
];

export const OUTLINE_CARD_DISPLAY_MODE_TOOLTIP: ChromeWording = [
  'com.labre.outline.card.display-mode-tooltip',
  'Display Mode',
];

/* ── Block preview ──────────────────────────────────────────────────────── */

export const OUTLINE_PREVIEW_DELETED_DOC: ChromeWording = [
  'com.labre.outline.preview.deleted-doc',
  'Deleted doc',
];

/* ── Header ─────────────────────────────────────────────────────────────── */

/**
 * Shared by the full panel's header AND the floating mini-viewer's own header
 * (`outline-viewer.ts`) — the exact same title over the exact same list.
 */
export const OUTLINE_TABLE_OF_CONTENTS: ChromeWording = [
  'com.labre.outline.table-of-contents',
  'Table of Contents',
];

export const OUTLINE_PREVIEW_SETTINGS_TOOLTIP: ChromeWording = [
  'com.labre.outline.preview-settings-tooltip',
  'Preview Settings',
];

export const OUTLINE_VISIBILITY_AND_SORT_TOOLTIP: ChromeWording = [
  'com.labre.outline.visibility-and-sort-tooltip',
  'Visibility and sort',
];

/* ── Preview settings menu ──────────────────────────────────────────────── */

export const OUTLINE_SETTINGS_LABEL: ChromeWording = [
  'com.labre.outline.setting-menu.settings',
  'Settings',
];

export const OUTLINE_SHOW_TYPE_ICON: ChromeWording = [
  'com.labre.outline.setting-menu.show-type-icon',
  'Show type icon',
];

/* ── Floating mini-viewer ───────────────────────────────────────────────── */

export const OUTLINE_OPEN_IN_SIDEBAR_TOOLTIP: ChromeWording = [
  'com.labre.outline.viewer.open-in-sidebar',
  'Open in sidebar',
];

/** Every wording this package declares, in the order it renders them. */
export const OUTLINE_WORDINGS: readonly ChromeWording[] = [
  OUTLINE_PLACEHOLDER_BOOKMARK,
  OUTLINE_PLACEHOLDER_CODE,
  OUTLINE_PLACEHOLDER_DATABASE,
  OUTLINE_PLACEHOLDER_IMAGE,
  OUTLINE_PLACEHOLDER_ATTACHMENT,
  OUTLINE_NOTICE_HIDDEN_LABEL,
  OUTLINE_NOTICE_HIDDEN_TEXT,
  OUTLINE_NOTICE_ORGANIZE,
  OUTLINE_EMPTY_PANEL,
  OUTLINE_HIDDEN_CONTENTS,
  OUTLINE_MODE_BOTH,
  OUTLINE_MODE_EDGELESS,
  OUTLINE_MODE_PAGE,
  OUTLINE_CARD_SHOW_IN,
  OUTLINE_CARD_DISPLAY_MODE_TOOLTIP,
  OUTLINE_PREVIEW_DELETED_DOC,
  OUTLINE_TABLE_OF_CONTENTS,
  OUTLINE_PREVIEW_SETTINGS_TOOLTIP,
  OUTLINE_VISIBILITY_AND_SORT_TOOLTIP,
  OUTLINE_SETTINGS_LABEL,
  OUTLINE_SHOW_TYPE_ICON,
  OUTLINE_OPEN_IN_SIDEBAR_TOOLTIP,
];
