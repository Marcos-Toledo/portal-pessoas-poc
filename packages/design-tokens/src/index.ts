/**
 * Design Tokens do Portal Pessoas.
 * Fonte única de verdade para cor, tipografia e espaçamento.
 * Em produção: gerado por Style Dictionary -> CSS vars + TS + RN StyleSheet.
 */

export const colors = {
  primary: '#1d4ed8',
  primaryHover: '#1e40af',
  secondary: '#475569',
  danger: '#dc2626',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  success: '#16a34a',
  warning: '#d97706',
} as const;

// Numéricos para RN (StyleSheet) — no web, os mesmos valores saem
// como px via tokens.css (CSS custom properties).
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
} as const;

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  sizeSm: '13px',
  sizeMd: '15px',
  sizeLg: '18px',
  sizeXl: '24px',
} as const;

export const tokens = { colors, spacing, radius, typography } as const;
export type Tokens = typeof tokens;
