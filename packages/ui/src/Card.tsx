import type { ReactNode } from 'react';

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div
      style={{
        background: 'var(--portal-color-surface)',
        border: '1px solid var(--portal-color-border)',
        borderRadius: 'var(--portal-radius-lg)',
        padding: 'var(--portal-space-lg)',
      }}
    >
      {title && (
        <h3 style={{ margin: '0 0 var(--portal-space-md)', fontSize: 'var(--portal-font-lg)' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
