/**
 * A mindmap reports a rewritten `children` key exactly like a group does.
 *
 * `observeChildren` used to call `setChildIds(…, transaction?.local ?? true)`,
 * while `group.ts` (and the std test element) use `?? false`. The default is
 * not academic: `syncElementFromY` re-runs `startObserve` whenever the
 * `children` KEY itself is rewritten — by a remote peer, a snapshot import or
 * an undo — and the re-observe call is made with `transaction === null`. With
 * `?? true` that received rewrite is announced as a local gesture, and the
 * group watchers act on it: they delete a mindmap a remote peer emptied,
 * which a readonly viewer cannot do (`Cannot remove element in readonly
 * mode`).
 *
 * The two element types are asserted side by side, in one transaction, so the
 * mindmap is measured against the convention rather than against a literal.
 */
import type { SurfaceBlockModel } from '@labre/affine-block-surface';
import { StoreExtensionManager } from '@labre/affine-ext-loader';
import type { ElementUpdatedData } from '@labre/std/gfx';
import { Text } from '@labre/store';
import { TestWorkspace } from '@labre/store/test';
import { describe, expect, test } from 'vitest';
import * as Y from 'yjs';

import { getInternalStoreExtensions } from '../extensions/store.js';

function createBoard(id: string) {
  const manager = new StoreExtensionManager(getInternalStoreExtensions({}));
  const collection = new TestWorkspace({ id });
  collection.storeExtensions = manager.get('store');
  collection.meta.initialize();

  const store = collection.createDoc(id).getStore({ id });
  let surfaceId = '';
  store.load(() => {
    const rootId = store.addBlock('affine:page', { title: new Text('#251') });
    surfaceId = store.addBlock('affine:surface', {}, rootId);
  });

  return {
    store,
    surface: store.getBlock(surfaceId)!.model as SurfaceBlockModel,
  };
}

describe('a children rewrite arriving from outside this peer', () => {
  test('is reported as non-local by a mindmap, exactly like by a group', () => {
    const { store, surface } = createBoard('mindmap-children');

    const rootShape = surface.addElement({
      type: 'shape',
      shapeType: 'rect',
      xywh: '[0,0,100,100]',
    });
    const childShape = surface.addElement({
      type: 'shape',
      shapeType: 'rect',
      xywh: '[200,0,100,100]',
    });
    const groupedShape = surface.addElement({
      type: 'shape',
      shapeType: 'rect',
      xywh: '[400,0,100,100]',
    });

    const mindmapId = surface.addElement({
      type: 'mindmap',
      children: {
        [rootShape]: { index: 'a0' },
        [childShape]: { index: 'a0', parent: rootShape },
      },
    });
    const groupId = surface.addElement({
      type: 'group',
      children: { [groupedShape]: true },
    });

    const mindmap = surface.getElementById(mindmapId)!;
    const group = surface.getElementById(groupId)!;

    const payloads: ElementUpdatedData[] = [];
    surface.elementUpdated.subscribe(payload => payloads.push(payload));

    // Rewriting the KEY, not mutating the map in place — the shape a remote
    // peer's update, a snapshot import and an undo all take.
    store.spaceDoc.transact(() => {
      const mindmapChildren = new Y.Map<unknown>();
      mindmapChildren.set(rootShape, { index: 'a0' });
      mindmapChildren.set(childShape, { index: 'a0', parent: rootShape });
      mindmap.yMap.set('children', mindmapChildren);

      const groupChildren = new Y.Map<unknown>();
      groupChildren.set(groupedShape, true);
      group.yMap.set('children', groupChildren);
    }, 'remote-peer');

    const childIdsPayloads = payloads.filter(p => 'childIds' in p.props);

    expect(childIdsPayloads.map(p => p.id).sort()).toEqual(
      [mindmapId, groupId].sort()
    );
    expect(childIdsPayloads.map(p => p.local)).toEqual([false, false]);
  });
});
