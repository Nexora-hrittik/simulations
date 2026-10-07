---
title: Complexity
order: 3
type: theory
topic: Algorithms
tags:
  - time-complexity
  - asymptotic-analysis
  - logarithmic
---

# Complexity

The efficiency of Binary Search arises from repeatedly halving the search interval.

## Recurrence Relation

At each step, the search interval size $n$ is halved, incurring $O(1)$ comparison overhead:

$$
T(n) = T\left(\frac{n}{2}\right) + O(1)
$$

By Case 2 of the Master Theorem (or through expansion), the exact solution yields:

$$
T(n) = O(\log_2 n)
$$

The maximum number of comparisons required on an array of length $n$ is at most $\lfloor \log_2 n \rfloor + 1$.

## Asymptotic Comparison

| Metric | Linear Search | Binary Search | Hash Table |
|---|---|---|---|
| Best Time | $O(1)$ | $O(1)$ | $O(1)$ |
| Average Time | $O(n)$ | $O(\log n)$ | $O(1)$ |
| Worst Time | $O(n)$ | $O(\log n)$ | $O(n)$ |
| Auxiliary Space | $O(1)$ | $O(1)$ | $O(n)$ |
| Requires Sorting | No | **Yes** | No |
