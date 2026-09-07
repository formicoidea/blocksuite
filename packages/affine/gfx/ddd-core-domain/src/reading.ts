import type { ReadingProfile } from '@labre/affine-block-surface';

import { CORE_DOMAIN_ROLE, CORE_DOMAIN_ROLES } from './roles.js';

/**
 * What a Core Domain Chart lets the tool read (MF3, the reversed reading).
 *
 * DATA, like the rules and the profiles beside it: the engine
 * (`@labre/affine-block-surface`) knows how to read a role and a typed edge — it
 * knows nothing about this framework. Everything below is already stated in
 * `roles.ts` and is merely POINTED AT here.
 *
 * Registered from the FLAG-GATED view extension: reading a chart is tooling, so
 * a chart whose flag is off keeps every element it has and simply stops being
 * read (ADR 0009).
 *
 * ## TWO profiles, because the vocabulary has two disjoint node families
 *
 * `roles.ts` makes the split deliberately: a sub-domain is a thing PLOTTED at a
 * (differentiation, complexity) position, a Team Topologies marker is an
 * annotation about how work flows between teams. Neither specialises the other,
 * so neither `appliesTo` can cover both — and giving them a common parent would
 * mean minting a role the notation does not have, which ADR 0007 forbids.
 *
 * The chart itself is the FRAME and is not read.
 *
 * ## No nature, no phase
 *
 * The framework ships no type-3 tag pack: the five dot presets ARE roles, and
 * the panel says them on the type line with the chain above them ("Platform
 * sub-domain › Sub-domain"). And the chart's two axes are a plane, not a set of
 * declared zones with ids — reading a phase off it would be an invented fact, so
 * the section is absent rather than empty. A follow-up ticket covers the
 * variant-scoped 2D zones the engine would need.
 */

/**
 * The dots: the five presets, and the two bounded-context positions.
 *
 * The MOVEMENT is the only typed edge on this board. ADR 0010 tier 2 on that
 * role: the verb is "is moving to", so the SOURCE is where the context stands
 * today and the TARGET where it is headed — an edge leaving the subject names
 * where it goes, one arriving names where it came from.
 */
export const CORE_DOMAIN_READING: ReadingProfile = {
  id: 'core-domain',
  framework: 'ddd-core-domain',
  roles: CORE_DOMAIN_ROLES,
  appliesTo: CORE_DOMAIN_ROLE.subdomain,
  relation: {
    edgeRole: CORE_DOMAIN_ROLE.movement,
    sides: {
      consumer: {
        labelKey: 'com.labre.core-domain.reading.relations.consumer',
        labelFallback: 'Moved from',
      },
      supplier: {
        labelKey: 'com.labre.core-domain.reading.relations.supplier',
        labelFallback: 'Moves to',
      },
    },
  },
};

/**
 * The Team Topologies markers.
 *
 * No relation: a movement runs between two positions of a bounded context, and
 * `core-domain.malformed-movement` is written on exactly that. A marker is what
 * the chart SAYS about an interaction, not a thing that moves.
 */
export const CORE_DOMAIN_MARKER_READING: ReadingProfile = {
  id: 'core-domain-marker',
  framework: 'ddd-core-domain',
  roles: CORE_DOMAIN_ROLES,
  appliesTo: CORE_DOMAIN_ROLE.marker,
};

/** Both profiles, in the order the view extension registers them. */
export const CORE_DOMAIN_READINGS: readonly ReadingProfile[] = [
  CORE_DOMAIN_READING,
  CORE_DOMAIN_MARKER_READING,
];
