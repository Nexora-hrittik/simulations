import { type FC, useEffect, useRef, useState } from 'react';
import type { SimulationVisualizationProps } from '@nexora-hrittik/sdk';
import anime from 'animejs';
import type { InsertionSortConfig, InsertionSortState, InsertionSortStepLog } from './types';
import { Clock, Key, ArrowDown, CheckCircle2, ArrowRightLeft, Sparkles } from 'lucide-react';

export interface InsertionSortVisualizationProps
  extends SimulationVisualizationProps<InsertionSortState, InsertionSortConfig, InsertionSortStepLog> {
  showInsights?: boolean;
  onToggleInsights?: () => void;
}

export const InsertionSortVisualization: FC<InsertionSortVisualizationProps> = ({
  state,
  isRunning,
  speedMs = 300,
  showInsights,
  onToggleInsights,
  onAction,
}) => {
  const [internalShowInsights, setInternalShowInsights] = useState(false);
  const isInsightsOpen = showInsights !== undefined ? showInsights : internalShowInsights;

  const handleToggleInsights = () => {
    if (onToggleInsights) {
      onToggleInsights();
    } else {
      setInternalShowInsights((prev) => !prev);
    }
    onAction?.('toggle-insights');
  };
  const {
    array,
    outerIndex,
    compareIndex,
    key,
    keyOriginIndex,
    keyTargetIndex,
    gapIndex,
    sortedBoundary,
    phase,
    shiftedIndices,
    insertedIndex,
    lastComparison,
    comparisons,
    shifts,
    keyPlacements,
    completedPasses,
    totalSteps,
    isComplete,
    message,
  } = state;

  const n = array.length;
  const maxValue = Math.max(...array, 1);
  const minValue = Math.min(...array, 0);
  const valueRange = Math.max(1, maxValue - minValue);

  // Effective floating target index where key is hovering / aiming to insert
  const effectiveKeyPosition = keyTargetIndex ?? (compareIndex >= 0 ? compareIndex + 1 : (keyOriginIndex ?? outerIndex));

  // Animation DOM refs
  const trackRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatingKeyRef = useRef<HTMLDivElement>(null);
  const activeAnimationRef = useRef<anime.AnimeInstance | null>(null);
  const prevStepRef = useRef<number>(totalSteps);
  const prevPhaseRef = useRef<string>(phase);

  // Compute adaptive animation duration based on playback speedMs
  // Clamp between 80ms (for fast 5x speeds) and 350ms (for slow 0.25x speeds)
  const animDuration = Math.min(350, Math.max(80, Math.round(speedMs * 0.75)));

  // Pause / resume / cancel animations when isRunning changes
  useEffect(() => {
    if (!isRunning && activeAnimationRef.current) {
      activeAnimationRef.current.pause();
    } else if (isRunning && activeAnimationRef.current && activeAnimationRef.current.paused) {
      activeAnimationRef.current.play();
    }
  }, [isRunning]);

  // Clean up any in-flight animations when resetting or step changes
  useEffect(() => {
    // Check if user reduced motion is enabled
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (totalSteps === 0) {
      // Reset occurred: cancel any active animations and reset transforms immediately
      if (activeAnimationRef.current) {
        activeAnimationRef.current.pause();
        activeAnimationRef.current = null;
      }
      barRefs.current.forEach((barEl) => {
        if (barEl) {
          anime.remove(barEl);
          barEl.style.transform = 'none';
        }
      });
      if (floatingKeyRef.current) {
        anime.remove(floatingKeyRef.current);
        floatingKeyRef.current.style.transform = 'none';
      }
      prevStepRef.current = 0;
      prevPhaseRef.current = phase;
      return;
    }

    if (prefersReducedMotion) {
      // Skip physics motion for reduced motion
      prevStepRef.current = totalSteps;
      prevPhaseRef.current = phase;
      return;
    }

    // Measure element slot spacing to calculate pixel displacement dynamically
    const getSlotDistance = (): number => {
      if (barRefs.current[0] && barRefs.current[1]) {
        const rect0 = barRefs.current[0].getBoundingClientRect();
        const rect1 = barRefs.current[1].getBoundingClientRect();
        return rect1.left - rect0.left;
      }
      return 48; // fallback reasonable slot distance in px
    };

    const slotDist = getSlotDistance();

    // 1. Shift Animation: When an element shifted right (from compareIndex to compareIndex + 1)
    if (phase === 'compare' && prevPhaseRef.current === 'shift' && shiftedIndices.length > 0) {
      const shiftedIdx = shiftedIndices[0];
      const targetBar = barRefs.current[shiftedIdx];
      if (targetBar) {
        anime.remove(targetBar);
        // Animate from left by -slotDist to 0 (entering into shifted position)
        activeAnimationRef.current = anime({
          targets: targetBar,
          translateX: [-slotDist, 0],
          duration: animDuration,
          easing: 'easeOutCubic',
          complete: () => {
            if (targetBar) targetBar.style.transform = 'none';
            activeAnimationRef.current = null;
          },
        });
      }
    }

    // 2. Key Insertion Animation: When key is inserted down from buffer into target gap
    if (phase === 'pass-complete' && insertedIndex !== null && prevPhaseRef.current === 'insert') {
      const insertedBar = barRefs.current[insertedIndex];
      if (insertedBar) {
        anime.remove(insertedBar);
        // Animate key descending from above into its array slot
        activeAnimationRef.current = anime({
          targets: insertedBar,
          translateY: [-28, 0],
          opacity: [0.7, 1],
          duration: animDuration,
          easing: 'easeOutBack',
          complete: () => {
            if (insertedBar) insertedBar.style.transform = 'none';
            activeAnimationRef.current = null;
          },
        });
      }
    }

    // 3. Floating Key Marker Horizontal Movement: When key slides along buffer
    if (floatingKeyRef.current && (phase === 'compare' || phase === 'shift') && key !== null) {
      anime.remove(floatingKeyRef.current);
      activeAnimationRef.current = anime({
        targets: floatingKeyRef.current,
        scale: [0.92, 1],
        duration: Math.min(200, animDuration),
        easing: 'easeOutQuad',
      });
    }

    prevStepRef.current = totalSteps;
    prevPhaseRef.current = phase;

    return () => {
      if (activeAnimationRef.current) {
        activeAnimationRef.current.pause();
      }
    };
  }, [totalSteps, phase, shiftedIndices, insertedIndex, key, animDuration]);

  const getElementRole = (idx: number) => {
    if (isComplete) {
      return {
        role: 'sorted-final',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-900 font-bold',
      };
    }

    if (idx === insertedIndex && phase === 'pass-complete') {
      return {
        role: 'inserted',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-900 font-bold',
      };
    }

    if (idx === compareIndex && phase === 'compare') {
      return {
        role: 'comparing',
        barColor: 'bg-blue-500',
        textColor: 'text-blue-900 font-bold',
      };
    }

    if (shiftedIndices.includes(idx)) {
      return {
        role: 'shifted',
        barColor: 'bg-indigo-500',
        textColor: 'text-indigo-900 font-bold',
      };
    }

    if (idx <= sortedBoundary) {
      return {
        role: 'sorted-prefix',
        barColor: 'bg-emerald-600/75',
        textColor: 'text-emerald-950 font-semibold',
      };
    }

    if (idx === outerIndex && (phase === 'select-key' || phase === 'compare' || phase === 'shift')) {
      return {
        role: 'key-slot',
        barColor: 'bg-amber-400/80',
        textColor: 'text-amber-950 font-medium',
      };
    }

    return {
      role: 'unsorted',
      barColor: 'bg-zinc-300',
      textColor: 'text-zinc-600',
    };
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. Compact Live Status & Operation Bar */}
      <div className="p-3 bg-white border border-zinc-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border shadow-2xs ${
              isComplete
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : phase === 'compare'
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : phase === 'shift'
                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                : phase === 'insert'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-zinc-100 text-zinc-800 border-zinc-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isComplete
                  ? 'bg-emerald-500'
                  : phase === 'compare'
                  ? 'bg-blue-500 animate-pulse'
                  : phase === 'shift'
                  ? 'bg-indigo-500'
                  : 'bg-zinc-400'
              }`}
            />
            {phase}
          </span>

          <p className="text-xs text-zinc-850 font-medium leading-relaxed truncate max-w-[500px]" title={message}>
            {message}
          </p>
        </div>

        {/* Inset comparison summary pill if comparing */}
        {lastComparison && phase === 'compare' && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/80 border border-blue-200 rounded-lg text-xs font-mono text-blue-900">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>
              A[{compareIndex}] ({lastComparison.compareVal}) {lastComparison.isGreater ? '>' : '≤'} Key ({lastComparison.keyVal})
            </span>
          </div>
        )}

        {/* Post-Completion "Understand Why" action button at canvas complete row end */}
        {isComplete && (
          <button
            type="button"
            onClick={handleToggleInsights}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isInsightsOpen ? 'Hide Analysis' : 'Understand Why'}</span>
          </button>
        )}
      </div>

      {/* 2. Visual Array Canvas with Elevated Key Track - Inner padding set to exactly 20px (p-5) */}
      <div className="w-full bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-2xs flex flex-col gap-5">
        {/* Array Visualization Area */}
        <div ref={trackRef} className="w-full flex flex-col gap-1 overflow-x-auto pb-2">
          {/* Track 1: Floating Key Elevation Area */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3 min-h-[46px]">
            {array.map((_, idx) => {
              const isTargetSlot = key !== null && idx === effectiveKeyPosition && !isComplete;

              return (
                <div
                  key={`elevated-slot-${idx}`}
                  className="flex-1 max-w-[64px] min-w-[36px] flex flex-col items-center justify-center"
                >
                  {isTargetSlot && (
                    <div ref={floatingKeyRef} className="flex flex-col items-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[11px] font-mono font-bold rounded-md shadow-sm ring-2 ring-amber-300">
                        <Key className="w-3 h-3" />
                        {key}
                      </div>
                      <ArrowDown className="w-3.5 h-3.5 text-amber-600 mt-0.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Track 2: Bars Canvas with Dynamic Heights, Values Directly Above, and Gap Display */}
          <div className="w-full flex items-end justify-center gap-2 sm:gap-3 min-h-[190px] pt-2">
            {array.map((value, idx) => {
              const isGap = gapIndex !== null && idx === gapIndex;
              const roleInfo = getElementRole(idx);
              const heightPercent = Math.max(
                18,
                Math.min(100, Math.round(((value - minValue) / valueRange) * 82 + 18))
              );

              return (
                <div
                  key={`bar-slot-${idx}`}
                  ref={(el) => {
                    barRefs.current[idx] = el;
                  }}
                  className="flex flex-col items-center flex-1 max-w-[64px] min-w-[36px] group will-change-transform"
                >
                  {/* Dynamic Height Bar Container */}
                  <div className="w-full h-40 flex flex-col justify-end items-center relative">
                    {isGap ? (
                      /* Empty Slot Indicator: subtle neutral dashed outline with height matching array bars */
                      <div className="w-full h-full flex flex-col items-center justify-end pb-1">
                        <div
                          className="w-full h-[60%] rounded-t-lg border-2 border-dashed border-zinc-300/80 bg-zinc-50/60 flex flex-col items-center justify-center"
                          title={`Empty gap at index [${idx}] awaiting key placement`}
                        >
                          <span className="text-[10px] font-mono text-zinc-400 font-semibold select-none">
                            gap
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Value Directly Above Bar Height */}
                        <div
                          style={{ bottom: `calc(${heightPercent}% + 6px)` }}
                          className={`absolute font-mono text-xs font-bold transition-transform duration-150 pointer-events-none ${roleInfo.textColor} ${
                            idx === outerIndex || idx === compareIndex ? 'scale-110' : ''
                          }`}
                        >
                          {value}
                        </div>

                        {/* Animated Vertical Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg shadow-2xs transition-colors duration-200 ${roleInfo.barColor} ${
                            idx === compareIndex
                              ? 'ring-2 ring-blue-600 ring-offset-1'
                              : idx === outerIndex && phase === 'select-key'
                              ? 'ring-2 ring-amber-500 ring-offset-1'
                              : ''
                          }`}
                        />
                      </>
                    )}
                  </div>

                  {/* Slot Subtitle: Index Only */}
                  <div className="flex flex-col items-center justify-center w-full pt-2 border-t border-zinc-100">
                    <span className="font-mono text-[10px] text-zinc-400">[{idx}]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Live Metrics Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-zinc-200/80 rounded-xl shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Comparisons
          </span>
          <span className="text-xl font-mono font-bold text-zinc-950 mt-1">
            {comparisons}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">A[j] &gt; key checks</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200/80 rounded-xl shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Element Shifts
          </span>
          <span className="text-xl font-mono font-bold text-zinc-950 mt-1">
            {shifts}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">A[j+1] = A[j] moves</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200/80 rounded-xl shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Key Placements
          </span>
          <span className="text-xl font-mono font-bold text-zinc-950 mt-1">
            {keyPlacements}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">A[j+1] = key inserts</span>
        </div>

        <div className="p-3 bg-white border border-zinc-200/80 rounded-xl shadow-2xs flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Pass Progress
          </span>
          <span className="text-xl font-mono font-bold text-zinc-950 mt-1 flex items-center gap-1.5">
            {completedPasses} / {Math.max(1, n - 1)}
            {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5">Total steps: {totalSteps}</span>
        </div>
      </div>

      {/* 4. Asymptotic Complexity Reference */}
      <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="font-semibold text-zinc-900">Asymptotic Complexity:</span>
          <span>Best: <strong className="font-mono text-emerald-700">O(n)</strong></span>
          <span className="text-zinc-300">•</span>
          <span>Average/Worst: <strong className="font-mono text-zinc-900">O(n²)</strong></span>
          <span className="text-zinc-300">•</span>
          <span>Space: <strong className="font-mono text-zinc-900">O(1)</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <span className="inline-block px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-emerald-800 font-bold">
            STABLE
          </span>
          <span className="inline-block px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-blue-800 font-bold">
            ADAPTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
