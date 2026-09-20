import { useState } from 'react';
import { usePortal } from '../portal';

/** Painel de notificações alimentado pelo BFF + Event Bus em runtime. */
export function NotificationsPanel() {
  const { notifications } = usePortal();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        aria-label={`Notificações (${unread} não lidas)`}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid var(--portal-color-border)',
          borderRadius: 'var(--portal-radius-md)',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'var(--portal-color-danger)',
              color: '#fff',
              borderRadius: '999px',
              fontSize: 11,
              padding: '1px 6px',
              fontWeight: 700,
            }}
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            width: 340,
            maxHeight: 400,
            overflow: 'auto',
            background: 'var(--portal-color-surface)',
            border: '1px solid var(--portal-color-border)',
            borderRadius: 'var(--portal-radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,.12)',
            zIndex: 50,
          }}
        >
          {notifications.length === 0 ? (
            <p style={{ padding: 16, color: 'var(--portal-color-text-muted)' }}>
              Sem notificações.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--portal-color-border)',
                  opacity: n.read ? 0.6 : 1,
                }}
              >
                <strong style={{ fontSize: 'var(--portal-font-sm)' }}>
                  {n.title}
                </strong>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 'var(--portal-font-sm)',
                    color: 'var(--portal-color-text-muted)',
                  }}
                >
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
