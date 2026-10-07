import React from 'react';
import { SimulationControlsProps } from '@rec-labs/sdk';
import { BinarySearchConfig, BinarySearchState } from './types';

export const BinarySearchControls: React.FC<
  SimulationControlsProps<BinarySearchState, BinarySearchConfig>
> = ({ config, state, onChangeConfig, onUpdateState, disabled }) => {
  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* Target Value Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex justify-between">
          <span>Search Target</span>
          <span className="font-mono text-blue-700">{config.target}</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={config.target}
            disabled={disabled}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChangeConfig({ target: val });
              if (onUpdateState) {
                onUpdateState((prev: BinarySearchState) => ({
                  ...prev,
                  target: val,
                  low: 0,
                  high: prev.array.length - 1,
                  mid: null,
                  phase: 'init',
                  stepNumber: 0,
                  comparisons: 0,
                  foundIndex: null,
                  isComplete: false,
                }));
              }
            }}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-sm bg-white focus:outline-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Target Presets */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Quick Target Presets
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {state.array.slice(0, 6).map((val: number) => (
            <button
              key={val}
              type="button"
              disabled={disabled}
              onClick={() => {
                onChangeConfig({ target: val });
                if (onUpdateState) {
                  onUpdateState((prev: BinarySearchState) => ({
                    ...prev,
                    target: val,
                    low: 0,
                    high: prev.array.length - 1,
                    mid: null,
                    phase: 'init',
                    stepNumber: 0,
                    comparisons: 0,
                    foundIndex: null,
                    isComplete: false,
                  }));
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                state.target === val
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {val}
            </button>
          ))}
          {/* Missing value preset to test not-found */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const missingVal = 50; // not in array
              onChangeConfig({ target: missingVal });
              if (onUpdateState) {
                onUpdateState((prev: BinarySearchState) => ({
                  ...prev,
                  target: missingVal,
                  low: 0,
                  high: prev.array.length - 1,
                  mid: null,
                  phase: 'init',
                  stepNumber: 0,
                  comparisons: 0,
                  foundIndex: null,
                  isComplete: false,
                }));
              }
            }}
            className="px-2.5 py-1 rounded-md text-xs font-mono font-medium border bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Set target to 50 (not in array) to observe search termination"
          >
            50 (Missing)
          </button>
        </div>
      </div>

      {/* Array Size Slider */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex justify-between">
          <span>Array Size</span>
          <span className="font-mono text-blue-700">{config.arraySize}</span>
        </label>
        <input
          type="range"
          min={4}
          max={12}
          step={1}
          value={config.arraySize}
          disabled={disabled}
          onChange={(e) => onChangeConfig({ arraySize: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>4</span>
          <span>12</span>
        </div>
      </div>
    </div>
  );
};
