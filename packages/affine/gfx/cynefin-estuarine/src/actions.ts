import { DefaultTool } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import type { BlockStdScope } from '@labre/std';
import { type GfxController, GfxControllerIdentifier } from '@labre/std/gfx';

import {
  CYNEFIN_H,
  CYNEFIN_W,
  cynefinBackgroundProps,
  ESTUARINE_MAP_H,
  ESTUARINE_MAP_W,
  estuarineHexagonBox,
  estuarineHexagonProps,
  estuarineMapProps,
} from './presets';

/**
 * Creation actions for the Cynefin / Estuarine toolbox — lifted out of
 * `toolbar/menu.ts` by PF3. This is also the framework that emitted NO
 * telemetry at all before the switchover: routing every surface through
 * `runCommand` fixes that for free (`docs/adr/0008`).
 *
 * What each artefact IS lives in `presets.ts`, which the palette reads too: the
 * templates used to restate these props and drifted from them.
 */

const gfxOf = (std: BlockStdScope) => std.get(GfxControllerIdentifier);

function finish(gfx: GfxController, id: string) {
  gfx.doc.captureSync();
  gfx.tool.setTool(DefaultTool);
  gfx.selection.set({ elements: [id], editing: false });
}

/** The box an artefact of the given size is born in, centred on the viewport. */
function centered(gfx: GfxController, width: number, height: number) {
  const { centerX, centerY } = gfx.viewport;
  return new Bound(
    centerX - width / 2,
    centerY - height / 2,
    width,
    height
  ).serialize();
}

export function createCynefin(std: BlockStdScope) {
  const gfx = gfxOf(std);
  if (!gfx.surface) return;
  const id = gfx.surface.addElement(
    cynefinBackgroundProps({ xywh: centered(gfx, CYNEFIN_W, CYNEFIN_H) })
  );
  finish(gfx, id);
}

export function createEstuarineMap(std: BlockStdScope) {
  const gfx = gfxOf(std);
  if (!gfx.surface) return;
  const id = gfx.surface.addElement(
    estuarineMapProps({
      xywh: centered(gfx, ESTUARINE_MAP_W, ESTUARINE_MAP_H),
    })
  );
  finish(gfx, id);
}

export function createConstraintHexagon(std: BlockStdScope) {
  const gfx = gfxOf(std);
  if (!gfx.surface) return;
  const { centerX, centerY } = gfx.viewport;
  const id = gfx.surface.addElement(
    estuarineHexagonProps({ xywh: estuarineHexagonBox(centerX, centerY) })
  );
  finish(gfx, id);
}
