import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * This package's own wordings, joined into `PACKAGE_WORDINGS` in
 * `@labre/affine/translations` — see that file and
 * `packages/affine/shared/src/services/translation-service/README.md`.
 *
 * Framework-derived template names do NOT live here: a template's tooltip is
 * resolved through the command it derives from (`resolveTemplateName`, in
 * `./toolbar/resolve-name.ts`), and a hand-written template's own name is a
 * key of the framework that authored it, not of this generic panel.
 */

/** The templates-panel tile's hover caption — genuinely generic chrome. */
export const TEMPLATE_PANEL_ADD: ChromeWording = [
  'com.labre.template.panel.add',
  'Add',
];

/** The built-in "Other" category's own tab label. */
export const TEMPLATE_PANEL_CATEGORY_OTHER: ChromeWording = [
  'com.labre.template.panel.category.other',
  'Other',
];

export const TEMPLATE_PACKAGE_WORDINGS: readonly ChromeWording[] = [
  TEMPLATE_PANEL_ADD,
  TEMPLATE_PANEL_CATEGORY_OTHER,
];
