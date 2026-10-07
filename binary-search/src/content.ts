import { SimulationContent } from '@rec-labs/sdk';

export const BINARY_SEARCH_CONTENT: SimulationContent = {
  introduction:
    'Binary Search is a foundational divide-and-conquer search algorithm that locates the position of a target value within a sorted array in logarithmic time.',
  theory:
    'Binary search compares the target value to the middle element of the array.\n\nIf they are not equal, the half in which the target cannot lie is eliminated, and the search continues on the remaining half, again taking the middle element to compare to the target value.\n\nBecause each comparison reduces the search space by half, the maximum number of comparisons required to find a target in an array of size n is ⌊log₂ n⌋ + 1, giving an optimal O(log n) time complexity.',
  howItWorks: [
    'Set pointers low = 0 and high = array.length - 1.',
    'Calculate the midpoint index: mid = Math.floor((low + high) / 2).',
    'Compare array[mid] with the target value.',
    'If array[mid] === target, the search terminates successfully with the found index.',
    'If array[mid] < target, the target must lie in the right sub-array. Update low = mid + 1.',
    'If array[mid] > target, the target must lie in the left sub-array. Update high = mid - 1.',
    'Repeat until target is found or low > high, indicating the target does not exist in the array.',
  ],
  keyFormulas: [
    {
      label: 'Midpoint Calculation',
      formula: 'mid = ⌊(low + high) / 2⌋',
      explanation: 'Integer division to locate the central index of the active search interval.',
    },
    {
      label: 'Time Complexity',
      formula: 'T(n) = O(log₂ n)',
      explanation: 'Search space is halved after each comparison, guaranteeing logarithmic bounds.',
    },
  ],
  guidedInquiries: [
    {
      question: 'Why does Binary Search require the array to be sorted?',
      answer:
        'Binary search relies on the monotonicity invariant: if the target is greater than the midpoint element, all elements before the midpoint are guaranteed to be smaller and can be safely eliminated. Without sorting, this elimination principle is invalid.',
      note: 'Precondition: Array must be monotonically ordered.',
    },
    {
      question: 'Why does calculating mid as (low + high) / 2 risk integer overflow in other languages?',
      answer:
        'In fixed-width integer languages (like C/C++ or Java), low + high can exceed 2³¹ - 1 and overflow to negative. Safe calculation is low + ((high - low) / 2). JavaScript numbers are 64-bit IEEE floats, but this remains a classic edge case in CS.',
    },
  ],
  references: [
    {
      title: 'Knuth, Donald E. (1998). The Art of Computer Programming, Vol 3: Sorting and Searching',
      url: 'https://en.wikipedia.org/wiki/Binary_search_algorithm',
      description: 'Definitive mathematical analysis of binary search and logarithmic search trees.',
    },
  ],
};
