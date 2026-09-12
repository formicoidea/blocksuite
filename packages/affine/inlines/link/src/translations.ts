import { type ChromeWording } from '@labre/affine-shared/services';

/**
 * `@labre/affine-inline-link`'s own wordings — the inline link's toolbar
 * (`configs/toolbar.ts`) and its create/edit popup (`link-popup/link-popup.ts`).
 */

export const LINK_TOOLBAR_COPY_LINK: ChromeWording = [
  'com.labre.inline-link.toolbar.copy-link',
  'Copy link',
];
export const LINK_TOOLBAR_COPIED_TOAST: ChromeWording = [
  'com.labre.inline-link.toolbar.copied-toast',
  'Copied link to clipboard',
];
export const LINK_TOOLBAR_EDIT: ChromeWording = [
  'com.labre.inline-link.toolbar.edit',
  'Edit',
];
export const LINK_TOOLBAR_REMOVE_LINK: ChromeWording = [
  'com.labre.inline-link.toolbar.remove-link',
  'Remove link',
];

export const LINK_POPUP_LINK_PLACEHOLDER: ChromeWording = [
  'com.labre.inline-link.popup.link-placeholder',
  'Paste or type a link',
];
export const LINK_POPUP_TEXT_PLACEHOLDER: ChromeWording = [
  'com.labre.inline-link.popup.text-placeholder',
  'Enter text',
];
export const LINK_POPUP_TEXT_LABEL: ChromeWording = [
  'com.labre.inline-link.popup.text-label',
  'Text',
];
export const LINK_POPUP_LINK_LABEL: ChromeWording = [
  'com.labre.inline-link.popup.link-label',
  'Link',
];

/**
 * Every wording declared above, in declaration order — walked by
 * `PACKAGE_WORDINGS` in `packages/affine/all/src/translations.ts`.
 */
export const LINK_WORDINGS: readonly ChromeWording[] = [
  LINK_TOOLBAR_COPY_LINK,
  LINK_TOOLBAR_COPIED_TOAST,
  LINK_TOOLBAR_EDIT,
  LINK_TOOLBAR_REMOVE_LINK,
  LINK_POPUP_LINK_PLACEHOLDER,
  LINK_POPUP_TEXT_PLACEHOLDER,
  LINK_POPUP_TEXT_LABEL,
  LINK_POPUP_LINK_LABEL,
];
