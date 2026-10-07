import { SimulationModule } from '@rec-labs/sdk';
import {
  PerceptronConfig,
  PerceptronState,
  PerceptronStepLog,
} from './types';
import { createInitialState, step, subStep } from './logic';
import { PerceptronVisualization } from './visualization';
import { PerceptronControls, PerceptronStateInspector } from './controls';
import { PERCEPTRON_CONTENT } from './content';

export const perceptronSimulation: SimulationModule<
  PerceptronState,
  PerceptronConfig,
  PerceptronStepLog
> = {
  metadata: {
    id: 'perceptron',
    title: 'Perceptron Binary Classifier',
    shortDescription:
      'Interactive 2D decision boundary visualization demonstrating Frank Rosenblatt’s foundational linear neuron model and convergence theorem.',
    topicId: 'machine-learning',
    category: 'Neural Foundations',
    tags: ['neural-networks', 'classification', 'machine-learning', 'optimization'],
    difficulty: 'Beginner',
    version: '1.0.0',
    sdkVersion: '0.1.0',
    author: {
      name: 'REC Labs Core Team',
    },
  },
  content: PERCEPTRON_CONTENT,
  defaultConfig: {
    learningRate: 0.1,
    datasetPreset: 'AND',
    maxEpochs: 25,
  },
  createInitialState,
  step,
  subStep,
  reset: createInitialState,
  completionSummary: (state, config) => {
    if (state.isConverged) {
      return {
        title: 'Simulation Complete: Separation Hyperplane Converged!',
        description: `The Perceptron found a valid weight configuration that perfectly classifies all ${state.dataset.length} training samples in ${state.totalSteps} steps (Epoch ${state.epoch}).`,
        analysis: {
          title: 'What Just Happened?',
          explanation:
            'Every time a sample was misclassified (prediction != target), the learning rule pushed the weight vector by Δw = η · error · x. This rotated and translated the normal vector of the hyperplane until all points were on the correct side of the boundary.',
          inquiry:
            'Try selecting a different dataset preset (e.g. 2D Clusters or OR Gate) and observe how the number of steps changes with different learning rates (η).',
        },
      };
    }
    return {
      title: 'Simulation Stopped: Maximum Epochs Reached',
      description: `Training completed ${config.maxEpochs} epochs with ${state.errorsInEpoch} errors remaining. If you are training on XOR, note that a single linear hyperplane cannot separate non-linear data.`,
      analysis: {
        title: 'Linear Separability Limit',
        explanation:
          'Minsky & Papert (1969) proved that single-layer perceptrons cannot solve problems that are not linearly separable (such as XOR). Multi-layer networks with non-linear activation functions are required.',
      },
    };
  },
  Visualization: PerceptronVisualization,
  Controls: PerceptronControls,
  StateInspector: PerceptronStateInspector,
};

export * from './types';
export * from './math';
export * from './logic';
export * from './content';

export default perceptronSimulation;
