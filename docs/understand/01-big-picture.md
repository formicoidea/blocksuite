# The big picture

**One document, two views, three kinds of content.**

```
                    ┌──────────────────────────────┐
                    │        Document (Yjs)        │
                    │                              │
                    │  root block                  │
                    │   ├─ note block              │
                    │   │   ├─ paragraph block     │
                    │   │   └─ list block          │
                    │   └─ surface block           │
                    │        ├─ elements: shape,   │
                    │        │   connector, text,  │
                    │        │   wardley map…      │
                    │        └─ children: frame,   │
                    │            image, note…      │
                    └──────────────┬───────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
     ┌───────────────────┐                   ┌───────────────────┐
     │   Page editor     │                   │  Edgeless editor  │
     │  (text, vertical) │                   │  (canvas, 2D)     │
     └───────────────────┘                   └───────────────────┘
```

## The document

A document is a Yjs document. It contains a tree of **blocks**. Every block
has a `flavour` (`affine:paragraph`, `affine:note`, `affine:surface`…),
typed props, and children. The tree is the only state that matters: if you
can describe a change as "this block's prop is now that value", the editor can
show it, undo it, and send it to other users.

A **workspace** holds many documents plus a shared metadata document (the
list of documents, their titles). The host creates the workspace and decides
where its bytes go (memory, IndexedDB, a server).

## The two views

The same document is shown either as a **page** (text flowing top to bottom,
the notes stacked) or as a **whiteboard** (notes placed freely on a canvas,
with graphics around them). Switching converts nothing. The undo history
survives the switch.

The whiteboard is called **edgeless** in the code, a name inherited from
AFFiNE.

## The three kinds of content

| Kind             | Lives in                      | Examples                                                            | Rendered by                                           |
| ---------------- | ----------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| Blocks           | the block tree                | paragraph, list, image, database, note, frame                       | a Lit web component per block                         |
| Surface elements | `surface.elements`, a Yjs map | shape, connector, brush stroke, text, group, Wardley map, BPMN pool | canvas 2D, batched into as few `<canvas>` as possible |
| Fragments        | outside the editor            | outline panel, document title, frame panel                          | their own web components attached to the document     |

Business frameworks are mostly **surface elements**: a board (the map, the
pool, the diagram frame) and artefacts on it (a Wardley component, a BPMN
task). They inherit everything a shape can do: move, resize, connect, select,
copy, undo.

## How a change travels

```
user gesture ──▶ command ──▶ store mutation (Yjs transaction)
                                     │
                       Yjs event ◀───┘
                          │
        model props update (signals) ──▶ views re-render
                          │
              other users receive the same update
```

Nothing in the view writes to another view. Nothing distinguishes a local
edit from a remote one once it is in the store. This is why collaboration
needs no extra code in blocks and why undo is a document property.

## Where the code is

| Layer                                              | Package                     | What it contains                                                                        |
| -------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| store                                              | `packages/framework/store`  | Yjs document model, block schemas, snapshots, undo                                      |
| sync                                               | `packages/framework/sync`   | doc sources, blob sources, awareness sources                                            |
| std                                                | `packages/framework/std`    | the editor runtime: container, commands, selection, events, gfx model, command registry |
| affine/model                                       | `packages/affine/model`     | every block schema and element model (the file format)                                  |
| affine/blocks, gfx, widgets, fragments, components | `packages/affine/*`         | one package per block, canvas module, widget                                            |
| affine/all                                         | `packages/affine/all`       | the assembly: schemas, store extensions, view extensions, flags, framework descriptors  |
| playground                                         | `packages/playground`       | the dev app (`yarn dev`)                                                                |
| integration-test                                   | `packages/integration-test` | browser tests and the test editor container                                             |

Next: [02-data-flow.md](02-data-flow.md).
