---
title: Execution Algorithm
order: 2
type: algorithm
topic: Algorithms
---

# Insertion Sort Algorithm & Invariants

This document specifies the step-by-step state machine, mathematical loop invariants, inversion characteristics, and complexity bounds governing the Insertion Sort simulation.

---

## 1. Pseudocode

```text
INSERTION-SORT(A):
  for i = 1 to length(A) - 1:
    key = A[i]
    // Insert A[i] into the sorted sequence A[0 .. i-1]
    j = i - 1
    while j >= 0 and A[j] > key:
      A[j + 1] = A[j]
      j = j - 1
    A[j + 1] = key
```

---

## 2. Formal Loop Invariant

At the start of each iteration of the outer `for` loop indexed by $i$:

$$\text{The subarray } A[0 \dots i-1] \text{ consists of the elements originally in } A[0 \dots i-1], \text{ but in sorted order.}$$

### Invariant Proof:
- **Initialization**: Prior to the first iteration ($i = 1$), the subarray consists of $A[0]$ alone. A single element is trivially sorted.
- **Maintenance**: The inner `while` loop moves $A[i-1], A[i-2], \dots$ by one position to the right until the proper position for `key` ($A[i]$) is found, at which point `key` is inserted. Subarray $A[0 \dots i]$ now contains the same elements in sorted order.
- **Termination**: The outer loop terminates when $i = n$. By substituting $i = n$ into the invariant, $A[0 \dots n-1]$ consists of all original elements in sorted order.

---

## 3. Inversion-Sensitive Complexity Analysis

An **inversion** in an array $A$ is an index pair $(j, k)$ such that $j < k$ but $A[j] > A[k]$.

- Every shift operation $A[j+1] \leftarrow A[j]$ moves an element over `key`, decreasing the total inversion count by exactly $1$.
- Total element shifts across the entire algorithm run equal the exact number of inversions $I$ in the initial array:
  $$\text{Total Shifts} = I = |\{ (j, k) : j < k \land A[j] > A[k] \}|$$
- The overall running time is $\Theta(n + I)$, demonstrating why Insertion Sort is exceptionally fast on nearly-sorted data where $I = O(n)$.

---

## 4. Online Sorting & Binary Insertion Sort

### Online Capability
Insertion Sort is an **online algorithm**: it can process items sequentially as they arrive from a live data stream. Because the prefix $A[0 \dots i-1]$ is kept sorted at all times, a newly arriving element can be immediately slotted into position without requiring access to future elements.

### Binary Insertion Sort Variant
Instead of scanning linearly backwards ($j = i-1$ down to $0$), Binary Insertion Sort applies binary search over the sorted prefix $A[0 \dots i-1]$ to find the insertion index in $O(\log i)$ comparisons:
- Total comparisons drop from $O(n^2)$ to $\sum_{i=1}^{n-1} O(\log i) = O(n \log n)$.
- However, shifting elements rightward in a flat array still requires $\Theta(n^2)$ data movements. Thus, binary insertion sort remains $O(n^2)$ overall time on contiguous arrays.

---

## 5. Asymptotic Complexity Reference

| Case | Comparisons | Shifts | Time Complexity | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Best Case** | $n - 1$ | $0$ | $O(n)$ | Array is already sorted in non-decreasing order ($I = 0$) |
| **Average Case** | $\approx \frac{n(n-1)}{4}$ | $\approx \frac{n(n-1)}{4}$ | $O(n^2)$ | Random permutation with expected inversions $I \approx \frac{n(n-1)}{4}$ |
| **Worst Case** | $\frac{n(n-1)}{2}$ | $\frac{n(n-1)}{2}$ | $O(n^2)$ | Strictly descending order ($I = \frac{n(n-1)}{2}$) |
| **Auxiliary Space** | — | — | $O(1)$ | Operates entirely in-place |
