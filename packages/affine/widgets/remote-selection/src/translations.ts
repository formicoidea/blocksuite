import type { ChromeWording } from '@labre/affine-shared/services';

/**
 * The remote cursor's own fallback label, shown under a collaborator's
 * cursor when their `awarenessStore` user record carries no name.
 */
export const REMOTE_SELECTION_UNKNOWN_USER: ChromeWording = [
  'com.labre.remote-selection.unknown-user',
  'Unknown',
];

/** Every wording this package declares, in the order it renders them. */
export const REMOTE_SELECTION_WORDINGS: readonly ChromeWording[] = [
  REMOTE_SELECTION_UNKNOWN_USER,
];
