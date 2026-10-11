---
title: Overview
order: 1
type: theory
topic: Algorithms
---

# Insertion Sort Overview

Insertion Sort is an elementary, in-place, comparison-based sorting algorithm. It builds the final sorted array one element at a time by repeatedly taking the next unsorted element (the **key**) and inserting it into its correct position within an expanding **sorted prefix**.

---

## 1. Core Intuition

A common analogy for Insertion Sort is sorting a hand of playing cards:

1. You start with cards dealt face down on the table.
2. You pick up the first card; by definition, a single card is already sorted.
3. You pick up the second card (the **key**). You compare it with the card in your hand. If the card in hand is greater, you slide it over and place the key in front.
4. For each subsequent card, you scan your sorted hand from right to left, sliding cards that are greater than the key to make room, until you find the right slot.

---

## 2. In-Place & Stability Characteristics

- **In-Place**: Requires only $O(1)$ auxiliary space beyond the input array.
- **Stable**: Elements with equal values never cross each other because the inner loop shifts elements only when $A[j] > \text{key}$ (strict inequality).
- **Adaptive**: Runs in $O(n)$ linear time on already-sorted or nearly-sorted datasets.

---

## 3. Practical Usage

While algorithms like Quicksort, Mergesort, and Heapsort achieve $O(n \log n)$ average-case asymptotic complexity, Insertion Sort exhibits minimal constant factor overhead and excellent CPU cache locality. Consequently, state-of-the-art hybrid sorting algorithms (such as **Timsort** in Python/Java and **Introsort** in C++ standard libraries) transition to Insertion Sort for small partitions ($n \le 16\text{--}32$).
