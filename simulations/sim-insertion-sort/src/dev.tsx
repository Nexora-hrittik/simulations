import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { SimulationPreviewHarness } from './harness/SimulationPreviewHarness';
import { templateSimulation } from './index';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimulationPreviewHarness module={templateSimulation} />
  </StrictMode>
);
