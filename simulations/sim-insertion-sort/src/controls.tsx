import type { FC } from 'react';
import type { SimulationControlsProps } from '@nexora-hrittik/sdk';
import { useState } from 'react';
import type { InsertionSortConfig, InsertionSortState, PresetType } from './types';
import {
  PRESET_ARRAYS,
  generateRandomArray,
  parseCustomArray,
  createInitialState,
} from './logic';
import { Shuffle, AlertCircle } from 'lucide-react';

interface CompactSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}

const CompactSlider: FC<CompactSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  disabled = false,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5 text-xs">
    <div className="flex justify-between items-center text-zinc-700">
      <label className="font-medium text-xs text-zinc-700 select-none">{label}</label>
      <span className="font-mono text-[11px] font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 shadow-2xs min-w-6 text-center">
        {value}
      </span>
    </div>
    <div className="flex items-center pt-0.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all"
      />
    </div>
  </div>
);

export const InsertionSortControls: FC<
  SimulationControlsProps<InsertionSortState, InsertionSortConfig>
> = ({ config, onChangeConfig, onUpdateState, disabled }) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  const applyNewArray = (newArr: number[], preset: PresetType) => {
    onChangeConfig({
      initialArray: newArr,
      arraySize: newArr.length,
      preset,
    });
    if (onUpdateState) {
      onUpdateState(() =>
        createInitialState({
          ...config,
          initialArray: newArr,
          arraySize: newArr.length,
          preset,
        })
      );
    }
  };

  const handlePresetSelect = (preset: Exclude<PresetType, 'custom'>) => {
    const generator = PRESET_ARRAYS[preset];
    if (generator) {
      const newArr = generator(config.arraySize);
      applyNewArray(newArr, preset);
      setCustomError(null);
    }
  };

  const handleRandomize = () => {
    const newArr = generateRandomArray(config.arraySize, config.minValue, config.maxValue);
    applyNewArray(newArr, 'random');
    setCustomError(null);
  };

  const handleApplyCustom = () => {
    const result = parseCustomArray(customInput, config.minValue, config.maxValue, 20);
    if (!result.valid || !result.array) {
      setCustomError(result.error || 'Invalid array values.');
      return;
    }
    setCustomError(null);
    applyNewArray(result.array, 'custom');
  };

  const handleSizeChange = (newSize: number) => {
    let newArr: number[];
    if (config.preset !== 'custom' && PRESET_ARRAYS[config.preset]) {
      newArr = PRESET_ARRAYS[config.preset](newSize);
    } else {
      newArr = generateRandomArray(newSize, config.minValue, config.maxValue);
    }
    applyNewArray(newArr, config.preset === 'custom' ? 'random' : config.preset);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Preset Dataset Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Input Presets
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handlePresetSelect('random')}
            className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              config.preset === 'random'
                ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            Random
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handlePresetSelect('nearly-sorted')}
            className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              config.preset === 'nearly-sorted'
                ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            Nearly Sorted
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handlePresetSelect('reversed')}
            className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              config.preset === 'reversed'
                ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            Reversed
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handlePresetSelect('few-unique')}
            className={`px-2 py-1.5 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              config.preset === 'few-unique'
                ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200'
            }`}
          >
            Few Unique
          </button>
        </div>
      </div>

      {/* Array Size Slider */}
      <CompactSlider
        label="Array Size"
        value={config.arraySize}
        min={4}
        max={16}
        step={1}
        disabled={disabled}
        onChange={handleSizeChange}
      />

      {/* Generate Random Action */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleRandomize}
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-zinc-100 hover:bg-zinc-200/90 text-zinc-900 text-xs font-semibold rounded-lg border border-zinc-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Shuffle className="w-3.5 h-3.5" />
        Generate Random Values
      </button>

      {/* Manual Array Input */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-zinc-200/80">
        <label className="font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Custom Array (comma/space separated)
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            disabled={disabled}
            placeholder="e.g. 24, 13, 9, 64, 7"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              if (customError) setCustomError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyCustom();
              }
            }}
            className="w-full px-2.5 py-1.5 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white disabled:opacity-40"
          />
          <button
            type="button"
            disabled={disabled || !customInput.trim()}
            onClick={handleApplyCustom}
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Load
          </button>
        </div>
        {customError && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{customError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
