export interface CounterConfig {
  stepSize: number;
  target: number;
}

export interface CounterStepLog {
  previous: number;
  current: number;
  increment: number;
}

export interface CounterState {
  count: number;
  history: number[];
}
