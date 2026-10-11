import { useState } from 'react';
import { Copy, Check, Terminal, Sliders, History } from 'lucide-react';
import { Card } from './components/Card';

export interface StateInspectorProps<TState, TConfig, TStepLog = unknown> {
  state: TState;
  config: TConfig;
  lastStepLog?: TStepLog;
  stepCount: number;
}

export function StateInspector<TState, TConfig, TStepLog = unknown>({
  state,
  config,
  lastStepLog,
  stepCount,
}: StateInspectorProps<TState, TConfig, TStepLog>) {
  const [activeSection, setActiveSection] = useState<'state' | 'config' | 'log'>('state');
  const [copied, setCopied] = useState<boolean>(false);

  const getPayload = () => {
    switch (activeSection) {
      case 'state':
        return state;
      case 'config':
        return config;
      case 'log':
        return lastStepLog ?? { message: 'No step log generated yet' };
    }
  };

  const jsonString = JSON.stringify(getPayload(), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Header and Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 px-4 py-3 bg-zinc-50/80 gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-700" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
            Runtime Telemetry & State Inspector
          </span>
          <span className="text-[10px] font-mono bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full font-bold">
            STEP {String(stepCount).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab selection */}
          <div className="flex bg-zinc-200/60 p-0.5 rounded-lg border border-zinc-200 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveSection('state')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeSection === 'state'
                  ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Terminal className="w-3 h-3" />
              State
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('config')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeSection === 'config'
                  ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sliders className="w-3 h-3" />
              Config
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('log')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeSection === 'log'
                  ? 'bg-white text-zinc-950 font-bold shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <History className="w-3 h-3" />
              Step Log
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy snapshot to clipboard"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg shadow-2xs cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs overflow-auto max-h-[520px] leading-relaxed">
        <pre className="selection:bg-zinc-800">
          <code>{jsonString}</code>
        </pre>
      </div>

      {/* Footer metadata */}
      <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-400">
        <span>INSPECTOR STATUS: ACTIVE</span>
        <span>OBJECT TYPE: {activeSection.toUpperCase()}</span>
      </div>
    </Card>
  );
}
