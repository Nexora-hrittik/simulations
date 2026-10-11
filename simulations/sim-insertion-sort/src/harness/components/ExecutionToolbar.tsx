import { useState, useRef, useEffect, FC } from 'react';
import { Play, Pause, StepForward, RotateCcw, ChevronDown, Gauge, Check } from 'lucide-react';
import type { SimulationStatus } from '@nexora-hrittik/sdk';

export const PLAYBACK_SPEEDS = [
  0.25, 0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00,
  2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00,
  4.25, 4.50, 4.75, 5.00,
] as const;

export interface ExecutionToolbarProps {
  status: SimulationStatus;
  stepCount: number;
  speedMs: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onSubStep?: () => void;
  hasSubStep?: boolean;
  onReset: () => void;
  onSpeedChange: (ms: number) => void;
  className?: string;
}

export const ExecutionToolbar: FC<ExecutionToolbarProps> = ({
  status,
  stepCount,
  speedMs,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  className = '',
}) => {
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';

  // Calculate current multiplier (baseline is 300ms for 1.00x)
  const currentMultiplier = 300 / speedMs;
  const activeSpeed = PLAYBACK_SPEEDS.reduce((prev, curr) =>
    Math.abs(curr - currentMultiplier) < Math.abs(prev - currentMultiplier) ? curr : prev
  );

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSpeedOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSpeedOpen(false);
      }
    };

    if (isSpeedOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpeedOpen]);

  const handleSelectSpeed = (multiplier: number) => {
    const newMs = Math.max(20, Math.round(300 / multiplier));
    onSpeedChange(newMs);
    setIsSpeedOpen(false);
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 p-2.5 bg-white border border-zinc-200 rounded-xl shadow-2xs ${className}`}
    >
      {/* Icon-Based Execution Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Primary Action Button: Play / Pause / Restart */}
        {isRunning ? (
          <button
            type="button"
            onClick={onPause}
            aria-label="Pause execution"
            title="Pause execution"
            className="h-9 w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        ) : isCompleted ? (
          <button
            type="button"
            onClick={onReset}
            aria-label="Restart simulation"
            title="Restart simulation"
            className="h-9 w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={status === 'paused' ? 'Resume execution' : 'Start execution'}
            title={status === 'paused' ? 'Resume execution' : 'Start execution'}
            className="h-9 w-9 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center cursor-pointer shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}

        {/* Step Forward Action Button */}
        <button
          type="button"
          onClick={onStep}
          disabled={isRunning || isCompleted}
          aria-label="Execute single step"
          title="Step forward"
          className="h-9 w-9 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all"
        >
          <StepForward className="w-4 h-4" />
        </button>

        {/* Reset Action Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={status === 'idle' && stepCount === 0}
          aria-label="Reset simulation to initial state"
          title="Reset to initial state"
          className="h-9 w-9 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Dropdown Menu (0.25x - 5.00x in 0.25x steps) */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsSpeedOpen(!isSpeedOpen)}
          aria-label="Select playback speed"
          aria-haspopup="listbox"
          aria-expanded={isSpeedOpen}
          title="Playback speed"
          className="h-9 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-mono font-medium text-zinc-800 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all select-none"
        >
          <Gauge className="w-3.5 h-3.5 text-zinc-500" />
          <span>{activeSpeed.toFixed(2)}x</span>
          <ChevronDown
            className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${
              isSpeedOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isSpeedOpen && (
          <div
            role="listbox"
            aria-label="Available playback speeds"
            className="absolute right-0 top-full mt-1.5 w-28 max-h-52 overflow-y-auto bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-30 font-mono text-xs focus:outline-none animate-in fade-in zoom-in-95 duration-100"
          >
            {PLAYBACK_SPEEDS.map((speed) => {
              const isSelected = speed === activeSpeed;
              return (
                <button
                  key={speed}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelectSpeed(speed)}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                  }`}
                >
                  <span>{speed.toFixed(2)}x</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-950" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
