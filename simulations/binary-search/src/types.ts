export type BinarySearchPhase =
  | 'init'
  | 'calc-mid'
  | 'compare'
  | 'narrow'
  | 'found'
  | 'not-found';

export interface BinarySearchConfig {
  arraySize: number;
  target: number;
}

export interface BinarySearchState {
  array: number[];
  target: number;
  low: number;
  high: number;
  mid: number | null;
  phase: BinarySearchPhase;
  stepNumber: number;
  comparisons: number;
  foundIndex: number | null;
  isComplete: boolean;
}

export interface BinarySearchStepLog {
  phase: BinarySearchPhase;
  low: number;
  high: number;
  mid: number | null;
  message: string;
}
