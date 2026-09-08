---
'@labre/affine-block-surface': patch
'@labre/affine-block-frame': patch
'@labre/affine': patch
---

fix(edgeless): a framework background never covers what is drawn on it

- A board, map or pool created AFTER the elements it surrounds now lands under them instead of hiding them.
- Anything dropped onto a board that sits above it is raised just above that board, and still below the board's own artefacts.
- Superposed boards stack in the order they were placed, each under its own artefacts — a cross-reading is now possible.
- One rule for every framework: EDGY, Wardley, C4, BPMN, Cynefin, Estuarine and the DDD boards all answer the same way.
