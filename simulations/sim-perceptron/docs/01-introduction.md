---
title: Introduction
order: 1
type: theory
topic: Machine Learning
tags:
  - neural-foundations
  - classification
  - rosenblatt
---

# Introduction

The Perceptron is the foundational building block of artificial neural networks. Proposed by Frank Rosenblatt in 1958 at Cornell Aeronautical Laboratory, it introduced a supervised learning algorithm for binary classification that calculates a linear hyperplane separating two classes.

> [!NOTE]
> All simulations in REC Labs execute deterministically on your machine. You can step forward through weight updates and watch the decision boundary pivot in real time.

## Conceptual Model

A Perceptron models an elementary biological neuron. It receives multiple continuous numerical inputs, calculates an affine combination using learned synaptic weights and an internal bias threshold, and fires if the total sum exceeds zero.

In two-dimensional feature space, the Perceptron establishes a line that partitions the plane into two decision half-spaces: positive ($+1$) and negative ($-1$).
