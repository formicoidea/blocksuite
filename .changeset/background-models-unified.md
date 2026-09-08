---
'@labre/affine-model': patch
---

fix(edgeless): EDGY boards, facets, Cynefin and Estuarine maps are framework backgrounds like the others

- Frames drawn on or dropped onto them are raised above them instead of being buried under the paint.
- Wardley zones and every other "send behind the artefacts" placement now stop at these backgrounds too.
- No document change: the four models keep their persisted fields, names and defaults, so maps written before this load byte-identically.
