---
title: Training Process
order: 4
type: theory
topic: Machine Learning
tags:
  - training-loop
  - workflow
  - epochs
---

# Training Process

Training proceeds across discrete epochs. In each epoch, the model cycles deterministically through all samples in the training set.

## Execution Flowchart

```mermaid
flowchart TD
    Init[Initialize w and b to 0] --> Fetch[Fetch Next Sample x, y]
    Fetch --> Dot[Compute Net Activation z = w·x + b]
    Dot --> Sign[Discretize Output y_hat = sign z]
    Sign --> Check{y_hat == y ?}
    Check -->|Yes| NextSample[Proceed without update]
    Check -->|No| UpdateRule[w += eta*y*x and b += eta*y]
    UpdateRule --> NextSample
    NextSample --> EpochCheck{Epoch Finished?}
    EpochCheck -->|No| Fetch
    EpochCheck -->|Yes| Converged{Errors == 0 ?}
    Converged -->|Yes| Terminate[Simulation Complete: Converged]
    Converged -->|No| MaxEpoch{Epochs >= Max?}
    MaxEpoch -->|Yes| Stop[Terminated: Limit Reached]
    MaxEpoch -->|No| Fetch
```

## Convergence Telemetry

During execution in the REC Labs runtime, the system monitors:

- **Current Epoch**: The pass number through the entire dataset.
- **Active Sample**: The coordinates currently evaluated on the canvas.
- **Epoch Error Count**: The total classification discrepancies observed during the current sweep.
- **Hyperplane State**: The current coefficients $[w_1, w_2, b]$ defining the boundary.
