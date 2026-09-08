---
'@labre/std': patch
---

fix(std): a readonly viewer no longer throws `Cannot remove element in readonly mode` when a remote peer empties a group — surface cascades (delete the emptied group, drop a deleted block from its group) now react to local transactions only
