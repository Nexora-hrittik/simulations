import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateSimulationModule,
  checkSDKCompatibility,
  useSimulationRuntime,
  ErrorFallback,
  Slider,
  SimulationPreviewHarness,
} from '@nexora-hrittik/sdk';
import { insertionSortSimulation, templateSimulation } from '../src/index';
import { InsertionSortConfig } from '../src/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('SDK Contract & Simulation Conformance', () => {
  it('exports all required runtime and UI primitives from canonical @nexora-hrittik/sdk', () => {
    expect(typeof useSimulationRuntime).toBe('function');
    expect(typeof ErrorFallback).toBe('function');
    expect(typeof Slider).toBe('function');
    expect(typeof SimulationPreviewHarness).toBe('function');
    expect(typeof validateSimulationModule).toBe('function');
    expect(typeof checkSDKCompatibility).toBe('function');
  });

  it('validates insertion sort simulation successfully against the SDK validator', () => {
    const res = validateSimulationModule(insertionSortSimulation);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('declares an SDK version that satisfies SDK compatibility checks', () => {
    const compat = checkSDKCompatibility(insertionSortSimulation.metadata.sdkVersion);
    expect(compat.status).toBe('compatible');
  });

  it('implements deterministic state machine lifecycle contract', () => {
    const config: InsertionSortConfig = {
      initialArray: [20, 10, 5],
      arraySize: 3,
      minValue: 1,
      maxValue: 99,
      preset: 'custom',
    };

    // 1. Initial State
    const s0 = insertionSortSimulation.createInitialState(config);
    expect(s0.originalArray).toEqual([20, 10, 5]);
    expect(s0.array).toEqual([20, 10, 5]);
    expect(s0.totalSteps).toBe(0);
    expect(s0.isComplete).toBe(false);

    // 2. Step 1: select-key
    const r1 = insertionSortSimulation.step(s0, config);
    expect(r1.nextState.phase).toBe('compare');
    expect(r1.nextState.key).toBe(10);
    expect(r1.isComplete).toBe(false);
    expect(r1.stepLog?.action).toBe('SELECT_KEY');

    // Run until complete
    let cur = r1.nextState;
    while (!cur.isComplete) {
      cur = insertionSortSimulation.step(cur, config).nextState;
    }

    expect(cur.isComplete).toBe(true);
    expect(cur.array).toEqual([5, 10, 20]);

    // Post-terminal step (NOOP guard)
    const postStep = insertionSortSimulation.step(cur, config);
    expect(postStep.isComplete).toBe(true);
    expect(postStep.stepLog?.action).toBe('NOOP');

    // Reset semantics
    if (insertionSortSimulation.reset) {
      const resetState = insertionSortSimulation.reset(config);
      expect(resetState.array).toEqual([20, 10, 5]);
      expect(resetState.totalSteps).toBe(0);
      expect(resetState.isComplete).toBe(false);
    }

    // Completion summary
    if (insertionSortSimulation.completionSummary) {
      const summary = insertionSortSimulation.completionSummary(cur, config);
      expect(summary.title).toBeTruthy();
      expect(summary.description).toContain('sorted');
    }
  });

  it('enforces dependency integrity with no local filesystem or obsolete SDK links', () => {
    const pkgPath = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    for (const [dep, ver] of Object.entries(allDeps)) {
      expect(ver).not.toMatch(/^file:/);
      expect(ver).not.toMatch(/^link:/);
      expect(dep).not.toBe('@rec-labs/sdk');
      expect(dep).not.toBe('@nexora/sdk');
    }

    expect(pkg.dependencies['@nexora-hrittik/sdk']).toBeDefined();
    expect(pkg.dependencies['@nexora-hrittik/sdk']).toMatch(/^\^0\./);
  });
});
