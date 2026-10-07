export interface DataPoint {
  id: string;
  x1: number;
  x2: number;
  y: number; // Binary class: 0 or 1
  label: 1 | -1; // Bipolar representation: 1 or -1
}

export type DatasetPreset = 'AND' | 'OR' | 'XOR' | 'CUSTOM' | 'SEPARABLE_CLUSTERS';

export type AnimationStage =
  | 'idle'
  | 'select'
  | 'feed'
  | 'summate'
  | 'activate'
  | 'evaluate'
  | 'update';

export interface PerceptronConfig {
  learningRate: number;
  datasetPreset: DatasetPreset;
  maxEpochs: number;
}

export interface PerceptronStepLog {
  sampleIndex: number;
  point: DataPoint;
  weightedSum: number;
  prediction: 0 | 1;
  isCorrect: boolean;
  updated: boolean;
  weightsBefore: [number, number];
  biasBefore: number;
  weightsAfter: [number, number];
  biasAfter: number;
  deltaW1: number;
  deltaW2: number;
  deltaB: number;
  stage: AnimationStage;
}

export interface PerceptronState {
  weights: [number, number];
  bias: number;
  dataset: DataPoint[];
  currentIndex: number;
  epoch: number;
  errorsInEpoch: number;
  isConverged: boolean;
  totalSteps: number;
  stage: AnimationStage;
  traceSum: number | null;
  tracePred: 0 | 1 | null;
  traceError: number | null;
  traceDeltaW1: number;
  traceDeltaW2: number;
  traceDeltaB: number;
  traceMode: 'focused' | 'full';
  history: Array<{ epoch: number; errors: number }>;
}
