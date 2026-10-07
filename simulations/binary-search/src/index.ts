import { SimulationModule } from '@nexora/sdk';
import { BinarySearchConfig, BinarySearchState, BinarySearchStepLog } from './types';
import { createInitialState, step, subStep } from './logic';
import { BinarySearchVisualization } from './visualization';
import { BinarySearchControls } from './controls';
import { BINARY_SEARCH_CONTENT } from './content';

export const binarySearchSimulation: SimulationModule<
  BinarySearchState,
  BinarySearchConfig,
  BinarySearchStepLog
> = {
  metadata: {
    id: 'binary-search',
    title: 'Binary Search Algorithm',
    shortDescription:
      'Interactive divide-and-conquer search visualizer demonstrating interval halving, midpoint calculation, and O(log n) convergence on sorted arrays.',
    topicId: 'algorithms',
    category: 'Algorithms',
    topics: ['Searching', 'Divide-and-Conquer'],
    concepts: ['Interval Halving', 'Logarithmic Complexity', 'Divide and Conquer', 'Two Pointers'],
    tags: ['algorithms', 'search', 'divide-and-conquer', 'binary-search'],
    difficulty: 'Beginner',
    status: 'available',
    featured: true,
    estimatedTime: '5 min',
    prerequisites: ['Sorted Arrays', 'Index Arithmetic'],
    version: '1.0.0',
    sdkVersion: '0.1.0',
    author: {
      name: 'Contributor Example',
      github: 'contributor-dev',
    },
  },
  content: BINARY_SEARCH_CONTENT,
  defaultConfig: {
    arraySize: 10,
    target: 37,
  },
  createInitialState,
  step,
  subStep,
  reset: createInitialState,
  completionSummary: (state: BinarySearchState) => {
    if (state.phase === 'found' && state.foundIndex !== null) {
      return {
        title: 'Binary Search Succeeded!',
        description: `Located target ${state.target} at index ${state.foundIndex} using ${state.comparisons} comparisons (Step ${state.stepNumber}).`,
        analysis: {
          title: 'Logarithmic Efficiency',
          explanation: `In an array of length ${state.array.length}, linear scan would require up to ${state.array.length} comparisons. Binary search achieved resolution in only ${state.comparisons} comparisons.`,
        },
      };
    }
    return {
      title: 'Target Not Found',
      description: `Exhausted active range with low=${state.low} > high=${state.high}. Target ${state.target} does not exist in the array.`,
      analysis: {
        title: 'Exhaustion Termination',
        explanation: 'When the low pointer passes the high pointer, all possible candidate positions have been mathematically eliminated.',
      },
    };
  },
  Visualization: BinarySearchVisualization,
  Controls: BinarySearchControls,
};

export * from './types';
export * from './logic';
export * from './content';

export default binarySearchSimulation;
