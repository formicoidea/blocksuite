# Persistence and sync

**You own the bytes. The library gives you Yjs documents and three kinds of
sources to plug.**

## What there is to persist

| Thing                       | Where                           | Contains                                          |
| --------------------------- | ------------------------------- | ------------------------------------------------- |
| the workspace root document | `workspace.doc`                 | the list of documents and their metadata (`meta`) |
| each document               | `workspace.getDoc(id).spaceDoc` | the block tree and the surface elements           |
| blobs                       | `workspace.blobSync`            | images, attachments, by content hash              |
| awareness                   | `workspace.awarenessStore`      | cursors and presence; not persisted               |

All documents are Yjs documents. Persist **binary updates**, never JSON. Store
a snapshot plus incremental updates and squash periodically; the Labre app's
`packages/doc-storage` does exactly that against Supabase.

## The three sources

Passed to the `WorkspaceImpl` constructor:

```ts
import { WorkspaceImpl } from '@labre/affine/store';
import {
  BroadcastChannelAwarenessSource,
  BroadcastChannelDocSource,
  IndexedDBBlobSource,
  MemoryBlobSource,
} from '@labre/affine/sync';

const workspace = new WorkspaceImpl({
  id: 'my-app',
  docSources: { main: new BroadcastChannelDocSource('room-1') },
  blobSources: {
    main: new MemoryBlobSource(),
    shadows: [new IndexedDBBlobSource('my-app')],
  },
  awarenessSources: [new BroadcastChannelAwarenessSource('room-1')],
});
```

| Source           | Interface                                     | Ships with                                        |
| ---------------- | --------------------------------------------- | ------------------------------------------------- |
| doc source       | `DocSource`: pull, push, subscribe to updates | `BroadcastChannelDocSource`, `IndexedDBDocSource` |
| blob source      | `BlobSource`: get, set, delete, list          | `MemoryBlobSource`, `IndexedDBBlobSource`         |
| awareness source | `AwarenessSource`: connect, disconnect        | `BroadcastChannelAwarenessSource`                 |

Implement the interface against your backend (WebSocket, Supabase Realtime,
your REST API). `main` is authoritative; `shadows` are written through.

The alternative is to leave the defaults inert and attach your own provider
directly to `workspace.doc` and each `doc.spaceDoc` (any Yjs provider works).
This is what the Labre app does.

## Order of initialization

This order avoids a real incident (the corpus wiped on reload):

1. Create the workspace with its sources. Call `workspace.start()`.
2. **Hydrate the root document** from storage (apply the saved updates to
   `workspace.doc`).
3. Only then call `workspace.meta.initialize()`. It creates the empty
   `pages` array; if it runs before hydration, the empty array wins the Y.Map
   key conflict and the persisted list is gone.
4. For each document: hydrate `doc.spaceDoc`, then `doc.load()`, then seed if
   `store.root` is still empty.

## Awareness scope mismatch

Yjs awareness is per **workspace** (it hangs off the root document), while a
realtime channel is usually per **document**. If your transport is
per-document, create the awareness source with the workspace and hand it the
current document's channel on each mount. The Labre app keeps one
`SupabaseAwarenessSource` per collection in a `WeakMap` and rewires it in
`mountDocEditor`.

## Blobs need a document id

The library's `BlobSource` is workspace-scoped. If your storage needs the
document id for authorization, carry it out of band (a module-level "current
document" set at mount, cleared at dispose). The library cannot pass it.

## Read-only

Set `store.readonly = true` to make a document read-only. Every mutation entry
point in the library checks it. Change it live when a share role changes.

## Testing collaboration locally

Open two tabs on the playground with the same room:

```
http://localhost:5173/starter/?init&room=hello
http://localhost:5173/starter/?room=hello
```

They sync through a broadcast channel. Type in one, watch the other.

Next: [06-build-tooling.md](06-build-tooling.md).
