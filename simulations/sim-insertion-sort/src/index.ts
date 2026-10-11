import './index.css';
import { SimulationModule } from '@nexora-hrittik/sdk';
import {
  InsertionSortConfig,
  InsertionSortState,
  InsertionSortStepLog,
} from './types';
import { createInitialState, step, PRESET_ARRAYS } from './logic';
import { InsertionSortVisualization } from './visualization';
import { InsertionSortControls } from './controls';
import { INSERTION_SORT_CONTENT } from './content';

const defaultArray = PRESET_ARRAYS['random'](8);

export const insertionSortSimulation: SimulationModule<
  InsertionSortState,
  InsertionSortConfig,
  InsertionSortStepLog
> = {
  metadata: {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    shortDescription:
      'Interactive visualizer demonstrating how Insertion Sort builds a sorted prefix by comparing and shifting elements to place each key into its correct relative position.',
    topicId: 'algorithms',
    category: 'Algorithms',
    tags: ['sorting', 'insertion-sort', 'arrays', 'algorithms', 'time-complexity'],
    difficulty: 'Beginner',
    status: 'available',
    featured: true,
    estimatedTime: '5-10 min',
    prerequisites: ['1D Arrays', 'Comparisons', 'Loop Invariants'],
    version: '1.0.0',
    sdkVersion: '0.1.0',
    author: {
      name: 'REC Labs Core Team',
    },
  },
  content: INSERTION_SORT_CONTENT,
  defaultConfig: {
    initialArray: defaultArray,
    arraySize: defaultArray.length,
    minValue: 1,
    maxValue: 99,
    preset: 'random',
  },
  createInitialState,
  step,
  reset: createInitialState,
  completionSummary: (state) => ({
    title: 'Simulation Complete: Array Successfully Sorted!',
    description: `All ${state.array.length} elements are sorted in ascending order after ${state.completedPasses} passes, executing ${state.comparisons} comparisons and ${state.shifts} shifts (${state.totalSteps} total steps).`,
    analysis: {
      title: 'Algorithmic Invariant Preserved',
      explanation:
        'Throughout all passes, the sorted prefix A[0..i] grew monotonically while preserving relative order for equal elements (stability). Notice how nearly-sorted inputs terminate comparisons early, reflecting its O(n) adaptive best-case behavior.',
      inquiry:
        'Try switching to the "Reversed" preset and observe how the number of comparisons and shifts scales quadratically toward n(n-1)/2.',
    },
  }),
  Visualization: InsertionSortVisualization,
  Controls: InsertionSortControls,
};

// Aliased export for template backwards compatibility if imported by name
export const templateSimulation = insertionSortSimulation;

export * from './types';
export * from './logic';
export * from './content';

export default insertionSortSimulation;
