---
'@labre/affine-gfx-bpmn': patch
---

feat(edgeless): BPMN palette templates are derived from the creation commands

The BPMN cards of the senior menu's Templates panel used to be a hand-written
copy of what the toolbox creates, and the copy had drifted: no node carried the
text-fit mode the pack has written since the importer landed, so a long name
deformed a symbol whose size BPMN fixes; the events and gateways had lost their
typography; the labels were English literals outside the translation seam; and
only six of the seventeen artefacts had a card at all.

Every single-artefact card is now produced by running its own command against a
recording surface, so it cannot disagree with the button next to it — and the
palette gained the eleven that were missing: the user, service, sub-process and
call activities, the parallel gateway, the message and timer starts, the message
and terminate ends, the data object, the data store, the annotation and the
group. The two worked scenes stay hand-composed, on the same presets.

The "Message exchange" card broke a BPMN rule the moment it was inserted: its
customer participant showed where its process began and never where it ended,
which is the norm's own requirement and a warning under the Descriptive profile.
The customer's process now closes on an end event. A new test re-runs each
command against its card, checks the coverage both ways, and runs the whole
Descriptive rule pack over the two scenes.
