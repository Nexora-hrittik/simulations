import { useState, type ReactNode, type KeyboardEvent } from 'react';
import {
  type SimulationModule,
  type SimulationStatus,
  useSimulationRuntime,
  ErrorFallback,
} from '@nexora-hrittik/sdk';
import { EducationalTabs } from './EducationalTabs';
import { StateInspector } from './StateInspector';
import { ExecutionToolbar } from './components/ExecutionToolbar';
import { Card } from './components/Card';
import {
  Sparkles,
  BookOpen,
  FlaskConical,
  Terminal,
  Home,
  ChevronRight,
} from 'lucide-react';
import type { SimulationVisualizationProps } from '@nexora-hrittik/sdk';

export interface SimulationPreviewHarnessProps<TState, TConfig, TStepLog = unknown> {
  module: SimulationModule<TState, TConfig, TStepLog>;
  title?: string;
}

export function SimulationPreviewHarness<TState, TConfig, TStepLog = unknown>({
  module,
}: SimulationPreviewHarnessProps<TState, TConfig, TStepLog>) {
  const runtime = useSimulationRuntime(module);
  const [activeView, setActiveView] = useState<'experiment' | 'theory' | 'inspector'>('experiment');
  const [showInsights, setShowInsights] = useState<boolean>(false);

  const Visualization = module.Visualization;
  const VisualizationComponent = Visualization as React.ComponentType<
    SimulationVisualizationProps<TState, TConfig, TStepLog> & {
      showInsights?: boolean;
      onToggleInsights?: () => void;
    }
  >;
  const Controls = module.Controls;
  const StateInspectorComponent = module.StateInspector;

  const isCompleted = runtime.status === 'completed';

  const statusBadge: Record<SimulationStatus, ReactNode> = {
    idle: (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-white text-zinc-700 border border-zinc-200/80 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span>READY</span>
      </div>
    ),
    running: (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-900 text-white border border-zinc-900 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>RUNNING</span>
      </div>
    ),
    paused: (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-white border border-amber-500 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span>PAUSED</span>
      </div>
    ),
    completed: (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-600 text-white border border-emerald-600 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span>COMPLETED</span>
      </div>
    ),
    error: (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-600 text-white border border-rose-600 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span>ERROR</span>
      </div>
    ),
  };

  const completion =
    isCompleted && module.completionSummary
      ? module.completionSummary(runtime.state, runtime.config)
      : isCompleted
        ? {
            title: `Simulation Complete: ${module.metadata.title} Finished`,
            description: `Execution completed successfully in ${runtime.stepCount} steps.`,
          }
        : null;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-zinc-900 font-sans flex flex-col">
      <main className="rec-page-content outline-none flex-1 px-(--page-gutter) py-6 sm:py-8 max-w-375 mx-auto w-full flex flex-col gap-5">
        {/* 1. Official Platform Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 font-sans"
        >
          <div className="flex items-center gap-1.5 hover:text-zinc-950 transition-colors select-none cursor-pointer">
            <Home className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span>Home</span>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-300 shrink-0" />
          <span className="capitalize hover:text-zinc-950 transition-colors select-none cursor-pointer">
            {module.metadata.category || module.metadata.topicId}
          </span>
          <ChevronRight className="w-3 h-3 text-zinc-300 shrink-0" />
          <span className="text-zinc-900 font-semibold truncate">{module.metadata.title}</span>
        </nav>

        <div className="flex flex-col gap-6 w-full font-sans">
          {/* 2. Technical Laboratory Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 lg:gap-12 pb-5 border-b border-zinc-200">
            <div className="text-left flex-1 min-w-0">
              <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-zinc-950 text-left">
                {module.metadata.title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed mt-2 text-left">
                {module.metadata.shortDescription}
              </p>
            </div>

            {/* Right-Side Header Row: Step, Status & Pill Mode Switcher */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {/* Integrated Simulation Step & State Telemetry Dock */}
              <div className="flex items-center h-9 p-1 rounded-full bg-zinc-200/50 border border-zinc-200/70 backdrop-blur-md shadow-2xs gap-1 select-none">
                {/* Step Counter Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-zinc-200/80 shadow-2xs font-mono text-[11px]">
                  <span className="text-zinc-400 font-medium uppercase tracking-wider">Step</span>
                  <span className="font-bold text-zinc-950 min-w-3 text-center">
                    {runtime.stepCount}
                  </span>
                </div>

                {/* Status State Pill */}
                {statusBadge[runtime.status]}
              </div>

              {/* Navigation Mode Switcher: Experiment vs Theory vs Inspector (Icon-Only Segmented Dock) */}
              <div
                role="tablist"
                aria-label="Simulation Views"
                className="flex items-center h-9 p-1 rounded-full bg-zinc-200/50 border border-zinc-200/70 backdrop-blur-md shadow-2xs gap-0.5 shrink-0"
                onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                  const views: Array<'experiment' | 'theory' | 'inspector'> = ['experiment', 'theory', 'inspector'];
                  const currentIndex = views.indexOf(activeView);
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % views.length;
                    setActiveView(views[nextIndex]);
                    document.getElementById(`tab-${views[nextIndex]}`)?.focus();
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + views.length) % views.length;
                    setActiveView(views[prevIndex]);
                    document.getElementById(`tab-${views[prevIndex]}`)?.focus();
                  }
                }}
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-experiment"
                  aria-selected={activeView === 'experiment'}
                  aria-controls="panel-experiment"
                  tabIndex={activeView === 'experiment' ? 0 : -1}
                  onClick={() => setActiveView('experiment')}
                  title="Experiment"
                  aria-label="Experiment"
                  className={`h-7 w-7 rounded-full transition-all duration-200 cursor-pointer select-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                    activeView === 'experiment'
                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-bold'
                      : 'text-zinc-500 hover:text-zinc-950 hover:bg-white/60'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-theory"
                  aria-selected={activeView === 'theory'}
                  aria-controls="panel-theory"
                  tabIndex={activeView === 'theory' ? 0 : -1}
                  onClick={() => setActiveView('theory')}
                  title="Theory"
                  aria-label="Theory"
                  className={`h-7 w-7 rounded-full transition-all duration-200 cursor-pointer select-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                    activeView === 'theory'
                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-bold'
                      : 'text-zinc-500 hover:text-zinc-950 hover:bg-white/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-inspector"
                  aria-selected={activeView === 'inspector'}
                  aria-controls="panel-inspector"
                  tabIndex={activeView === 'inspector' ? 0 : -1}
                  onClick={() => setActiveView('inspector')}
                  title="Inspector"
                  aria-label="Inspector"
                  className={`h-7 w-7 rounded-full transition-all duration-200 cursor-pointer select-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                    activeView === 'inspector'
                      ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200/80 font-bold'
                      : 'text-zinc-500 hover:text-zinc-950 hover:bg-white/60'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

        {/* 3. Active View Content */}
        {activeView === 'theory' && (
          <EducationalTabs content={module.content} simulationId={module.metadata.id} />
        )}

        {activeView === 'inspector' && (
          <StateInspector
            state={runtime.state}
            config={runtime.config}
            lastStepLog={runtime.lastStepLog}
            stepCount={runtime.stepCount}
          />
        )}

        {activeView === 'experiment' && (
          <div className="flex flex-col gap-6">
            {/* Expandable Post-Completion Analysis */}
            {isCompleted && showInsights && completion?.analysis && (
              <Card className="p-5 bg-white border border-emerald-200 rounded-md animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-emerald-900">
                    {completion.analysis.title}
                  </h4>
                </div>
                <div className="text-xs sm:text-sm text-zinc-700 space-y-2.5 leading-relaxed">
                  <p>{completion.analysis.explanation}</p>
                </div>
              </Card>
            )}

            {/* 4. Main Balanced Workspace Grid: Two-Column Desktop (Visualization Left, Controls Right) */}
            <div className="simulation-workspace">
              {/* Primary Visual Simulation Stage (Left Column) */}
              <section className="simulation-canvas">
                <div className="p-5 flex flex-col items-center justify-center min-h-135 bg-white border border-zinc-200/90 relative overflow-hidden rounded-xl text-zinc-900 technical-grid shadow-2xs">
                  <div className="w-full flex justify-center">
                    <VisualizationComponent
                      state={runtime.state}
                      config={runtime.config}
                      isRunning={runtime.status === 'running'}
                      stepCount={runtime.stepCount}
                      lastStepLog={runtime.lastStepLog}
                      speedMs={runtime.speedMs}
                      onUpdateState={runtime.updateState}
                      showInsights={showInsights}
                      onToggleInsights={() => setShowInsights(!showInsights)}
                    />
                  </div>
                </div>
              </section>

              {/* Simulation Sidebar: Controls, Parameters, & Diagnostics (Right Column) */}
              <aside className="simulation-sidebar">
                {/* Refined Icon-Based Execution Toolbar with 0.25x Speed Dropdown */}
                <ExecutionToolbar
                  status={runtime.status}
                  stepCount={runtime.stepCount}
                  speedMs={runtime.speedMs}
                  onPlay={runtime.play}
                  onPause={runtime.pause}
                  onStep={runtime.step}
                  onSubStep={runtime.subStep}
                  hasSubStep={runtime.hasSubStep}
                  onReset={() => {
                    runtime.reset();
                    setShowInsights(false);
                  }}
                  onSpeedChange={runtime.setSpeedMs}
                />

                {/* Runtime Error Guard Display */}
                {runtime.errorMessage && (
                  <ErrorFallback
                    error={runtime.errorMessage}
                    onReset={runtime.reset}
                    simulationTitle={module.metadata.title}
                  />
                )}

                {/* Compact Parameter Setup Panel */}
                <Card className="p-4 flex flex-col gap-3 bg-white border border-zinc-200/90 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-bold">
                      Experiment Parameters
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400">EDITABLE</span>
                  </div>

                  <Controls
                    config={runtime.config}
                    state={runtime.state}
                    onChangeConfig={(patch: Partial<TConfig>) => {
                      runtime.updateConfig(patch, true);
                      setShowInsights(false);
                    }}
                    onUpdateState={runtime.updateState}
                    disabled={runtime.status === 'running'}
                  />
                </Card>

                {/* Module-Provided Custom State Inspector if supplied */}
                {StateInspectorComponent && (
                  <Card className="p-4 flex flex-col gap-3 bg-white border border-zinc-200/90 rounded-xl shadow-2xs">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 font-bold">
                        Internal Telemetry
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-400">LIVE</span>
                    </div>

                    <StateInspectorComponent
                      state={runtime.state}
                      config={runtime.config}
                      lastStepLog={runtime.lastStepLog}
                    />
                  </Card>
                )}
              </aside>
            </div>

            {/* 5. Theory Connection Below Workspace */}
            <div className="pt-8 border-t border-zinc-200">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-1.5">
                    THEORETICAL FOUNDATION
                  </span>
                  <div className="text-sm sm:text-base font-semibold text-zinc-950 max-w-2xl leading-relaxed">
                    {module.content.introduction}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView('theory')}
                  className="text-xs font-mono font-bold text-zinc-900 hover:text-black flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 group underline underline-offset-2"
                >
                  <span>Read the proof</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>

              {/* Execution Dynamics */}
              <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Observation Focus
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-zinc-950 mb-2">
                    What You Are Observing
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {module.metadata.shortDescription}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                    Execution Dynamics
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-zinc-950 mb-2">
                    Step Lifecycle
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-zinc-600">
                    {module.content.howItWorks.slice(0, 3).map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="font-mono text-[10px] font-bold text-zinc-400 mt-0.5">
                          0{idx + 1}.
                        </span>
                        <div className="flex-1">{step}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
