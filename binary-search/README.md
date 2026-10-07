# Contributor Simulation: Binary Search

This is an example standalone simulation module demonstrating authoring against `@rec-labs/sdk`.

## Development Commands

- `npm run dev`: Launch local development preview with `SimulationPreviewHarness` at `http://localhost:5173`.
- `npm test`: Run headless algorithmic logic unit tests with Vitest.
- `npm run typecheck`: Run TypeScript type-checker in strict mode.
- `npm run build`: Compile TypeScript and bundle production assets with Vite.
- `npm run check:boundary`: Verify zero platform-private imports.

## Structure

- `src/types.ts`: Domain state and configuration interfaces.
- `src/logic.ts`: Pure transition functions (`createInitialState`, `step`, `subStep`).
- `src/logic.test.ts`: Algorithmic verification tests.
- `src/visualization.tsx`: Visual stage projection.
- `src/controls.tsx`: Parameter controls.
- `src/content.ts`: Educational theory, formulas, and references.
- `src/index.ts`: Module export implementing `SimulationModule`.
- `src/dev.tsx`: Preview entry mounting `<SimulationPreviewHarness />`.
