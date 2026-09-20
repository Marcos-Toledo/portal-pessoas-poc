export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div
      role="status"
      style={{
        padding: 'var(--portal-space-xl)',
        color: 'var(--portal-color-text-muted)',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
}
