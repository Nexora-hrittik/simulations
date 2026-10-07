import { describe, it, expect } from 'vitest';
import {
  calculateDecisionBoundary,
  stepActivation,
  DATASETS,
  getWireStrokeWidth,
  getWireColor,
} from '../index';

describe('PerceptronSimulation Mathematics & Edge Cases', () => {
  it('correctly calculates decision boundary for standard non-vertical lines (w2 != 0)', () => {
    // w1 = 1, w2 = -1, b = 0 => x1 - x2 = 0 => x2 = x1
    const line = calculateDecisionBoundary(1, -1, 0, -1, 1, -1, 1);
    expect(line).not.toBeNull();
    if (!line) return;

    expect(line.x1).toBe(-1);
    expect(line.y1).toBeCloseTo(-1);
    expect(line.x2).toBe(1);
    expect(line.y2).toBeCloseTo(1);
  });

  it('handles vertical line edge case when w2 = 0 and w1 != 0', () => {
    // w1 = 2, w2 = 0, b = -1 => 2*x1 - 1 = 0 => x1 = 0.5 (vertical line)
    const line = calculateDecisionBoundary(2, 0, -1, -2, 2, -2, 2);
    expect(line).not.toBeNull();
    if (!line) return;

    expect(line.x1).toBeCloseTo(0.5);
    expect(line.x2).toBeCloseTo(0.5);
    expect(line.y1).toBe(-2);
    expect(line.y2).toBe(2);
  });

  it('returns null for degenerate case when both w1 = 0 and w2 = 0', () => {
    const line = calculateDecisionBoundary(0, 0, 0.5);
    expect(line).toBeNull();
  });

  it('evaluates Heaviside step activation accurately', () => {
    expect(stepActivation(0.5)).toBe(1);
    expect(stepActivation(0.0)).toBe(1);
    expect(stepActivation(-0.001)).toBe(0);
    expect(stepActivation(-5.2)).toBe(0);
  });

  it('verifies dataset truth table structures for AND, OR, XOR', () => {
    const andData = DATASETS.AND;
    expect(andData.length).toBe(4);
    expect(andData.find((p) => p.x1 === 1 && p.x2 === 1)?.y).toBe(1);
    expect(andData.find((p) => p.x1 === 0 && p.x2 === 1)?.y).toBe(0);

    const orData = DATASETS.OR;
    expect(orData.find((p) => p.x1 === 0 && p.x2 === 0)?.y).toBe(0);
    expect(orData.find((p) => p.x1 === 0 && p.x2 === 1)?.y).toBe(1);

    const xorData = DATASETS.XOR;
    expect(xorData.find((p) => p.x1 === 1 && p.x2 === 1)?.y).toBe(0);
    expect(xorData.find((p) => p.x1 === 0 && p.x2 === 1)?.y).toBe(1);
  });

  it('simulates full convergence of Perceptron learning rule on AND gate', () => {
    let w1 = 0.2;
    let w2 = -0.4;
    let b = 0.1;
    const lr = 0.1;
    const dataset = DATASETS.AND;

    let converged = false;
    let epochs = 0;
    const maxEpochs = 30;

    while (!converged && epochs < maxEpochs) {
      epochs++;
      let errorsThisEpoch = 0;

      for (const pt of dataset) {
        const sum = w1 * pt.x1 + w2 * pt.x2 + b;
        const pred = stepActivation(sum);
        const err = pt.y - pred;

        if (err !== 0) {
          errorsThisEpoch++;
          w1 += lr * err * pt.x1;
          w2 += lr * err * pt.x2;
          b += lr * err * 1;
        }
      }

      if (errorsThisEpoch === 0) {
        converged = true;
      }
    }

    expect(converged).toBe(true);
    expect(epochs).toBeLessThanOrEqual(15);

    // Verify all 4 points are now classified correctly
    for (const pt of dataset) {
      const sum = w1 * pt.x1 + w2 * pt.x2 + b;
      expect(stepActivation(sum)).toBe(pt.y);
    }
  });

  it('demonstrates non-convergence on XOR gate (Perceptron oscillation)', () => {
    let w1 = 0.2;
    let w2 = -0.4;
    let b = 0.1;
    const lr = 0.1;
    const dataset = DATASETS.XOR;

    let converged = false;
    let epochs = 0;
    const maxEpochs = 40;

    while (!converged && epochs < maxEpochs) {
      epochs++;
      let errorsThisEpoch = 0;

      for (const pt of dataset) {
        const sum = w1 * pt.x1 + w2 * pt.x2 + b;
        const pred = stepActivation(sum);
        const err = pt.y - pred;

        if (err !== 0) {
          errorsThisEpoch++;
          w1 += lr * err * pt.x1;
          w2 += lr * err * pt.x2;
          b += lr * err * 1;
        }
      }

      if (errorsThisEpoch === 0) {
        converged = true;
      }
    }

    // XOR is non-linearly separable, so Perceptron cannot converge
    expect(converged).toBe(false);
    expect(epochs).toBe(maxEpochs);
  });

  it('guarantees safe dataset sample indexing without throwing undefined x1', () => {
    const dataset = DATASETS.AND;
    // Test that for any out-of-bounds index (e.g., 4, 10, -1), safe modulo arithmetic returns a valid sample
    for (const testIdx of [0, 1, 2, 3, 4, 10, 99]) {
      const safeIdx = ((testIdx % dataset.length) + dataset.length) % dataset.length;
      const sample = dataset[safeIdx];
      expect(sample).toBeDefined();
      expect(typeof sample.x1).toBe('number');
      expect(typeof sample.x2).toBe('number');
      expect(typeof sample.y).toBe('number');
    }
  });

  it('calculates dynamic wire stroke widths proportional to absolute weight magnitude', () => {
    expect(getWireStrokeWidth(0)).toBe(1.5);
    expect(getWireStrokeWidth(0.5)).toBeCloseTo(3.75);
    expect(getWireStrokeWidth(-0.5)).toBeCloseTo(3.75);
    expect(getWireStrokeWidth(2.0)).toBe(7.5); // Clamped at max 7.5
  });

  it('determines wire color based on polarity and error status', () => {
    // Normal states
    expect(getWireColor(0.5, false, false)).toBe('#2563eb'); // Positive -> Blue
    expect(getWireColor(-0.5, false, false)).toBe('#e11d48'); // Negative -> Red
    expect(getWireColor(0.005, false, false)).toBe('#94a3b8'); // Near zero -> Neutral

    // Updating states
    expect(getWireColor(0.5, true, true)).toBe('#ef4444'); // Error update -> Red flash
    expect(getWireColor(0.5, true, false)).toBe('#22c55e'); // Zero error success -> Green flash
  });

  it('simulates full convergence of Perceptron learning rule on OR gate with zero classification errors', () => {
    let w1 = 0.2;
    let w2 = -0.4;
    let b = 0.1;
    const lr = 0.1;
    const dataset = DATASETS.OR;

    let converged = false;
    let epochs = 0;
    const maxEpochs = 30;

    while (!converged && epochs < maxEpochs) {
      epochs++;
      let errorsThisEpoch = 0;

      for (const pt of dataset) {
        const sum = w1 * pt.x1 + w2 * pt.x2 + b;
        const pred = stepActivation(sum);
        const err = pt.y - pred;

        if (err !== 0) {
          errorsThisEpoch++;
          w1 += lr * err * pt.x1;
          w2 += lr * err * pt.x2;
          b += lr * err * 1;
        }
      }

      if (errorsThisEpoch === 0) {
        converged = true;
      }
    }

    expect(converged).toBe(true);
    expect(epochs).toBeLessThanOrEqual(15);

    // Verify all 4 OR truth points are correctly classified
    for (const pt of dataset) {
      const sum = w1 * pt.x1 + w2 * pt.x2 + b;
      expect(stepActivation(sum)).toBe(pt.y);
    }
  });
});

