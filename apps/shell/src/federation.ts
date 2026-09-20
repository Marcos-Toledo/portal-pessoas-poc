/**
 * Camada de federação do shell.
 *
 * Registra e carrega MFEs dinamicamente a partir do manifest (Journey
 * Registry) servido pelo BFF. Em produção o `entry` apontaria para a CDN
 * interna versionada (ex.: /mfe-ponto/1.4.2/remoteEntry.js), permitindo
 * rollback trocando apenas o manifest.
 */
import {
  getInstance,
  init,
  loadRemote,
  registerRemotes,
} from '@module-federation/runtime';
import type {
  JourneyManifestEntry,
  MountContext,
  MountedJourney,
} from '@portal/core';

interface JourneyModule {
  mount: (el: HTMLElement, ctx: MountContext) => MountedJourney;
}

export function ensureFederationHost(): void {
  if (!getInstance()) {
    init({ name: 'portalShell', remotes: [] });
  }
}

export function registerJourneyRemote(journey: JourneyManifestEntry): void {
  if (journey.type !== 'mfe' || !journey.remote) return;
  registerRemotes(
    [{ name: journey.remote.name, entry: journey.remote.entry, type: 'module' }],
    { force: true },
  );
}

export async function loadJourneyModule(
  journey: JourneyManifestEntry,
): Promise<JourneyModule> {
  if (journey.type !== 'mfe' || !journey.remote) {
    throw new Error(`Jornada "${journey.id}" não é um microfrontend.`);
  }
  const exposed = journey.remote.module.replace(/^\.\//, '');
  const mod = await loadRemote<JourneyModule>(
    `${journey.remote.name}/${exposed}`,
  );
  if (!mod || typeof mod.mount !== 'function') {
    throw new Error(
      `MFE "${journey.remote.name}" não expõe o contrato mount(el, ctx).`,
    );
  }
  return mod;
}
