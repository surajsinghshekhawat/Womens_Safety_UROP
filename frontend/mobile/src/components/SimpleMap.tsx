/**
 * Simple Map Component (Fallback)
 * 
 * A simpler map implementation that avoids react-native-maps issues
 * Can be used as fallback if main map has problems
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface SimpleMapProps {
  latitude: number;
  longitude: number;
}

export default function SimpleMap({ latitude, longitude }: SimpleMapProps) {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.text}>🗺️ Map View</Text>
        <Text style={styles.coords}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
        <Text style={styles.note}>
          Map will be displayed here{'\n'}
          (Using fallback view due to map configuration)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  text: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  coords: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
  note: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});



