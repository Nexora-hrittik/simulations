import React from 'react';
import { createRoot } from 'react-dom/client';
import { SimulationPreviewHarness } from '@rec-labs/sdk';
import { binarySearchSimulation } from './index';
import './index.css';

export function DevApp() {
  return <SimulationPreviewHarness module={binarySearchSimulation} />;
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <DevApp />
    </React.StrictMode>
  );
}
