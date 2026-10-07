import { SimulationModule } from '@rec-labs/sdk';
import { CounterConfig, CounterState, CounterStepLog } from './types';
import { createInitialState, step } from './logic';
import { CounterVisualization } from './visualization';
import { CounterControls, CounterStateInspector } from './controls';
import { COUNTER_CONTENT } from './content';

export const counterSimulation: SimulationModule<
  CounterState,
  CounterConfig,
  CounterStepLog
> = {
  metadata: {
    id: 'counter',
    title: 'Discrete State Counter',
    shortDescription:
      'Architectural validation simulation demonstrating an independent discrete accumulator running on the platform contract.',
    topicId: 'algorithms',
    category: 'Algorithms',
    topics: ['Discrete Systems', 'State Machines'],
    concepts: ['State Accumulation', 'Discrete Transitions', 'Termination Invariants'],
    tags: ['state-machine', 'discrete-math', 'accumulator'],
    difficulty: 'Beginner',
    status: 'available',
    featured: false,
    estimatedTime: '2 min',
    prerequisites: ['Basic Arithmetic'],
    version: '1.0.0',
    sdkVersion: '0.1.0',
    author: {
      name: 'REC Labs Core Team',
    },
  },
  content: COUNTER_CONTENT,
  defaultConfig: {
    stepSize: 2,
    target: 20,
  },
  createInitialState,
  step,
  reset: createInitialState,
  completionSummary: (state, config) => ({
    title: 'Counter Completed: Target Reached!',
    description: `Accumulator reached terminal value of ${state.count} (Target: ${config.target}) across ${state.history.length - 1} steps.`,
    analysis: {
      title: 'Accumulation Summary',
      explanation: `The counter successfully executed discrete affine transitions until satisfying the stopping predicate count >= ${config.target}.`,
    },
  }),
  Visualization: CounterVisualization,
  Controls: CounterControls,
  StateInspector: CounterStateInspector,
};

export * from './types';
export * from './logic';
export * from './content';

export default counterSimulation;
