---
title: Limitations
order: 5
type: theory
topic: Machine Learning
tags:
  - xor-problem
  - linear-separability
  - minsky-papert
---

# Limitations

While the Perceptron operates with theoretical elegance on linearly separable datasets, its structural limitations defined a historic inflection point in computational artificial intelligence.

> [!IMPORTANT]
> The single-layer Perceptron cannot represent non-linear decision boundaries, including the logical XOR (Exclusive OR) function.

## The Minsky & Papert Critique (1969)

In their seminal book *Perceptrons*, Marvin Minsky and Seymour Papert proved that a single linear threshold unit cannot compute the XOR logic function:

| $x_1$ | $x_2$ | Target Label $y$ |
|---|---|---|
| $0$ | $0$ | $-1$ |
| $0$ | $1$ | $+1$ |
| $1$ | $0$ | $+1$ |
| $1$ | $1$ | $-1$ |

In two-dimensional geometric space, points $(0, 1)$ and $(1, 0)$ require a positive classification, while $(0, 0)$ and $(1, 1)$ require a negative classification. No single straight line can partition these alternating diagonal points without error.

## Resolution via Multi-Layer Architectures

Resolving non-linear geometries requires composing units into Multi-Layer Perceptrons (MLPs) utilizing non-linear activation functions (such as Sigmoid, ReLU, or GELU) trained via backpropagation.
