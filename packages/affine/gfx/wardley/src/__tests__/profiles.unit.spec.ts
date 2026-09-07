import {
  defaultProfileOf,
  evaluateCheckup,
  evaluateRules,
  userFacingViolations,
} from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import type { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { WARDLEY_PROFILES } from '../profiles';
import { WARDLEY_ROLE } from '../roles';
import { WARDLEY_RULES } from '../rules';

/**
 * The Wardley profiles as DATA (PF9.2): what the framework actually ships, and
 * what each level does to the REAL rules.
 *
 * Ported from the pilot rule's spec without losing a property: the same seven
 * questions, asked of W1–W3 instead of `wardley.component-outside-map`.
 */

function element(
  id: string,
  xywh: [number, number, number, number],
  role?: string,
  absolutePath?: [number, number][],
  validationProfile?: string
): GfxPrimitiveElementModel {
  return {
    id,
    role,
    validationProfile,
    ...(absolutePath ? { absolutePath } : {}),
    get elementBound() {
      return new Bound(...xywh);
    },
  } as unknown as GfxPrimitiveElementModel;
}

const map = (profile?: string) =>
  element('bg', [0, 0, 1600, 900], WARDLEY_ROLE.map, undefined, profile);

/** A change arrow pointing back towards genesis: one W1 finding, every time. */
const backwardsArrow = () =>
  element('a1', [400, 399, 800, 2], WARDLEY_ROLE.changeArrow, [
    [1200, 400],
    [400, 400],
  ]);

const board = (profile?: string) => [map(profile), backwardsArrow()];

/** The drawing pass alone — what a gesture pays for. */
const drawing = (profile?: string) =>
  evaluateRules([...WARDLEY_RULES], board(profile), WARDLEY_PROFILES);

/**
 * Everything the pack says about the map, whichever MOMENT says it.
 *
 * `wardley.sketch` holds all four rules at `audit`, and since PF7.6 a level
 * that draws nothing costs no gesture: on the default the findings come off the
 * check-up pass. What each level MAKES of a finding, which is what this suite
 * is about, is the same either way.
 */
const evaluate = (profile?: string) => [
  ...drawing(profile),
  ...evaluateCheckup([...WARDLEY_RULES], board(profile), WARDLEY_PROFILES),
];

describe('what Wardley ships', () => {
  it('exposes a permissive and a strict level', () => {
    expect(WARDLEY_PROFILES.map(profile => profile.id)).toEqual([
      'wardley.sketch',
      'wardley.strict',
    ]);
  });

  it('namespaces every profile by its framework', () => {
    for (const profile of WARDLEY_PROFILES) {
      expect(profile.framework).toBe('wardley');
      expect(profile.id.startsWith('wardley.')).toBe(true);
      expect(profile.labelKey).toMatch(/^com\.labre\./);
    }
  });

  it('makes the permissive one the default — the sketch wins', () => {
    expect(defaultProfileOf(WARDLEY_PROFILES, 'wardley')?.id).toBe(
      'wardley.sketch'
    );
    // Exactly one, or "the default" would depend on registration order.
    expect(WARDLEY_PROFILES.filter(profile => profile.isDefault)).toHaveLength(
      1
    );
  });

  it('names every rule the framework ships, and nothing else', () => {
    // Profiles are data and a typo in a rule id would silently do nothing at
    // all — no error, no effect, just a level of requirement that lies. Since
    // PF13 both profiles are also EXHAUSTIVE: every severity a user gets is
    // readable in one place (PF9.4).
    const known = new Set(WARDLEY_RULES.map(rule => rule.id));
    for (const profile of WARDLEY_PROFILES) {
      expect(new Set(Object.keys(profile.rules))).toEqual(known);
    }
  });

  it('never blocks, at any level', () => {
    // Strict is a level of attention, not a wall (PRD principle 3) — and, for
    // now, a level nothing downstream could enforce anyway: no gesture is
    // refused in this library. See the note in `profiles.ts`.
    for (const profile of WARDLEY_PROFILES) {
      for (const severity of Object.values(profile.rules)) {
        expect(severity).not.toBe('blocking-overridable');
      }
    }
  });
});

describe('the permissive default', () => {
  it('demotes every rule to audit', () => {
    const [violation] = evaluate();

    expect(violation.severity).toBe('audit');
  });

  it('leaves nothing on the canvas', () => {
    // `audit` is collected, never drawn: the drawing user is not interrupted.
    expect(userFacingViolations(evaluate())).toEqual([]);
  });

  it('still reports the finding to the engine seam', () => {
    // A host panel and a conformance report see it; only the canvas does not.
    expect(evaluate().map(violation => violation.ruleId)).toEqual([
      'wardley.change-arrow-against-evolution',
    ]);
  });

  it('is what a map authored before profiles existed gets', () => {
    // No profile key on the background, no migration, no backfill.
    expect(evaluate(undefined)).toEqual(evaluate('wardley.sketch'));
  });

  it('costs the drawing path nothing at all', () => {
    // PF7.6: four rules the level shows to nobody are four rules no gesture
    // walks. They are still computed, on the pass a user asks for.
    expect(drawing()).toEqual([]);
    expect(drawing('wardley.sketch')).toEqual([]);
  });
});

describe('the strict profile', () => {
  it('puts the rules back on warning', () => {
    const [violation] = evaluate('wardley.strict');

    expect(violation.severity).toBe('warning');
  });

  it('shows it on the canvas', () => {
    expect(userFacingViolations(evaluate('wardley.strict'))).toHaveLength(1);
  });

  it('brings the rules back onto the drawing path', () => {
    // The other half of PF7.6: the level that SHOWS a finding is the level that
    // owes the gesture a verdict, so a map raised to strict is judged live.
    expect(drawing('wardley.strict').map(v => v.ruleId)).toEqual([
      'wardley.change-arrow-against-evolution',
    ]);
  });
});
