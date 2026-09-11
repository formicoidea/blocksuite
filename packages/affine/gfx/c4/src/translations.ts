import {
  collectTranslationKeys,
  commandCategoryTranslationEntries,
  commandTranslationEntries,
  mergeTranslationEntries,
  type TranslationKeyManifestEntry,
} from '@labre/std';

import { C4_BOARD_BACKGROUND, C4_BOUNDARY_BACKGROUND } from './background.js';
import { c4Commands } from './commands.js';
import {
  BOUNDARY_LABEL,
  boundaryLabelKey,
  DESCRIPTION_PLACEHOLDER,
  DESCRIPTION_PLACEHOLDER_KEY,
  NODE_LABEL,
  nodeLabelKey,
} from './consts.js';
import { C4_BOARD_LEVEL_MENU } from './levels.js';
import { C4_PROFILES } from './profiles.js';
import { C4_READINGS } from './reading.js';
import { C4_ROLES } from './roles.js';
import { C4_RULES } from './rules.js';

/**
 * The captions a placed component and a placed boundary are seeded with — the
 * fallback IS `NODE_LABEL[kind]` / `BOUNDARY_LABEL[variant]`, never restated,
 * mirroring BPMN's `seedEntries` exactly. The type line's own bracketed word
 * and the technology placeholder are NOT here: `createC4Node` leaves them
 * English on purpose (see the note in `actions.ts`), so there is no key for a
 * host to be offered.
 */
const seedEntries = (): TranslationKeyManifestEntry[] => [
  ...Object.entries(NODE_LABEL).map(([kind, label]) => ({
    key: nodeLabelKey(kind as keyof typeof NODE_LABEL),
    fallback: label,
    source: 'seed' as const,
  })),
  ...Object.entries(BOUNDARY_LABEL).map(([variant, label]) => ({
    key: boundaryLabelKey(variant as keyof typeof BOUNDARY_LABEL),
    fallback: label,
    source: 'seed' as const,
  })),
  {
    key: DESCRIPTION_PLACEHOLDER_KEY,
    fallback: DESCRIPTION_PLACEHOLDER,
    source: 'seed' as const,
  },
];

/**
 * THIS framework's contribution to the translation-key manifest — every
 * `com.labre.*` key C4 can hand to `TranslationProvider.t`, derived from the
 * very declarations the editor registers (never restated).
 *
 * The contribution ships WITH the framework, exactly as BPMN's does: in the
 * bundled distribution `@formicoidea/labre-framework-c4` carries it, and a host
 * composes it into its catalogue the same way it already composes `c4Commands`
 * into the command registry. See `packages/affine/all/src/translations.ts`.
 *
 * The two BACKGROUND declarations are walked even though neither carries a
 * `labelKey` today: both frames write the user's own words and have no
 * vocabulary to fall back to (`background.ts`). Walking them costs nothing and
 * means the day one of them gains a declared label the manifest already names
 * it — which is the whole reason these lists are derived rather than written.
 */
export const c4TranslationEntries: TranslationKeyManifestEntry[] =
  mergeTranslationEntries(
    commandTranslationEntries(c4Commands),
    // The catalogue's own group headers, derived from the very categories
    // these commands declare. They ship WITH the framework because core's
    // registry names no framework category in the bundled distribution, so a
    // host that composed core's manifest alone drew translated entries under
    // English headers (#183).
    commandCategoryTranslationEntries(c4Commands),
    collectTranslationKeys('role', C4_ROLES),
    collectTranslationKeys('background', [
      C4_BOARD_BACKGROUND,
      C4_BOUNDARY_BACKGROUND,
      // The LEVEL a board declares, and the words the picker offers it under.
      //
      // Filed under `background` with the two declarations above, and it is the
      // honest bucket rather than a convenient one: `level` is a prop of the
      // board BACKGROUND, these are the names of the values it can take, and
      // the table is walked exactly as the two declarations beside it are —
      // nothing is restated in `affine/all`, so a key added to the picker
      // reaches a host's catalogue by construction.
      C4_BOARD_LEVEL_MENU,
    ]),
    seedEntries(),
    // AFTER the two above, and the order is load-bearing: a rule carries its
    // framework's `roles` and, for `c4.person-in-boundary`, the boundary's own
    // declaration, so walking the rules reaches keys those two lists already
    // named. `mergeTranslationEntries` keeps the FIRST occurrence, which is what
    // makes each key report the source it actually comes from.
    collectTranslationKeys('rule', C4_RULES),
    collectTranslationKeys('profile', C4_PROFILES),
    // LAST, for the reason the rules are placed after the roles: a reading
    // profile carries the framework's own `roles` too, so walking it reaches
    // keys the lists above already named, and the first occurrence wins.
    collectTranslationKeys('reading', C4_READINGS)
  );
