# Upgrade

**Small hops. Read the changelog. Type the lists.**

## Versioning

Every `@labre/*` package versions in lockstep (a fixed group in
`.changeset/config.json`), and every bundle carries the umbrella's version.
A framework bundle pins the exact core version it was built with. Bump every
`@formicoidea/*` range together.

Changelogs are per package in the repo (`packages/**/CHANGELOG.md`); the core
bundle's changelog aggregates them.

## What breaks between versions

Typical changes a host sees, from the Labre app's history:

| Kind                                | Example                                                                                | How to catch it                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| a descriptor changes shape          | 0.33: frameworks moved from `{ flag, viewExtension }` to `{ flag, extensions: [...] }` | compile error if you typed the map as `Record<FrameworkId, …>`             |
| a new framework appears             | 0.33: `c4`                                                                             | compile error on the same typed map; a missing button otherwise            |
| a key is added to `OPTIONAL_BLOCKS` | 0.3x: `edgeless-media`, `template`, `link`                                             | nothing to do if you iterate the exported list                             |
| a seam is added                     | pivot picker, catalogue panel                                                          | a button appears or disappears: check [04-host-seams.md](04-host-seams.md) |
| a peer's semantics change           | signals-core 1.14 `batch()`                                                            | pin the version the library tests with                                     |

Six weeks of library in one hop produced three compile breaks and one silent
behaviour change. Upgrade at every minor.

## Write the host so a change is a compile error

```ts
import type { FrameworkId } from '@labre/affine/std';
import { FRAMEWORK_DESCRIPTORS } from '@labre/affine/frameworks';

const BUNDLES: Record<FrameworkId, FrameworkBundle> = {
  wardley: wardleyFramework,
  edgy: edgyFramework,
  // a framework the library gains and you forgot here fails to compile
};

// order comes from the library, never restated
const FRAMEWORKS = FRAMEWORK_DESCRIPTORS.map(d => BUNDLES[d.id]);
```

## Checklist per upgrade

1. Bump every `@formicoidea/*` range to the same version.
2. Reinstall with a lockfile check that no second copy appeared.
3. Typecheck. Fix the compile errors first; they are the intended ones.
4. Run your editor smoke tests: mount, type, draw, switch mode, reload.
5. Diff [04-host-seams.md](04-host-seams.md) against your registrations.
6. Read the flag list: a new key defaults to enabled.

## Requests to the library

Open an issue on the library repository. If issues are disabled there, the
Labre app tracks pending requests in its own `docs/adr/0002`; the library
maintainers read it.
