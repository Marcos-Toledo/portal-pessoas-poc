/**
 * Event Bus tipado do portal.
 *
 * Decisão arquitetural: comunicação entre Shell e MFEs (e entre MFEs)
 * nunca acontece via estado global compartilhado ou imports cruzados.
 * Todos os eventos são contratos versionados neste pacote.
 *
 * Em produção, os payloads seriam validados em runtime com JSON Schema
 * ou Zod — tipos TS sozinhos não protegem fronteiras entre versões
 * diferentes de pacotes.
 */
export type PortalEventMap = {
  'notification:received': {
    id: string;
    title: string;
    message: string;
    source: string;
  };
  'journey:navigate': { path: string };
  'journey:completed': { journeyId: string; status: 'SUCCESS' | 'FAILED' };
  'ponto:registrado': { timestamp: string; tipo: 'ENTRADA' | 'SAIDA' };
  'session:logout': { reason: string };
};

export class TypedEventBus {
  private static target = new EventTarget();

  static emit<K extends keyof PortalEventMap>(
    event: K,
    detail: PortalEventMap[K],
  ): void {
    this.target.dispatchEvent(new CustomEvent(event, { detail }));
  }

  static on<K extends keyof PortalEventMap>(
    event: K,
    handler: (detail: PortalEventMap[K]) => void,
  ): () => void {
    const listener = (e: Event) =>
      handler((e as CustomEvent<PortalEventMap[K]>).detail);
    this.target.addEventListener(event, listener);
    return () => this.target.removeEventListener(event, listener);
  }
}
