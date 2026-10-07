import { SimulationContent } from '@rec-labs/sdk';

export const COUNTER_CONTENT: SimulationContent = {
  introduction:
    'The Discrete State Counter demonstrates discrete state accumulation and completion boundary conditions in computing.',
  theory:
    'In finite automata and sequential circuit analysis, an accumulator increments state iteratively until a terminating condition is met.',
  howItWorks: [
    'Initialize count register to 0.',
    'Upon each execution step, increment register by stepSize.',
    'Compare value with target threshold.',
    'Terminate when count >= target.',
  ],
  keyFormulas: [
    {
      label: 'State Transition',
      formula: 'S_{t+1} = S_t + \\Delta',
      explanation: 'Discrete affine update step.',
    },
  ],
  guidedInquiries: [
    {
      question: 'What defines a deterministic accumulator state transition?',
      answer:
        'A deterministic state transition maps the current state and input to exactly one next state without stochastic variation: S(t+1) = f(S(t), u(t)). Here, f is addition by stepSize.',
    },
  ],
  references: [
    {
      title: 'Introduction to Automata Theory, Languages, and Computation',
      url: 'https://en.wikipedia.org/wiki/Finite-state_machine',
      description: 'Formal foundations of discrete state transitions.',
    },
  ],
};
