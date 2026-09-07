import type { ReadingProfile } from '@labre/affine-block-surface';

import { ES_ROLE, EVENT_STORMING_ROLES } from './roles.js';

/**
 * What an Event Storming board lets the tool read of a sticky (MF3, the
 * reversed reading).
 *
 * DATA, like the rules and the profiles beside it: the engine
 * (`@labre/affine-block-surface`) knows how to read a role and a typed edge — it
 * knows nothing about Event Storming. Everything below is already stated in
 * `roles.ts` and is merely POINTED AT here.
 *
 * Registered from the FLAG-GATED view extension: reading a board is tooling, so
 * a roll whose flag is off keeps every sticky it has and simply stops being read
 * (ADR 0009).
 *
 * ## One subject, nine kinds
 *
 * `es:sticky` is the parent of all nine, so one profile reads them all and the
 * panel's type line says which ("Domain event › Sticky"). The board is the
 * FRAME and specialises nothing, exactly so that what is written about the
 * stickies never falls on the roll they are stuck to.
 *
 * The two kinds outside the grammar — the hotspot and the constraint — are read
 * like the other seven, and deliberately: being outside `es.forbidden-arc`'s
 * alphabet means no rule judges them, not that nobody may ask what they are.
 *
 * ## No nature, no phase
 *
 * The framework ships no type-3 tag pack: the nine kinds ARE the roles. And the
 * roll's timeline is a direction the FLOW states, not a set of declared zones a
 * position could be read against — `es.against-timeline` reads the edge, and so
 * does the section below.
 */
export const EVENT_STORMING_READING: ReadingProfile = {
  id: 'event-storming',
  framework: 'ddd-event-storming',
  roles: EVENT_STORMING_ROLES,
  appliesTo: ES_ROLE.sticky,
  relation: {
    edgeRole: ES_ROLE.flow,
    // ADR 0010 tier 2 on this role: the verb is "leads to", so the SOURCE is
    // what happens FIRST. An edge leaving the subject names what follows it,
    // one arriving names what it follows.
    sides: {
      consumer: {
        labelKey: 'com.labre.event-storming.reading.relations.consumer',
        labelFallback: 'Follows',
      },
      supplier: {
        labelKey: 'com.labre.event-storming.reading.relations.supplier',
        labelFallback: 'Leads to',
      },
    },
  },
};
