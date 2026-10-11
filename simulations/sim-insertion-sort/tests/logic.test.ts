import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  step,
  generateRandomArray,
  parseCustomArray,
  PRESET_ARRAYS,
} from '../src/logic';
import { InsertionSortConfig, InsertionSortState } from '../src/types';

describe('Insertion Sort Algorithmic Logic & Invariants', () => {
  const baseConfig: InsertionSortConfig = {
    initialArray: [24, 13, 9, 64, 7],
    arraySize: 5,
    minValue: 1,
    maxValue: 99,
    preset: 'custom',
  };

  it('creates clean initial state with length-1 sorted prefix', () => {
    const state = createInitialState(baseConfig);
    expect(state.originalArray).toEqual([24, 13, 9, 64, 7]);
    expect(state.array).toEqual([24, 13, 9, 64, 7]);
    expect(state.outerIndex).toBe(1);
    expect(state.sortedBoundary).toBe(0);
    expect(state.phase).toBe('select-key');
    expect(state.comparisons).toBe(0);
    expect(state.shifts).toBe(0);
    expect(state.keyPlacements).toBe(0);
    expect(state.completedPasses).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('sorts an array completely through step-by-step state transitions', () => {
    let state = createInitialState(baseConfig);
    let guard = 0;
    const maxSteps = 200;

    while (!state.isComplete && guard < maxSteps) {
      const stepRes = step(state, baseConfig);
      state = stepRes.nextState;
      guard++;
    }

    expect(state.isComplete).toBe(true);
    expect(state.array).toEqual([7, 9, 13, 24, 64]);
    expect(state.comparisons).toBeGreaterThan(0);
    expect(state.shifts).toBeGreaterThan(0);
    expect(state.keyPlacements).toBe(4); // 4 passes for 5 elements
    expect(state.completedPasses).toBe(4);
  });

  it('maintains the multiset invariant after every step', () => {
    let state = createInitialState(baseConfig);
    const sortedOriginal = [...baseConfig.initialArray].sort((a, b) => a - b);

    let steps = 0;
    while (!state.isComplete && steps < 100) {
      const res = step(state, baseConfig);
      state = res.nextState;
      steps++;

      // When not in the middle of a shift (where array has duplicate temporary value), check after insert
      if (state.phase === 'pass-complete' || state.phase === 'complete') {
        const currentSorted = [...state.array].sort((a, b) => a - b);
        expect(currentSorted).toEqual(sortedOriginal);

        // Sorted prefix invariant
        for (let i = 0; i < state.sortedBoundary; i++) {
          expect(state.array[i]).toBeLessThanOrEqual(state.array[i + 1]);
        }
      }
    }

    expect(state.array).toEqual(sortedOriginal);
  });

  it('handles already-sorted array with O(n) comparisons and 0 shifts', () => {
    const config: InsertionSortConfig = {
      initialArray: [10, 20, 30, 40, 50],
      arraySize: 5,
      minValue: 1,
      maxValue: 99,
      preset: 'already-sorted',
    };

    let state = createInitialState(config);
    while (!state.isComplete) {
      state = step(state, config).nextState;
    }

    expect(state.array).toEqual([10, 20, 30, 40, 50]);
    expect(state.shifts).toBe(0);
    expect(state.comparisons).toBe(4); // Exactly 1 comparison per outer pass
    expect(state.isComplete).toBe(true);
  });

  it('handles reverse-sorted array with maximum comparisons and shifts', () => {
    const config: InsertionSortConfig = {
      initialArray: [50, 40, 30, 20, 10],
      arraySize: 5,
      minValue: 1,
      maxValue: 99,
      preset: 'reversed',
    };

    let state = createInitialState(config);
    while (!state.isComplete) {
      state = step(state, config).nextState;
    }

    expect(state.array).toEqual([10, 20, 30, 40, 50]);
    // For reverse array: sum(1..4) = 10 shifts
    expect(state.shifts).toBe(10);
    expect(state.comparisons).toBe(10);
    expect(state.isComplete).toBe(true);
  });

  it('preserves stability with duplicate values', () => {
    // Array with duplicates
    const config: InsertionSortConfig = {
      initialArray: [15, 8, 15, 3],
      arraySize: 4,
      minValue: 1,
      maxValue: 99,
      preset: 'custom',
    };

    let state = createInitialState(config);
    while (!state.isComplete) {
      state = step(state, config).nextState;
    }

    expect(state.array).toEqual([3, 8, 15, 15]);
  });

  it('correctly sorts negative and mixed values', () => {
    const config: InsertionSortConfig = {
      initialArray: [0, -15, 42, -3, 8],
      arraySize: 5,
      minValue: -50,
      maxValue: 50,
      preset: 'custom',
    };

    let state = createInitialState(config);
    while (!state.isComplete) {
      state = step(state, config).nextState;
    }

    expect(state.array).toEqual([-15, -3, 0, 8, 42]);
  });

  it('handles single-element array as immediately complete', () => {
    const config: InsertionSortConfig = {
      initialArray: [42],
      arraySize: 1,
      minValue: 1,
      maxValue: 99,
      preset: 'custom',
    };

    const state = createInitialState(config);
    expect(state.isComplete).toBe(true);
    expect(state.array).toEqual([42]);

    const stepRes = step(state, config);
    expect(stepRes.isComplete).toBe(true);
    expect(stepRes.stepLog?.action).toBe('NOOP');
  });

  it('handles empty array cleanly', () => {
    const config: InsertionSortConfig = {
      initialArray: [],
      arraySize: 0,
      minValue: 1,
      maxValue: 99,
      preset: 'custom',
    };

    const state = createInitialState(config);
    expect(state.isComplete).toBe(true);
    expect(state.array).toEqual([]);

    const stepRes = step(state, config);
    expect(stepRes.isComplete).toBe(true);
  });

  it('validates manual custom input correctly', () => {
    expect(parseCustomArray('  10, 25, 30  ').valid).toBe(true);
    expect(parseCustomArray('10 25 30').array).toEqual([10, 25, 30]);

    // Error cases
    expect(parseCustomArray('').valid).toBe(false);
    expect(parseCustomArray('abc, 123').valid).toBe(false);
    expect(parseCustomArray('10, 9999', 0, 100).valid).toBe(false);
  });

  it('is deterministic: identical calls yield identical states', () => {
    const s1 = createInitialState(baseConfig);
    const s2 = createInitialState(baseConfig);
    expect(s1).toEqual(s2);

    const step1 = step(s1, baseConfig);
    const step2 = step(s2, baseConfig);
    expect(step1).toEqual(step2);
  });

  it('tracks keyOriginIndex, keyTargetIndex, and lastComparison correctly across phases', () => {
    let state = createInitialState({
      initialArray: [20, 10],
      arraySize: 2,
      minValue: 10,
      maxValue: 20,
      preset: 'custom',
    });

    expect(state.keyOriginIndex).toBeNull();
    expect(state.keyTargetIndex).toBeNull();
    expect(state.gapIndex).toBeNull();
    expect(state.lastComparison).toBeNull();

    // Step 1: select-key
    const step1 = step(state, baseConfig);
    state = step1.nextState;
    expect(state.phase).toBe('compare');
    expect(state.key).toBe(10);
    expect(state.keyOriginIndex).toBe(1);
    expect(state.keyTargetIndex).toBe(1);
    expect(state.gapIndex).toBeNull();

    // Step 2: compare 20 > 10 -> shift
    const step2 = step(state, baseConfig);
    state = step2.nextState;
    expect(state.phase).toBe('shift');
    expect(state.lastComparison).toEqual({
      keyVal: 10,
      compareVal: 20,
      isGreater: true,
    });
    expect(state.keyTargetIndex).toBe(0);

    // Step 3: perform shift -> gap opened at index 0
    const step3 = step(state, baseConfig);
    state = step3.nextState;
    expect(state.shifts).toBe(1);
    expect(state.compareIndex).toBe(-1);
    expect(state.gapIndex).toBe(0);

    // Step 4: compare with boundary (< 0) -> insert
    const step4 = step(state, baseConfig);
    state = step4.nextState;
    expect(state.phase).toBe('insert');
    expect(state.keyTargetIndex).toBe(0);
    expect(state.gapIndex).toBe(0);

    // Step 5: insert key at 0 -> gapIndex cleared
    const step5 = step(state, baseConfig);
    state = step5.nextState;
    expect(state.phase).toBe('pass-complete');
    expect(state.array).toEqual([10, 20]);
    expect(state.keyTargetIndex).toBe(0);
    expect(state.gapIndex).toBeNull();

    // Step 6: pass complete -> sorting complete
    const step6 = step(state, baseConfig);
    state = step6.nextState;
    expect(state.isComplete).toBe(true);
    expect(state.keyOriginIndex).toBeNull();
    expect(state.keyTargetIndex).toBeNull();
    expect(state.gapIndex).toBeNull();
  });

  it('correctly manages empty gap transitions for target array [27, 38, 43, 3, 9, 82, 10, 19]', () => {
    const targetArr = [27, 38, 43, 3, 9, 82, 10, 19];
    const cfg: InsertionSortConfig = {
      initialArray: [...targetArr],
      arraySize: targetArr.length,
      minValue: 1,
      maxValue: 100,
      preset: 'custom',
    };

    let state = createInitialState(cfg);

    // Run until pass 3 where key 3 at index 3 is selected (indices 0..2: [27, 38, 43])
    while (!(state.outerIndex === 3 && state.phase === 'select-key') && !state.isComplete) {
      state = step(state, cfg).nextState;
    }

    expect(state.outerIndex).toBe(3);
    expect(state.array[3]).toBe(3);

    // Step: select key 3
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('compare');
    expect(state.key).toBe(3);
    expect(state.compareIndex).toBe(2); // array[2] = 43

    // Step: compare 43 > 3 -> shift phase
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('shift');

    // Step: execute shift -> 43 moves to [3], gap opens at [2]
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('compare');
    expect(state.array[3]).toBe(43);
    expect(state.gapIndex).toBe(2);
    expect(state.compareIndex).toBe(1); // next compare is 38 at [1]

    // Step: compare 38 > 3 -> shift phase
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('shift');

    // Step: execute shift -> 38 moves to [2], gap moves to [1]
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('compare');
    expect(state.array[2]).toBe(38);
    expect(state.gapIndex).toBe(1);
    expect(state.compareIndex).toBe(0); // next compare is 27 at [0]

    // Step: compare 27 > 3 -> shift phase
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('shift');

    // Step: execute shift -> 27 moves to [1], gap moves to [0]
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('compare');
    expect(state.array[1]).toBe(27);
    expect(state.gapIndex).toBe(0);
    expect(state.compareIndex).toBe(-1); // boundary reached

    // Step: boundary detected -> insert phase
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('insert');
    expect(state.gapIndex).toBe(0);

    // Step: insert key 3 at [0] -> gap cleared!
    state = step(state, cfg).nextState;
    expect(state.phase).toBe('pass-complete');
    expect(state.array[0]).toBe(3);
    expect(state.gapIndex).toBeNull();
    expect(state.array.slice(0, 4)).toEqual([3, 27, 38, 43]);

    // Finish entire sort to completion
    while (!state.isComplete) {
      state = step(state, cfg).nextState;
    }

    expect(state.isComplete).toBe(true);
    expect(state.gapIndex).toBeNull();
    expect(state.array).toEqual([...targetArr].sort((a, b) => a - b));
  });

  it('correctly sorts all preset arrays to completion without semantic degradation', () => {
    const testCases: { name: string; arr: number[] }[] = [
      { name: 'nearly-sorted', arr: [7, 14, 28, 21, 35] },
      { name: 'reversed', arr: [40, 32, 24, 16, 8] },
      { name: 'few-unique', arr: [12, 25, 12, 40, 25, 40, 12] },
      { name: 'already-sorted', arr: [6, 12, 18, 24, 30] },
      { name: 'negative-and-zero', arr: [-10, 0, -25, 15, -5, 0] },
    ];

    for (const { arr } of testCases) {
      const cfg: InsertionSortConfig = {
        initialArray: [...arr],
        arraySize: arr.length,
        minValue: -50,
        maxValue: 50,
        preset: 'custom',
      };

      let state = createInitialState(cfg);
      let steps = 0;
      while (!state.isComplete && steps < 500) {
        const res = step(state, cfg);
        state = res.nextState;
        steps++;
      }

      expect(state.isComplete).toBe(true);
      const expected = [...arr].sort((a, b) => a - b);
      expect(state.array).toEqual(expected);
    }
  });
});
