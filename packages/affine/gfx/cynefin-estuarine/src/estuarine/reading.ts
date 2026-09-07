import type { ReadingProfile } from '@labre/affine-block-surface';

import { ESTUARINE_ROLE, ESTUARINE_ROLES } from './roles.js';

/**
 * What Estuarine lets the tool read of a constraint (MF3, the reversed
 * reading).
 *
 * One profile, one role, and nothing else: a hexagon is a plain polygon on the
 * canvas, so the role is the only place that says what it is — and saying it,
 * with the link to the record beside it, is the whole of what a reading can
 * honestly offer here.
 *
 * Registered from the FLAG-GATED view extension, like every other profile:
 * reading a board is tooling (ADR 0009).
 *
 * ## No relation, no nature, no phase — and no verdict
 *
 * Estuarine declares no edge role: an arrow drawn between two hexagons is a
 * plain connector and carries no verb, so there is no sentence to read off it.
 * It declares no type-3 tag pack either. And the map's own energy/time plane is
 * NOT read as a phase in this pass: the three reference curves are not zones
 * with an id, and reading a "position" off them would be the engine inventing a
 * fact the declaration does not carry.
 *
 * ## Cynefin gets nothing, and that is ADR 0013
 *
 * The two frameworks share this package and share nothing here. Cynefin
 * declares no role at all — its four domains are the participants' judgement
 * about their own context, and there is no external truth to check — so a free
 * element on a Cynefin board carries no role and has no reading. A CONSTRAINT
 * hexagon dropped on such a board does, because the hexagon is an Estuarine
 * artefact wherever it is drawn. See the amendment of 2026-09-07 to
 * `docs/adr/0013`: reading is not validation, and this profile carries no rule
 * and no verdict.
 */
export const ESTUARINE_READING: ReadingProfile = {
  id: 'estuarine',
  framework: 'cynefin-estuarine',
  roles: ESTUARINE_ROLES,
  // Not the map: a reading is about an artefact, never about the frame it is
  // measured against.
  appliesTo: ESTUARINE_ROLE.constraint,
};
