import { useEffect, useRef, useState } from 'react';
import type { JourneyManifestEntry, MountedJourney } from '@portal/core';
import { Spinner } from '@portal/ui';
import { loadJourneyModule, registerJourneyRemote } from '../federation';
import { usePortal } from '../portal';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Carrega um MFE em runtime (Plugin Registry) e executa o contrato
 * mount(el, ctx). O shell não importa nenhum código da jornada —
 * apenas o contrato em @portal/core.
 */
function JourneyHostInner({ journey }: { journey: JourneyManifestEntry }) {
  const ref = useRef<HTMLDivElement>(null);
  const { mountContext } = usePortal();
  const [error, setError] = useState<Error | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted: MountedJourney | undefined;
    let cancelled = false;
    setReady(false);
    setError(null);

    (async () => {
      try {
        registerJourneyRemote(journey);
        const mod = await loadJourneyModule(journey);
        if (cancelled || !ref.current) return;
        mounted = mod.mount(ref.current, mountContext);
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e as Error);
        mountContext.telemetry.error(e as Error, {
          journeyId: journey.id,
          phase: 'remote-load',
        });
      }
    })();

    return () => {
      cancelled = true;
      mounted?.unmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey.id]);

  return (
    <>
      {error && (
        <div
          style={{
            border: '1px solid var(--portal-color-danger)',
            borderRadius: 'var(--portal-radius-lg)',
            padding: 'var(--portal-space-lg)',
            background: '#fef2f2',
          }}
        >
          <strong>Falha ao carregar a jornada "{journey.name}".</strong>
          <p style={{ color: 'var(--portal-color-text-muted)' }}>
            {error.message}
          </p>
        </div>
      )}
      {!ready && !error && <Spinner label={`Carregando ${journey.name}...`} />}
      <div ref={ref} style={{ display: ready ? 'block' : 'none' }} />
    </>
  );
}

export function JourneyHost({ journey }: { journey: JourneyManifestEntry }) {
  return (
    <ErrorBoundary journeyId={journey.id}>
      <JourneyHostInner journey={journey} />
    </ErrorBoundary>
  );
}
