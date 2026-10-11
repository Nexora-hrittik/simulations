# Insertion Sort Simulation

Official contributor simulation package implementing an interactive, deterministic, pedagogical visualizer for **Insertion Sort** in the **Nexora** learning ecosystem.

This package conforms directly to the `@nexora-hrittik/sdk` runtime contract and integrates with the standalone developer harness.

---

## 1. Features

- **Observable Operation Granularity**: Every comparison ($A[j] > \text{key}$), element shift ($A[j+1] \leftarrow A[j]$), key placement ($A[j+1] \leftarrow \text{key}$), and pass completion is exposed as an individual, deterministic state step.
- **Accurate Metric Telemetry**: Live tracking of comparisons, shifts, key placements, pass progress, and total steps.
- **Preserved Invariants**: Strictly enforces loop invariant $A[0 \dots i-1]$ sorted order and stability.
- **Interactive Control Stage**: Presets for Random, Nearly-Sorted, Reversed, Few-Unique, and Custom input with real-time validation.
- **Educational Integration**: Formulated theory, guided inquiries, academic citations, and asymptotic complexity references.

---

## 2. Contributor Verification Commands

```bash
# 1. Verify simulation metadata conformance against canonical topic taxonomy
npm run validate:metadata

# 2. Check strict architectural boundaries (zero illegal platform leaks)
npm run check:boundary

# 3. Static typechecking against SDK definitions
npm run typecheck

# 4. Execute unit, invariant, and contract tests
npm test

# 5. Build standalone production preview
npm run build

# 6. Start local standalone preview
npm run dev
```

---

## 3. Architecture & File Structure

```text
Insertion-Sort/
├── package.json              # Package manifest (@nexora-hrittik/simulation-template)
├── tsconfig.json             # TypeScript compiler options
├── vite.config.ts            # Vite bundler configuration
├── index.html                # Entrypoint mounting dev harness
├── docs/
│   ├── 01-overview.md        # Pedagogical overview & intuition
│   └── 02-algorithm.md       # Invariant proof, pseudocode, and complexities
├── scripts/
│   ├── check-boundary.js     # Enforces zero platform leaks
│   └── validate-metadata.js  # Validates metadata against canonical taxonomy
├── tests/
│   ├── contract.test.ts      # Automated SDK contract & lifecycle verification
│   ├── harness.test.tsx      # Standalone preview harness invariant tests
│   └── logic.test.ts         # Vitest unit tests for insertion sort invariants
└── src/
    ├── index.ts              # Primary SimulationModule export
    ├── types.ts              # Strongly typed State, Config, and StepLog
    ├── logic.ts              # Pure deterministic state machine transitions
    ├── visualization.tsx     # Visual canvas rendering array elements and roles
    ├── controls.tsx          # User controls (presets, array size, custom inputs)
    ├── content.ts            # Theory, formulas, guided inquiries, and references
    ├── dev.tsx               # Preview harness mount (<SimulationPreviewHarness />)
    └── index.css             # Tailwind v4 styles, theme tokens, and typography
```

---

## 4. Complexity Reference

- **Best-Case Time**: $O(n)$ (Nearly-sorted / already-sorted input)
- **Average-Case Time**: $O(n^2)$
- **Worst-Case Time**: $O(n^2)$ (Reverse-sorted input)
- **Auxiliary Space**: $O(1)$ (In-place)
- **Stability**: Stable ($A[j] > \text{key}$ strictly prevents equal elements from crossing)

---

## License

This project is licensed under the [MIT License](LICENSE).
