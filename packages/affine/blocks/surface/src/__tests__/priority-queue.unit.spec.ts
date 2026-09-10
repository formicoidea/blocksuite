import { describe, expect, it } from 'vitest';

import { PriorityQueue } from '../utils/priority-queue.js';

const drain = (values: number[]): number[] => {
  const pq = new PriorityQueue<number, number>((a, b) => a - b);
  values.forEach(value => pq.enqueue(value, value));

  const dequeued: number[] = [];
  while (!pq.empty()) {
    dequeued.push(pq.dequeue() as number);
  }
  return dequeued;
};

// Deterministic PRNG (mulberry32) so a failing random case can be replayed.
const makeRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe('priority queue', () => {
  it('should dequeue the smallest item', () => {
    const pq = new PriorityQueue<string, number>((a, b) => a - b);
    pq.enqueue('d', 4);
    pq.enqueue('c', 3);
    expect(pq.dequeue()).toBe('c');

    pq.enqueue('b', 2);
    pq.enqueue('a', 1);
    expect(pq.dequeue()).toBe('a');
    expect(pq.dequeue()).toBe('b');

    pq.enqueue('e', 5);
    expect(pq.dequeue()).toBe('d');
    expect(pq.dequeue()).toBe('e');
    expect(pq.dequeue()).toBe(null);
  });

  it('should sink an element below a right child that is smaller than it', () => {
    // Minimal case where the right child has to be compared against the
    // element being sunk, not only against the left child.
    expect(drain([1, 2, 3, 7, 6, 5, 4])).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('should dequeue an arbitrary set of priorities in order', () => {
    expect(drain([11, 63, 91, 7, 38, 67, 8, 13, 29])).toEqual([
      7, 8, 11, 13, 29, 38, 63, 67, 91,
    ]);
  });

  it('should keep the heap invariant on random inputs', () => {
    const random = makeRandom(0x1a2b3c4d);
    const failures: string[] = [];

    for (let run = 0; run < 2000; run++) {
      const size = 3 + Math.floor(random() * 10);
      const values = Array.from({ length: size }, () =>
        Math.floor(random() * 100)
      );

      const dequeued = drain(values);
      const sorted = [...values].sort((a, b) => a - b);

      if (dequeued.join(',') !== sorted.join(',')) {
        failures.push(
          `[${values.join(', ')}] dequeued as [${dequeued.join(', ')}]`
        );
      }
    }

    expect(failures.slice(0, 5)).toEqual([]);
    expect(failures.length).toBe(0);
  });
});
