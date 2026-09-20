import type { Telemetry } from './contracts';

/**
 * Telemetria mínima da POC: log estruturado no console + envio ao BFF.
 * Em produção: Datadog RUM / OpenTelemetry + Sentry por MFE (DSN próprio).
 */
export function createTelemetry(source: string, apiBaseUrl: string): Telemetry {
  const emit = (level: string, event: string, props: Record<string, unknown>) => {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      source,
      event,
      ...props,
    };
    // eslint-disable-next-line no-console
    console[level === 'ERROR' ? 'error' : 'debug']('[telemetry]', payload);
    fetch(`${apiBaseUrl}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  };

  return {
    track: (event, props = {}) => emit('INFO', event, props),
    error: (error, context = {}) =>
      emit('ERROR', 'unhandled_error', {
        message: error.message,
        stack: error.stack,
        ...context,
      }),
  };
}
