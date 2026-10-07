import { SimulationContent } from '@nexora/sdk';

export const PERCEPTRON_CONTENT: SimulationContent = {
  introduction:
    'The Perceptron is the foundational fundamental building block of artificial neural networks. Proposed by Frank Rosenblatt in 1958, it is a supervised learning algorithm for binary classification that finds a linear hyperplane separating two classes.',
  theory: `A Perceptron models a biological neuron: it takes several numerical inputs, computes an affine combination using learned synaptic weights and an internal bias threshold, and fires if the total sum exceeds zero.

If the dataset is linearly separable in n-dimensional Euclidean space, the Perceptron Convergence Theorem guarantees that the algorithm will converge to a separating hyperplane in a finite number of update steps.

However, if the classes are not linearly separable (such as the famous XOR logical operator), the algorithm will never converge and will oscillate endlessly. This limitation famously led Marvin Minsky and Seymour Papert to publish 'Perceptrons' in 1969, highlighting the necessity of multi-layer networks with non-linear activations.`,
  howItWorks: [
    'Initialize weights [w₁, w₂] and bias b to zero or small initial values.',
    'Iterate through the training dataset sample by sample (x₁, x₂, y), where y ∈ {-1, +1}.',
    'Compute the linear combination: z = w₁x₁ + w₂x₂ + b.',
    'Apply the step activation function: ŷ = +1 if z ≥ 0, else -1.',
    'Compare the predicted class ŷ with the actual target label y.',
    'If ŷ ≠ y (misclassified), adjust weights and bias: w ← w + η·y·x and b ← b + η·y, where η is the learning rate.',
    'Repeat until an entire epoch finishes with zero classification errors (convergence) or max epochs are reached.',
  ],
  keyFormulas: [
    {
      label: 'Weighted Sum (Net Input)',
      formula: 'z = \\sum_{i=1}^{n} w_i x_i + b',
      explanation: 'Computes dot product between weight vector and input vector plus scalar bias.',
    },
    {
      label: 'Activation Function (Signum)',
      formula:
        '\\hat{y} = \\text{sign}(z) = \\begin{cases} +1 & z \\geq 0 \\\\ -1 & z < 0 \\end{cases}',
      explanation: 'Discretizes continuous net input into discrete binary class predictions.',
    },
    {
      label: 'Rosenblatt Weight Update',
      formula: 'w_i \\leftarrow w_i + \\eta \\cdot y \\cdot x_i',
      explanation:
        'Shifts the normal vector of the hyperplane towards or away from the misclassified vector.',
    },
    {
      label: 'Decision Boundary Line',
      formula: 'w_1 x_1 + w_2 x_2 + b = 0 \\implies x_2 = -\\frac{w_1}{w_2} x_1 - \\frac{b}{w_2}',
      explanation:
        'The 2D line where net input equals zero, dividing the space into positive and negative regions.',
    },
  ],
  guidedInquiries: [
    {
      question: 'Why does the single-layer Perceptron fail on XOR?',
      answer:
        'In 1969, Marvin Minsky and Seymour Papert proved that a single-layer perceptron can only compute linearly separable functions. For XOR, positive labels are at (0, 1) and (1, 0), while negative labels are at (0, 0) and (1, 1). No single straight line in 2D space can separate these classes without misclassifying at least one point.',
      note: 'Solution: Multi-Layer Perceptrons (MLPs) with hidden layers and non-linear activations.',
    },
    {
      question: 'What guarantees convergence if data is linearly separable?',
      answer:
        'The Perceptron Convergence Theorem (Novikoff, 1962) guarantees that if a dataset has geometric margin γ > 0 and maximum vector radius R, the algorithm makes at most (R / γ)² weight updates before perfectly separating the data.',
    },
  ],
  references: [
    {
      title: 'The Perceptron: A Probabilistic Model for Information Storage (1958)',
      url: 'https://doi.org/10.1037/h0042519',
      description:
        'Frank Rosenblatt’s original paper introducing the perceptron architecture in Psychological Review.',
    },
    {
      title: 'Perceptron Convergence Theorem Proof',
      url: 'https://en.wikipedia.org/wiki/Perceptron#Convergence_theorem',
      description: 'Mathematical formulation of Novikoff’s theorem and finite step upper bounds.',
    },
    {
      title: 'Minsky & Papert (1969) - Historical Context',
      url: 'https://mitpress.mit.edu/9780262631112/perceptrons/',
      description:
        'The seminal critique establishing the limits of single-layer perceptrons on non-separable logic.',
    },
  ],
};
