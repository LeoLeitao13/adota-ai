export const theme = {
  colors: {
    primary: '#FF7A59',
    primaryLight: '#FFF1EC',
    background: '#FFFFFF',
    surface: '#F7F7F8',
    text: '#1C1C1E',
    muted: '#6B7280',
    placeholder: '#9CA3AF',
    border: '#E5E7EB',
    danger: '#E11D48',
    success: '#16A34A',
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 999,
  },
  font: {
    caption: 12,
    label: 13,
    body: 14,
    subtitle: 16,
    title: 24,
    hero: 32,
    logo: 64,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export type Theme = typeof theme;
