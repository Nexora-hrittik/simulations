import { SimulationContent } from '@nexora-hrittik/sdk';

export const INSERTION_SORT_CONTENT: SimulationContent = {
  introduction:
    'Insertion Sort is a fundamental, comparison-based sorting algorithm that constructs the final sorted array one element at a time. It iterates through the input elements, taking each new key and inserting it into its correct relative position within an expanding sorted prefix.',
  theory: `Insertion Sort mimics the natural way people sort a hand of playing cards.
The algorithm maintains a strict loop invariant: at the beginning of each outer pass $i$, the subarray $A[0 \\dots i-1]$ is guaranteed to be completely sorted in ascending order.

To process element $A[i]$ (the key):
1. The key value is extracted into temporary storage.
2. The key is compared sequentially against preceding elements in the sorted prefix from right to left ($j = i-1$ down to $0$).
3. Any element strictly greater than the key is shifted one position to the right ($A[j+1] \\leftarrow A[j]$) to create room for the key.
4. When an element less than or equal to the key is encountered (or the front of the array is reached), shifting terminates.
5. The key is inserted into the resulting gap ($A[j+1] \\leftarrow key$).
6. Because equal elements are never shifted past each other, relative ordering is preserved, ensuring stability.

Advanced Theoretical Insights:
• Inversion Sensitivity: An inversion is a pair $(i, j)$ such that $i \\lt j$ but $A[i] \\gt A[j]$. The number of shifts performed by Insertion Sort is exactly equal to the total number of inversions in the original input array. The total running time is $\\Theta(n + I)$, where $I$ is the number of inversions.
• Online Processing: Insertion Sort is an online algorithm. It can sort a stream of input items as they arrive sequentially without needing the entire dataset upfront.
• Binary Insertion Sort Variant: Using binary search to locate the insertion point reduces comparisons from $O(n^2)$ to $O(n \\log n)$, but the shift operations still take $O(n^2)$ time in an array.`,
  howItWorks: [
    'Establish the base case: index 0 forms an initial sorted prefix of length 1.',
    'Select the element at index i (where 1 ≤ i < n) as the current key to be inserted.',
    'Scan backwards through the sorted prefix (j = i - 1 down to 0), comparing each element with the key.',
    'Shift every element strictly greater than the key one position to the right.',
    'Insert the key into the newly vacated position (index j + 1).',
    'Advance the sorted prefix boundary by one and repeat until all elements are sorted.',
  ],
  keyFormulas: [
    {
      label: 'Sorted Prefix Loop Invariant',
      formula: 'A[0 \\dots i-1] \\text{ is sorted and contains a permutation of original elements}',
      explanation: 'Holds true at the start of every outer loop pass i. Each pass restores and extends this invariant.',
    },
    {
      label: 'Strict Shift Condition (Stability)',
      formula: 'A[j] > \\text{key} \\implies A[j+1] \\leftarrow A[j]',
      explanation: 'Equal elements never cross each other, preserving original relative order and guaranteeing stability.',
    },
    {
      label: 'Inversion-Sensitive Time Complexity',
      formula: 'T(n) = \\Theta(n + I), \\quad I = |\\{ (i, j) : i < j \\land A[i] > A[j] \\}|',
      explanation: 'The number of element shifts is identically equal to the number of inversions I in the input array.',
    },
    {
      label: 'Best-Case Time Complexity',
      formula: 'T(n) = O(n)',
      explanation: 'Occurs when the input array is already sorted. Exactly n-1 comparisons occur and 0 shifts are needed.',
    },
    {
      label: 'Worst-Case Time Complexity',
      formula: 'T(n) = O(n^2)',
      explanation: 'Occurs when the array is in reverse order. Requires n(n-1)/2 comparisons and n(n-1)/2 shifts.',
    },
    {
      label: 'Auxiliary Space Complexity',
      formula: 'S(n) = O(1)',
      explanation: 'In-place sorting requiring only constant additional memory for key storage and loop pointers.',
    },
  ],
  guidedInquiries: [
    {
      question: 'Why does Insertion Sort achieve O(n) runtime on nearly-sorted data?',
      answer:
        'When an array is already or nearly sorted, elements are already close to their final positions. Each inner scan terminates almost immediately (1 comparison, 0 or few shifts), allowing the algorithm to execute in linear time.',
      note: 'This adaptive property makes Insertion Sort the standard base-case routine for hybrid algorithms like Timsort and Introsort for small partitions (typically n ≤ 16–32).',
    },
    {
      question: 'What makes Insertion Sort stable, and why does strict comparison matter?',
      answer:
        'Because the shift condition requires A[j] > key rather than A[j] >= key, an element equal to the key stops the inner loop immediately. The key is placed directly to the right of its duplicate, preserving their initial sequence.',
    },
    {
      question: 'How is the number of shifts related to array inversions?',
      answer:
        'Every shift moves an element one step to the right over the key, resolving exactly one inversion. Thus, the total shift count is equal to the total inversion count of the input array.',
      note: 'This makes insertion sort optimal among comparison sorts when the number of inversions is small (O(n)).',
    },
    {
      question: 'Why does Binary Insertion Sort not improve asymptotic time complexity on arrays?',
      answer:
        'Binary search reduces comparisons to O(n log n), but shifting elements in a contiguous array to open the gap still requires O(n) moves in the worst case, leaving the overall time complexity at O(n²).',
    },
  ],
  references: [
    {
      title: 'Introduction to Algorithms (CLRS)',
      url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
      description: 'Chapter 2.1: Getting Started — Detailed proof of correctness and loop invariants for Insertion Sort.',
    },
    {
      title: 'Princeton Algorithms 4th Edition',
      url: 'https://algs4.cs.princeton.edu/21elementary/',
      description: 'Elementary sorts: Inversion-based analysis and empirical performance characteristics.',
    },
    {
      title: 'The Art of Computer Programming, Volume 3: Sorting and Searching',
      url: 'https://www-cs-faculty.stanford.edu/~knuth/taocp.html',
      description: 'Donald E. Knuth on comparative analysis of straight insertion and inversion counts.',
    },
  ],
};
