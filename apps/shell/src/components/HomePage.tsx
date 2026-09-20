import { Link } from 'react-router-dom';
import { Badge, Card } from '@portal/ui';
import { usePortal } from '../portal';

export function HomePage() {
  const { user, journeys } = usePortal();

  return (
    <div style={{ display: 'grid', gap: 'var(--portal-space-lg)' }}>
      <div>
        <h1 style={{ marginBottom: 4 }}>
          Olá, {user?.name?.split(' ')[0] ?? 'colaborador'} 👋
        </h1>
        <p style={{ color: 'var(--portal-color-text-muted)', margin: 0 }}>
          O que você precisa fazer hoje?
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--portal-space-md)',
        }}
      >
        {journeys.map((j) => (
          <Link
            key={j.id}
            to={j.route}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card>
              <div style={{ fontSize: 28 }}>{j.icon}</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  margin: '8px 0 4px',
                }}
              >
                <strong>{j.name}</strong>
                {j.type === 'legacy' ? (
                  <Badge tone="warning">legado</Badge>
                ) : (
                  <Badge tone="success">novo</Badge>
                )}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--portal-font-sm)',
                  color: 'var(--portal-color-text-muted)',
                }}
              >
                {j.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
