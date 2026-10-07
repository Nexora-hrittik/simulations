export interface LineCoordinates {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Computes the 2D Decision Boundary line coordinates for:
 *   w1 * x1 + w2 * x2 + b = 0
 *
 * Derivation:
 *   - General Case (w2 ≠ 0):
 *       Solve for x2:  x2 = (-w1 * x1 - b) / w2
 *       Evaluate across the graph's visible domain [xMin, xMax].
 *
 *   - Edge Case (w2 = 0, w1 ≠ 0):
 *       Vertical line: w1 * x1 + b = 0  =>  x1 = -b / w1
 *       Spans the vertical domain [yMin, yMax].
 *
 *   - Degenerate Case (w1 = 0 AND w2 = 0):
 *       Undefined hyperplane (no separating line exists).
 */
export function calculateDecisionBoundary(
  w1: number,
  w2: number,
  b: number,
  xMin = -1.5,
  xMax = 1.5,
  yMin = -1.5,
  yMax = 1.5
): LineCoordinates | null {
  const EPSILON = 1e-5;

  // Degenerate case: both weights zero
  if (Math.abs(w1) < EPSILON && Math.abs(w2) < EPSILON) {
    return null;
  }

  // Edge Case: w2 is zero -> vertical line x = -b / w1
  if (Math.abs(w2) < EPSILON) {
    const verticalX = -b / w1;
    return {
      x1: verticalX,
      y1: yMin,
      x2: verticalX,
      y2: yMax,
    };
  }

  // General Case: solve for y at domain boundaries
  const yStart = (-w1 * xMin - b) / w2;
  const yEnd = (-w1 * xMax - b) / w2;

  return {
    x1: xMin,
    y1: yStart,
    x2: xMax,
    y2: yEnd,
  };
}

/**
 * Heaviside step activation function:
 *   ŷ = 1  if Σ ≥ 0
 *   ŷ = 0  if Σ < 0
 */
export function stepActivation(sum: number): 0 | 1 {
  return sum >= 0 ? 1 : 0;
}

/**
 * Dynamic wire stroke thickness based on absolute weight magnitude:
 * Clamped between 1.5px and 7.5px.
 */
export function getWireStrokeWidth(weight: number): number {
  return Math.min(7.5, Math.max(1.5, 1.5 + Math.abs(weight) * 4.5));
}

/**
 * Dynamic wire color based on weight polarity:
 * - Positive (> 0): Blue (#2563eb)
 * - Negative (< 0): Red (#e11d48)
 * - Near-zero: Neutral Slate (#94a3b8)
 */
export function getWireColor(
  weight: number,
  isUpdating: boolean,
  hasError: boolean
): string {
  if (isUpdating) {
    return hasError ? '#ef4444' : '#22c55e';
  }
  if (Math.abs(weight) < 0.02) {
    return '#94a3b8';
  }
  return weight > 0 ? '#2563eb' : '#e11d48';
}

/**
 * Formats the linear decision boundary equation w1*x1 + w2*x2 + b = 0 into mathematically sound,
 * human-readable notation with correct signs (e.g. "0.20x₁ − 0.40x₂ + 0.10 = 0").
 */
export function formatHyperplaneEquation(w1: number, w2: number, b: number): string {
  const EPSILON = 1e-4;
  if (Math.abs(w1) < EPSILON && Math.abs(w2) < EPSILON) {
    return '0 = 0';
  }

  const formatNum = (val: number) => Math.abs(val).toFixed(2);
  let result = '';

  // x1 term
  if (Math.abs(w1) >= EPSILON) {
    result += w1 < 0 ? `−${formatNum(w1)}x₁` : `${formatNum(w1)}x₁`;
  }

  // x2 term
  if (Math.abs(w2) >= EPSILON) {
    if (result.length > 0) {
      result += w2 < 0 ? ` − ${formatNum(w2)}x₂` : ` + ${formatNum(w2)}x₂`;
    } else {
      result += w2 < 0 ? `−${formatNum(w2)}x₂` : `${formatNum(w2)}x₂`;
    }
  }

  // bias term
  if (Math.abs(b) >= EPSILON) {
    if (result.length > 0) {
      result += b < 0 ? ` − ${formatNum(b)}` : ` + ${formatNum(b)}`;
    } else {
      result += b < 0 ? `−${formatNum(b)}` : `${formatNum(b)}`;
    }
  }

  return `${result} = 0`;
}
