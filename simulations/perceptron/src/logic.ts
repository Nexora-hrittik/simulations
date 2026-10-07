import { StepResult } from '@rec-labs/sdk';
import {
  DataPoint,
  DatasetPreset,
  PerceptronConfig,
  PerceptronState,
  PerceptronStepLog,
} from './types';
import { stepActivation } from './math';

export const PRESET_DATASETS: Record<'AND' | 'OR' | 'XOR' | 'SEPARABLE_CLUSTERS', DataPoint[]> = {
  AND: [
    { id: 'and-0', x1: 0, x2: 0, y: 0, label: -1 },
    { id: 'and-1', x1: 0, x2: 1, y: 0, label: -1 },
    { id: 'and-2', x1: 1, x2: 0, y: 0, label: -1 },
    { id: 'and-3', x1: 1, x2: 1, y: 1, label: 1 },
  ],
  OR: [
    { id: 'or-0', x1: 0, x2: 0, y: 0, label: -1 },
    { id: 'or-1', x1: 0, x2: 1, y: 1, label: 1 },
    { id: 'or-2', x1: 1, x2: 0, y: 1, label: 1 },
    { id: 'or-3', x1: 1, x2: 1, y: 1, label: 1 },
  ],
  XOR: [
    { id: 'xor-0', x1: 0, x2: 0, y: 0, label: -1 },
    { id: 'xor-1', x1: 0, x2: 1, y: 1, label: 1 },
    { id: 'xor-2', x1: 1, x2: 0, y: 1, label: 1 },
    { id: 'xor-3', x1: 1, x2: 1, y: 0, label: -1 },
  ],
  SEPARABLE_CLUSTERS: [
    { id: 'c1-1', x1: 1.2, x2: 1.1, y: 1, label: 1 },
    { id: 'c1-2', x1: 0.9, x2: 1.6, y: 1, label: 1 },
    { id: 'c1-3', x1: 1.6, x2: 0.7, y: 1, label: 1 },
    { id: 'c1-4', x1: 0.6, x2: 1.3, y: 1, label: 1 },
    { id: 'c2-1', x1: -1.1, x2: -0.8, y: 0, label: -1 },
    { id: 'c2-2', x1: -1.5, x2: -1.2, y: 0, label: -1 },
    { id: 'c2-3', x1: -0.7, x2: -1.5, y: 0, label: -1 },
    { id: 'c2-4', x1: -1.3, x2: -0.4, y: 0, label: -1 },
  ],
};

export const DATASETS = PRESET_DATASETS;

export function getDataset(preset: DatasetPreset): DataPoint[] {
  if (preset === 'CUSTOM') return [];
  return PRESET_DATASETS[preset] ?? PRESET_DATASETS.AND;
}

export function createInitialState(config: PerceptronConfig): PerceptronState {
  return {
    weights: [0, 0],
    bias: 0,
    dataset: getDataset(config.datasetPreset),
    currentIndex: 0,
    epoch: 1,
    errorsInEpoch: 0,
    isConverged: false,
    totalSteps: 0,
    stage: 'idle',
    traceSum: null,
    tracePred: null,
    traceError: null,
    traceDeltaW1: 0,
    traceDeltaW2: 0,
    traceDeltaB: 0,
    traceMode: 'focused',
    history: [],
  };
}

/**
 * Macro step: advances execution across 1 entire dataset row and applies the Rosenblatt update.
 */
export function step(
  state: PerceptronState,
  config: PerceptronConfig
): StepResult<PerceptronState, PerceptronStepLog> {
  if (state.isConverged || state.epoch > config.maxEpochs || state.dataset.length === 0) {
    return {
      nextState: { ...state, stage: 'idle' },
      isComplete: true,
    };
  }

  const safeIndex =
    state.dataset.length > 0
      ? ((state.currentIndex % state.dataset.length) + state.dataset.length) % state.dataset.length
      : 0;
  const sample = state.dataset[safeIndex];
  if (!sample) {
    return {
      nextState: { ...state, stage: 'idle' },
      isComplete: true,
    };
  }

  const curW1 = state.weights[0];
  const curW2 = state.weights[1];
  const curB = state.bias;

  const weightedSum = Number((curW1 * sample.x1 + curW2 * sample.x2 + curB).toFixed(4));
  const prediction: 0 | 1 = stepActivation(weightedSum);
  const error = sample.y - prediction;
  const isCorrect = error === 0;

  let nextW1 = curW1;
  let nextW2 = curW2;
  let nextBias = curB;
  let deltaW1 = 0;
  let deltaW2 = 0;
  let deltaB = 0;
  let updated = false;

  if (!isCorrect) {
    deltaW1 = Number((config.learningRate * error * sample.x1).toFixed(4));
    deltaW2 = Number((config.learningRate * error * sample.x2).toFixed(4));
    deltaB = Number((config.learningRate * error * 1).toFixed(4));

    nextW1 = Number((curW1 + deltaW1).toFixed(4));
    nextW2 = Number((curW2 + deltaW2).toFixed(4));
    nextBias = Number((curB + deltaB).toFixed(4));
    updated = true;
  }

  const newErrorsInEpoch = state.errorsInEpoch + (isCorrect ? 0 : 1);
  const isEndOfEpoch = safeIndex === state.dataset.length - 1;

  let nextIndex = safeIndex + 1;
  let nextEpoch = state.epoch;
  let nextErrorsInEpoch = newErrorsInEpoch;
  let isConverged = false;
  let nextHistory = state.history;

  if (isEndOfEpoch) {
    nextHistory = [...state.history, { epoch: state.epoch, errors: newErrorsInEpoch }];
    if (newErrorsInEpoch === 0) {
      isConverged = true;
      nextIndex = safeIndex;
    } else {
      nextEpoch = state.epoch + 1;
      nextIndex = 0;
      nextErrorsInEpoch = 0;
    }
  }

  const isComplete = isConverged || nextEpoch > config.maxEpochs;

  const nextState: PerceptronState = {
    ...state,
    weights: [nextW1, nextW2],
    bias: nextBias,
    currentIndex: isConverged ? safeIndex : nextIndex,
    epoch: nextEpoch,
    errorsInEpoch: nextErrorsInEpoch,
    isConverged,
    totalSteps: state.totalSteps + 1,
    stage: 'idle',
    traceSum: weightedSum,
    tracePred: prediction,
    traceError: error,
    traceDeltaW1: deltaW1,
    traceDeltaW2: deltaW2,
    traceDeltaB: deltaB,
    history: nextHistory,
  };

  const stepLog: PerceptronStepLog = {
    sampleIndex: safeIndex,
    point: sample,
    weightedSum,
    prediction,
    isCorrect,
    updated,
    weightsBefore: state.weights,
    biasBefore: state.bias,
    weightsAfter: [nextW1, nextW2],
    biasAfter: nextBias,
    deltaW1,
    deltaW2,
    deltaB,
    stage: 'update',
  };

  return {
    nextState,
    isComplete,
    stepLog,
  };
}

/**
 * Micro step: advances through intermediate pedagogical stages:
 * select -> feed -> summate -> activate -> evaluate -> update -> (next sample select)
 */
export function subStep(
  state: PerceptronState,
  config: PerceptronConfig
): StepResult<PerceptronState, PerceptronStepLog> {
  if (state.isConverged || state.epoch > config.maxEpochs || state.dataset.length === 0) {
    return {
      nextState: { ...state, stage: 'idle' },
      isComplete: true,
    };
  }

  const safeIndex =
    state.dataset.length > 0
      ? ((state.currentIndex % state.dataset.length) + state.dataset.length) % state.dataset.length
      : 0;
  const sample = state.dataset[safeIndex] ?? state.dataset[0];
  if (!sample) {
    return {
      nextState: { ...state, stage: 'idle' },
      isComplete: true,
    };
  }

  const curW1 = state.weights[0];
  const curW2 = state.weights[1];
  const curB = state.bias;

  const z = Number((curW1 * sample.x1 + curW2 * sample.x2 + curB).toFixed(4));
  const pred = stepActivation(z);
  const err = sample.y - pred;
  const isCorrect = err === 0;

  let currentStage = state.stage;
  if (currentStage === 'idle') currentStage = 'select';

  switch (currentStage) {
    case 'select': {
      const nextState: PerceptronState = {
        ...state,
        stage: 'feed',
        traceSum: null,
        tracePred: null,
        traceError: null,
      };
      return { nextState, isComplete: false };
    }

    case 'feed': {
      const nextState: PerceptronState = {
        ...state,
        stage: 'summate',
        traceSum: z,
      };
      return { nextState, isComplete: false };
    }

    case 'summate': {
      const nextState: PerceptronState = {
        ...state,
        stage: 'activate',
        traceSum: z,
        tracePred: pred,
      };
      return { nextState, isComplete: false };
    }

    case 'activate': {
      const nextState: PerceptronState = {
        ...state,
        stage: 'evaluate',
        traceSum: z,
        tracePred: pred,
        traceError: err,
      };
      return { nextState, isComplete: false };
    }

    case 'evaluate': {
      // Move to 'update' stage and apply weights
      let nextW1 = curW1;
      let nextW2 = curW2;
      let nextBias = curB;
      let deltaW1 = 0;
      let deltaW2 = 0;
      let deltaB = 0;
      let updated = false;

      if (!isCorrect) {
        deltaW1 = Number((config.learningRate * err * sample.x1).toFixed(4));
        deltaW2 = Number((config.learningRate * err * sample.x2).toFixed(4));
        deltaB = Number((config.learningRate * err * 1).toFixed(4));

        nextW1 = Number((curW1 + deltaW1).toFixed(4));
        nextW2 = Number((curW2 + deltaW2).toFixed(4));
        nextBias = Number((curB + deltaB).toFixed(4));
        updated = true;
      }

      const nextState: PerceptronState = {
        ...state,
        weights: [nextW1, nextW2],
        bias: nextBias,
        stage: 'update',
        traceSum: z,
        tracePred: pred,
        traceError: err,
        traceDeltaW1: deltaW1,
        traceDeltaW2: deltaW2,
        traceDeltaB: deltaB,
      };

      const stepLog: PerceptronStepLog = {
        sampleIndex: safeIndex,
        point: sample,
        weightedSum: z,
        prediction: pred,
        isCorrect,
        updated,
        weightsBefore: state.weights,
        biasBefore: state.bias,
        weightsAfter: [nextW1, nextW2],
        biasAfter: nextBias,
        deltaW1,
        deltaW2,
        deltaB,
        stage: 'update',
      };

      return { nextState, isComplete: false, stepLog };
    }

    case 'update':
    default: {
      // Complete current row and cycle to next sample
      const newErrorsInEpoch = state.errorsInEpoch + (isCorrect ? 0 : 1);
      const isEndOfEpoch = safeIndex === state.dataset.length - 1;

      let nextIndex = safeIndex + 1;
      let nextEpoch = state.epoch;
      let nextErrorsInEpoch = newErrorsInEpoch;
      let isConverged = false;
      let nextHistory = state.history;

      if (isEndOfEpoch) {
        nextHistory = [...state.history, { epoch: state.epoch, errors: newErrorsInEpoch }];
        if (newErrorsInEpoch === 0) {
          isConverged = true;
          nextIndex = safeIndex;
        } else {
          nextEpoch = state.epoch + 1;
          nextIndex = 0;
          nextErrorsInEpoch = 0;
        }
      }

      const isComplete = isConverged || nextEpoch > config.maxEpochs;

      const nextState: PerceptronState = {
        ...state,
        currentIndex: isConverged ? safeIndex : nextIndex,
        epoch: nextEpoch,
        errorsInEpoch: nextErrorsInEpoch,
        isConverged,
        totalSteps: state.totalSteps + 1,
        stage: isConverged ? 'idle' : 'select',
        history: nextHistory,
      };

      return { nextState, isComplete };
    }
  }
}

/**
 * Direct manipulation helper: add a custom point to dataset
 */
export function addPointToDataset(
  state: PerceptronState,
  x1: number,
  x2: number,
  y: number
): PerceptronState {
  const newPoint: DataPoint = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    x1,
    x2,
    y,
    label: y === 1 ? 1 : -1,
  };

  return {
    ...state,
    dataset: [...state.dataset, newPoint],
    isConverged: false,
  };
}

/**
 * Direct manipulation helper: clear all points
 */
export function clearCustomPoints(state: PerceptronState): PerceptronState {
  return {
    ...state,
    dataset: [],
    currentIndex: 0,
    errorsInEpoch: 0,
    isConverged: false,
    stage: 'idle',
  };
}
