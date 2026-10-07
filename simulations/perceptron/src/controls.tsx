import React, { useState } from 'react';
import {
  DatasetPreset,
  PerceptronConfig,
  PerceptronState,
  PerceptronStepLog,
} from './types';
import { PRESET_DATASETS } from './logic';
import { stepActivation } from './math';
import {
  Check,
  X,
  Calculator,
  Info,
  CheckCircle2,
  Database,
  Layers,
} from 'lucide-react';
import { SimulationControlsProps, SimulationInspectorProps, Slider } from '@nexora/sdk';

export const PerceptronControls: React.FC<
  SimulationControlsProps<PerceptronState, PerceptronConfig>
> = ({ config, state, onChangeConfig, onUpdateState, disabled }) => {
  const presets: {
    id: DatasetPreset;
    label: string;
    badge: string;
    description: string;
  }[] = [
    { id: 'AND', label: 'AND Gate', badge: 'Linear', description: 'Linearly separable logic gate' },
    { id: 'OR', label: 'OR Gate', badge: 'Linear', description: 'Linearly separable logic gate' },
    { id: 'XOR', label: 'XOR Gate', badge: 'Non-linear', description: 'Non-linearly separable (oscillates indefinitely)' },
    { id: 'SEPARABLE_CLUSTERS', label: '2D Clusters', badge: 'Geometric', description: 'Two separated 2D geometric sample clusters' },
  ];

  const handleSelectSample = (idx: number) => {
    if (disabled || !onUpdateState) return;
    onUpdateState((prev) => ({
      ...prev,
      currentIndex: idx,
      stage: 'idle',
      traceSum: null,
      tracePred: null,
      traceError: null,
    }));
  };

  const [w1, w2] = state.weights;
  const bias = state.bias;

  const sampleEvaluations = state.dataset.map((pt) => {
    const z = Number((w1 * pt.x1 + w2 * pt.x2 + bias).toFixed(4));
    const pred = stepActivation(z);
    const isCorrect = pred === pt.y;
    return { ...pt, z, pred, isCorrect };
  });

  const safeIndex =
    state.dataset.length > 0
      ? ((state.currentIndex % state.dataset.length) + state.dataset.length) % state.dataset.length
      : 0;

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* Dataset Selection */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-mono uppercase tracking-wider text-[10.5px] font-bold text-zinc-600 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-500" />
            <span>Dataset Problem</span>
          </label>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
            {state.dataset.length} samples
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Dataset presets">
          {presets.map((preset) => {
            const isSelected = config.datasetPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChangeConfig({ datasetPreset: preset.id });
                  if (onUpdateState) {
                    onUpdateState((prev) => ({
                      ...prev,
                      dataset: PRESET_DATASETS[preset.id as 'AND' | 'OR' | 'XOR' | 'SEPARABLE_CLUSTERS'],
                      currentIndex: 0,
                      epoch: 1,
                      errorsInEpoch: 0,
                      isConverged: false,
                      totalSteps: 0,
                      stage: 'idle',
                      traceSum: null,
                      tracePred: null,
                      traceError: null,
                    }));
                  }
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-900 text-white border-zinc-950 shadow-2xs'
                    : 'bg-zinc-50/80 hover:bg-zinc-100 text-zinc-700 border-zinc-200/80'
                }`}
                title={preset.description}
              >
                <span className="truncate">{preset.label}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-200/70 text-zinc-600'
                  }`}
                >
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Truth Table & Sample Inspector */}
      <div className="border border-zinc-200/80 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="px-3 py-2 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between text-[10.5px] font-mono text-zinc-600 font-bold">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>DATASET TRUTH TABLE</span>
          </span>
          <span>ŷ / TARGET y</span>
        </div>
        <div className="divide-y divide-zinc-100 text-xs font-mono max-h-40 overflow-y-auto">
          {sampleEvaluations.map((pt, idx) => {
            const isActive = idx === safeIndex && !state.isConverged;
            return (
              <div
                key={pt.id}
                onClick={() => handleSelectSample(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectSample(idx);
                }}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-zinc-100/90 font-bold text-zinc-950 ring-1 ring-zinc-300/80 inset-0'
                    : 'hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100 animate-pulse shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
                  )}
                  <span className="tracking-tight">
                    x₁={pt.x1}, x₂={pt.x2}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[11px]">y={pt.y}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      pt.isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                        : 'bg-rose-50 text-rose-800 border border-rose-200/70'
                    }`}
                    title={pt.isCorrect ? `Correctly classified (pred=${pt.pred})` : `Misclassified (pred=${pt.pred}, target=${pt.y})`}
                  >
                    {pt.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>ŷ={pt.pred}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Rate (eta) */}
      <Slider
        label="Learning Rate (η)"
        value={config.learningRate}
        min={0.01}
        max={1.0}
        step={0.01}
        valueDisplay={config.learningRate.toFixed(2)}
        onChange={(val) => onChangeConfig({ learningRate: val })}
        disabled={disabled}
      />

      {/* Max Epochs */}
      <Slider
        label="Max Epochs Limit"
        value={config.maxEpochs}
        min={5}
        max={50}
        step={5}
        valueDisplay={config.maxEpochs}
        onChange={(val) => onChangeConfig({ maxEpochs: val })}
        disabled={disabled}
      />
    </div>
  );
};

export const PerceptronStateInspector: React.FC<
  SimulationInspectorProps<PerceptronState, PerceptronConfig, PerceptronStepLog>
> = ({ state }) => {
  const [traceMode, setTraceMode] = useState<'focused' | 'full'>('focused');
  const [w1, w2] = state.weights;
  const bias = state.bias;

  const safeIndex =
    state.dataset.length > 0
      ? ((state.currentIndex % state.dataset.length) + state.dataset.length) % state.dataset.length
      : 0;
  const activePoint = state.dataset[safeIndex] ?? state.dataset[0];

  const currentWeightedSum =
    state.traceSum ?? (activePoint ? Number((w1 * activePoint.x1 + w2 * activePoint.x2 + bias).toFixed(4)) : 0);
  const currentPrediction = state.tracePred ?? stepActivation(currentWeightedSum);
  const currentError = state.traceError ?? (activePoint ? activePoint.y - currentPrediction : 0);

  return (
    <div className="flex flex-col gap-3.5 text-xs font-mono">
      {/* Current Learned Parameters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80 text-center">
          <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider font-semibold">
            w₁
          </span>
          <span className="text-zinc-950 font-bold text-sm block mt-0.5">
            {w1.toFixed(2)}
          </span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">
            {w1 >= 0 ? '+ pos' : '− neg'}
          </span>
        </div>
        <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80 text-center">
          <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider font-semibold">
            w₂
          </span>
          <span className="text-zinc-950 font-bold text-sm block mt-0.5">
            {w2.toFixed(2)}
          </span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">
            {w2 >= 0 ? '+ pos' : '− neg'}
          </span>
        </div>
        <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-200/80 text-center">
          <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider font-semibold">
            Bias (b)
          </span>
          <span className="text-zinc-950 font-bold text-sm block mt-0.5">
            {bias.toFixed(2)}
          </span>
          <span className="text-[9px] text-zinc-400 block mt-0.5">
            {bias >= 0 ? '+ pos' : '− neg'}
          </span>
        </div>
      </div>

      {/* Epoch & Errors Telemetry */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-50/80 px-3 py-2 rounded-xl border border-zinc-200/80 flex justify-between items-center">
          <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Epoch</span>
          <span className="text-zinc-950 font-bold font-mono text-sm">{state.epoch}</span>
        </div>
        <div className="bg-zinc-50/80 px-3 py-2 rounded-xl border border-zinc-200/80 flex justify-between items-center">
          <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Errors</span>
          <span
            className={`font-bold font-mono text-sm ${
              state.errorsInEpoch === 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {state.errorsInEpoch === 0 ? '0 (Clean)' : state.errorsInEpoch}
          </span>
        </div>
      </div>

      {/* Math Derivation Trace Section */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-3 py-2 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
          <span className="font-bold text-zinc-700 text-[10.5px] font-mono flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-zinc-600" />
            <span>STEP-BY-STEP TRACE</span>
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-zinc-200/70 p-0.5 rounded-md text-[9px] font-sans font-semibold">
              <button
                type="button"
                onClick={() => setTraceMode('focused')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  traceMode === 'focused' ? 'bg-white text-zinc-950 font-bold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Focused
              </button>
              <button
                type="button"
                onClick={() => setTraceMode('full')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                  traceMode === 'full' ? 'bg-white text-zinc-950 font-bold shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Full
              </button>
            </div>
            <span className="text-[9px] font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300 uppercase tracking-wider">
              {state.stage}
            </span>
          </div>
        </div>

        <div className="p-3 space-y-2.5 text-[11px]">
          {activePoint ? (
            traceMode === 'focused' ? (
              state.stage === 'idle' ? (
                <div className="space-y-1.5 text-zinc-600 font-sans">
                  <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ready for Step Execution</span>
                  </div>
                  <p className="text-[11px] leading-snug font-mono text-zinc-500">
                    Sample #{safeIndex + 1}: x₁={activePoint.x1}, x₂={activePoint.x2} → Target y={activePoint.y}
                  </p>
                </div>
              ) : state.stage === 'select' || state.stage === 'feed' ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-zinc-900 uppercase">[1. Input Feed]</div>
                  <div className="font-mono text-zinc-800">x₁={activePoint.x1}, x₂={activePoint.x2}, bias input=1</div>
                  <div className="text-zinc-500 text-[10px] font-sans">Propagating feature inputs across synaptic connections</div>
                </div>
              ) : state.stage === 'summate' ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-zinc-900 uppercase">[2. Linear Summation Σ]</div>
                  <div className="text-zinc-700 font-mono">
                    z = ({w1.toFixed(2)} · {activePoint.x1}) + ({w2.toFixed(2)} · {activePoint.x2}) + ({bias.toFixed(2)})
                  </div>
                  <div className="font-bold font-mono text-zinc-950">
                    z = {currentWeightedSum.toFixed(3)}
                  </div>
                </div>
              ) : state.stage === 'activate' ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-zinc-900 uppercase">[3. Heaviside Step Activation]</div>
                  <div className="text-zinc-700 font-mono">
                    z = {currentWeightedSum.toFixed(3)} {currentWeightedSum >= 0 ? '≥ 0 ⇒ ŷ = 1' : '< 0 ⇒ ŷ = 0'}
                  </div>
                  <div className="font-bold font-mono text-zinc-950 flex items-center gap-1">
                    <span>Prediction ŷ = {currentPrediction}</span>
                  </div>
                </div>
              ) : state.stage === 'evaluate' ? (
                <div className="space-y-1">
                  <div className={`text-[10px] font-mono font-bold uppercase ${currentError === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    [4. Target Evaluation]
                  </div>
                  <div className="font-mono text-zinc-700">
                    Target y = {activePoint.y}, Prediction ŷ = {currentPrediction}
                  </div>
                  <div className={`font-bold font-mono ${currentError === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    Error e = (y − ŷ) = {currentError}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold text-zinc-900 uppercase">[5. Weight Update Delta]</div>
                  {currentError !== 0 ? (
                    <div className="space-y-1 font-mono text-zinc-800">
                      <div className="text-rose-700 font-semibold">
                        Δw₁={state.traceDeltaW1.toFixed(3)}, Δw₂={state.traceDeltaW2.toFixed(3)}, Δb={state.traceDeltaB.toFixed(3)}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>w₁ → {(w1 + state.traceDeltaW1).toFixed(2)}</span>
                        <span>•</span>
                        <span>w₂ → {(w2 + state.traceDeltaW2).toFixed(2)}</span>
                        <span>•</span>
                        <span>b → {(bias + state.traceDeltaB).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zero Error (y = ŷ) • Weights Preserved</span>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-2 font-mono">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">[1. Summation]</span>
                  <div className="text-zinc-800">z = {currentWeightedSum.toFixed(3)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">[2. Prediction & Error]</span>
                  <div className="text-zinc-800">ŷ = {currentPrediction} (Target: {activePoint.y}, Error: {currentError})</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">[3. Weights Delta]</span>
                  {currentError !== 0 ? (
                    <div className="text-rose-700 font-medium">
                      Δw₁={state.traceDeltaW1.toFixed(3)}, Δw₂={state.traceDeltaW2.toFixed(3)}, Δb={state.traceDeltaB.toFixed(3)}
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Zero Error
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="text-zinc-400 font-mono">No active data points</div>
          )}
        </div>
      </div>
    </div>
  );
};
