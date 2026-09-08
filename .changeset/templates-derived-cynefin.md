---
'@labre/affine-gfx-cynefin-estuarine': patch
---

feat(edgeless): Cynefin and Estuarine palette templates are derived from the creation commands

The Cynefin and Estuarine templates of the senior menu's Templates panel used to
be a hand-written copy of what the toolbox creates, and the copy had drifted:
the hexagons carried no text-fit mode, so their text stretched them instead of
shrinking inside them, and the estuarine background was drawn at its reference
size while the button draws it 20% larger.

They are now produced by running the command itself against a recording surface,
so a hexagon or a map dropped from the palette is the same artefact as one drawn
from the button. What each artefact IS lives in a single description the actions
and the palette both read.

The "Constraint map" template gets its captions back: the names were positioned
by an offset computed for a hexagon half the current size, so since the hexagons
were doubled every name had been drawn on top of the shape it names. The offset
now follows the hexagon's size, and the map is laid out at the scale the toolbox
draws it. A parity test guards both directions: every artefact command has its
template, every derived template matches its command, and the constraint map's
captions stay below their hexagons.
