import { describe, it, expect } from 'vitest';
import { createInitialState, step, subStep } from '../logic';

describe('Contributor Simulation: Binary Search Logic', () => {
  const config = { arraySize: 10, target: 37 };

  it('initializes search state with valid bounds and sorted array', () => {
    const state = createInitialState(config);
    expect(state.array).toHaveLength(10);
    expect(state.low).toBe(0);
    expect(state.high).toBe(9);
    expect(state.mid).toBeNull();
    expect(state.isComplete).toBe(false);
    expect(state.foundIndex).toBeNull();
  });

  it('successfully locates a target that exists in the array', () => {
    let state = createInitialState({ arraySize: 10, target: 37 });
    let iterations = 0;

    while (!state.isComplete && iterations < 10) {
      const result = step(state, { arraySize: 10, target: 37 });
      state = result.nextState;
      iterations++;
    }

    expect(state.isComplete).toBe(true);
    expect(state.foundIndex).not.toBeNull();
    expect(state.array[state.foundIndex!]).toBe(37);
    expect(state.phase).toBe('found');
    // Binary search must converge in <= ceil(log2(10)) + 1 steps
    expect(iterations).toBeLessThanOrEqual(5);
  });

  it('terminates with not-found when target does not exist', () => {
    let state = createInitialState({ arraySize: 10, target: 999 });
    let iterations = 0;

    while (!state.isComplete && iterations < 15) {
      const result = step(state, { arraySize: 10, target: 999 });
      state = result.nextState;
      iterations++;
    }

    expect(state.isComplete).toBe(true);
    expect(state.foundIndex).toBeNull();
    expect(state.phase).toBe('not-found');
    expect(state.low).toBeGreaterThan(state.high);
  });

  it('cycles through correct sub-step phases: calc-mid, compare, narrow', () => {
    let state = createInitialState({ arraySize: 8, target: 46 });

    // 1st sub-step: calc-mid
    let res = subStep(state, { arraySize: 8, target: 46 });
    expect(res.nextState.phase).toBe('calc-mid');
    expect(res.nextState.mid).toBe(3); // Math.floor((0 + 7) / 2)

    // 2nd sub-step: compare
    state = res.nextState;
    res = subStep(state, { arraySize: 8, target: 46 });
    expect(res.nextState.phase).toBe('compare');
    expect(res.nextState.comparisons).toBe(1);

    // 3rd sub-step: narrow
    state = res.nextState;
    res = subStep(state, { arraySize: 8, target: 46 });
    expect(res.nextState.phase).toBe('narrow');
    expect(res.nextState.low).toBeGreaterThan(0);
  });
});
