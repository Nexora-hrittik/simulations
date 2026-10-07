import React, { useState } from 'react';
import {
  DatasetPreset,
  PerceptronConfig,
  PerceptronState,
  PerceptronStepLog,
} from './types';
import { PRESET_DATASETS } from './logic';
import { stepActivation } from './math';
import { Check, X, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { SimulationControlsProps, SimulationInspectorProps, Slider } from '@rec-labs/sdk';

export const PerceptronControls: React.FC<
  SimulationControlsProps<PerceptronState, PerceptronConfig>
> = ({ config, state, onChangeConfig, onUpdateState, disabled }) => {
  const presets: { id: DatasetPreset; label: string; description: string }[] = [
    { id: 'AND', label: 'AND Gate', description: 'Linearly separable' },
    { id: 'OR', label: 'OR Gate', description: 'Linearly separable' },
    { id: 'XOR', label: 'XOR Gate', description: 'Non-linearly separable (oscillates)' },
    { id: 'SEPARABLE_CLUSTERS', label: '2D Clusters', description: 'Separated 2D geometric clusters' },
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
    state.dataset.length > 0 ? state.currentIndex % state.dataset.length : 0;

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* Dataset Selection */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10.5px]">
            Dataset Problem
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            {state.dataset.length} samples
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Dataset presets">
          {presets.map((preset) => {
            const isSelected = config.datasetPreset === preset.id;
            return (
              <button
                key={preset.id}
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
                className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Truth Table & Sample Inspector */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[10.5px] font-mono text-slate-600 font-bold">
          <span>TRUTH TABLE SAMPLES</span>
          <span>TARGET y</span>
        </div>
        <div className="divide-y divide-slate-100 text-xs font-mono max-h-36 overflow-y-auto">
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
                className={`px-2.5 py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-amber-50/80 font-bold text-amber-950 ring-1 ring-amber-300 inset-0'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                  <span>
                    x₁={pt.x1}, x₂={pt.x2}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">y={pt.y}</span>
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold ${
                      pt.isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                    title={pt.isCorrect ? 'Correctly classified' : 'Misclassified'}
                  >
                    {pt.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
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
    state.dataset.length > 0 ? state.currentIndex % state.dataset.length : 0;
  const activePoint = state.dataset[safeIndex] ?? state.dataset[0];

  const currentWeightedSum =
    state.traceSum ?? (activePoint ? Number((w1 * activePoint.x1 + w2 * activePoint.x2 + bias).toFixed(4)) : 0);
  const currentPrediction = state.tracePred ?? stepActivation(currentWeightedSum);
  const currentError = state.traceError ?? (activePoint ? activePoint.y - currentPrediction : 0);

  return (
    <div className="flex flex-col gap-3 text-xs font-mono">
      {/* Current Learned Parameters */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Weight 1</span>
          <span className="text-blue-700 font-bold text-sm">{w1.toFixed(2)}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Weight 2</span>
          <span className="text-blue-700 font-bold text-sm">{w2.toFixed(2)}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Bias (b)</span>
          <span className="text-blue-700 font-bold text-sm">{bias.toFixed(2)}</span>
        </div>
      </div>

      {/* Epoch Telemetry */}
      <div className="grid grid-cols-2 gap-2 font-sans">
        <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex justify-between items-center">
          <span className="text-slate-500 text-xs">Epoch:</span>
          <span className="text-slate-900 font-bold font-mono text-sm">{state.epoch}</span>
        </div>
        <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex justify-between items-center">
          <span className="text-slate-500 text-xs">Errors:</span>
          <span
            className={`font-bold font-mono text-sm ${
              state.errorsInEpoch === 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {state.errorsInEpoch}
          </span>
        </div>
      </div>

      {/* Math Derivation Trace Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-2.5 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-700 text-[10.5px] flex items-center gap-1">
            <Calculator className="w-3 h-3 text-blue-600" />
            <span>STEP-BY-STEP TRACE</span>
          </span>
          <div className="flex items-center gap-1">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded text-[9px] font-sans font-semibold">
              <button
                onClick={() => setTraceMode('focused')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  traceMode === 'focused' ? 'bg-white text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                Focused
              </button>
              <button
                onClick={() => setTraceMode('full')}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  traceMode === 'full' ? 'bg-white text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                Full
              </button>
            </div>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 uppercase">
              [{state.stage}]
            </span>
          </div>
        </div>

        <div className="p-2.5 space-y-2 text-[11px]">
          {activePoint ? (
            traceMode === 'focused' ? (
              state.stage === 'idle' ? (
                <div className="space-y-1 text-slate-600 font-sans">
                  <div className="flex items-center gap-1 text-slate-800 font-bold">
                    <Info className="w-3 h-3 text-blue-600" />
                    <span>Ready for Step Execution</span>
                  </div>
                  <p className="text-[10.5px] leading-snug">
                    Sample #{safeIndex + 1}: x₁={activePoint.x1}, x₂={activePoint.x2} → Target y={activePoint.y}
                  </p>
                </div>
              ) : state.stage === 'select' || state.stage === 'feed' ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-blue-700 uppercase font-sans">[1. Input Feed]</div>
                  <div>x₁={activePoint.x1}, x₂={activePoint.x2}, b=1</div>
                  <div className="text-slate-500 text-[10px]">Propagating inputs through synapses</div>
                </div>
              ) : state.stage === 'summate' ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-blue-700 uppercase font-sans">[2. Linear Summation Σ]</div>
                  <div>z = ({w1.toFixed(2)}×{activePoint.x1}) + ({w2.toFixed(2)}×{activePoint.x2}) + ({bias.toFixed(2)}×1)</div>
                  <div className="font-bold text-blue-700">= {currentWeightedSum.toFixed(3)}</div>
                </div>
              ) : state.stage === 'activate' ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-blue-700 uppercase font-sans">[3. Heaviside Step Activation]</div>
                  <div>z = {currentWeightedSum.toFixed(3)} {currentWeightedSum >= 0 ? '≥' : '<'} 0</div>
                  <div className="font-bold text-blue-700">Prediction ŷ = {currentPrediction}</div>
                </div>
              ) : state.stage === 'evaluate' ? (
                <div className="space-y-1">
                  <div className={`text-[10px] font-bold uppercase font-sans ${currentError === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    [4. Target Evaluation]
                  </div>
                  <div>Target y = {activePoint.y}, Prediction ŷ = {currentPrediction}</div>
                  <div className="font-bold">Error (y - ŷ) = {currentError}</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-blue-700 uppercase font-sans">[5. Weight Update Delta]</div>
                  {currentError !== 0 ? (
                    <div className="text-rose-700 font-medium">
                      Δw₁={state.traceDeltaW1.toFixed(3)}, Δw₂={state.traceDeltaW2.toFixed(3)}, Δb={state.traceDeltaB.toFixed(3)}
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Zero Error • Weights Preserved
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans font-bold">[1. Summation]</span>
                  <div>z = {currentWeightedSum.toFixed(3)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans font-bold">[2. Prediction]</span>
                  <div>ŷ = {currentPrediction} (Target: {activePoint.y}, Error: {currentError})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans font-bold">[3. Weights Delta]</span>
                  {currentError !== 0 ? (
                    <div className="text-rose-700">
                      Δw₁={state.traceDeltaW1.toFixed(3)}, Δw₂={state.traceDeltaW2.toFixed(3)}, Δb={state.traceDeltaB.toFixed(3)}
                    </div>
                  ) : (
                    <div className="text-emerald-700 font-semibold">Zero Error</div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="text-slate-400">No active data points</div>
          )}
        </div>
      </div>
    </div>
  );
};
