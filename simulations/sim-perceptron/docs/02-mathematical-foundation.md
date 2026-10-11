---
title: Mathematical Foundation
order: 2
type: theory
topic: Machine Learning
tags:
  - mathematics
  - hyperplane
  - novikoff
---

# Mathematical Foundation

The Perceptron computes a linear combination of input features parameterized by a weight vector $w \in \mathbb{R}^n$ and an affine scalar bias $b \in \mathbb{R}$.

## The Weighted Sum

The net activation input $z$ is the inner product of weights and input features augmented by the scalar bias:

$$
z = \sum_{i=1}^{n} w_i x_i + b = \mathbf{w}^T \mathbf{x} + b
$$

## Activation Function

The continuous net input $z$ is discretized into binary decisions via the signum step activation function:

$$
\hat{y} = \text{sign}(z) = \begin{cases} +1 & z \geq 0 \\ -1 & z < 0 \end{cases}
$$

## Decision Boundary Hyperplane

The boundary dividing the two classes is the set of all points $\mathbf{x}$ where the net input equals zero:

$$
\mathbf{w}^T \mathbf{x} + b = 0
$$

In two-dimensional space where $\mathbf{x} = [x_1, x_2]^T$ and $\mathbf{w} = [w_1, w_2]^T$, the decision boundary forms a line:

$$
w_1 x_1 + w_2 x_2 + b = 0 \implies x_2 = -\frac{w_1}{w_2} x_1 - \frac{b}{w_2}
$$

The weight vector $\mathbf{w}$ is orthogonal to the decision boundary line and points into the positive half-space.

## The Convergence Theorem

If a training dataset is linearly separable with geometric margin $\gamma > 0$ and bounded radius $R = \max \|\mathbf{x}_k\|$, the **Novikoff Perceptron Convergence Theorem (1962)** proves that the algorithm converges in a bounded finite number of weight updates:

$$
k \leq \left( \frac{R}{\gamma} \right)^2
$$
