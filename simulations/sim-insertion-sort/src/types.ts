export type AlgorithmPhase =
  | 'idle'
  | 'select-key'
  | 'compare'
  | 'shift'
  | 'insert'
  | 'pass-complete'
  | 'complete';

export type PresetType =
  | 'custom'
  | 'random'
  | 'nearly-sorted'
  | 'reversed'
  | 'few-unique'
  | 'already-sorted';

export interface InsertionSortConfig {
  initialArray: number[];
  arraySize: number;
  minValue: number;
  maxValue: number;
  preset: PresetType;
}

export interface InsertionSortStepLog {
  action: 'SELECT_KEY' | 'COMPARE' | 'SHIFT' | 'INSERT' | 'PASS_COMPLETE' | 'COMPLETE' | 'NOOP';
  phase: AlgorithmPhase;
  outerIndex: number;
  compareIndex: number;
  keyValue: number | null;
  message: string;
  comparisons: number;
  shifts: number;
  keyPlacements: number;
  arraySnapshot: number[];
}

export interface InsertionSortState {
  originalArray: number[];
  array: number[];
  outerIndex: number;
  compareIndex: number;
  key: number | null;
  keyOriginIndex: number | null;
  keyTargetIndex: number | null;
  sortedBoundary: number;
  phase: AlgorithmPhase;
  activeIndices: number[];
  shiftedIndices: number[];
  insertedIndex: number | null;
  gapIndex: number | null;
  lastComparison: {
    keyVal: number;
    compareVal: number;
    isGreater: boolean;
  } | null;
  comparisons: number;
  shifts: number;
  keyPlacements: number;
  completedPasses: number;
  totalSteps: number;
  isComplete: boolean;
  message: string;
}
