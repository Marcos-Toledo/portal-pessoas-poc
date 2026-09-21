/**
 * Entrypoint standalone — permite rodar o MFE isolado (http://localhost:5001)
 * para desenvolvimento da squad sem depender do shell.
 */
import { createRoot } from 'react-dom/client';
import {
  createTelemetry,
  TypedEventBus,
  type MountContext,
} from '@portal/core';
import '@portal/design-tokens/tokens.css';
import '@portal/design-tokens/base.css';
import { App } from './App';

const ctx: MountContext = {
  user: { id: 'dev', name: 'Dev Standalone', roles: ['*'] },
  apiBaseUrl: 'http://localhost:4000',
  authToken: 'dev-token',
  featureFlags: {},
  telemetry: createTelemetry('mfe-ponto:standalone', 'http://localhost:4000'),
  eventBus: TypedEventBus,
};

createRoot(document.getElementById('root')!).render(
  <div
    style={{
      maxWidth: 960,
      margin: '0 auto',
      padding: 'var(--portal-space-lg)',
    }}
  >
    <App ctx={ctx} />
  </div>,
);
