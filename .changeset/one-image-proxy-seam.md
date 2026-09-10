---
'@labre/affine-shared': patch
'@labre/affine-block-surface': patch
'@labre/affine-block-root': patch
---

fix(blocks): `ImageProxyService` now governs every remote-image fetch — the canvas PNG/PDF export and copy-as-image resolve the proxy through it instead of a hard-coded AFFiNE worker endpoint, an empty proxy means « fetch direct » (`buildUrl` hands the URL back untouched), and the default transformer middleware reads the URL set by `setImageProxyURL` at run time instead of the value captured at module load
