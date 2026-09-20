/**
 * Event Bus tipado do portal.
 *
 * Decisão arquitetural: comunicação entre Shell e MFEs (e entre MFEs)
 * nunca acontece via estado global compartilhado ou imports cruzados.
 * Todos os eventos são contratos versionados neste pacote.
 *
 * Implementação: emitter in-process próprio (não DOM EventTarget) para
 * rodar identico no browser e no Hermes/React Native — que não expõe
 * EventTarget global. Em produção, os payloads seriam validados em
 * runtime com JSON Schema ou Zod: tipos TS sozinhos não protegem
 * fronteiras entre versões diferentes de pacotes.
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

type AnyHandler = (detail: unknown) => void;

const listeners = new Map<keyof PortalEventMap, Set<AnyHandler>>();

export class TypedEventBus {
  static emit<K extends keyof PortalEventMap>(
    event: K,
    detail: PortalEventMap[K],
  ): void {
    listeners.get(event)?.forEach((handler) => handler(detail));
  }

  static on<K extends keyof PortalEventMap>(
    event: K,
    handler: (detail: PortalEventMap[K]) => void,
  ): () => void {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    const h = handler as AnyHandler;
    set.add(h);
    return () => {
      set.delete(h);
    };
  }
}
