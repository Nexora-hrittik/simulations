import { StepResult } from '@rec-labs/sdk';
import { BinarySearchConfig, BinarySearchState, BinarySearchStepLog } from './types';

export function generateSortedArray(size: number): number[] {
  const result: number[] = [];
  let current = 3;
  for (let i = 0; i < size; i++) {
    result.push(current);
    current += Math.floor(Math.random() * 5) + 2;
  }
  return result;
}

export function createInitialState(config: BinarySearchConfig): BinarySearchState {
  const array = [3, 8, 14, 21, 29, 37, 46, 58, 67, 79, 88, 95].slice(0, config.arraySize);
  return {
    array,
    target: config.target,
    low: 0,
    high: array.length - 1,
    mid: null,
    phase: 'init',
    stepNumber: 0,
    comparisons: 0,
    foundIndex: null,
    isComplete: false,
  };
}

export function subStep(
  state: BinarySearchState,
  _config?: BinarySearchConfig
): StepResult<BinarySearchState, BinarySearchStepLog> {
  if (state.isComplete) {
    return {
      nextState: state,
      isComplete: true,
      stepLog: {
        phase: state.phase,
        low: state.low,
        high: state.high,
        mid: state.mid,
        message: 'Search already completed.',
      },
    };
  }

  // Phase 1: init -> calculate midpoint
  if (state.phase === 'init' || state.phase === 'narrow') {
    if (state.low > state.high) {
      const nextState: BinarySearchState = {
        ...state,
        phase: 'not-found',
        isComplete: true,
      };
      return {
        nextState,
        isComplete: true,
        stepLog: {
          phase: 'not-found',
          low: state.low,
          high: state.high,
          mid: state.mid,
          message: `Search interval exhausted (low ${state.low} > high ${state.high}). Target ${state.target} not found in array.`,
        },
      };
    }

    const mid = Math.floor((state.low + state.high) / 2);
    const nextState: BinarySearchState = {
      ...state,
      mid,
      phase: 'calc-mid',
      stepNumber: state.stepNumber + 1,
    };
    return {
      nextState,
      isComplete: false,
      stepLog: {
        phase: 'calc-mid',
        low: state.low,
        high: state.high,
        mid,
        message: `Calculated midpoint: index ${mid} = Math.floor((${state.low} + ${state.high}) / 2). Value is ${state.array[mid]}.`,
      },
    };
  }

  // Phase 2: calc-mid -> compare
  if (state.phase === 'calc-mid') {
    const mid = state.mid!;
    const val = state.array[mid];
    const nextComparisons = state.comparisons + 1;

    if (val === state.target) {
      const nextState: BinarySearchState = {
        ...state,
        phase: 'found',
        foundIndex: mid,
        comparisons: nextComparisons,
        isComplete: true,
      };
      return {
        nextState,
        isComplete: true,
        stepLog: {
          phase: 'found',
          low: state.low,
          high: state.high,
          mid,
          message: `Target ${state.target} matched array[${mid}] (${val}) in ${nextComparisons} comparisons!`,
        },
      };
    }

    const nextState: BinarySearchState = {
      ...state,
      phase: 'compare',
      comparisons: nextComparisons,
    };
    return {
      nextState,
      isComplete: false,
      stepLog: {
        phase: 'compare',
        low: state.low,
        high: state.high,
        mid,
        message:
          val < state.target
            ? `array[${mid}] (${val}) < target (${state.target}). Target is in right sub-array.`
            : `array[${mid}] (${val}) > target (${state.target}). Target is in left sub-array.`,
      },
    };
  }

  // Phase 3: compare -> narrow search window
  if (state.phase === 'compare') {
    const mid = state.mid!;
    const val = state.array[mid];

    let nextLow = state.low;
    let nextHigh = state.high;

    if (val < state.target) {
      nextLow = mid + 1;
    } else {
      nextHigh = mid - 1;
    }

    const nextState: BinarySearchState = {
      ...state,
      low: nextLow,
      high: nextHigh,
      phase: 'narrow',
    };

    return {
      nextState,
      isComplete: false,
      stepLog: {
        phase: 'narrow',
        low: nextLow,
        high: nextHigh,
        mid,
        message:
          val < state.target
            ? `Adjusted low index to mid + 1 (${nextLow}). Narrowed search range to [${nextLow}, ${nextHigh}].`
            : `Adjusted high index to mid - 1 (${nextHigh}). Narrowed search range to [${nextLow}, ${nextHigh}].`,
      },
    };
  }

  return { nextState: state, isComplete: state.isComplete };
}

export function step(
  state: BinarySearchState,
  config: BinarySearchConfig
): StepResult<BinarySearchState, BinarySearchStepLog> {
  if (state.isComplete) {
    return { nextState: state, isComplete: true };
  }

  let current = state;
  let result: StepResult<BinarySearchState, BinarySearchStepLog> = {
    nextState: current,
    isComplete: false,
  };

  do {
    result = subStep(current, config);
    current = result.nextState;
    if (result.isComplete) break;
  } while (current.phase !== 'narrow');

  return result;
}
