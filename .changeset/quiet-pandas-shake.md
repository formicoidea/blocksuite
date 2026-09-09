---
'@labre/affine-gfx-connector': patch
'@labre/affine-block-frame': patch
'@labre/affine-model': patch
'@labre/affine-gfx-mindmap': patch
---

A remote edit never triggers a local persisted write in the connector watcher,
the frame manager or a mindmap's children observer. Readonly viewers no longer
write — or throw — on remote polygon moves, connector mode changes, block adds
above a frame, or mindmap children rewrites. Connector label and mindmap node
view lookups are null-safe.
