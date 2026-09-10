---
'@labre/affine-block-paragraph': patch
'@labre/affine-block-list': patch
---

fix(blocks): a heading expanded in readonly mode stays expanded while the reader selects and copies its content; the persisted collapse state is only re-applied when entering readonly mode (lists aligned on the same rule)
