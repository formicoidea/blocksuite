---
'@labre/affine-gfx-edgy': patch
---

feat(edgeless): EDGY palette templates are derived from the creation commands

An EDGY template of the senior menu's Templates panel used to be a hand-written
copy of what the toolbox creates, and the copy had drifted: the four base
elements (People, Outcome, Object, Activity) carried no semantic role at all,
so an element dropped from the palette was invisible to the overlap rule, was
never picked up by the auto legend and would not open the info panel; "People"
arrived as a loose glyph and a loose name that walked apart the first time you
dragged one of them; the words were English literals outside the translation
seam; and the label box was a size the toolbox stopped using.

Every single-artefact template is now produced by running its own command
against a recording surface, so it cannot disagree with the button next to it.
The blank EDGY board gains the template it never had. The five compositions
(the facets overview, the customer journey, the service blueprint, the
organisation chart and the EDGY dynamic metamodel) stay hand-composed, but are
rebuilt on the same node description the toolbox draws from — and the person of
the customer journey now travels grouped with its name. A parity test guards
both directions: every artefact command has its template, every derived
template matches its command.
