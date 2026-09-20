import type { CSSProperties, ReactNode } from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress: () => void;
  children: ReactNode;
}

const paddings = { sm: '6px 12px', md: '10px 16px', lg: '14px 22px' };

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  onPress,
  children,
}: ButtonProps) {
  const palette: Record<string, CSSProperties> = {
    primary: { background: 'var(--portal-color-primary)', color: '#fff' },
    secondary: {
      background: 'var(--portal-color-surface-alt)',
      color: 'var(--portal-color-text)',
      border: '1px solid var(--portal-color-border)',
    },
    danger: { background: 'var(--portal-color-danger)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--portal-color-primary)' },
  };

  return (
    <button
      disabled={disabled}
      onClick={onPress}
      style={{
        fontFamily: 'var(--portal-font-family)',
        fontSize: 'var(--portal-font-md)',
        padding: paddings[size],
        border: 'none',
        borderRadius: 'var(--portal-radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontWeight: 600,
        ...palette[variant],
      }}
    >
      {children}
    </button>
  );
}
