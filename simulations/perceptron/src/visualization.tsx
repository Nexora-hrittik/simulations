import React, { useState, useRef } from 'react';
import { SimulationVisualizationProps } from '@nexora/sdk';
import { PerceptronConfig, PerceptronState, PerceptronStepLog, DataPoint } from './types';
import {
  calculateDecisionBoundary,
  getWireColor,
  getWireStrokeWidth,
  stepActivation,
  formatHyperplaneEquation,
} from './math';
import { addPointToDataset, clearCustomPoints } from './logic';
import {
  Sparkles,
  MousePointer,
  Trash2,
  CheckCircle2,
  Brain,
  Layers,
} from 'lucide-react';

export const PerceptronVisualization: React.FC<
  SimulationVisualizationProps<PerceptronState, PerceptronConfig, PerceptronStepLog>
> = ({ state, onUpdateState }) => {
  const [activeTab, setActiveTab] = useState<'split' | 'network' | 'space'>('split');
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [w1, w2] = state.weights;
  const bias = state.bias;

  const safeIndex =
    state.dataset.length > 0
      ? ((state.currentIndex % state.dataset.length) + state.dataset.length) % state.dataset.length
      : 0;
  const activePoint: DataPoint =
    state.dataset[safeIndex] ?? { id: 'fallback', x1: 0, x2: 0, y: 0, label: -1 };

  // Derived math values
  const currentWeightedSum =
    state.traceSum ?? Number((w1 * activePoint.x1 + w2 * activePoint.x2 + bias).toFixed(4));
  const currentPrediction = state.tracePred ?? stepActivation(currentWeightedSum);
  const currentError = state.traceError ?? (activePoint.y - currentPrediction);

  // 2D Canvas coordinate mapping
  const viewSize = 340;
  const padding = 36;
  const domainMin = -1.5;
  const domainMax = 1.5;

  const toSvgX = (x: number) =>
    padding + ((x - domainMin) / (domainMax - domainMin)) * (viewSize - 2 * padding);

  const toSvgY = (y: number) =>
    viewSize - padding - ((y - domainMin) / (domainMax - domainMin)) * (viewSize - 2 * padding);

  const handleCanvasInteraction = (
    e: React.MouseEvent<SVGSVGElement>,
    forcedLabel?: number
  ) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;

    const svgX = (pixelX / rect.width) * viewSize;
    const svgY = (pixelY / rect.height) * viewSize;

    if (
      svgX < padding ||
      svgX > viewSize - padding ||
      svgY < padding ||
      svgY > viewSize - padding
    ) {
      return;
    }

    const cartX1 = Number(
      (domainMin + ((svgX - padding) / (viewSize - 2 * padding)) * (domainMax - domainMin)).toFixed(2)
    );
    const cartX2 = Number(
      (domainMax - ((svgY - padding) / (viewSize - 2 * padding)) * (domainMax - domainMin)).toFixed(2)
    );

    const targetLabel = forcedLabel !== undefined ? forcedLabel : e.button === 2 ? 0 : 1;

    onUpdateState((prev) => addPointToDataset(prev, cartX1, cartX2, targetLabel));
  };

  const boundaryLine = calculateDecisionBoundary(w1, w2, bias);
  const formattedEq = formatHyperplaneEquation(w1, w2, bias);

  return (
    <div className="w-full flex flex-col gap-3 font-sans">
      {/* Visualizer Mode Switcher Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2 px-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-800">
          <Brain className="w-4 h-4 text-zinc-900" />
          <span className="tracking-wider">PERCEPTRON ARCHITECTURE LABORATORY</span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'split'
                ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'network'
                ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Synaptic Network
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('space')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'space'
                ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            2D Decision Space
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Section 1: Neural Network Signal Diagram */}
        {(activeTab === 'split' || activeTab === 'network') && (
          <div className="w-full bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-2xs flex flex-col">
            <div className="h-8 px-3.5 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between text-[11px] select-none font-mono">
              <span className="text-zinc-700 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-600" />
                NEURAL SYNAPSE MECHANISM
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-zinc-400 uppercase font-mono tracking-wider">Stage:</span>
                <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300 uppercase tracking-wider">
                  {state.stage}
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center p-2 min-h-[190px] max-h-[260px]">
              <svg
                viewBox="0 0 880 340"
                className="w-full h-full object-contain select-none max-h-[240px]"
                aria-label="Perceptron neural network node and synaptic wire diagram"
              >
                <defs>
                  <marker
                    id="wire-arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#71717a" />
                  </marker>
                </defs>

                {/* Synaptic Wires */}
                <line
                  x1="138"
                  y1="60"
                  x2="410"
                  y2="170"
                  stroke={getWireColor(w1, state.stage === 'update', currentError !== 0)}
                  strokeWidth={getWireStrokeWidth(w1)}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
                <line
                  x1="138"
                  y1="170"
                  x2="410"
                  y2="170"
                  stroke={getWireColor(w2, state.stage === 'update', currentError !== 0)}
                  strokeWidth={getWireStrokeWidth(w2)}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
                <line
                  x1="138"
                  y1="280"
                  x2="410"
                  y2="170"
                  stroke={getWireColor(bias, state.stage === 'update', currentError !== 0)}
                  strokeWidth={getWireStrokeWidth(bias)}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />

                {/* Wire to Activation Node */}
                <line
                  x1="483"
                  y1="170"
                  x2="604"
                  y2="170"
                  stroke="#27272a"
                  strokeWidth="2.5"
                  markerEnd="url(#wire-arrow)"
                />

                {/* Wire to Output Node */}
                <line
                  x1="676"
                  y1="170"
                  x2="768"
                  y2="170"
                  stroke="#27272a"
                  strokeWidth="2.5"
                  markerEnd="url(#wire-arrow)"
                />

                {/* Weight Labels */}
                <g transform="translate(240, 95)">
                  <rect x="-42" y="-12" width="84" height="24" rx="6" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="11"
                    fontWeight="700"
                    fill="#18181b"
                  >
                    w₁ = {w1.toFixed(2)}
                  </text>
                </g>
                <g transform="translate(250, 155)">
                  <rect x="-42" y="-12" width="84" height="24" rx="6" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="11"
                    fontWeight="700"
                    fill="#18181b"
                  >
                    w₂ = {w2.toFixed(2)}
                  </text>
                </g>
                <g transform="translate(240, 245)">
                  <rect x="-42" y="-12" width="84" height="24" rx="6" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="11"
                    fontWeight="700"
                    fill="#18181b"
                  >
                    b = {bias.toFixed(2)}
                  </text>
                </g>

                {/* Input Nodes */}
                <g>
                  <circle
                    cx="110"
                    cy="60"
                    r="26"
                    fill={state.stage === 'feed' || state.stage === 'select' ? '#f4f4f5' : '#ffffff'}
                    stroke={state.stage === 'feed' || state.stage === 'select' ? '#18181b' : '#a1a1aa'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="110"
                    y="51"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="10"
                    fontWeight="700"
                    fill="#71717a"
                  >
                    x₁
                  </text>
                  <text
                    x="110"
                    y="69"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="15"
                    fontWeight="800"
                    fill="#09090b"
                  >
                    {activePoint.x1}
                  </text>
                </g>

                <g>
                  <circle
                    cx="110"
                    cy="170"
                    r="26"
                    fill={state.stage === 'feed' || state.stage === 'select' ? '#f4f4f5' : '#ffffff'}
                    stroke={state.stage === 'feed' || state.stage === 'select' ? '#18181b' : '#a1a1aa'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="110"
                    y="161"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="10"
                    fontWeight="700"
                    fill="#71717a"
                  >
                    x₂
                  </text>
                  <text
                    x="110"
                    y="179"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="15"
                    fontWeight="800"
                    fill="#09090b"
                  >
                    {activePoint.x2}
                  </text>
                </g>

                <g>
                  <circle
                    cx="110"
                    cy="280"
                    r="26"
                    fill={state.stage === 'feed' || state.stage === 'select' ? '#f4f4f5' : '#ffffff'}
                    stroke={state.stage === 'feed' || state.stage === 'select' ? '#18181b' : '#a1a1aa'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="110"
                    y="271"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="10"
                    fontWeight="700"
                    fill="#71717a"
                  >
                    bias
                  </text>
                  <text
                    x="110"
                    y="289"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="15"
                    fontWeight="800"
                    fill="#09090b"
                  >
                    1
                  </text>
                </g>

                {/* Summation Node */}
                <g>
                  <circle
                    cx="445"
                    cy="170"
                    r="38"
                    fill={state.stage === 'summate' ? '#fafafa' : '#ffffff'}
                    stroke={state.stage === 'summate' ? '#18181b' : '#27272a'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="445"
                    y="156"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-display, Georgia, serif)"
                    fontSize="26"
                    fontWeight="700"
                    fill="#09090b"
                  >
                    ∑
                  </text>
                  <text
                    x="445"
                    y="184"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="12"
                    fontWeight="700"
                    fill="#0284c7"
                  >
                    z = {currentWeightedSum.toFixed(2)}
                  </text>
                </g>

                {/* Activation Node */}
                <g>
                  <circle
                    cx="640"
                    cy="170"
                    r="36"
                    fill={state.stage === 'activate' ? '#fafafa' : '#ffffff'}
                    stroke={state.stage === 'activate' ? '#18181b' : '#27272a'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="640"
                    y="152"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="#71717a"
                  >
                    f(z) ≥ 0
                  </text>
                  <path
                    d="M 627 182 L 640 182 L 640 168 L 653 168"
                    fill="none"
                    stroke="#09090b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Output Prediction Node */}
                <g>
                  <circle
                    cx="800"
                    cy="170"
                    r="32"
                    fill={
                      state.stage === 'evaluate' || state.stage === 'update'
                        ? currentError === 0
                          ? '#ecfdf5'
                          : '#fff1f2'
                        : '#ffffff'
                    }
                    stroke={
                      state.stage === 'evaluate' || state.stage === 'update'
                        ? currentError === 0
                          ? '#059669'
                          : '#e11d48'
                        : '#27272a'
                    }
                    strokeWidth="2.5"
                  />
                  <text
                    x="800"
                    y="155"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="10"
                    fontWeight="700"
                    fill="#71717a"
                  >
                    ŷ (Pred)
                  </text>
                  <text
                    x="800"
                    y="179"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="18"
                    fontWeight="800"
                    fill="#09090b"
                  >
                    {currentPrediction}
                  </text>
                </g>

                {/* Target Comparison Badge */}
                <g transform="translate(800, 235)">
                  <rect x="-56" y="-13" width="112" height="26" rx="6" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="11"
                    fontWeight="700"
                    fill="#27272a"
                  >
                    Target y = {activePoint.y}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* Section 2: 2D Cartesian Decision Boundary Plane */}
        {(activeTab === 'split' || activeTab === 'space') && (
          <div className="w-full bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-2xs flex flex-col">
            <div className="h-8 px-3.5 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between text-[11px] select-none font-mono">
              <span className="text-zinc-700 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                DECISION BOUNDARY SPACE (2D)
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> +1 (Positive)
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
                  <span className="w-2.5 h-2.5 rounded-xs bg-zinc-900 inline-block" /> 0 (Negative)
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center p-3 relative">
              <div className="relative w-full max-w-[340px] aspect-square bg-zinc-50/70 rounded-xl border border-zinc-200/80 overflow-hidden shadow-2xs">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${viewSize} ${viewSize}`}
                  className="w-full h-full select-none cursor-crosshair"
                  onClick={(e) => handleCanvasInteraction(e, 1)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCanvasInteraction(e, 0);
                  }}
                  aria-label="Direct manipulation Cartesian plane. Click to add point."
                >
                  <defs>
                    <clipPath id="plot-clip-frame">
                      <rect
                        x={padding}
                        y={padding}
                        width={viewSize - 2 * padding}
                        height={viewSize - 2 * padding}
                        rx="4"
                      />
                    </clipPath>
                  </defs>

                  {/* Grid Lines */}
                  {[-1, -0.5, 0, 0.5, 1].map((val) => (
                    <React.Fragment key={`grid-${val}`}>
                      <line
                        x1={toSvgX(val)}
                        y1={padding}
                        x2={toSvgX(val)}
                        y2={viewSize - padding}
                        stroke={val === 0 ? '#71717a' : '#e4e4e7'}
                        strokeWidth={val === 0 ? 1.5 : 1}
                        strokeDasharray={val === 0 ? undefined : '3 3'}
                      />
                      <line
                        x1={padding}
                        y1={toSvgY(val)}
                        x2={viewSize - padding}
                        y2={toSvgY(val)}
                        stroke={val === 0 ? '#71717a' : '#e4e4e7'}
                        strokeWidth={val === 0 ? 1.5 : 1}
                        strokeDasharray={val === 0 ? undefined : '3 3'}
                      />
                      {val !== 0 && (
                        <>
                          <text
                            x={toSvgX(val)}
                            y={toSvgY(0) + 14}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontFamily="var(--font-mono, monospace)"
                            fontSize="9"
                            fontWeight="600"
                            fill="#71717a"
                          >
                            {val}
                          </text>
                          <text
                            x={toSvgX(0) - 8}
                            y={toSvgY(val)}
                            textAnchor="end"
                            dominantBaseline="central"
                            fontFamily="var(--font-mono, monospace)"
                            fontSize="9"
                            fontWeight="600"
                            fill="#71717a"
                          >
                            {val}
                          </text>
                        </>
                      )}
                    </React.Fragment>
                  ))}

                  <text
                    x={toSvgX(0) - 7}
                    y={toSvgY(0) + 12}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono, monospace)"
                    fontSize="9"
                    fontWeight="700"
                    fill="#a1a1aa"
                  >
                    0
                  </text>

                  {/* Decision Boundary Line */}
                  {boundaryLine && (
                    <g clipPath="url(#plot-clip-frame)">
                      <line
                        x1={toSvgX(boundaryLine.x1)}
                        y1={toSvgY(boundaryLine.y1)}
                        x2={toSvgX(boundaryLine.x2)}
                        y2={toSvgY(boundaryLine.y2)}
                        stroke="#2563eb"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="transition-all duration-150"
                      />
                    </g>
                  )}

                  {/* Points */}
                  {state.dataset.map((pt, idx) => {
                    const isThisActive = idx === safeIndex && !state.isConverged;
                    const isPositive = pt.y === 1;

                    return (
                      <g key={pt.id} className="transition-all duration-150">
                        {isThisActive && (
                          <circle
                            cx={toSvgX(pt.x1)}
                            cy={toSvgY(pt.x2)}
                            r="18"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                            className="animate-spin origin-center"
                            style={{
                              transformOrigin: `${toSvgX(pt.x1)}px ${toSvgY(pt.x2)}px`,
                            }}
                          />
                        )}

                        {isPositive ? (
                          <circle
                            cx={toSvgX(pt.x1)}
                            cy={toSvgY(pt.x2)}
                            r="9"
                            fill="#2563eb"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="shadow-sm"
                          />
                        ) : (
                          <rect
                            x={toSvgX(pt.x1) - 8}
                            y={toSvgY(pt.x2) - 8}
                            width="16"
                            height="16"
                            rx="4"
                            fill="#18181b"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="shadow-sm"
                          />
                        )}

                        <text
                          x={toSvgX(pt.x1)}
                          y={toSvgY(pt.x2)}
                          dominantBaseline="central"
                          textAnchor="middle"
                          fontFamily="var(--font-mono, monospace)"
                          fontSize={isPositive ? "12" : "10"}
                          fontWeight="700"
                          fill="#ffffff"
                          className="pointer-events-none select-none"
                        >
                          {isPositive ? '+' : '0'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {state.dataset.some((p) => p.id.startsWith('custom')) && (
                  <button
                    type="button"
                    onClick={() => onUpdateState((prev) => clearCustomPoints(prev))}
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white/95 hover:bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono px-2 py-1 rounded-lg font-bold shadow-2xs backdrop-blur-xs cursor-pointer transition-colors"
                    title="Clear custom points"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Points
                  </button>
                )}
              </div>
            </div>

            <div className="shrink-0 px-3.5 py-1.5 bg-zinc-50/80 border-t border-zinc-200/80 text-[10.5px] font-mono text-zinc-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-zinc-600" />
                Click to add: Left = +1 &bull; Right = 0
              </span>
              <span className="text-zinc-900 font-bold font-mono">
                {formattedEq}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Status Footer */}
      <div className="w-full flex items-center justify-between text-xs font-mono bg-white p-3 rounded-xl border border-zinc-200/80 text-zinc-600 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-zinc-500">Epoch:</span>
          <span className="text-zinc-950 font-bold">{state.epoch}</span>
          <span className="text-zinc-300">•</span>
          <span className="font-medium text-zinc-500">Errors:</span>
          <span className={state.errorsInEpoch > 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
            {state.errorsInEpoch}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="font-medium text-zinc-500">Accuracy:</span>
          <span className="text-zinc-950 font-bold">
            {state.dataset.length > 0
              ? `${Math.round(((state.dataset.length - state.errorsInEpoch) / state.dataset.length) * 100)}%`
              : '100%'}
          </span>
        </div>
        <div>
          {state.isConverged ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Linearly Separated
            </span>
          ) : (
            <span className="text-zinc-800 font-bold font-mono bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200/80">
              {formattedEq}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

