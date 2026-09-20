import { Navigate, useParams } from 'react-router-dom';
import { usePortal } from '../portal';
import { JourneyHost } from './JourneyHost';
import { LegacyHost } from './LegacyHost';

/**
 * Rota dinâmica de jornada: resolve pelo manifest em runtime.
 * Adicionar uma jornada nova ao portal = nova entrada no manifest
 * do BFF. Nenhuma rota ou import precisa ser criada no shell.
 */
export function JourneyPage() {
  const { id } = useParams();
  const { journeys } = usePortal();
  const journey = journeys.find((j) => j.id === id);

  if (!journey) return <Navigate to="/" replace />;
  if (journey.type === 'legacy') return <LegacyHost journey={journey} />;
  return <JourneyHost journey={journey} />;
}
