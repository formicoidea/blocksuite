# blocksuite-labre

The editor library behind **Labre**: a text editor and a whiteboard in one
document, with business frameworks drawn on the canvas (Wardley maps, EDGY,
BPMN, C4, Cynefin/Estuarine, DDD).

It is a fork of [BlockSuite](https://github.com/toeverything/blocksuite), the
editor of AFFiNE. The fork is assumed divergent: we do not track upstream, we
cherry-pick security and block fixes deliberately, and we never publish under
the `@blocksuite/*` scope.

## Documentation

Start at [docs/README.md](docs/README.md). Four doors:

- **Understand** how the library works: [docs/understand/](docs/understand/01-big-picture.md)
- **Integrate** the editor in your software: [docs/integrate/](docs/integrate/01-install.md)
- **Contribute** a fix or a feature: [docs/contribute/](docs/contribute/01-setup.md)
- **Add a business framework**: [docs/add-a-framework/](docs/add-a-framework/01-definition-of-done.md)

Plus [docs/principles.md](docs/principles.md), [docs/lessons.md](docs/lessons.md)
and the [decision records](docs/adr/README.md).

## Packages

Source packages are private, under `@labre/*`. What ships to npm is generated
under `@formicoidea/`:

| Package                                                                                                          | Content            |
| ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| `@formicoidea/labre-core`                                                                                        | the editor         |
| `@formicoidea/labre-framework-{wardley,edgy,bpmn,c4,cynefin,ddd-event-storming,ddd-core-domain,ddd-context-map}` | one framework each |

Install the core plus the frameworks you need, at the same version. See
[docs/integrate/01-install.md](docs/integrate/01-install.md).

## Quick start for contributors

```bash
yarn install --immutable
yarn dev                 # playground on http://localhost:5173
yarn build               # typecheck and build everything
yarn test:unit
yarn test:integration
```

Details in [BUILDING.md](BUILDING.md).

## In one paragraph

A document is a Yjs document holding a tree of blocks; the whiteboard is a
block whose elements are shapes, connectors and framework artefacts. Yjs is
the only source of truth; views react to it; a change from a remote user
follows the same path as a local one, so collaboration is built in. Everything
the editor does is an extension registered into a per-editor container, and a
host application plugs its own services (telemetry, search, notifications)
into documented seams. Frameworks are canvas modules that contribute data
(commands, roles, rules, templates) rather than menu code, and a flag can
remove a framework's tooling but never the content a document already holds.

## License

[MPL 2.0](./LICENSE). BlockSuite is © toeverything; this fork is maintained
by Formicoidea.
