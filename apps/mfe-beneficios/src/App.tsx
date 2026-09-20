import { useEffect, useState } from 'react';
import type { MountContext } from '@portal/core';
import { createPortalClient, type Beneficio } from '@portal/api-client';
import { Badge, Button, Card, Spinner } from '@portal/ui';

const tonePorStatus = {
  ATIVO: 'success',
  PENDENTE: 'warning',
  DISPONIVEL: 'info',
} as const;

export function App({ ctx }: { ctx: MountContext }) {
  const [beneficios, setBeneficios] = useState<Beneficio[] | null>(null);
  const client = createPortalClient(ctx.apiBaseUrl, () => ctx.authToken);

  useEffect(() => {
    ctx.telemetry.track('journey_view', { journeyId: 'beneficios' });
    client
      .getBeneficios()
      .then(setBeneficios)
      .catch((e) => ctx.telemetry.error(e, { journeyId: 'beneficios' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const solicitar = (b: Beneficio) => {
    ctx.eventBus.emit('notification:received', {
      id: `sol-${Date.now()}`,
      title: 'Solicitação enviada',
      message: `Adesão ao benefício "${b.nome}" encaminhada para análise.`,
      source: 'mfe-beneficios',
    });
    ctx.eventBus.emit('journey:completed', {
      journeyId: 'beneficios',
      status: 'SUCCESS',
    });
    ctx.telemetry.track('beneficio_solicitado', { beneficioId: b.id });
  };

  if (beneficios === null) return <Spinner label="Carregando benefícios..." />;

  return (
    <div style={{ display: 'grid', gap: 'var(--portal-space-md)' }}>
      {beneficios.map((b) => (
        <Card key={b.id}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--portal-space-md)',
            }}
          >
            <div>
              <strong>{b.nome}</strong>
              <p
                style={{
                  margin: '4px 0 0',
                  color: 'var(--portal-color-text-muted)',
                  fontSize: 'var(--portal-font-sm)',
                }}
              >
                {b.descricao}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge tone={tonePorStatus[b.status]}>{b.status}</Badge>
              {b.status === 'DISPONIVEL' && (
                <Button size="sm" variant="secondary" onPress={() => solicitar(b)}>
                  Solicitar
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
