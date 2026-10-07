import React from 'react';
import { SimulationVisualizationProps } from '@nexora/sdk';
import { CounterConfig, CounterState, CounterStepLog } from './types';
import { Activity, CheckCircle2 } from 'lucide-react';

export const CounterVisualization: React.FC<
  SimulationVisualizationProps<CounterState, CounterConfig, CounterStepLog>
> = ({ state, config }) => {
  const percentage = Math.min(100, Math.round((state.count / config.target) * 100));
  const isTargetReached = state.count >= config.target;

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 p-6 font-sans">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
        <Activity className="w-4 h-4 text-blue-600" />
        <span>Discrete Accumulator Display</span>
      </div>

      <div className="relative w-48 h-48 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50 shadow-inner">
        <span className="text-5xl font-mono font-black text-slate-900 tracking-tight">
          {state.count}
        </span>
        <span className="text-xs font-mono text-slate-500 mt-1">
          Target: {config.target}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-600">
          <span>Accumulation Progress</span>
          <span className="font-bold">{percentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-200 ${
              isTargetReached ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {isTargetReached && (
        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Target threshold reached successfully!</span>
        </div>
      )}
    </div>
  );
};
