---
'@labre/affine-block-frame': patch
'@labre/affine-block-surface': patch
'@labre/affine-gfx-wardley': patch
---

fix(edgeless): a frame drawn on a framework board stays visible above it

A frame is deliberately sent to the back of the stack so it renders behind its
own content — but a Wardley map, a C4 board or a BPMN pool is an opaque canvas
element, so the frame went behind the board and only the strip overhanging it
stayed visible. A frame now lands just above the topmost board it covers
(still behind everything the frame owns), whether it is drawn there or dragged
onto it afterwards.
