import type { RoleDefs } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import {
  RULE_SCOPES,
  scopeOf,
  type RuleFamily,
  type RuleScope,
  type ValidationRule,
} from '../extensions/validation.js';

/**
 * `ValidationRule.scope` / {@link RULE_SCOPES} — the dependency scope, as DATA
 * (PF5.3).
 *
 * The engine does not consume it yet: PF5.4 will compute an incremental closure
 * from it. What these pins hold is the SHAPE of the contract — every family has
 * an answer, and a rule can only ever widen it.
 */

const ROLES: RoleDefs = {
  'test:thing': { id: 'test:thing', kind: 'node', labelKey: 'test.thing' },
};

const SCOPES: readonly RuleScope[] = [
  'element',
  'relations',
  'frame',
  'surface',
];

function ruleOf(family: RuleFamily, scope?: RuleScope): ValidationRule {
  return {
    id: `test.${family}`,
    framework: 'test',
    family,
    severity: 'warning',
    roles: ROLES,
    version: 1,
    messageKey: 'test.message',
    ...(scope !== undefined ? { scope } : {}),
  };
}

describe('RULE_SCOPES', () => {
  it('gives every family a scope, and the same one scopeOf resolves', () => {
    const families = Object.keys(RULE_SCOPES) as RuleFamily[];
    // The table is typed `Record<RuleFamily, RuleScope>`, so a missing family is
    // already a build error; this pins that the values are the four the type
    // names and that nothing between here and `scopeOf` reinterprets them.
    expect(families.length).toBeGreaterThan(0);
    for (const family of families) {
      expect(SCOPES).toContain(RULE_SCOPES[family]);
      expect(scopeOf(ruleOf(family))).toBe(RULE_SCOPES[family]);
    }
  });

  it('keeps the pair-wise and the graph families at surface', () => {
    // The two families whose evaluator reads the whole board, and the two the
    // reading of the evaluators WIDENED (see docs/adr/0015).
    expect(RULE_SCOPES['no-overlap']).toBe('surface');
    expect(RULE_SCOPES.reachability).toBe('surface');
    expect(RULE_SCOPES.attachment).toBe('surface');
  });
});

describe('scopeOf', () => {
  it('falls back to the family when the rule declares none', () => {
    expect(scopeOf(ruleOf('label-presence'))).toBe('element');
    expect(scopeOf(ruleOf('role-count'))).toBe('frame');
  });

  it('honours a rule that WIDENS its family', () => {
    expect(scopeOf(ruleOf('label-presence', 'surface'))).toBe('surface');
    expect(scopeOf(ruleOf('label-presence', 'relations'))).toBe('relations');
  });

  it('ignores a rule that tries to NARROW its family', () => {
    expect(scopeOf(ruleOf('role-count', 'element'))).toBe('frame');
    expect(scopeOf(ruleOf('no-overlap', 'element'))).toBe('surface');
  });

  it('answers surface for a family it does not know', () => {
    // A serialized rule shipped by a host against a build without that family.
    const alien = ruleOf('not-a-family' as RuleFamily);
    expect(scopeOf(alien)).toBe('surface');
    expect(scopeOf({ ...alien, scope: 'element' })).toBe('surface');
  });
});
