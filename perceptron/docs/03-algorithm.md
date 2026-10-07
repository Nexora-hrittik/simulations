---
title: Algorithm
order: 3
type: algorithm
topic: Machine Learning
tags:
  - algorithm
  - weight-update
  - pseudocode
---

# Algorithm

The Rosenblatt Perceptron learning algorithm iteratively inspects training samples and applies instantaneous additive corrections upon encountering misclassified points.

## Learning Rule

For a training pair $(\mathbf{x}_i, y_i)$ with ground-truth label $y_i \in \{-1, +1\}$ and learning rate $\eta \in (0, 1]$:

$$
\mathbf{w}^{(t+1)} \leftarrow \mathbf{w}^{(t)} + \eta (y_i - \hat{y}_i) \mathbf{x}_i
$$

$$
b^{(t+1)} \leftarrow b^{(t)} + \eta (y_i - \hat{y}_i)
$$

When a prediction is correct ($\hat{y}_i = y_i$), $(y_i - \hat{y}_i) = 0$ and no parameter update occurs. When misclassified, the normal vector of the hyperplane is rotated toward the sample vector.

## Python Reference Implementation

```python
def train_perceptron(X, y, learning_rate=0.1, max_epochs=50):
    weights = [0.0] * len(X[0])
    bias = 0.0

    for epoch in range(max_epochs):
        errors = 0
        for xi, target in zip(X, y):
            z = sum(w * x for w, x in zip(weights, xi)) + bias
            prediction = 1 if z >= 0 else -1
            
            if prediction != target:
                update = learning_rate * target
                weights = [w + update * x for w, x in zip(weights, xi)]
                bias += update
                errors += 1
                
        if errors == 0:
            break  # Perfect linear separation achieved

    return weights, bias
```
