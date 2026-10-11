import { useState } from 'react';
import { BookOpen, ListOrdered, Bookmark, Lightbulb, ExternalLink } from 'lucide-react';
import { Tabs, TabItem } from './components/Tabs';
import { Card } from './components/Card';
import type { SimulationContent, EducationalReference } from '@nexora-hrittik/sdk';

export type KeyFormula = NonNullable<SimulationContent['keyFormulas']>[number];
export type GuidedInquiry = NonNullable<SimulationContent['guidedInquiries']>[number];

export interface EducationalTabsProps {
  content: SimulationContent;
  simulationId?: string;
}

export const EducationalTabs = ({ content }: EducationalTabsProps) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'how-it-works' | 'deep-dive' | 'references'>('theory');

  const tabs: TabItem[] = [
    { id: 'theory', label: 'Theory & Foundations', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'how-it-works', label: 'Execution Algorithm', icon: <ListOrdered className="w-4 h-4" /> },
    ...(content.guidedInquiries && content.guidedInquiries.length > 0
      ? [{ id: 'deep-dive', label: 'Guided Inquiries', icon: <Lightbulb className="w-4 h-4 text-amber-500" /> }]
      : []),
    ...(content.references && content.references.length > 0
      ? [{ id: 'references', label: 'Academic References', icon: <Bookmark className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <Card className="overflow-hidden bg-white border border-zinc-200 rounded-xl shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as typeof activeTab)}
        />
      </div>

      <div className="p-6">
        {activeTab === 'theory' && (
          <div className="space-y-6 text-sm text-zinc-700 leading-relaxed">
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 font-bold mb-2">
                Concept Overview
              </h4>
              <p className="text-zinc-800 text-sm leading-relaxed whitespace-pre-line">
                {content.introduction}
              </p>
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <h4 className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 font-bold mb-2">
                Mathematical Foundations
              </h4>
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {content.theory}
              </p>
            </div>

            {content.keyFormulas && content.keyFormulas.length > 0 && (
              <div className="border-t border-zinc-200 pt-5">
                <h4 className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 font-bold mb-3">
                  Essential Mathematical Equations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {content.keyFormulas.map((item: KeyFormula, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200 flex flex-col gap-2"
                    >
                      <span className="text-xs font-bold text-zinc-900 font-display">
                        {item.label}
                      </span>
                      <div className="bg-white p-2 border border-zinc-200/80 rounded font-mono text-xs overflow-x-auto flex justify-center text-zinc-900">
                        <code>{item.formula}</code>
                      </div>
                      <span className="text-xs text-zinc-600 leading-normal">
                        {item.explanation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 font-bold mb-3">
              Step-by-Step Execution Lifecycle
            </h4>
            <div className="space-y-2.5">
              {content.howItWorks.map((stepDesc: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 bg-zinc-50/70 rounded-lg border border-zinc-200"
                >
                  <div className="w-5 h-5 rounded bg-zinc-200 text-zinc-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed flex-1">
                    {stepDesc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deep-dive' && content.guidedInquiries && (
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 font-bold mb-3">
              Guided Scientific Inquiries
            </h4>
            <div className="space-y-3">
              {content.guidedInquiries.map((inquiry: GuidedInquiry, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-zinc-50/70 border border-zinc-200 rounded-lg space-y-2 text-xs sm:text-sm"
                >
                  <div className="font-semibold text-zinc-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Inquiry {idx + 1}: {inquiry.question}</span>
                  </div>
                  <div className="p-3 bg-white rounded border border-zinc-200 text-xs text-zinc-700">
                    <strong className="text-zinc-900 block mb-1">Answer / Model Solution:</strong>
                    {inquiry.answer}
                  </div>
                  {inquiry.note && (
                    <p className="text-zinc-500 text-xs italic pl-2">
                      Note: {inquiry.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'references' && content.references && (
          <div className="space-y-4">
            <h4 className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 font-bold mb-3">
              Academic & Technical References
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {content.references.map((ref: EducationalReference, idx: number) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-lg transition-all flex flex-col justify-between gap-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      <span>{ref.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    {ref.description && (
                      <p className="text-xs text-zinc-600 mt-1 leading-normal">
                        {ref.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 truncate">
                    {ref.url}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
