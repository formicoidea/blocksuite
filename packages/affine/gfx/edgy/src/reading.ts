import type { ReadingProfile } from '@labre/affine-block-surface';

import { EDGY_ROLE, EDGY_ROLES } from './roles';

/**
 * What EDGY lets the tool read of an element (MF3, the reversed reading).
 *
 * DATA, like the rules and the profiles beside it: the engine
 * (`@labre/affine-block-surface`) knows how to read a role and a typed edge — it
 * knows nothing about EDGY. Everything below is already stated in `roles.ts` and
 * is merely POINTED AT here.
 *
 * Registered from the FLAG-GATED view extension: reading a board is tooling, so
 * a board whose EDGY flag is off keeps every element it has and simply stops
 * being read (ADR 0009).
 *
 * ## One subject, sixteen kinds
 *
 * `edgy:element` is the root of the four persisted kinds and the twelve official
 * elements, and `readingProfileFor` resolves through `roleIsA` — so one profile
 * reads all sixteen, and the panel's type line says which one AND the chain
 * above it ("Journey › Activity › Element"). The three FRAMES (`edgy:background`
 * and its two children) stay out for the reason they are not children of
 * `edgy:element`: a reading is about an artefact, never about the sheet it is
 * drawn on.
 *
 * ## No nature, no phase
 *
 * EDGY ships no type-3 tag pack: its kinds ARE the roles, and the panel already
 * says them on the type line. And its board declares no zones — the facets
 * diagram is a legend, not a plotted axis — so there is nothing a position could
 * be read against. Both sections are therefore absent rather than empty, which
 * is the whole discipline of this feature: a reading offers what the document
 * states and never a heading with nothing under it.
 */

/**
 * ## Why the two sides are named after the DIRECTION and not after a verb
 *
 * EDGY has 22 canonical verbs and the relation between two elements is entirely
 * determined by the pair they run between (`EDGY_PAIR_TO_VERB`). There is no one
 * word that names "what this element points at" across "requires", "is part of"
 * and "delivers" — so the panel says the only thing that is true of all 22:
 * which way the arrow runs. ADR 0010 tier 1 fixes what that means — the source
 * is the subject of the verb — and the verb itself is already on the link's own
 * chip, where the user drew it.
 */
export const EDGY_READING: ReadingProfile = {
  id: 'edgy',
  framework: 'edgy',
  roles: EDGY_ROLES,
  appliesTo: EDGY_ROLE.element,
  relation: {
    // The parent of the 22 verb roles: a rule of `roleIsA` away from every one
    // of them, which is why the vocabulary declares it.
    edgeRole: EDGY_ROLE.relation,
    sides: {
      consumer: {
        labelKey: 'com.labre.edgy.reading.relations.consumer',
        labelFallback: 'Incoming relations',
      },
      supplier: {
        labelKey: 'com.labre.edgy.reading.relations.supplier',
        labelFallback: 'Outgoing relations',
      },
    },
  },
};
