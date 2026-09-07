import {
  collectTranslationKeys,
  commandCategoryTranslationEntries,
  commandTranslationEntries,
  mergeTranslationEntries,
  type TranslationKeyManifestEntry,
} from '@labre/std';

import { cynefinEstuarineCommands } from './commands.js';
import { ESTUARINE_NUDGES } from './estuarine/nudges.js';
import { ESTUARINE_READING } from './estuarine/reading.js';
import { ESTUARINE_ROLES } from './estuarine/roles.js';

/**
 * THIS framework's contribution to the translation-key manifest.
 *
 * Since WS4 it also carries the Estuarine ROLE labels and the four Map quality
 * NUDGES — the framework's entire validation vocabulary, since it declares no
 * rule and no profile (`estuarine/nudges.ts`). Cynefin contributes neither,
 * having no role of its own.
 *
 * Its command labels and descriptions are built from a TEMPLATE, so the
 * concrete keys exist nowhere but in the declarations themselves and the
 * core manifest could not restate them even if it wanted to. The
 * contribution therefore ships WITH the framework: in the bundled
 * distribution `@formicoidea/labre-framework-cynefin` carries it, and a host
 * composes it into its catalogue exactly as it already composes
 * `cynefinEstuarineCommands` into the command registry. See
 * `packages/affine/all/src/translations.ts`.
 */
export const cynefinEstuarineTranslationEntries: TranslationKeyManifestEntry[] =
  mergeTranslationEntries(
    commandTranslationEntries(cynefinEstuarineCommands),
    // The catalogue's own group headers, derived from the very categories
    // these commands declare. They ship WITH the framework because core's
    // registry names no framework category in the bundled distribution, so a
    // host that composed core's manifest alone drew translated entries under
    // English headers (#183).
    commandCategoryTranslationEntries(cynefinEstuarineCommands),
    collectTranslationKeys('role', ESTUARINE_ROLES),
    collectTranslationKeys('nudge', ESTUARINE_NUDGES),
    // LAST, and the order is load-bearing: a reading profile carries the
    // framework's own `roles`, so walking it reaches every role key the line
    // above already named. `mergeTranslationEntries` keeps the FIRST
    // occurrence, which is what makes each key report the source it comes from.
    // This profile declares no relation, so today it contributes no key of its
    // own — walking it costs nothing and means the day it gains one the
    // manifest already names it.
    collectTranslationKeys('reading', ESTUARINE_READING)
  );
