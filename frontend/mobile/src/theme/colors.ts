/**
 * App Theme Colors
 * 
 * Centralized color scheme for the app
 */

export const colors = {
  // Primary colors
  primary: '#6366f1', // Indigo
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Safety colors
  danger: '#ef4444', // Red
  dangerDark: '#dc2626',
  warning: '#f59e0b', // Amber
  success: '#10b981', // Green
  info: '#3b82f6', // Blue
  
  // Background colors
  background: '#0f172a', // Slate 900
  backgroundSecondary: '#1e293b', // Slate 800
  backgroundTertiary: '#334155', // Slate 700
  
  // Text colors
  text: '#f1f5f9', // Slate 100
  textSecondary: '#cbd5e1', // Slate 300
  textTertiary: '#94a3b8', // Slate 400
  
  // Border colors
  border: '#334155', // Slate 700
  borderLight: '#475569', // Slate 600
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Risk level colors
  riskHigh: 'rgba(239, 68, 68, 0.7)', // Red
  riskMediumHigh: 'rgba(245, 158, 11, 0.6)', // Amber
  riskMedium: 'rgba(251, 191, 36, 0.5)', // Yellow
  riskLow: 'rgba(16, 185, 129, 0.4)', // Green
  
  // White and black
  white: '#ffffff',
  black: '#000000',
};

export type ColorKey = keyof typeof colors;



