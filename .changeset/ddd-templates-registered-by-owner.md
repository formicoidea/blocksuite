---
'@labre/affine-gfx-ddd-event-storming': patch
'@labre/affine-gfx-ddd-core-domain': patch
'@labre/affine-gfx-ddd-context-map': patch
'@labre/affine-gfx-ddd-aggregate': patch
---

fix(edgeless): each DDD framework registers its own templates category

The Event Storming, Core Domain Chart and Context Map template categories are
now registered by the framework that owns them, under that framework's flag,
like every other framework's. The aggregate bundle registers the Aggregate
Design Canvas only: it used to import the three sibling framework bundles to
register all four, a dependency the published bundle layout does not allow,
and the 0.38.0 publish stopped on it.
