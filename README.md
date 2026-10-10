# Nexora Simulations

Official catalog of interactive, deterministic Computer Science and IT simulations for the **Nexora** learning ecosystem.

This repository is the central hub for discovering, building, testing, and contributing interactive simulations. Each simulation is an independently testable, standalone module designed to run within the Nexora platform or inside an isolated development harness.

---

## 1. Project Overview

The Nexora learning ecosystem provides hands-on, visual simulations of core computing concepts ranging from fundamental algorithms to systems and machine learning.

- **`Nexora-Hrittik/simulations`** (This repository): The public catalog containing official and community-authored simulation packages.
- **[`Nexora-Hrittik/sdk`](https://github.com/Nexora-Hrittik/sdk)**: The foundational contract and runtime library defining the `SimulationModule` interface, headless state machine runtime, UI telemetry primitives, and validation utilities.
- **[`Nexora-Hrittik/simulation-template`](https://github.com/Nexora-Hrittik/simulation-template)**: A minimal starter repository with a standalone development harness for building new simulations.
- **`Nexora-Labs`**: The private platform application shell that renders the simulations catalog for end learners. (Its internal implementation and configuration are private; simulations interact with it exclusively via the published SDK contract).

---

## 2. Repository Structure

This repository is organized as an **npm workspaces catalog**:

```text
simulations/
├── package.json                      # Catalog root workspace configuration
├── package-lock.json
├── LICENSE
├── README.md                         # This guide
└── simulations/                      # Directory containing individual simulations
    ├── binary-search/                # Binary Search visualizer
    │   ├── package.json              # Simulation package manifest (@nexora/sim-binary-search)
    │   ├── tsconfig.json
    │   ├── vite.config.ts
    │   ├── index.html                # HTML mount for local dev harness
    │   ├── README.md
    │   ├── docs/                     # Algorithm & concept documentation
    │   ├── scripts/
    │   │   └── check-boundary.js     # Boundary leak checker
    │   └── src/
    │       ├── index.ts              # Primary export implementing SimulationModule
    │       ├── types.ts              # State, Config, and StepLog interfaces
    │       ├── logic.ts              # Pure state transition functions
    │       ├── visualization.tsx     # Visual rendering component
    │       ├── controls.tsx          # Parameter controls & input component
    │       ├── content.ts            # Educational theory, formulas & references
    │       ├── dev.tsx               # Development harness mounting SimulationPreviewHarness
    │       └── tests/
    │           └── logic.test.ts     # Automated unit tests
    ├── counter/                      # Discrete State Counter visualizer
    └── perceptron/                   # 2D Linear Classifier visualizer
```

### File Responsibilities in a Simulation

| File | Purpose | Normal Contributor Modification? |
| :--- | :--- | :--- |
| `src/index.ts` | Simulation entry point conforming to `SimulationModule` | **Yes** — wire exports and metadata |
| `src/types.ts` | State, Config, and StepLog type definitions | **Yes** — define simulation data models |
| `src/logic.ts` | Pure state transition functions (`createInitialState`, `step`) | **Yes** — core algorithmic logic |
| `src/visualization.tsx`| React component rendering the visual stage | **Yes** — visual representation |
| `src/controls.tsx` | React component rendering user configuration inputs | **Yes** — parameters and controls |
| `src/content.ts` | Structured educational text, theory, and references | **Yes** — pedagogical explanations |
| `src/tests/*` | Unit test suite verifying logic, transitions, and edge cases | **Yes** — write comprehensive tests |
| `docs/*` | In-depth topic documentation and reference guides | **Yes** — supplementary explanations |
| `src/dev.tsx` | Mounts the SDK `SimulationPreviewHarness` for local browser preview | Rarely — already configured |
| `scripts/check-boundary.js` | Enforces zero platform leaks | No — keep intact |

### Shared Files (Do Not Modify Casually)

- **Root `package.json` & `package-lock.json`**: Only update when adding a new simulation workspace path or updating catalog-wide dev dependencies.
- **Other contributors' simulations**: Avoid making unrelated changes in sibling simulation folders (`simulations/<other-simulation>/`).

---

## 3. Prerequisites

Before working on simulations, ensure you have the following installed:

- **Node.js**: `v18.0.0` or higher (Node `v20+` or `v22+` LTS recommended).
- **npm**: `v9.0.0` or higher.
- **Git**: `v2.30.0` or higher.

Verify your environment by running:

```bash
node -v
npm -v
git --version
```

---

## 4. Clone and Explore the Repository

To clone and explore the repository locally:

```bash
git clone https://github.com/Nexora-Hrittik/simulations.git
cd simulations
```

### Install Dependencies and Verify Existing Simulations

```bash
# Install dependencies across all workspace packages
npm install

# Run automated tests across all simulations
npm test

# Verify architectural boundary invariants (no platform leaks)
npm run check:boundary
```

### Run an Existing Simulation Locally

Each simulation includes a standalone development harness powered by Vite and the SDK:

```bash
# Navigate to the target simulation workspace
cd simulations/binary-search

# Start the local development preview server
npm run dev
```

Open your browser at `http://localhost:5173` to interact with the simulation, inspect the state machine, view educational theory, and review the live validation badge.

> [!NOTE]
> **Understanding Repository Scope**:
> - Cloning downloads committed repository contents, including simulations created by other contributors.
> - A clone is a local copy on your machine, not ownership or write permission on the upstream repository.
> - You can inspect and modify your local copy freely without affecting the remote repository.
> - Pushing directly to `Nexora-Hrittik/simulations` requires repository write permissions. Contributors without write permissions must fork the repository and submit a pull request.
> - Cloning does not automatically publish, register, or deploy simulations to any server or platform.

---

## 5. Choose Your Contribution Path

### Path A: Improve an Existing Simulation

Use this path to fix a bug, improve performance, refine visual rendering, or add educational depth to an existing simulation in the catalog.

1. Locate the simulation under `simulations/<name>/`.
2. Inspect its implementation (`src/logic.ts`, `src/visualization.tsx`, `src/content.ts`) and existing documentation (`docs/`).
3. Create a branch from your fork (e.g., `git checkout -b fix/binary-search-bounds`).
4. Make focused, minimal changes addressing the specific issue.
5. Run tests and boundary validation:
   ```bash
   cd simulations/<name>
   npm test
   npm run check:boundary
   npm run typecheck
   ```
6. Commit your changes and open a pull request.

---

### Path B: Contribute a Simulation Already Built Elsewhere

If you have already implemented an algorithm, interactive model, or visualizer in an external repository, **you do not need to rebuild it from scratch**.

1. **Review Against the SDK Contract**: Compare your existing logic to the `SimulationModule` contract exported by the SDK.
2. **Preserve Your Implementation**: Keep your existing calculation algorithms, mathematical models, and core logic intact.
3. **Adapt Interfaces to the SDK**:
   - Extract initial state creation into a pure function `createInitialState(config)`.
   - Adapt step progression into a pure function `step(state, config)` returning `{ nextState, isComplete, stepLog }`.
   - Wrap your visualization in a component conforming to `SimulationVisualizationProps`.
   - Provide configuration controls conforming to `SimulationControlsProps`.
   - Add structured metadata and educational content (`SimulationMetadata`, `SimulationContent`).
4. **Copy into the Catalog**:
   - Place your simulation folder inside `simulations/<your-simulation-name>/`.
   - Include standard configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, `scripts/check-boundary.js`).
5. **Run Validation Checks**:
   ```bash
   npm test
   npm run check:boundary
   ```
6. Submit your simulation through a pull request.

*Compatibility is determined strictly by satisfying the SDK contract and repository standards, not by whether the simulation was originally generated from the template.*

---

### Path C: Create a New Simulation from Scratch

Use the official starter template to scaffold a new simulation:

1. Clone or generate a new project from the official template:
   ```bash
   git clone https://github.com/Nexora-Hrittik/simulation-template.git my-simulation
   cd my-simulation
   npm install
   npm run dev
   ```
2. Build and verify your simulation within the template's standalone harness.
3. Add the required metadata, controls, visualization, and educational theory.
4. When ready to contribute, copy your simulation folder into the catalog under `simulations/<your-simulation-name>/`.
5. Run the catalog-wide verification tests and submit your pull request.

---

## 6. Fork, Branch, Commit, and Pull Request

Contributors without write permissions should follow this standard GitHub workflow:

### Step 1: Fork and Clone

1. On GitHub, visit [Nexora-Hrittik/simulations](https://github.com/Nexora-Hrittik/simulations) and click **Fork**.
2. Clone your personal fork locally:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/simulations.git
   cd simulations
   ```
3. Add the original repository as `upstream`:
   ```bash
   git remote add upstream https://github.com/Nexora-Hrittik/simulations.git
   ```

*Terminology*:
- `origin`: Your personal GitHub fork (where you have push permissions).
- `upstream`: The official `Nexora-Hrittik/simulations` repository.

### If You Already Cloned the Upstream Repository Directly

If you already cloned `Nexora-Hrittik/simulations` directly and have local uncommitted changes, **do not run `git reset --hard`**. Transfer your remote safely:

```bash
# Rename existing upstream remote
git remote rename origin upstream

# Add your fork as origin
git remote add origin https://github.com/<YOUR-USERNAME>/simulations.git
```

### Step 2: Create a Feature Branch

Always create a new branch from up-to-date upstream `main`:

```bash
git fetch upstream
git checkout -b feat/your-simulation-name upstream/main
```

### Step 3: Implement and Inspect Changes

Keep changes focused on your target simulation:

```bash
git status
git diff
```

### Step 4: Run Checks Before Committing

Before committing, confirm that all validation checks pass:

```bash
# Run tests across simulations
npm test

# Verify architectural boundary invariants
npm run check:boundary

# Verify type consistency
npm run typecheck
```

### Step 5: Commit and Push

Commit with a clear, descriptive commit message:

```bash
git add simulations/<your-simulation-name>/
git commit -m "feat(simulations): add <your-simulation-name> simulation"
git push -u origin feat/your-simulation-name
```

### Step 6: Open a Pull Request

1. Navigate to your fork on GitHub.
2. Click **Compare & pull request**.
3. Select `base repository: Nexora-Hrittik/simulations` and `base: main`.
4. Fill out the PR description detailing what concept your simulation models, how to test it, and any boundary considerations.

> [!WARNING]
> Never use destructive Git commands such as `git reset --hard` or forced pushes (`git push --force`) on shared branches.

---

## 7. Simulation Requirements and Quality Checklist

All accepted simulations must satisfy the following technical and educational standards:

1. **Deterministic Pure State Transitions**:
   - `createInitialState(config)` must be a pure function returning a complete, predictable initial state.
   - `step(state, config)` must be a pure function returning `{ nextState, isComplete, stepLog }`. It must **never mutate state in-place** or perform side effects (no network calls, timers, or direct DOM manipulation).
2. **SDK Contract Conformance**:
   - The simulation module exported at `src/index.ts` must implement `SimulationModule<TState, TConfig, TStepLog>` from the SDK.
3. **Required Metadata**:
   - `id`: Unique kebab-case identifier matching the directory name (e.g., `'binary-search'`).
   - `title`: Human-readable title.
   - `shortDescription`: 1-2 sentence description for catalog cards.
   - `topicId` and `category`: Primary domain category (e.g., `algorithms`, `machine-learning`, `systems`).
   - `tags`: Array of searchable topic keywords.
   - `difficulty`: `'Beginner'`, `'Intermediate'`, or `'Advanced'`.
   - `version`: Semantic version string (e.g., `'1.0.0'`).
   - `sdkVersion`: Compatible SDK version (e.g., `'0.1.0'`).
   - `author`: Contributor name and optional GitHub username.
4. **Rich Educational Content**:
   - `content.introduction`: Clear context explaining why the concept matters.
   - `content.theory`: Deep dive into underlying mathematical or algorithmic principles.
   - `content.howItWorks`: Step-by-step breakdown of the execution flow.
   - `content.references`: Array of credible educational references and sources.
5. **Interactive Controls & Visualization**:
   - `Controls`: Lets users tweak parameters (e.g., data size, target value, learning rate) before or during execution.
   - `Visualization`: Accurately and clearly represents state changes, current pointers, active nodes, and termination criteria.
   - Handles edge cases gracefully (e.g., empty arrays, invalid targets, non-convergent inputs).
6. **Reset and Repeatability**:
   - `reset: createInitialState` ensures that resetting restores a clean, repeatable state.
7. **Architectural Boundary Isolation**:
   - Zero imports from platform private files (`src/`, `@heroui`, `../../`). The simulation depends strictly on the SDK and React.
8. **Automated Unit Tests**:
   - Tests under `src/tests/` verifying initial state creation, step transitions, termination conditions, and boundary behavior.

---

## 8. Testing and Validation

### Catalog-Wide Verification Commands

Run from the root of the `simulations` repository:

```bash
# Run all unit tests across all simulation packages
npm test

# Verify architectural boundaries across all simulations
npm run check:boundary

# Run TypeScript typechecks across all simulation packages
npm run typecheck
```

### Workspace-Specific Verification Commands

Run from within a specific simulation directory (e.g., `cd simulations/binary-search`):

```bash
# Launch the interactive standalone dev harness in the browser
npm run dev

# Run Vitest unit tests for this simulation
npm test

# Run boundary leak check for this simulation
npm run check:boundary

# Run strict TypeScript compiler verification without emitting files
npm run typecheck

# Build production assets using Vite
npm run build
```

### What Each Check Verifies

- **`npm test`**: Executes Vitest test suites, asserting algorithmic correctness, state immutability, step counting, and edge cases.
- **`npm run check:boundary`**: Scans all source files (`.ts`, `.tsx`, `.js`, `.jsx`) with `scripts/check-boundary.js` to ensure no illegal imports escape the simulation boundary.
- **`npm run typecheck`**: Runs `tsc --noEmit` against `tsconfig.json` to guarantee strict type safety.
- **`npm run dev`**: Launches `SimulationPreviewHarness`, allowing manual visual inspection of the simulation stage, control responsiveness, playback speed adjustment, and theory tab rendering.

---

## 9. How Accepted Simulations Reach the Platform

The integration process follows three distinct stages:

```
┌─────────────────────────────────┐
│ Stage 1: Contributor Authoring  │ Contributor develops and validates simulation locally
└────────────────┬────────────────┘
                 │ (Pull Request)
                 ▼
┌─────────────────────────────────┐
│ Stage 2: Catalog Review & Merge │ Maintainers review code against quality checklist
└────────────────┬────────────────┘
                 │ (Merged into main)
                 ▼
┌─────────────────────────────────┐
│ Stage 3: Platform Integration   │ Simulation is integrated into the Nexora platform
└─────────────────────────────────┘
```

> [!IMPORTANT]
> **Merging a pull request accepts the simulation into this catalog; it does not automatically deploy the simulation to production.**
> 
> *Maintainer Confirmation Required*: The precise release mechanism (e.g., whether individual simulation packages `@nexora/sim-*` are published to an npm registry or bundled into the platform via workspace ingestion) is managed by platform maintainers. Contributor code remains isolated and independent of the platform shell.

---

## 10. Contribution Rules and Troubleshooting

### Contribution Rules

1. **Keep Pull Requests Focused**: Limit changes to a single simulation. Do not reformat unrelated files or alter shared root dependencies without prior discussion.
2. **Prevent Duplication**: Check existing simulations under `simulations/` and open issues before starting work on a new simulation.
3. **SDK Changes Belong in SDK**: If your simulation requires a new SDK primitive or interface change, open an issue or PR in [Nexora-Hrittik/sdk](https://github.com/Nexora-Hrittik/sdk) first. Do not bundle SDK changes with simulation contributions.

### Common Issues & Troubleshooting

- **Boundary Violation (`[BOUNDARY VIOLATION]` error)**:
  - *Cause*: An import references platform shell code (e.g., `import ... from '@heroui/...'` or `../../src/...`).
  - *Fix*: Remove the platform import. Use standard HTML/Tailwind elements or SDK UI primitives (`Slider`, `PlaybackBar`).
- **Cannot Find Module `@nexora/sdk` / `@nexora-hrittik/sdk`**:
  - *Cause*: Workspace packages not linked or installed.
  - *Fix*: Run `npm install` from the root of the repository to resolve workspace dependencies.
- **State Mutation in Step Function**:
  - *Cause*: Direct modification of state properties (e.g., `state.low = mid + 1`).
  - *Fix*: Return a new object: `return { nextState: { ...state, low: mid + 1 }, isComplete: false }`.

---

## 11. Final Contributor Checklist

Before opening your pull request, verify that:

- [ ] The simulation directory is located under `simulations/<your-simulation-name>/`.
- [ ] `src/index.ts` exports a valid `SimulationModule` with complete metadata and content.
- [ ] `createInitialState` and `step` are pure functions with zero side-effects.
- [ ] `npm test` passes with unit tests covering normal execution and edge cases.
- [ ] `npm run check:boundary` passes with zero violations.
- [ ] `npm run typecheck` passes without errors.
- [ ] Visual stage and controls have been tested manually in `npm run dev`.
- [ ] No unrelated files in root or sibling simulations are modified.

---

## License

This repository is licensed under the [MIT License](LICENSE).
