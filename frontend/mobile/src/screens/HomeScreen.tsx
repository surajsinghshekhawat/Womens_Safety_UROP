/**
 * Home Screen — SafeNaari
 * Main screen with safety heatmap. Map logic unchanged.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ShieldIcon, InfoIcon, LocationIcon, NavigateIcon } from '../components/AppIcons';
import HeatmapMapFallback from '../components/HeatmapMapFallback';

let HeatmapMap: any = null;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    if (Platform.OS === 'android') {
      HeatmapMap = require('../components/HeatmapMap.android').default;
    } else if (Platform.OS === 'ios') {
      HeatmapMap = require('../components/HeatmapMap.ios').default;
    }
  } catch (e) {
    console.warn('HeatmapMap not available, using fallback:', e);
  }
}

type HomeScreenRouteProp = RouteProp<{ params?: { panToLocation?: { latitude: number; longitude: number } } }, 'params'>;

export default function HomeScreen() {
  const [mapAvailable, setMapAvailable] = useState(true);
  const route = useRoute<HomeScreenRouteProp>();
  const navigation = useNavigation();
  const panToLocation = route.params?.panToLocation || null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* SafeNaari header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShieldIcon size={28} />
          <View>
            <Text style={styles.title}>SafeNaari</Text>
            <Text style={styles.subtitle}>Your safety companion</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoButton} onPress={() => {}} accessibleLabel="Info">
          <InfoIcon size={22} />
        </TouchableOpacity>
      </View>

      {/* Map — same component and props, no changes to behaviour */}
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

        {/* Risk levels legend — over map */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Risk Levels</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.riskLow }]} />
            <Text style={styles.legendLabel}>Low</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.riskMedium }]} />
            <Text style={styles.legendLabel}>Medium</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.riskMediumHigh }]} />
            <Text style={styles.legendLabel}>High</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.riskHigh }]} />
            <Text style={styles.legendLabel}>Critical</Text>
          </View>
        </View>
      </View>

      {/* Bottom card: location + Plan Safe Route */}
      <View style={styles.bottomCard}>
        <View style={styles.locationRow}>
          <LocationIcon size={20} />
          <View>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationAddress}>Connaught Place, New Delhi</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.planRouteButton}
          onPress={() => navigation.navigate('Routes' as never)}
          activeOpacity={0.8}
        >
          <NavigateIcon size={20} color={colors.white} />
          <Text style={styles.planRouteText}>Plan Safe Route</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'android' && !HeatmapMap && (
        <Text style={styles.androidNote}>Add Google Maps API key to app.json to enable map view</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  legendCard: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  bottomCard: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  locationAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  planRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  planRouteIcon: {
    fontSize: 18,
  },
  planRouteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  androidNote: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
