import { NavLink, Outlet } from 'react-router-dom';
import { Badge } from '@portal/ui';
import { usePortal } from '../portal';
import { NotificationsPanel } from './NotificationsPanel';
import { SearchBar } from './SearchBar';

/**
 * Moldura estrutural do portal: header, navegação e rodapé pertencem ao
 * shell. Jornadas (modernas ou legadas) ocupam apenas a área de conteúdo.
 */
export function Layout() {
  const { journeys, user } = usePortal();

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 'var(--portal-radius-md)',
    textDecoration: 'none',
    fontSize: 'var(--portal-font-md)',
    color: isActive ? 'var(--portal-color-primary)' : 'var(--portal-color-text)',
    background: isActive ? 'var(--portal-color-surface-alt)' : 'transparent',
    fontWeight: isActive ? 600 : 400,
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--portal-font-family)',
        color: 'var(--portal-color-text)',
        background: 'var(--portal-color-surface-alt)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--portal-space-lg)',
          padding: '12px var(--portal-space-lg)',
          background: 'var(--portal-color-surface)',
          borderBottom: '1px solid var(--portal-color-border)',
        }}
      >
        <strong style={{ fontSize: 'var(--portal-font-lg)' }}>
          Portal Pessoas
        </strong>
        <SearchBar />
        <div style={{ flex: 1 }} />
        <NotificationsPanel />
        <span style={{ fontSize: 'var(--portal-font-sm)' }}>
          {user?.name ?? '...'}
        </span>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <nav
          style={{
            width: 240,
            padding: 'var(--portal-space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <NavLink to="/" end style={linkStyle}>
            🏠 Home
          </NavLink>
          <NavLink to="/catalogo" style={linkStyle}>
            🧭 Catálogo de jornadas
          </NavLink>
          <div
            style={{
              margin: 'var(--portal-space-md) 0 4px',
              fontSize: 'var(--portal-font-sm)',
              color: 'var(--portal-color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Jornadas
          </div>
          {journeys.map((j) => (
            <NavLink key={j.id} to={j.route} style={linkStyle}>
              <span>{j.icon}</span>
              <span style={{ flex: 1 }}>{j.name}</span>
              {j.type === 'legacy' && <Badge tone="warning">legado</Badge>}
            </NavLink>
          ))}
        </nav>

        <main style={{ flex: 1, padding: 'var(--portal-space-lg)' }}>
          <Outlet />
        </main>
      </div>

      <footer
        style={{
          padding: 'var(--portal-space-md)',
          textAlign: 'center',
          fontSize: 'var(--portal-font-sm)',
          color: 'var(--portal-color-text-muted)',
        }}
      >
        Portal Pessoas — POC de arquitetura (microfrontends + Strangler Fig)
      </footer>
    </div>
  );
}
