import { Badge, Card } from '@portal/ui';
import { usePortal } from '../portal';
import { Link } from 'react-router-dom';

export function CatalogPage() {
  const { journeys } = usePortal();
  const categories = [...new Set(journeys.map((j) => j.category))];

  return (
    <div style={{ display: 'grid', gap: 'var(--portal-space-lg)' }}>
      <h1 style={{ margin: 0 }}>Catálogo de jornadas</h1>
      {categories.map((cat) => (
        <section key={cat}>
          <h2
            style={{
              fontSize: 'var(--portal-font-lg)',
              color: 'var(--portal-color-text-muted)',
            }}
          >
            {cat}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--portal-space-md)',
            }}
          >
            {journeys
              .filter((j) => j.category === cat)
              .map((j) => (
                <Card key={j.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <strong>
                      {j.icon} {j.name}
                    </strong>
                    {j.type === 'legacy' ? (
                      <Badge tone="warning">legado</Badge>
                    ) : (
                      <Badge tone="success">moderno</Badge>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 'var(--portal-font-sm)',
                      color: 'var(--portal-color-text-muted)',
                    }}
                  >
                    {j.description}
                  </p>
                  <Link to={j.route}>Abrir jornada →</Link>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
