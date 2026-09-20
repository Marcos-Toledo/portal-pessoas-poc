import { useEffect, useRef } from 'react';
import type { JourneyManifestEntry } from '@portal/core';
import { usePortal } from '../portal';

/**
 * Encapsulador de legado (Strangler Fig):
 * renderiza o sistema antigo num iframe sandboxed em outra origem e
 * faz a ponte via postMessage com contrato tipado. O token SSO só é
 * injetado depois do handshake LEGACY_READY — nunca via query string.
 */
export function LegacyHost({ journey }: { journey: JourneyManifestEntry }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { mountContext } = usePortal();

  useEffect(() => {
    if (!journey.legacyUrl) return;
    const legacyOrigin = new URL(journey.legacyUrl).origin;

    const handler = (event: MessageEvent) => {
      if (event.origin !== legacyOrigin) return;
      const data = event.data as { type?: string; payload?: string };
      switch (data?.type) {
        case 'LEGACY_READY':
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'SHELL_AUTH_TOKEN',
              payload: { token: mountContext.authToken },
              timestamp: Date.now(),
            },
            legacyOrigin,
          );
          break;
        case 'LEGACY_NAVIGATION':
          window.history.replaceState(
            null,
            '',
            `${journey.route}${data.payload ?? ''}`,
          );
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [journey, mountContext.authToken]);

  return (
    <div>
      <p
        style={{
          fontSize: 'var(--portal-font-sm)',
          color: 'var(--portal-color-text-muted)',
          marginTop: 0,
        }}
      >
        Jornada servida pelo sistema legado, encapsulada no Shell (Strangler
        Fig).
      </p>
      <iframe
        ref={iframeRef}
        title={journey.name}
        src={journey.legacyUrl}
        sandbox="allow-scripts allow-same-origin allow-forms"
        style={{
          width: '100%',
          height: '70vh',
          border: '1px solid var(--portal-color-border)',
          borderRadius: 'var(--portal-radius-md)',
          background: '#fff',
        }}
      />
    </div>
  );
}
