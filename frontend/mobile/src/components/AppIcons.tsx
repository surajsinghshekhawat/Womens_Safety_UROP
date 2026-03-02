/**
 * App icons — Ionicons from @expo/vector-icons
 * Use these instead of emojis for consistent look across devices.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';

interface IconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
  style?: object;
}

export function AppIcon({ name, size = 24, color = colors.text, style }: IconProps) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}

/** Shield — app logo / SafeNaari */
export function ShieldIcon({ size = 28, color = colors.primary }: { size?: number; color?: string }) {
  return <Ionicons name="shield-checkmark" size={size} color={color} />;
}

/** Info circle */
export function InfoIcon({ size = 22, color = colors.primary }: { size?: number; color?: string }) {
  return <Ionicons name="information-circle" size={size} color={color} />;
}

/** Location pin */
export function LocationIcon({ size = 20, color = colors.primary }: { size?: number; color?: string }) {
  return <Ionicons name="location" size={size} color={color} />;
}

/** Navigate / route / plane */
export function NavigateIcon({ size = 20, color = colors.white }: { size?: number; color?: string }) {
  return <Ionicons name="navigate" size={size} color={color} />;
}

/** Alert / warning */
export function AlertIcon({ size = 28, color = colors.danger }: { size?: number; color?: string }) {
  return <Ionicons name="alert-circle" size={size} color={color} />;
}

/** Phone / call */
export function CallIcon({ size = 22, color = colors.primary }: { size?: number; color?: string }) {
  return <Ionicons name="call" size={size} color={color} />;
}

/** Trash / delete */
export function TrashIcon({ size = 20, color = colors.textSecondary }: { size?: number; color?: string }) {
  return <Ionicons name="trash-outline" size={size} color={color} />;
}

/** Document */
export function DocumentIcon({ size = 20, color = colors.white }: { size?: number; color?: string }) {
  return <Ionicons name="document-text" size={size} color={color} />;
}

/** Map */
export function MapIcon({ size = 20, color = colors.primary }: { size?: number; color?: string }) {
  return <Ionicons name="map" size={size} color={color} />;
}

/** Open external (e.g. Google Maps) */
export function OpenIcon({ size = 18, color = colors.primary }: { size?: number; color?: string }) {
  return <Ionicons name="open-outline" size={size} color={color} />;
}

/** Close / clear (X) */
export function CloseIcon({ size = 22, color = colors.textSecondary }: { size?: number; color?: string }) {
  return <Ionicons name="close" size={size} color={color} />;
}

/** Video */
export function VideocamIcon({ size = 20, color = colors.textSecondary }: { size?: number; color?: string }) {
  return <Ionicons name="videocam-outline" size={size} color={color} />;
}

/** Tab bar icon wrapper */
export function TabBarIcon({
  name,
  focused,
  size = 24,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  size?: number;
}) {
  return (
    <Ionicons
      name={name}
      size={size}
      color={focused ? colors.primary : colors.textTertiary}
    />
  );
}

export default Ionicons;
