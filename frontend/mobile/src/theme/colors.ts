/**
 * App Theme Colors — SafeNaari (light blue theme)
 * Light, clean theme for women safety app
 */

export const colors = {
  // Primary — light blue
  primary: '#5B9BD5',
  primaryDark: '#4A8BC7',
  primaryLight: '#7BB3E3',

  // Safety colors
  danger: '#ef4444',
  dangerDark: '#dc2626',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#5B9BD5',

  // Backgrounds — light
  background: '#F5F7FA',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#E8ECF1',

  // Text
  text: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',

  // Border
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Risk level colors (for heatmap legend etc.)
  riskHigh: 'rgba(239, 68, 68, 0.7)',
  riskMediumHigh: 'rgba(245, 158, 11, 0.6)',
  riskMedium: 'rgba(251, 191, 36, 0.5)',
  riskLow: 'rgba(16, 185, 129, 0.4)',

  white: '#ffffff',
  black: '#000000',
};

export type ColorKey = keyof typeof colors;
