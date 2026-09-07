---
'@labre/affine-block-surface': minor
'@labre/affine-gfx-edgy': minor
'@labre/affine-gfx-bpmn': minor
'@labre/affine-gfx-c4': minor
'@labre/affine-gfx-cynefin-estuarine': minor
'@labre/affine-gfx-ddd-event-storming': minor
'@labre/affine-gfx-ddd-core-domain': minor
'@labre/affine-gfx-ddd-context-map': minor
'@labre/affine-gfx-wardley': patch
'@labre/affine': patch
---

feat(edgeless): every framework's artefacts can be read, not only Wardley's

The reversed reading (MF3) shipped generic and was used once. The engine, the
click on the contextual toolbar and the panel never named a framework — but
`gfx/wardley/src/view.ts` was the only file that ever registered a
`ReadingProfile`, and the panel is gated on one. So "Read this component"
appeared on a Wardley component and nowhere else: an EDGY element, a BPMN task,
a C4 container, an Estuarine constraint had no entry at all, and nothing
failed. The product owner found it by clicking.

**Seven profiles more, declared where they belong.** Each framework now
declares its own `reading.ts` and registers it from its FLAG-GATED view
extension, exactly as Wardley does (reading is tooling, `docs/adr/0009`).
Selecting any role-carrying artefact opens the panel with its type and the
chain it specialises, its typed relations, and the Linked / Not linked section
with "Link to a record". Four frameworks needed more than one profile —
BPMN has four parent-less node families and C4's four levels are deliberately
flat — and no role was invented to spare them: an id is forever
(`docs/adr/0007`).

**The panel stopped speaking Wardley.** `ReadingProfile.relation` now carries
the framework's own two words for the ends of its relation, so a sequence flow
reads "Followed by" / "Preceded by", a context map "Downstream" / "Upstream",
a storming board "Leads to" / "Follows". It also carries an opt-in
`geometry: 'vertical'`, which only Wardley takes: on a value chain a consumer
is drawn above what it needs, so a link pointing the other way contradicts the
drawing and the value flow can be read from the bottom up. On a pool or a
context map neither sentence is true, so the contradiction note and the value
flow section are simply absent — as is the evolution phase for a framework
that declares no frame. A Wardley map's panel is unchanged, word for word.

**Reading is not validation**, and `docs/adr/0013` says so in an amendment: the
Estuarine constraint hexagon gets a profile (type and record, no rule, no
verdict); a free element on a Cynefin board carries no role and stays
unreadable, which is that decision working rather than a gap.

Two smaller corrections travel with it. The phase comparison now accepts the
zone label the HOST's catalogue gives, so a French deployment storing
"Produit" is no longer told for ever that its board disagrees. And the two
relation wordings moved out of the translation manifest's chrome table into
Wardley's own declaration, with the same keys and the same English — a host
that already translated them translates nothing twice.
