import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SimulationPreviewHarness } from '../src/harness/SimulationPreviewHarness';
import { templateSimulation } from '../src/index';

describe('SimulationPreviewHarness Visual & Accessibility Invariants', () => {
  const html = renderToString(<SimulationPreviewHarness module={templateSimulation} />);

  it('renders breadcrumb with proper accessibility and typography hierarchy', () => {
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('Home');
    expect(html).toContain('Algorithms');
    expect(html).toContain('Insertion Sort');
    expect(html).toContain('text-zinc-500');
  });

  it('renders main simulation heading matching official platform page-title styling', () => {
    expect(html).toContain('font-display');
    expect(html).toContain('font-bold');
    expect(html).toContain('tracking-tight');
    expect(html).toContain('text-2xl sm:text-4xl');
    expect(html).toContain('Insertion Sort');
  });

  it('renders icon-only segmented controls for Experiment, Theory, and Inspector without visible text', () => {
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Simulation Views"');

    // Controls must have accessible labels
    expect(html).toContain('aria-label="Experiment"');
    expect(html).toContain('aria-label="Theory"');
    expect(html).toContain('aria-label="Inspector"');

    // Controls must have tooltips/titles
    expect(html).toContain('title="Experiment"');
    expect(html).toContain('title="Theory"');
    expect(html).toContain('title="Inspector"');

    // Controls must have tab semantics
    expect(html).toContain('id="tab-experiment"');
    expect(html).toContain('id="tab-theory"');
    expect(html).toContain('id="tab-inspector"');

    // Tab buttons must NOT contain visible text spans
    expect(html).not.toContain('<span class="hidden sm:inline">Experiment</span>');
    expect(html).not.toContain('<span class="hidden sm:inline">Theory</span>');
    expect(html).not.toContain('<span class="hidden sm:inline">Inspector</span>');

    // Buttons must have standardized pill dimensions h-7 w-7 rounded-full
    expect(html).toContain('h-7 w-7 rounded-full');
  });

  it('renders two-column workspace on desktop with canvas on left and controls on right', () => {
    expect(html).toContain('simulation-workspace');
    expect(html).toContain('simulation-canvas');
    expect(html).toContain('simulation-sidebar');
    // Canvas container uses exactly 20px inner padding (p-5)
    expect(html).toContain('simulation-canvas"><div class="p-5');
  });

  it('renders ExecutionToolbar with accessible icon buttons and speed selector', () => {
    expect(html).toContain('aria-label="Start execution"');
    expect(html).toContain('aria-label="Execute single step"');
    expect(html).toContain('aria-label="Reset simulation to initial state"');
    expect(html).toContain('aria-label="Select playback speed"');
  });

  it('renders theoretical foundation section with official "Read the proof" CTA and symmetric grid', () => {
    expect(html).toContain('THEORETICAL FOUNDATION');
    expect(html).toContain('Read the proof');
    expect(html).toContain('Observation Focus');
    expect(html).toContain('Execution Dynamics');
    expect(html).toContain('grid grid-cols-1 md:grid-cols-2 gap-8');
    expect(html).toContain(templateSimulation.content.introduction);
    expect(html).toContain(templateSimulation.metadata.shortDescription);
  });

  it('does not render upper success banner and renders Understand Why button in canvas complete row', () => {
    expect(html).not.toContain('Simulation Complete: Array Successfully Sorted!');

    const completedState = {
      ...templateSimulation.createInitialState(templateSimulation.defaultConfig),
      isComplete: true,
      phase: 'complete' as const,
      message: 'Simulation Complete! All elements sorted.',
    };
    const completedCanvasHtml = renderToString(
      <templateSimulation.Visualization
        state={completedState}
        config={templateSimulation.defaultConfig}
        isRunning={false}
        stepCount={10}
        speedMs={300}
        onUpdateState={() => {}}
      />
    );
    expect(completedCanvasHtml).toContain('Understand Why');
  });
});

describe('Simulation Metadata & Taxonomy Conformance', () => {
  it('declares valid metadata conforming to SDK and canonical topic taxonomy', async () => {
    const { validateSimulationMetadata } = await import('../scripts/validate-metadata.js');
    const res = validateSimulationMetadata(templateSimulation.metadata);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.derivedCategory).toBe('Algorithms');
  });

  it('rejects invalid or arbitrary topicId values with actionable error', async () => {
    const { validateSimulationMetadata } = await import('../scripts/validate-metadata.js');
    const res = validateSimulationMetadata({
      ...templateSimulation.metadata,
      topicId: 'arbitrary-topic',
    });
    expect(res.valid).toBe(false);
    expect(res.errors.some((err: string) => err.includes('Unsupported topicId "arbitrary-topic"'))).toBe(true);
  });
});

describe('EducationalTabs Content & Resilience Invariants', () => {
  it('renders all tabs and sections correctly with complete content', async () => {
    const { EducationalTabs } = await import('../src/harness/EducationalTabs');
    const html = renderToString(<EducationalTabs content={templateSimulation.content} />);
    expect(html).toContain('Theory &amp; Foundations');
    expect(html).toContain('Execution Algorithm');
    expect(html).toContain('Essential Mathematical Equations');
    expect(html).toContain(templateSimulation.content.theory);
  });

  it('renders safely when optional content arrays are absent or empty', async () => {
    const { EducationalTabs } = await import('../src/harness/EducationalTabs');
    const minimalContent = {
      introduction: 'Minimal intro',
      theory: 'Minimal theory',
      howItWorks: ['Step 1'],
      references: [],
    };
    const html = renderToString(<EducationalTabs content={minimalContent} />);
    expect(html).toContain('Minimal intro');
    expect(html).toContain('Minimal theory');
    expect(html).not.toContain('Essential Mathematical Equations');
    expect(html).not.toContain('Guided Inquiries');
  });
});

