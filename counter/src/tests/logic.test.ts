import { describe, it, expect } from 'vitest';
import { createInitialState, step } from '../logic';
import { CounterConfig } from '../types';

describe('Counter Simulation Logic', () => {
  const config: CounterConfig = {
    stepSize: 3,
    target: 10,
  };

  it('initializes count to 0', () => {
    const state = createInitialState(config);
    expect(state.count).toBe(0);
    expect(state.history).toEqual([0]);
  });

  it('increments by stepSize and records history', () => {
    const s0 = createInitialState(config);
    const r1 = step(s0, config);
    expect(r1.nextState.count).toBe(3);
    expect(r1.isComplete).toBe(false);
    expect(r1.stepLog?.increment).toBe(3);

    const r2 = step(r1.nextState, config);
    expect(r2.nextState.count).toBe(6);
    expect(r2.isComplete).toBe(false);
  });

  it('marks complete when target threshold is reached', () => {
    let state = createInitialState(config);
    let isComplete = false;
    let steps = 0;

    while (!isComplete && steps < 10) {
      const res = step(state, config);
      state = res.nextState;
      isComplete = res.isComplete;
      steps++;
    }

    expect(isComplete).toBe(true);
    expect(state.count).toBeGreaterThanOrEqual(config.target);
  });
});
