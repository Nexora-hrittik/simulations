---
title: Algorithm
order: 2
type: algorithm
topic: Algorithms
tags:
  - binary-search
  - two-pointers
  - overflow
---

# Algorithm

The algorithm maintains two boundary pointers $\text{low}$ and $\text{high}$ defining the inclusive interval $[ \text{low}, \text{high} ]$ of potential candidate indices.

## Step-by-Step Procedure

1. Initialize pointers $\text{low} = 0$ and $\text{high} = n - 1$.
2. While $\text{low} \leq \text{high}$:
   - Compute midpoint index $\text{mid}$.
   - If $A[\text{mid}] = \text{target}$, return $\text{mid}$ (Success).
   - If $A[\text{mid}] < \text{target}$, discard left half by setting $\text{low} = \text{mid} + 1$.
   - If $A[\text{mid}] > \text{target}$, discard right half by setting $\text{high} = \text{mid} - 1$.
3. If $\text{low} > \text{high}$, conclude target is absent from the array (Failure).

## Safe Midpoint Arithmetic

In standard textbook formulations, the midpoint is often expressed as:

$$
\text{mid} = \left\lfloor \frac{\text{low} + \text{high}}{2} \right\rfloor
$$

> [!WARNING]
> In fixed-width integer architectures (e.g. 32-bit signed integers in C, C++, or Java), $\text{low} + \text{high}$ may exceed $2^{31} - 1$, producing negative integer overflow.

The robust arithmetic formula is:

$$
\text{mid} = \text{low} + \left\lfloor \frac{\text{high} - \text{low}}{2} \right\rfloor
$$

```typescript
function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1;
}
```
