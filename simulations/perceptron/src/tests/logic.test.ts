import { describe, it, expect } from 'vitest';
import { createInitialState, step, subStep } from '../logic';
import { PerceptronConfig } from '../types';

describe('Perceptron Simulation Logic', () => {
  const baseConfig: PerceptronConfig = {
    learningRate: 0.1,
    datasetPreset: 'AND',
    maxEpochs: 20,
  };

  it('creates clean initial state with zeroed weights and unclassified bias', () => {
    const state = createInitialState(baseConfig);
    expect(state.weights).toEqual([0, 0]);
    expect(state.bias).toBe(0);
    expect(state.dataset.length).toBe(4);
    expect(state.epoch).toBe(1);
    expect(state.isConverged).toBe(false);
  });

  it('correctly updates weights upon encountering a misclassified sample', () => {
    const initialState = createInitialState(baseConfig);
    // At w=[0, 0], b=0: weightedSum = 0 => prediction = 1
    // Sample 0 of AND is (0, 0) with label -1 => prediction (1) != label (-1) => Error!
    const result = step(initialState, baseConfig);

    expect(result.stepLog).toBeDefined();
    expect(result.stepLog?.updated).toBe(true);
    expect(result.stepLog?.prediction).toBe(1);
    expect(result.stepLog?.isCorrect).toBe(false);
    // delta = lr * label = 0.1 * -1 = -0.1 on bias
    expect(result.nextState.bias).toBe(-0.1);
    expect(result.nextState.totalSteps).toBe(1);
  });

  it('converges to 100% accuracy on linearly separable AND logic dataset', () => {
    let state = createInitialState(baseConfig);
    let isComplete = false;
    let stepCount = 0;
    const maxSafetySteps = 200;

    while (!isComplete && stepCount < maxSafetySteps) {
      const res = step(state, baseConfig);
      state = res.nextState;
      isComplete = res.isComplete;
      stepCount++;
    }

    expect(state.isConverged).toBe(true);
    // Verify that every point in the dataset is now correctly classified
    for (const pt of state.dataset) {
      const sum = state.weights[0] * pt.x1 + state.weights[1] * pt.x2 + state.bias;
      const pred = sum >= 0 ? 1 : -1;
      expect(pred).toBe(pt.label);
    }
  });

  it('converges on 2D separable clusters dataset', () => {
    const clusterConfig: PerceptronConfig = {
      learningRate: 0.2,
      datasetPreset: 'SEPARABLE_CLUSTERS',
      maxEpochs: 30,
    };

    let state = createInitialState(clusterConfig);
    let isComplete = false;
    let stepCount = 0;

    while (!isComplete && stepCount < 500) {
      const res = step(state, clusterConfig);
      state = res.nextState;
      isComplete = res.isComplete;
      stepCount++;
    }

    expect(state.isConverged).toBe(true);
  });

  it('advances through intermediate stages with subStep', () => {
    const state0 = createInitialState(baseConfig);
    expect(state0.stage).toBe('idle');

    const r1 = subStep(state0, baseConfig);
    expect(r1.nextState.stage).toBe('feed');

    const r2 = subStep(r1.nextState, baseConfig);
    expect(r2.nextState.stage).toBe('summate');

    const r3 = subStep(r2.nextState, baseConfig);
    expect(r3.nextState.stage).toBe('activate');

    const r4 = subStep(r3.nextState, baseConfig);
    expect(r4.nextState.stage).toBe('evaluate');

    const r5 = subStep(r4.nextState, baseConfig);
    expect(r5.nextState.stage).toBe('update');
  });
});
