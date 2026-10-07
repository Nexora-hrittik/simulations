import React from 'react';
import { SimulationControlsProps, SimulationInspectorProps, Slider } from '@nexora/sdk';
import { CounterConfig, CounterState, CounterStepLog } from './types';

export const CounterControls: React.FC<
  SimulationControlsProps<CounterState, CounterConfig>
> = ({ config, onChangeConfig, disabled }) => {
  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      <Slider
        label="Increment Step Size"
        value={config.stepSize}
        min={1}
        max={10}
        step={1}
        valueDisplay={String(config.stepSize)}
        onChange={(val) => onChangeConfig({ stepSize: val })}
        disabled={disabled}
      />

      <Slider
        label="Target Limit"
        value={config.target}
        min={10}
        max={100}
        step={5}
        valueDisplay={String(config.target)}
        onChange={(val) => onChangeConfig({ target: val })}
        disabled={disabled}
      />
    </div>
  );
};

export const CounterStateInspector: React.FC<
  SimulationInspectorProps<CounterState, CounterConfig, CounterStepLog>
> = ({ state, config, lastStepLog }) => {
  return (
    <div className="flex flex-col gap-3 font-mono text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">
            Current Value
          </span>
          <span className="text-blue-700 font-bold text-base">{state.count}</span>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">
            Target
          </span>
          <span className="text-slate-800 font-bold text-base">{config.target}</span>
        </div>
      </div>

      {lastStepLog && (
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-[11px]">
          <div className="text-slate-500 font-sans font-bold text-[10px] uppercase">
            Last Step Action
          </div>
          <div className="text-slate-700">
            {lastStepLog.previous} + {lastStepLog.increment} ={' '}
            <strong className="text-blue-700">{lastStepLog.current}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
