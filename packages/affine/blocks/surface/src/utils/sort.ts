export function loadingSort<T extends { id: string; deps: string[] }>(
  elements: T[]
) {
  const graph = new Map<string, string[]>();
  const outDegree = new Map<string, number>();
  const sortedOrder = [];
  const map = new Map<string, T>();

  elements.forEach(element => {
    outDegree.set(element.id, 0);
    map.set(element.id, element);
  });

  elements.forEach(element => {
    element.deps.forEach(depId => {
      if (outDegree.has(depId)) {
        graph.has(depId)
          ? graph.get(depId)!.push(element.id)
          : graph.set(depId, [element.id]);
        outDegree.set(element.id, outDegree.get(element.id)! + 1);
      }
    });
  });

  const queue: string[] = [];

  for (const [id, degree] of outDegree) {
    if (degree === 0) {
      queue.push(id);
    }
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    sortedOrder.push(node);

    const deps = graph.get(node) || [];
    deps.forEach(depId => {
      if (outDegree.has(depId)) {
        outDegree.set(depId, outDegree.get(depId)! - 1);

        if (outDegree.get(depId) === 0) {
          queue.push(depId);
        }
      }
    });
  }

  return sortedOrder.map(id => map.get(id)!);
}

/**
 * Paint order of two serialized elements, group-aware to ANY depth.
 *
 * `groupIndexMap` maps a child id to its parent group's `{ id, index }`. An
 * element's position is the chain of indexes from its outermost group down to
 * itself, and two chains compare lexicographically — the same order the live
 * layer's `compare` derives from the group tree. A group is a strict prefix of
 * its children's chains, so it sorts before them.
 *
 * It used to look ONE level up only, which made the comparator cyclic on a
 * group inside a group (a leaf of the outer group, a leaf of the inner one and
 * the inner group itself had no consistent order) — and `Array.sort` on a
 * cyclic comparator returns whatever it likes.
 */
export function sortIndex(
  a: { id: string; index: string },
  b: { id: string; index: string },
  groupIndexMap: Map<string, { id: string; index: string }>
) {
  const chainOf = (el: { id: string; index: string }) => {
    const chain = [el.index];
    const seen = new Set<string>([el.id]);
    for (
      let group = groupIndexMap.get(el.id);
      group && !seen.has(group.id);
      group = groupIndexMap.get(group.id)
    ) {
      seen.add(group.id);
      chain.unshift(group.index);
    }
    return chain;
  };
  const ca = chainOf(a);
  const cb = chainOf(b);
  const depth = Math.min(ca.length, cb.length);
  for (let i = 0; i < depth; i++) {
    if (ca[i] !== cb[i]) return ca[i] > cb[i] ? 1 : -1;
  }
  return ca.length - cb.length;
}
