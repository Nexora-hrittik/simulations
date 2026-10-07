---
title: Execution
order: 2
type: algorithm
topic: Algorithms
tags:
  - lifecycle
  - execution
  - telemetry
---

# Execution

The accumulator runs under the platform contract execution loop governed by `@nexora/sdk`.

## Execution Lifecycle

1. **State Construction**: On mount or reset, `createInitialState(config)` sets internal accumulator register to 0.
2. **Transition Step**: Each clock tick triggers `step(state, config)`:
   - Evaluates whether current value meets terminal criterion $S_t \geq T$.
   - Appends audit entry into step history.
   - Emits next state vector.
3. **Completion Invariant**: Upon completion, the runtime locks controls and presents the terminal synthesis summary.

```typescript
export function step(state: CounterState, config: CounterConfig): StepResult<CounterState> {
  const nextCount = state.count + config.stepSize;
  const isComplete = nextCount >= config.target;

  return {
    nextState: {
      count: nextCount,
      history: [...state.history, nextCount],
    },
    isComplete,
  };
}
```
