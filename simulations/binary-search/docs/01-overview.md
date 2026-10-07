---
title: Overview
order: 1
type: theory
topic: Algorithms
tags:
  - searching
  - divide-and-conquer
  - sorted-arrays
---

# Overview

Binary Search is a foundational divide-and-conquer search algorithm that locates the index of a target key within a sorted collection in logarithmic time.

## The Monotonicity Precondition

Binary search relies strictly on the monotonicity invariant: the array must be sorted in non-decreasing order prior to execution.

$$
A[0] \leq A[1] \leq A[2] \leq \dots \leq A[n-1]
$$

If the target value is strictly less than the central element $A[\text{mid}]$, the monotonicity property guarantees that all elements at indices greater than or equal to $\text{mid}$ are also strictly greater than the target. Consequently, half of the active search space is pruned in $O(1)$ operations.
