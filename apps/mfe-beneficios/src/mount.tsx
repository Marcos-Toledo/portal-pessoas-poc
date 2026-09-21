import { createRoot } from 'react-dom/client';
import type { MountContext, MountedJourney } from '@portal/core';
import '@portal/design-tokens/tokens.css';
import '@portal/design-tokens/base.css';
import { App } from './App';

export function mount(el: HTMLElement, ctx: MountContext): MountedJourney {
  const root = createRoot(el);
  root.render(<App ctx={ctx} />);
  return {
    unmount: () => root.unmount(),
  };
}
