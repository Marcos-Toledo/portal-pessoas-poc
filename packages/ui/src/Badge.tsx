import type { ReactNode } from 'react';

const tones = {
  success: { bg: '#dcfce7', fg: '#166534' },
  warning: { bg: '#fef3c7', fg: '#92400e' },
  info: { bg: '#dbeafe', fg: '#1e40af' },
  neutral: { bg: '#f1f5f9', fg: '#475569' },
};

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  const t = tones[tone];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: 'var(--portal-font-sm)',
        fontWeight: 600,
        background: t.bg,
        color: t.fg,
      }}
    >
      {children}
    </span>
  );
}
