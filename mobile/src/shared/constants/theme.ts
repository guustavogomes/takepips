/**
 * Shared - Theme Constants
 * 
 * Cores e estilos globais do app
 */

export const theme = {
  colors: {
    primary: '#4A90E2',
    secondary: '#2ECC71',
    danger: '#E74C3C',
    warning: '#FFA500',
    background: '#0A0E27',
    surface: '#1A1F3A',
    surfaceVariant: '#2A2F4A',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#2A2F4A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
};
