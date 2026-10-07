import React from 'react';
import { SimulationVisualizationProps } from '@nexora/sdk';
import { BinarySearchConfig, BinarySearchState, BinarySearchStepLog } from './types';

export const BinarySearchVisualization: React.FC<
  SimulationVisualizationProps<BinarySearchState, BinarySearchConfig, BinarySearchStepLog>
> = ({ state, lastStepLog, onUpdateState }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 gap-6 font-sans">
      {/* Target & Status Banner */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-center">
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
            Target Value
          </span>
          <span className="text-2xl font-black font-mono text-blue-700">
            {state.target}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
            Active Interval
          </span>
          <span className="text-sm font-bold font-mono text-slate-800">
            [{state.low}, {state.high}] ({Math.max(0, state.high - state.low + 1)} elements)
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
            Comparisons
          </span>
          <span className="text-sm font-bold font-mono text-slate-800">
            {state.comparisons}
          </span>
        </div>
      </div>

      {/* Array Elements Representation */}
      <div className="w-full max-w-4xl overflow-x-auto py-4">
        <div className="flex items-end justify-center gap-2 min-w-max px-4">
          {state.array.map((val: number, idx: number) => {
            const isMid = idx === state.mid;
            const isLow = idx === state.low;
            const isHigh = idx === state.high;
            const inRange = idx >= state.low && idx <= state.high;
            const isFound = state.foundIndex === idx;

            let cellBg = 'bg-white text-slate-900 border-slate-200';
            if (!inRange) {
              cellBg = 'bg-slate-50 text-slate-300 border-slate-200/60 opacity-40';
            } else if (isFound) {
              cellBg = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400';
            } else if (isMid) {
              cellBg = 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400';
            } else if (inRange) {
              cellBg = 'bg-blue-50/60 text-slate-900 border-blue-200';
            }

            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 cursor-pointer select-none"
                title={`Index ${idx}: value ${val}. Click to set as search target.`}
                onClick={() => {
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
                }}
              >
                {/* Index Label */}
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {idx}
                </span>

                {/* Number Box */}
                <div
                  className={`w-12 h-14 rounded-xl border flex items-center justify-center text-lg font-mono font-bold transition-all ${cellBg}`}
                >
                  {val}
                </div>

                {/* Pointer Badges */}
                <div className="flex items-center gap-1 min-h-[22px]">
                  {isLow && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      L
                    </span>
                  )}
                  {isMid && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      M
                    </span>
                  )}
                  {isHigh && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      H
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative Telemetry Step Log */}
      {lastStepLog && (
        <div className="w-full max-w-xl bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-blue-400">
              Phase: {lastStepLog.phase}
            </span>
            <span>Step {state.stepNumber}</span>
          </div>
          <p className="text-slate-200 leading-relaxed">{lastStepLog.message}</p>
        </div>
      )}
    </div>
  );
};
