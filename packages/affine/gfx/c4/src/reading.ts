import type { ReadingProfile } from '@labre/affine-block-surface';

import { C4_ROLE, C4_ROLES } from './roles.js';

/**
 * What a C4 diagram lets the tool read of an element (MF3, the reversed
 * reading).
 *
 * DATA, like the rules and the profiles beside it: the engine
 * (`@labre/affine-block-surface`) knows how to read a role and a typed edge — it
 * knows nothing about C4. Everything below is already stated in `roles.ts` and
 * is merely POINTED AT here.
 *
 * Registered from the FLAG-GATED view extension: reading a diagram is tooling,
 * so a board whose C4 flag is off keeps every element it has and simply stops
 * being read (ADR 0009).
 *
 * ## FOUR profiles, because the four levels are deliberately FLAT
 *
 * `roles.ts` argues it at length: the relation between the levels is
 * COMPOSITION ("a container is part of a system"), not specialisation, and
 * `roleIsA` means the second. Filing them in a chain to get one `appliesTo`
 * would make "every rule about a system also falls on every container" true —
 * the opposite of what C4 says — and minting a `c4:element` parent would be
 * inventing an id the notation does not have (ADR 0007: an id is forever).
 *
 * So there is one profile per level, each with an id of its own (the DI keys on
 * it and throws on a duplicate). `c4:database` needs none: it is the one real
 * specialisation in the pack, a kind of container, and is read through the
 * container's profile for free.
 *
 * The BOARD and the BOUNDARY (and its two children) are frames and are not read.
 *
 * ## The name lives on a separate element
 *
 * A C4 element is a composite — a shape, and three tiers of canvas text grouped
 * with it — so every profile points `labelRole` at `c4:title`. Without it the
 * panel would print an id at a human, and the relation lines would name the
 * other end by id too.
 *
 * ## No nature, no phase
 *
 * C4 ships no type-3 tag pack: the levels ARE the roles, and the middle tier of
 * the label (`c4:type-line`) already says the technology in the author's own
 * words. And a board declares which of the three diagrams it draws, not a set of
 * zones a position could be read against.
 */

/**
 * The two words a relationship is read with, from the subject's end.
 *
 * ADR 0010 tier 1 and this role's own `direction`: the verb is "uses", so the
 * SOURCE is the user. An edge leaving the subject names what it uses; one
 * arriving names what uses it.
 */
const RELATIONSHIP = {
  edgeRole: C4_ROLE.relationship,
  sides: {
    consumer: {
      labelKey: 'com.labre.c4.reading.relations.consumer',
      labelFallback: 'Used by',
    },
    supplier: {
      labelKey: 'com.labre.c4.reading.relations.supplier',
      labelFallback: 'Uses',
    },
  },
} as const;

/** One level, as a profile. The four below differ by `id` and `appliesTo` only. */
const level = (id: string, appliesTo: string): ReadingProfile => ({
  id,
  framework: 'c4',
  roles: C4_ROLES,
  appliesTo,
  labelRole: C4_ROLE.title,
  relation: RELATIONSHIP,
});

export const C4_PERSON_READING = level('c4-person', C4_ROLE.person);
export const C4_SYSTEM_READING = level('c4-system', C4_ROLE.system);
/** Covers `c4:database`, the one specialisation in the pack. */
export const C4_CONTAINER_READING = level('c4-container', C4_ROLE.container);
export const C4_COMPONENT_READING = level('c4-component', C4_ROLE.component);

/** Every C4 profile, in the order the view extension registers them. */
export const C4_READINGS: readonly ReadingProfile[] = [
  C4_PERSON_READING,
  C4_SYSTEM_READING,
  C4_CONTAINER_READING,
  C4_COMPONENT_READING,
];
