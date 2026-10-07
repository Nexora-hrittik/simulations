import React, { useState, useRef } from 'react';
import { SimulationVisualizationProps } from '@nexora/sdk';
import { PerceptronConfig, PerceptronState, PerceptronStepLog, DataPoint } from './types';
import {
  calculateDecisionBoundary,
  getWireColor,
  getWireStrokeWidth,
  stepActivation,
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

  return (
    <div className="w-full flex flex-col gap-3 font-sans">
      {/* Visualizer Mode Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
          <Brain className="w-4 h-4 text-blue-600" />
          <span>PERCEPTRON ARCHITECTURE LABORATORY</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'split'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dual View
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'network'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Network
          </button>
          <button
            onClick={() => setActiveTab('space')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'space'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2D Boundary
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Section 1: Neural Network Signal Diagram */}
        {(activeTab === 'split' || activeTab === 'network') && (
          <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="h-7 px-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] select-none font-mono">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                NEURAL SYNAPSE MECHANISM
              </span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400">Stage:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase">
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
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
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
                  stroke="#334155"
                  strokeWidth="3"
                  markerEnd="url(#wire-arrow)"
                />

                {/* Wire to Output Node */}
                <line
                  x1="676"
                  y1="170"
                  x2="768"
                  y2="170"
                  stroke="#334155"
                  strokeWidth="3"
                  markerEnd="url(#wire-arrow)"
                />

                {/* Weight Labels */}
                <g transform="translate(240, 100)">
                  <rect x="-35" y="-12" width="70" height="24" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-800">
                    w₁={w1.toFixed(2)}
                  </text>
                </g>
                <g transform="translate(250, 155)">
                  <rect x="-35" y="-12" width="70" height="24" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-800">
                    w₂={w2.toFixed(2)}
                  </text>
                </g>
                <g transform="translate(240, 240)">
                  <rect x="-35" y="-12" width="70" height="24" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-800">
                    b={bias.toFixed(2)}
                  </text>
                </g>

                {/* Input Nodes */}
                <g>
                  <circle
                    cx="110"
                    cy="60"
                    r="26"
                    fill={state.stage === 'feed' ? '#dbeafe' : '#ffffff'}
                    stroke={state.stage === 'feed' ? '#2563eb' : '#64748b'}
                    strokeWidth="2.5"
                  />
                  <text x="110" y="53" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">x₁</text>
                  <text x="110" y="71" textAnchor="middle" className="text-[14px] font-mono font-black fill-slate-900">{activePoint.x1}</text>
                </g>

                <g>
                  <circle
                    cx="110"
                    cy="170"
                    r="26"
                    fill={state.stage === 'feed' ? '#dbeafe' : '#ffffff'}
                    stroke={state.stage === 'feed' ? '#2563eb' : '#64748b'}
                    strokeWidth="2.5"
                  />
                  <text x="110" y="163" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">x₂</text>
                  <text x="110" y="181" textAnchor="middle" className="text-[14px] font-mono font-black fill-slate-900">{activePoint.x2}</text>
                </g>

                <g>
                  <circle
                    cx="110"
                    cy="280"
                    r="26"
                    fill={state.stage === 'feed' ? '#dbeafe' : '#ffffff'}
                    stroke={state.stage === 'feed' ? '#2563eb' : '#64748b'}
                    strokeWidth="2.5"
                  />
                  <text x="110" y="273" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">bias</text>
                  <text x="110" y="291" textAnchor="middle" className="text-[14px] font-mono font-black fill-slate-900">1</text>
                </g>

                {/* Summation Node */}
                <g>
                  <circle
                    cx="445"
                    cy="170"
                    r="38"
                    fill={state.stage === 'summate' ? '#dbeafe' : '#f8fafc'}
                    stroke={state.stage === 'summate' ? '#2563eb' : '#334155'}
                    strokeWidth="3"
                  />
                  <text x="445" y="162" textAnchor="middle" className="text-[20px] font-bold fill-slate-800">Σ</text>
                  <text x="445" y="185" textAnchor="middle" className="text-[11px] font-mono font-bold fill-blue-700">
                    {currentWeightedSum.toFixed(2)}
                  </text>
                </g>

                {/* Activation Node */}
                <g>
                  <circle
                    cx="640"
                    cy="170"
                    r="36"
                    fill={state.stage === 'activate' ? '#dbeafe' : '#f8fafc'}
                    stroke={state.stage === 'activate' ? '#2563eb' : '#334155'}
                    strokeWidth="3"
                  />
                  <text x="640" y="158" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">f(Σ) ≥ 0</text>
                  <path d="M 627 182 L 640 182 L 640 170 L 653 170" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                </g>

                {/* Output Prediction Node */}
                <g>
                  <circle
                    cx="800"
                    cy="170"
                    r="32"
                    fill={
                      state.stage === 'evaluate' || state.stage === 'update'
                        ? currentError === 0 ? '#dcfce7' : '#fee2e2'
                        : '#ffffff'
                    }
                    stroke={
                      state.stage === 'evaluate' || state.stage === 'update'
                        ? currentError === 0 ? '#16a34a' : '#dc2626'
                        : '#334155'
                    }
                    strokeWidth="3"
                  />
                  <text x="800" y="161" textAnchor="middle" className="text-[10px] font-bold fill-slate-500">ŷ (Pred)</text>
                  <text x="800" y="183" textAnchor="middle" className="text-[18px] font-mono font-black fill-slate-900">
                    {currentPrediction}
                  </text>
                </g>

                {/* Target Comparison Badge */}
                <g transform="translate(800, 235)">
                  <rect x="-50" y="-13" width="100" height="26" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  <text x="0" y="4" textAnchor="middle" className="text-[10.5px] font-mono font-bold fill-slate-700">
                    Target y = {activePoint.y}
                  </text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* Section 2: 2D Cartesian Decision Boundary Plane */}
        {(activeTab === 'split' || activeTab === 'space') && (
          <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col">
            <div className="h-7 px-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] select-none font-mono">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                DECISION BOUNDARY SPACE (2D)
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> +1
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-600">
                  <span className="w-2 h-2 rounded-xs bg-rose-600 inline-block" /> 0
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center p-3 relative">
              <div className="relative w-full max-w-[340px] aspect-square bg-slate-50/70 rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
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
                        stroke={val === 0 ? '#64748b' : '#e2e8f0'}
                        strokeWidth={val === 0 ? 1.5 : 1}
                        strokeDasharray={val === 0 ? undefined : '3 3'}
                      />
                      <line
                        x1={padding}
                        y1={toSvgY(val)}
                        x2={viewSize - padding}
                        y2={toSvgY(val)}
                        stroke={val === 0 ? '#64748b' : '#e2e8f0'}
                        strokeWidth={val === 0 ? 1.5 : 1}
                        strokeDasharray={val === 0 ? undefined : '3 3'}
                      />
                      {val !== 0 && (
                        <>
                          <text
                            x={toSvgX(val)}
                            y={toSvgY(0) + 12}
                            textAnchor="middle"
                            className="text-[9px] font-mono fill-slate-500 font-semibold"
                          >
                            {val}
                          </text>
                          <text
                            x={toSvgX(0) - 7}
                            y={toSvgY(val)}
                            dominantBaseline="middle"
                            textAnchor="end"
                            className="text-[9px] font-mono fill-slate-500 font-semibold"
                          >
                            {val}
                          </text>
                        </>
                      )}
                    </React.Fragment>
                  ))}

                  <text
                    x={toSvgX(0) - 6}
                    y={toSvgY(0) + 12}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-400 font-bold"
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
                        stroke="#0284c7"
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
                            rx="3.5"
                            fill="#e11d48"
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
                          className="text-[10px] font-mono font-black fill-white pointer-events-none select-none"
                        >
                          {isPositive ? '+' : '−'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {state.dataset.some((p) => p.id.startsWith('custom')) && (
                  <button
                    onClick={() => onUpdateState((prev) => clearCustomPoints(prev))}
                    className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 hover:bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-1 rounded-lg font-bold shadow-2xs backdrop-blur-xs cursor-pointer"
                    title="Clear custom points"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Points
                  </button>
                )}
              </div>
            </div>

            <div className="shrink-0 px-3 py-1 bg-slate-50 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MousePointer className="w-3 h-3 text-blue-600" />
                Click to add: Left = +1 &bull; Right = 0
              </span>
              <span className="text-blue-700 font-bold">
                {w1.toFixed(2)}x₁ + {w2.toFixed(2)}x₂ + {bias.toFixed(2)} = 0
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Status Footer */}
      <div className="w-full flex items-center justify-between text-xs font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-500">Epoch:</span>
          <span className="text-slate-900 font-bold">{state.epoch}</span>
          <span className="text-slate-400">•</span>
          <span className="font-medium text-slate-500">Errors:</span>
          <span className={state.errorsInEpoch > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
            {state.errorsInEpoch}
          </span>
        </div>
        <div>
          {state.isConverged ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Separated
            </span>
          ) : (
            <span className="text-blue-700 font-bold">
              {w1.toFixed(2)}x₁ + {w2.toFixed(2)}x₂ + {bias.toFixed(2)} = 0
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
