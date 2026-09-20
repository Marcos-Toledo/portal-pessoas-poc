/**
 * Contrato de entrada do microfrontend.
 *
 * O MFE expõe `mount(el, ctx)` em vez de um componente React:
 *  - o shell não acopla no framework interno do MFE;
 *  - a jornada pode ser migrada de stack no futuro sem tocar o shell;
 *  - o contexto (user, token, flags, telemetry, eventBus) é injetado,
 *    nunca importado globalmente.
 */
import { createRoot } from 'react-dom/client';
import type { MountContext, MountedJourney } from '@portal/core';
import '@portal/design-tokens/tokens.css';
import { App } from './App';

export function mount(el: HTMLElement, ctx: MountContext): MountedJourney {
  const root = createRoot(el);
  root.render(<App ctx={ctx} />);
  return {
    unmount: () => root.unmount(),
  };
}
