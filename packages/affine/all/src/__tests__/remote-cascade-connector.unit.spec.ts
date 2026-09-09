/**
 * The connector watcher never turns a REMOTE edit into a local persisted write.
 *
 * Rule (PR #242): a cascade reacts to LOCAL transactions only, the receiving
 * peer trusts the sync. The watcher used to ignore `local` altogether and
 * performed three persisted writes on every peer that merely watched a
 * connector move:
 *
 * - `reanchorConnectorsForPolygon` rewriting `source` / `target` when a
 *   polygon's vertices changed,
 * - `curveControlPoint = null` when the connector's mode changed,
 * - `labelXYWH = …` inside `ConnectorPathGenerator.updatePath`.
 *
 * All three are `@field()`s, i.e. straight CRDT writes: `Store.transact` has
 * no readonly guard, so a readonly viewer wrote them silently. What must stay
 * unconditional is the path recomputation — `path`, `absolutePath` and the
 * connector's own `xywh` are `@local()`, so every peer recomputes them to
 * repaint.
 */
import type { SurfaceBlockModel } from '@labre/affine-block-surface';
import { StoreExtensionManager } from '@labre/affine-ext-loader';
import type { ConnectorElementModel, Connection } from '@labre/affine-model';
import { ConnectorMode } from '@labre/affine-model';
import { Text } from '@labre/store';
import {
  createAutoIncrementIdGenerator,
  TestWorkspace,
} from '@labre/store/test';
import { describe, expect, test } from 'vitest';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';
import * as Y from 'yjs';

import { getInternalStoreExtensions } from '../extensions/store.js';

/** A unit square, so its anchors are the four corners and four edge midpoints. */
const SQUARE = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

/**
 * A stored anchor position that is NOT one of the polygon's anchors, so
 * re-anchoring has something to correct: the nearest anchor is the `[1, 1]`
 * corner. Nothing else in the document moves, which keeps "did the watcher
 * write?" a one-value question.
 */
const OFF_ANCHOR = [0.9, 0.9];

/** Lets every `queueMicrotask` the watcher schedules run. */
const flush = () => Promise.resolve();

const storeExtensions = () =>
  new StoreExtensionManager(getInternalStoreExtensions({})).get('store');

function createBoard(id: string) {
  const collection = new TestWorkspace({ id });
  collection.storeExtensions = storeExtensions();
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

/** A polygon, a rectangle, and a connector anchored off-anchor on the polygon. */
function addConnectedShapes(surface: SurfaceBlockModel) {
  const polygonId = surface.addElement({
    type: 'shape',
    shapeType: 'polygon',
    xywh: '[0,0,100,100]',
    vertices: SQUARE,
  });
  const targetId = surface.addElement({
    type: 'shape',
    shapeType: 'rect',
    xywh: '[300,0,100,100]',
  });
  const connectorId = surface.addElement({
    type: 'connector',
    source: { id: polygonId, position: OFF_ANCHOR },
    target: { id: targetId },
  });

  return {
    polygonId,
    targetId,
    connectorId,
    connector: surface.getElementById(connectorId) as ConnectorElementModel,
  };
}

const sourceOf = (connector: ConnectorElementModel) =>
  (connector.yMap.get('source') as Connection).position;

describe('the connector watcher and a remote edit', () => {
  test.each([{ readonly: true }, { readonly: false }])(
    'a remote polygon edit does not re-anchor the connector (readonly: $readonly)',
    async ({ readonly }) => {
      const { store, surface } = createBoard(`reanchor-${readonly}`);
      const { polygonId, connector } = addConnectedShapes(surface);
      await flush();

      store.readonly = readonly;

      surface.elementUpdated.next({
        id: polygonId,
        props: { vertices: SQUARE },
        oldValues: {},
        local: false,
      });
      await flush();

      expect(sourceOf(connector)).toEqual(OFF_ANCHOR);
    }
  );

  test('a local polygon edit still re-anchors the connector', async () => {
    const { surface } = createBoard('reanchor-local');
    const { polygonId, connector } = addConnectedShapes(surface);
    await flush();

    surface.elementUpdated.next({
      id: polygonId,
      props: { vertices: SQUARE },
      oldValues: {},
      local: true,
    });
    await flush();

    expect(sourceOf(connector)).toEqual([1, 1]);
  });

  test.each([{ readonly: true }, { readonly: false }])(
    'a remote mode change does not clear the curve control point (readonly: $readonly)',
    async ({ readonly }) => {
      const { store, surface } = createBoard(`mode-${readonly}`);
      const { connectorId, connector } = addConnectedShapes(surface);
      connector.curveControlPoint = [10, 10];
      await flush();

      store.readonly = readonly;

      surface.elementUpdated.next({
        id: connectorId,
        props: { mode: ConnectorMode.Orthogonal },
        oldValues: {},
        local: false,
      });
      await flush();

      expect(connector.yMap.get('curveControlPoint')).toEqual([10, 10]);
    }
  );

  test('a local mode change still clears the curve control point', async () => {
    const { surface } = createBoard('mode-local');
    const { connectorId, connector } = addConnectedShapes(surface);
    connector.curveControlPoint = [10, 10];
    await flush();

    surface.elementUpdated.next({
      id: connectorId,
      props: { mode: ConnectorMode.Orthogonal },
      oldValues: {},
      local: true,
    });
    await flush();

    expect(connector.yMap.get('curveControlPoint')).toBeNull();
  });

  test('an update for an element that is already gone does not throw', () => {
    const { surface } = createBoard('missing-element');
    addConnectedShapes(surface);

    expect(() =>
      surface.elementUpdated.next({
        id: 'deleted-by-a-remote-peer',
        props: { xywh: '[0,0,10,10]' },
        oldValues: {},
        local: false,
      })
    ).not.toThrow();
  });
});

/**
 * Two peers on one document, wired the way a sync provider does it (see
 * `packages/framework/std/src/__tests__/gfx/remote-cascade.unit.spec.ts`):
 * the author writes, the viewer only ever RECEIVES, one transaction per
 * update, with a NAMED origin — an origin-less transaction reads as local in
 * `Store._handleYEvent`.
 */
const twoPeers = (id: string) => {
  const options = { id, idGenerator: createAutoIncrementIdGenerator() };

  const authorWorkspace = new TestWorkspace(options);
  authorWorkspace.storeExtensions = storeExtensions();
  authorWorkspace.meta.initialize();
  const authorDoc = authorWorkspace.createDoc('home');
  const queue: Uint8Array[] = [];
  authorDoc.spaceDoc.on('update', (update: Uint8Array) => queue.push(update));
  const author = authorDoc.getStore({ id: 'home' });
  authorDoc.load();

  const rootId = author.addBlock('affine:page', { title: new Text('#251') });
  const surfaceId = author.addBlock('affine:surface', {}, rootId);

  const viewerWorkspace = new TestWorkspace(options);
  viewerWorkspace.storeExtensions = storeExtensions();
  applyUpdate(viewerWorkspace.doc, encodeStateAsUpdate(authorWorkspace.doc));
  const viewerDoc = viewerWorkspace.getDoc('home')!;
  const sync = () => {
    for (const update of queue.splice(0)) {
      applyUpdate(viewerDoc.spaceDoc, update, 'remote-peer');
    }
  };
  sync();
  const viewer = viewerDoc.getStore({ id: 'home' });
  viewerDoc.load();

  let localWrites = 0;
  viewerDoc.spaceDoc.on('afterTransaction', transaction => {
    if (transaction.local) localWrites++;
  });

  return {
    author,
    authorSurface: author.getBlock(surfaceId)!.model as SurfaceBlockModel,
    viewer,
    viewerSurface: viewer.getBlock(surfaceId)!.model as SurfaceBlockModel,
    sync,
    localWrites: () => localWrites,
  };
};

describe('a connector watched by a second peer', () => {
  test.each([{ readonly: true }, { readonly: false }])(
    'the viewer opens no transaction of its own while the author edits (viewer readonly: $readonly)',
    async ({ readonly }) => {
      const {
        author,
        authorSurface,
        viewer,
        viewerSurface,
        sync,
        localWrites,
      } = twoPeers(`connector-two-peers-${readonly}`);

      const polygonId = authorSurface.addElement({
        type: 'shape',
        shapeType: 'polygon',
        xywh: '[0,0,100,100]',
        vertices: SQUARE,
      });
      const targetId = authorSurface.addElement({
        type: 'shape',
        shapeType: 'rect',
        xywh: '[300,0,100,100]',
      });
      const connectorId = authorSurface.addElement({
        type: 'connector',
        source: { id: polygonId, position: OFF_ANCHOR },
        target: { id: targetId },
        // A labelled connector: the label box is the third persisted write
        // `updatePath` used to perform on every peer.
        text: new Y.Text('label'),
        labelXYWH: [0, 0, 60, 20],
        curveControlPoint: [10, 10],
      });
      await flush();
      sync();
      await flush();

      expect(viewerSurface.getElementById(connectorId)).not.toBeNull();

      viewer.readonly = readonly;
      const before = localWrites();

      // Three edits, each of which used to cascade into a write on the viewer.
      authorSurface.updateElement(polygonId, {
        vertices: [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ],
      });
      authorSurface.updateElement(targetId, { xywh: '[500,120,100,100]' });
      authorSurface.updateElement(connectorId, {
        mode: ConnectorMode.Orthogonal,
      });
      await flush();

      expect(sync).not.toThrow();
      await flush();

      expect(localWrites()).toBe(before);
      // The author is untouched by the guards: it still owns the document.
      expect(author.readonly).toBe(false);
    }
  );
});
