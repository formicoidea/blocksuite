---
'@labre/affine-block-surface': patch
---

feat(edgeless): validation rules carry a dependency scope

- Every rule family declares what a verdict on one subject depends on
  (`element`, `relations`, `frame`, `surface`), as pure versioned data.
- The engine does not consume it: no evaluator reads it, and no verdict changes.
- Groundwork for incremental re-evaluation by dirty set (PF5.4).
