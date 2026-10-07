import { StepResult } from '@rec-labs/sdk';
import { CounterConfig, CounterState, CounterStepLog } from './types';

export function createInitialState(_config: CounterConfig): CounterState {
  return {
    count: 0,
    history: [0],
  };
}

export function step(
  state: CounterState,
  config: CounterConfig
): StepResult<CounterState, CounterStepLog> {
  const nextCount = state.count + config.stepSize;
  const isComplete = nextCount >= config.target;

  const nextState: CounterState = {
    count: nextCount,
    history: [...state.history, nextCount],
  };

  const stepLog: CounterStepLog = {
    previous: state.count,
    current: nextCount,
    increment: config.stepSize,
  };

  return {
    nextState,
    isComplete,
    stepLog,
  };
}
