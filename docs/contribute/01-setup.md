# Setup

**Clone, install, run the playground, run one package's tests. Ten minutes.**

## Install

```bash
git clone https://github.com/formicoidea/blocksuite-labre.git
cd blocksuite-labre
git checkout blocksuite-labre-main
yarn install --immutable
```

Node `>=18.19 <23`. Yarn 4 is pinned by `packageManager` in `package.json`;
Corepack picks it up. The install takes about three minutes; `postinstall`
installs the git hooks.

## Run the playground

```bash
yarn dev
```

Opens Vite on `http://localhost:5173`. Useful entries:

- `/starter/?init` a fresh document, page mode.
- `/starter/?init&mode=edgeless` the whiteboard.
- `/starter/?init&room=x` plus a second tab on `/starter/?room=x` to see
  collaboration through a broadcast channel.

The playground imports the packages from source: edits reload live.

## Build and typecheck

```bash
yarn build          # tsc -b on every package, playground and tests included
```

This is what CI runs. A partial `tsc -b packages/affine/gfx/wardley` may
reuse a stale `.tsbuildinfo` and skip a file you just added; use `--force`
when in doubt.

## Tests

```bash
yarn test:unit                  # every unit suite (vitest workspace)
yarn test:integration           # browser suite, chromium, serial
cd packages/affine/gfx/wardley && yarn vitest run roles   # one package, one filter
```

Run a package's tests **from its directory**. From the root,
`--config <pkg>/vitest.config.ts` finds no files and `--project` filters hang.

Run `yarn test:unit` alone: a concurrent `tsc -b` starves the browser-mode
projects and the vanilla-extract transforms time out.

The first integration run downloads chromium: `npx playwright install`.

## Format

```bash
yarn lint:format    # prettier --check
yarn format         # prettier --write
```

Prettier is the only formatter. There is no ESLint. The pre-commit hook runs
Prettier on staged files.

## Things that bite on a fresh checkout

- **Worktrees and CRLF.** Git worktrees created by tools often check out with
  `core.autocrlf=true`; `prettier --check` then flags every file. Check only
  your files with `prettier --check --end-of-line auto <files>`, or check the
  committed blobs. Git normalizes to LF on commit.
- **Worktrees have no `node_modules`.** Run `yarn install --immutable` in
  each.
- **No `python` on some machines.** Script edits with Node.
- **The Wardley benchmark is load-sensitive.** `validation.bench.unit.spec.ts`
  asserts a 16 ms frame budget and fails about one run in three under load.
  Rerun it alone before calling it a regression.
- **Browser pane screenshots may fail** on the playground. Verify through the
  integration suite or by reading application state, not by subscribing to
  signals from the console (Vite serves a second signals-core instance).

## Layout to know

| Path                                                                | What                                   |
| ------------------------------------------------------------------- | -------------------------------------- |
| `packages/framework/`                                               | store, sync, std, global               |
| `packages/affine/model/`                                            | schemas and element models             |
| `packages/affine/{blocks,gfx,widgets,fragments,components,shared}/` | features                               |
| `packages/affine/all/`                                              | assembly, flags, framework descriptors |
| `packages/playground/`                                              | dev app                                |
| `packages/integration-test/`                                        | browser tests                          |
| `scripts/`                                                          | bundle build and publish               |
| `docs/adr/`                                                         | decisions                              |
| `.changeset/`                                                       | pending release notes                  |

Next: [02-workflow.md](02-workflow.md).
