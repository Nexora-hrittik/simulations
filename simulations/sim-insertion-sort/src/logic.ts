import { StepResult } from '@nexora-hrittik/sdk';
import {
  AlgorithmPhase,
  InsertionSortConfig,
  InsertionSortState,
  InsertionSortStepLog,
  PresetType,
} from './types';

export const PRESET_ARRAYS: Record<Exclude<PresetType, 'custom'>, (size: number) => number[]> = {
  random: (size) => {
    // Deterministic pseudo-random sequence for consistent previews
    const base = [38, 27, 43, 3, 9, 82, 10, 19, 54, 61, 23, 75, 45, 12, 68, 33];
    return base.slice(0, Math.max(1, Math.min(size, base.length)));
  },
  'nearly-sorted': (size) => {
    const arr = Array.from({ length: size }, (_, i) => (i + 1) * 7);
    if (size >= 4) {
      // Swap adjacent pair to make it nearly sorted
      const temp = arr[2];
      arr[2] = arr[3];
      arr[3] = temp;
    }
    return arr;
  },
  reversed: (size) => {
    return Array.from({ length: size }, (_, i) => (size - i) * 8);
  },
  'few-unique': (size) => {
    const values = [12, 25, 12, 40, 25, 40, 12, 25];
    return Array.from({ length: size }, (_, i) => values[i % values.length]);
  },
  'already-sorted': (size) => {
    return Array.from({ length: size }, (_, i) => (i + 1) * 6);
  },
};

export function generateRandomArray(size: number, min = 5, max = 95): number[] {
  const count = Math.max(1, Math.min(size, 20));
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    result.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return result;
}

export function parseCustomArray(input: string, min = -999, max = 999, maxSize = 20): { valid: boolean; array?: number[]; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: 'Input cannot be empty.' };
  }
  const parts = trimmed.split(/[,\s]+/).filter(Boolean);
  if (parts.length === 0) {
    return { valid: false, error: 'No numeric elements found.' };
  }
  if (parts.length > maxSize) {
    return { valid: false, error: `Maximum array size is ${maxSize} elements.` };
  }
  const parsed: number[] = [];
  for (const part of parts) {
    const num = Number(part);
    if (!Number.isFinite(num) || Number.isNaN(num)) {
      return { valid: false, error: `"${part}" is not a valid number.` };
    }
    if (num < min || num > max) {
      return { valid: false, error: `Number ${num} is outside allowed range [${min}, ${max}].` };
    }
    parsed.push(Math.round(num));
  }
  return { valid: true, array: parsed };
}

export function createInitialState(config: InsertionSortConfig): InsertionSortState {
  const array = Array.isArray(config.initialArray) ? [...config.initialArray] : [];
  const n = array.length;

  if (n <= 1) {
    return {
      originalArray: [...array],
      array: [...array],
      outerIndex: n,
      compareIndex: -1,
      key: null,
      keyOriginIndex: null,
      keyTargetIndex: null,
      gapIndex: null,
      sortedBoundary: n > 0 ? 0 : -1,
      phase: 'complete',
      activeIndices: n > 0 ? [0] : [],
      shiftedIndices: [],
      insertedIndex: null,
      lastComparison: null,
      comparisons: 0,
      shifts: 0,
      keyPlacements: 0,
      completedPasses: n > 0 ? 1 : 0,
      totalSteps: 0,
      isComplete: true,
      message: n === 0 ? 'Empty array: already trivially sorted.' : 'Single element array: already sorted.',
    };
  }

  return {
    originalArray: [...array],
    array: [...array],
    outerIndex: 1,
    compareIndex: -1,
    key: null,
    keyOriginIndex: null,
    keyTargetIndex: null,
    gapIndex: null,
    sortedBoundary: 0,
    phase: 'select-key',
    activeIndices: [1],
    shiftedIndices: [],
    insertedIndex: null,
    lastComparison: null,
    comparisons: 0,
    shifts: 0,
    keyPlacements: 0,
    completedPasses: 0,
    totalSteps: 0,
    isComplete: false,
    message: `Ready to begin. First element at index 0 (value ${array[0]}) forms initial sorted prefix. Next: select key at index 1.`,
  };
}

export function step(
  state: InsertionSortState,
  _config: InsertionSortConfig
): StepResult<InsertionSortState, InsertionSortStepLog> {
  const n = state.array.length;

  if (state.isComplete || n <= 1) {
    return {
      nextState: { ...state },
      isComplete: true,
      stepLog: {
        action: 'NOOP',
        phase: state.phase,
        outerIndex: state.outerIndex,
        compareIndex: state.compareIndex,
        keyValue: state.key,
        message: state.message,
        comparisons: state.comparisons,
        shifts: state.shifts,
        keyPlacements: state.keyPlacements,
        arraySnapshot: [...state.array],
      },
    };
  }

  const {
    array,
    outerIndex,
    compareIndex,
    key,
    phase,
    comparisons,
    shifts,
    keyPlacements,
    completedPasses,
    totalSteps,
  } = state;

  switch (phase) {
    case 'idle':
    case 'select-key': {
      if (outerIndex >= n) {
        const nextState: InsertionSortState = {
          ...state,
          phase: 'complete',
          isComplete: true,
          keyOriginIndex: null,
          keyTargetIndex: null,
          lastComparison: null,
          activeIndices: Array.from({ length: n }, (_, i) => i),
          shiftedIndices: [],
          insertedIndex: null,
          totalSteps: totalSteps + 1,
          message: `Sorting complete! All ${n} elements are strictly ordered in the sorted prefix.`,
        };
        return {
          nextState,
          isComplete: true,
          stepLog: {
            action: 'COMPLETE',
            phase: 'complete',
            outerIndex,
            compareIndex: -1,
            keyValue: null,
            message: nextState.message,
            comparisons,
            shifts,
            keyPlacements,
            arraySnapshot: [...nextState.array],
          },
        };
      }

      const selectedKey = array[outerIndex];
      const nextState: InsertionSortState = {
        ...state,
        key: selectedKey,
        keyOriginIndex: outerIndex,
        keyTargetIndex: outerIndex,
        compareIndex: outerIndex - 1,
        phase: 'compare',
        activeIndices: [outerIndex, outerIndex - 1],
        shiftedIndices: [],
        insertedIndex: null,
        lastComparison: null,
        totalSteps: totalSteps + 1,
        message: `Pass ${outerIndex}: Selected key = ${selectedKey} at index ${outerIndex}. Lifted key into buffer. Comparing with left neighbor at index ${outerIndex - 1} (${array[outerIndex - 1]}).`,
      };

      return {
        nextState,
        isComplete: false,
        stepLog: {
          action: 'SELECT_KEY',
          phase: 'select-key',
          outerIndex,
          compareIndex: outerIndex - 1,
          keyValue: selectedKey,
          message: nextState.message,
          comparisons,
          shifts,
          keyPlacements,
          arraySnapshot: [...nextState.array],
        },
      };
    }

    case 'compare': {
      if (key === null) {
        throw new Error('Illegal state: key is null during compare phase');
      }

      const currentKey = key;
      const isActualComparison = compareIndex >= 0;
      const nextComparisons = comparisons + (isActualComparison ? 1 : 0);
      const comparisonData = isActualComparison
        ? {
            keyVal: currentKey,
            compareVal: array[compareIndex],
            isGreater: array[compareIndex] > currentKey,
          }
        : null;

      if (isActualComparison && array[compareIndex] > currentKey) {
        const nextState: InsertionSortState = {
          ...state,
          comparisons: nextComparisons,
          lastComparison: comparisonData,
          phase: 'shift',
          keyTargetIndex: compareIndex,
          activeIndices: [compareIndex, compareIndex + 1],
          totalSteps: totalSteps + 1,
          message: `Comparison: Array[${compareIndex}] = ${array[compareIndex]} > Key = ${currentKey}. Preparing to shift ${array[compareIndex]} right to index ${compareIndex + 1}.`,
        };
        return {
          nextState,
          isComplete: false,
          stepLog: {
            action: 'COMPARE',
            phase: 'compare',
            outerIndex,
            compareIndex,
            keyValue: currentKey,
            message: nextState.message,
            comparisons: nextComparisons,
            shifts,
            keyPlacements,
            arraySnapshot: [...nextState.array],
          },
        };
      }

      // Comparison condition stopped shifting: either compareIndex < 0 or array[compareIndex] <= key
      const stopReason =
        compareIndex < 0
          ? `Reached beginning of array (boundary index 0 reached). Key ${currentKey} is the smallest seen so far.`
          : `Array[${compareIndex}] = ${array[compareIndex]} ≤ Key = ${currentKey}. Correct insertion point found at index ${compareIndex + 1}. (Preserves stability)`;

      const nextState: InsertionSortState = {
        ...state,
        comparisons: nextComparisons,
        lastComparison: comparisonData,
        keyTargetIndex: compareIndex + 1,
        phase: 'insert',
        activeIndices: [compareIndex + 1],
        shiftedIndices: [],
        totalSteps: totalSteps + 1,
        message: `${stopReason} Inserting key into position ${compareIndex + 1}.`,
      };

      return {
        nextState,
        isComplete: false,
        stepLog: {
          action: 'COMPARE',
          phase: 'compare',
          outerIndex,
          compareIndex,
          keyValue: currentKey,
          message: nextState.message,
          comparisons: nextComparisons,
          shifts,
          keyPlacements,
          arraySnapshot: [...nextState.array],
        },
      };
    }

    case 'shift': {
      if (key === null) {
        throw new Error('Illegal state: key is null during shift phase');
      }

      const nextArray = [...array];
      const shiftedVal = nextArray[compareIndex];
      nextArray[compareIndex + 1] = shiftedVal;
      const nextShifts = shifts + 1;
      const nextCompareIndex = compareIndex - 1;

      let nextPhase: AlgorithmPhase = 'compare';
      let message = `Shift: Moved value ${shiftedVal} from index ${compareIndex} to index ${compareIndex + 1}. Opened gap at index ${compareIndex}.`;

      if (nextCompareIndex >= 0) {
        message += ` Next: compare key ${key} with element at index ${nextCompareIndex} (${nextArray[nextCompareIndex]}).`;
      } else {
        message += ` Reached beginning of array. Preparing to insert key ${key} at index 0.`;
      }

      const nextState: InsertionSortState = {
        ...state,
        array: nextArray,
        compareIndex: nextCompareIndex,
        keyTargetIndex: compareIndex,
        gapIndex: compareIndex,
        shifts: nextShifts,
        phase: nextPhase,
        activeIndices: nextCompareIndex >= 0 ? [nextCompareIndex] : [0],
        shiftedIndices: [compareIndex + 1],
        totalSteps: totalSteps + 1,
        message,
      };

      return {
        nextState,
        isComplete: false,
        stepLog: {
          action: 'SHIFT',
          phase: 'shift',
          outerIndex,
          compareIndex,
          keyValue: key,
          message: nextState.message,
          comparisons,
          shifts: nextShifts,
          keyPlacements,
          arraySnapshot: [...nextArray],
        },
      };
    }

    case 'insert': {
      if (key === null) {
        throw new Error('Illegal state: key is null during insert phase');
      }

      const nextArray = [...array];
      const targetIndex = compareIndex + 1;
      nextArray[targetIndex] = key;
      const nextKeyPlacements = keyPlacements + 1;

      const nextState: InsertionSortState = {
        ...state,
        array: nextArray,
        keyPlacements: nextKeyPlacements,
        keyTargetIndex: targetIndex,
        gapIndex: null,
        phase: 'pass-complete',
        activeIndices: [targetIndex],
        shiftedIndices: [],
        insertedIndex: targetIndex,
        lastComparison: null,
        totalSteps: totalSteps + 1,
        message: `Inserted key ${key} at target position [${targetIndex}]. Sorted prefix now covers indices 0 through ${outerIndex}.`,
      };

      return {
        nextState,
        isComplete: false,
        stepLog: {
          action: 'INSERT',
          phase: 'insert',
          outerIndex,
          compareIndex: targetIndex,
          keyValue: key,
          message: nextState.message,
          comparisons,
          shifts,
          keyPlacements: nextKeyPlacements,
          arraySnapshot: [...nextArray],
        },
      };
    }

    case 'pass-complete': {
      const nextOuterIndex = outerIndex + 1;
      const nextSortedBoundary = outerIndex;
      const nextCompletedPasses = completedPasses + 1;

      if (nextOuterIndex >= n) {
        const nextState: InsertionSortState = {
          ...state,
          outerIndex: nextOuterIndex,
          sortedBoundary: n - 1,
          completedPasses: nextCompletedPasses,
          phase: 'complete',
          isComplete: true,
          key: null,
          keyOriginIndex: null,
          keyTargetIndex: null,
          gapIndex: null,
          lastComparison: null,
          compareIndex: -1,
          activeIndices: Array.from({ length: n }, (_, i) => i),
          shiftedIndices: [],
          insertedIndex: null,
          totalSteps: totalSteps + 1,
          message: `Simulation Complete! All ${n} elements are sorted in ascending order. (Total passes: ${nextCompletedPasses})`,
        };
        return {
          nextState,
          isComplete: true,
          stepLog: {
            action: 'COMPLETE',
            phase: 'complete',
            outerIndex: nextOuterIndex,
            compareIndex: -1,
            keyValue: null,
            message: nextState.message,
            comparisons,
            shifts,
            keyPlacements,
            arraySnapshot: [...nextState.array],
          },
        };
      }

      const nextState: InsertionSortState = {
        ...state,
        outerIndex: nextOuterIndex,
        sortedBoundary: nextSortedBoundary,
        completedPasses: nextCompletedPasses,
        key: null,
        keyOriginIndex: null,
        keyTargetIndex: null,
        gapIndex: null,
        lastComparison: null,
        compareIndex: -1,
        phase: 'select-key',
        activeIndices: [nextOuterIndex],
        shiftedIndices: [],
        insertedIndex: null,
        totalSteps: totalSteps + 1,
        message: `Pass ${outerIndex} completed. Prefix 0..${nextSortedBoundary} is sorted. Next pass will select key at index ${nextOuterIndex}.`,
      };

      return {
        nextState,
        isComplete: false,
        stepLog: {
          action: 'PASS_COMPLETE',
          phase: 'pass-complete',
          outerIndex,
          compareIndex: -1,
          keyValue: null,
          message: nextState.message,
          comparisons,
          shifts,
          keyPlacements,
          arraySnapshot: [...nextState.array],
        },
      };
    }

    default:
      return {
        nextState: { ...state, isComplete: true },
        isComplete: true,
      };
  }
}
