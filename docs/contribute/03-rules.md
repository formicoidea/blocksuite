# Rules of the road

**What must never be merged without a human, what we never do, and the
conventions that keep the code uniform.**

## Red zones: human review, usually an ADR

| Zone                                                  | Why                                                                        |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/framework/store`, `packages/framework/sync` | the Yjs document format. A bad change corrupts documents irreversibly.     |
| `packages/affine/model` (schemas, element models)     | the file format. Every document created before the change must still load. |
| License headers, MPL-2.0 obligations                  | file-level copyleft.                                                       |
| Publishing, release scripts, CI workflows             | a mistake ships to every host.                                             |
| A flag that touches content                           | forbidden outright (ADR 0009).                                             |

How to change a model safely:

- Add optional fields with an `undefined` default: `@field()` never writes
  them, so no migration and no schema bump.
- Enum-like values are append-only. Never rename or remove a value that a
  document may contain.
- Identifiers (roles, tag ids, command ids) are deprecated, never removed.
- Write the ADR first: context, decision, what stays loadable.

## Upstream policy

We do not track BlockSuite or AFFiNE. A shallow reference clone lives beside
the repo (`../AFFiNE-upstream`, editor under `blocksuite/`) for targeted
cherry-picks: security bumps, block bug fixes, renderer fixes. A monthly
triage lists upstream commits touching `blocksuite/` and skips AI, mobile,
server and app-importer work.

Never publish under `@blocksuite/*`. It belongs to the AFFiNE team.

## No privileged host

The Labre application consumes the library through the same seams as any
other host. If the app needs something, the library exposes a seam; the app
never patches library code and never imports from `store/test`.

## Language

- Code, comments, identifiers, commit messages, ADRs and documentation are
  in **English**.
- User-visible strings are never hard-coded: they are `com.labre.*`
  translation keys with an English fallback. The host provides the catalogue.

## Style

- TypeScript strict, plus `noImplicitOverride`, `noUnusedLocals`,
  `verbatimModuleSyntax`. `override` and `import type` are mandatory where
  they apply.
- Relative imports carry the `.js` suffix in `src/`. Test files under
  `__tests__` import siblings without it.
- Named exports only. No default exports in library code.
- Prettier formats everything. No ESLint.
- Every package: `"private": true`, `"type": "module"`,
  `"sideEffects": false`, `"license": "MPL-2.0"`, a hand-written `exports`
  map with narrow entries.
- No `customElements.define` at import time. Registration happens in the
  package's `effects.ts`, called from a provider's `effect()`.

## Comments

Comments explain **why**, not what. A docblock cites the issue, the PR or
the ADR that motivated the code. This repo's docblocks are long on purpose:
they are the memory of decisions.

A deliberate shortcut is marked with a `ponytail:` line naming the ceiling
and the upgrade path:

```ts
// ponytail: global lock, per-account locks if throughput matters
```

## Dependencies

Do not add a dependency for what a few lines can do. If you must, pin it,
and mention it in the PR body. A new peer-level dependency (anything a host
also imports) is a red-zone-adjacent change: it affects every host's
deduplication.

## Definition of done for any change

1. The change does what the issue says, nothing more.
2. A test fails without it and passes with it.
3. `yarn build`, `yarn lint:format`, the relevant unit suite, and the
   integration suite if the canvas is touched.
4. A changeset if a host can see the change.
5. The docs updated if a rule, a seam or a flag changed.

Next: [04-testing.md](04-testing.md).
