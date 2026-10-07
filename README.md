# Nexora Simulations

This repository houses official and community-authored interactive simulation implementations for the **Nexora** platform.

---

## Directory Structure

```text
simulations/
├── binary-search/    # Binary Search algorithm visualizer
├── counter/          # Discrete State Counter architectural validation
└── perceptron/       # 2D Linear Classifier and convergence visualizer
```

Each simulation is an independently identifiable and testable package implementing the `@nexora/sdk` contract.

---

## Architecture & Boundary Invariants

1. **Dependency Direction**:
   - Simulations depend strictly on `@nexora/sdk`.
   - Simulations have **zero imports from the platform shell** (`src/`, `@heroui`, etc.).
   - The platform consumes simulations via package contracts (`@nexora/sim-*`).
2. **Standalone Integrity**:
   - Any simulation in this repository can be extracted into its own standalone GitHub repository without redesigning the platform.

---

## Development & Testing

```bash
# Install dependencies across all simulation workspaces
npm install

# Run automated tests across all simulations
npm test

# Run boundary leak checks
npm run check:boundary
```
