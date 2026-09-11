import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The group's own seed: the default title a newly created group is stamped
 * with (`Group 2`), written into the document at creation
 * (`createGroupCommand`). Resolved at PLACEMENT and never again — a group
 * renamed by its author keeps its name, and a group created before this key
 * existed keeps the plain text it was given.
 *
 * `{{n}}` is the group's 1-based ordinal among the groups already on the doc;
 * see the translation-service README on why a count carries a param rather
 * than its own key.
 */
export const GROUP_SEED_NAME: ChromeWording = [
  'com.labre.group.seed.name',
  'Group {{n}}',
];

/**
 * This package's contribution to the translation-key manifest — a single seed,
 * listed in `PACKAGE_SEED_WORDINGS` under source `seed`
 * (`packages/affine/all/src/translations.ts`).
 */
export const GROUP_WORDINGS: readonly ChromeWording[] = [GROUP_SEED_NAME];
