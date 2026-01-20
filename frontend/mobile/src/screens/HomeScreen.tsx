/**
 * Home Screen
 * 
 * Main screen with safety heatmap
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// Import fallback component (works on all platforms, no MapView dependency)
import HeatmapMapFallback from '../components/HeatmapMapFallback';

// Conditionally import HeatmapMap - Metro will automatically use platform-specific files
// .ios.tsx for iOS, .android.tsx for Android
let HeatmapMap: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    // Try to load platform-specific map component
    if (Platform.OS === 'android') {
      HeatmapMap = require('../components/HeatmapMap.android').default;
    } else if (Platform.OS === 'ios') {
      HeatmapMap = require('../components/HeatmapMap.ios').default;
    }
  } catch (e) {
    // Not available - will use fallback
    console.warn('HeatmapMap not available, using fallback:', e);
  }
}

type HomeScreenRouteProp = RouteProp<{ params?: { panToLocation?: { latitude: number; longitude: number } } }, 'params'>;

export default function HomeScreen() {
  // Use map view by default, fallback to list only if map fails
  const [mapAvailable, setMapAvailable] = useState(true);
  const route = useRoute<HomeScreenRouteProp>();
  
  // Get location to pan to from route params (e.g., from report submission)
  const panToLocation = route.params?.panToLocation || null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Safety Heatmap</Text>
        <Text style={styles.subtitle}>Real-time risk assessment</Text>
        {Platform.OS === 'android' && !HeatmapMap && (
          <Text style={styles.androidNote}>
            Add Google Maps API key to app.json to enable map view
          </Text>
        )}
      </View>
      
      <View style={styles.mapContainer}>
        {!HeatmapMap || !mapAvailable ? (
          <HeatmapMapFallback radius={10000} gridSize={200} />
        ) : (
          <HeatmapMap 
            radius={10000} 
            gridSize={200}
            panToLocation={panToLocation}
            onError={() => {
              console.warn('Map component error, switching to fallback');
              setMapAvailable(false);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
  },
  androidNote: {
    marginTop: spacing.sm,
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
  },
});

