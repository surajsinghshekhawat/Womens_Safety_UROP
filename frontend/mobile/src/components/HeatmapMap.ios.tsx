/**
 * Heatmap Map Component (iOS Only)
 * 
 * iOS-specific version that uses react-native-maps
 * Android/Web versions should use HeatmapMapFallback instead
 * 
 * @author Women Safety Analytics Team
 * @version 2.0.0
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { fetchHeatmap, HeatmapCell, HeatmapData } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface HeatmapMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  radius?: number;
  gridSize?: number;
  onError?: () => void;
}

const HeatmapMap: React.FC<HeatmapMapProps> = ({
  initialLatitude = 13.0827,
  initialLongitude = 80.2707,
  radius = 1000,
  gridSize = 100,
  onError,
}) => {
  // Default to Chennai center, not user location (to show all incidents)
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied. Using Chennai center.');
          setLoading(false);
          // Use Chennai center as default
          setLocation({
            latitude: 13.0827, // Chennai center
            longitude: 80.2707,
          });
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        // Store user location for marker
        setUserLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        
        // Center map on Chennai to show all incident data
        const chennaiCenter = {
          latitude: 13.0827,
          longitude: 80.2707,
        };
        setLocation(chennaiCenter);

        mapRef.current?.animateToRegion({
          latitude: chennaiCenter.latitude,
          longitude: chennaiCenter.longitude,
          latitudeDelta: 0.15, // Wider view to show more of Chennai
          longitudeDelta: 0.15,
        });
      } catch (err) {
        console.error('Error getting location:', err);
        // Default to Chennai center
        setLocation({
          latitude: 13.0827,
          longitude: 80.2707,
        });
      }
    })();
  }, []);

  useEffect(() => {
    loadHeatmap();
  }, [location.latitude, location.longitude, radius, gridSize]);

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchHeatmap(
        location.latitude,
        location.longitude,
        radius,
        gridSize
      );

      if (response.success && response.heatmap) {
        console.log('✅ Heatmap data received:', {
          cells: response.heatmap.cells?.length || 0,
          clusters: response.heatmap.clusters?.length || 0,
          center: response.heatmap.center,
          radius: response.heatmap.radius,
        });
        setHeatmapData(response.heatmap);
      } else {
        console.warn('❌ Heatmap response failed:', response);
        setError('Failed to load heatmap data');
      }
    } catch (err: any) {
      console.error('Error loading heatmap:', err);
      setError(err.message || 'Failed to load heatmap. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * iOS heatmap color mapping (matches Android)
   *
   * UI Bands:
   * - Medium:      1.0 - 2.0
   * - Medium-High: 2.0 - 4.0
   * - High:        4.0+
   *
   * NOTE: low-risk (<1.0) cells are not rendered (no green).
   */
  const interpolateColor = (
    riskScore: number
  ): { color: string; opacity: number } => {
    const clamped = Math.max(0, Math.min(5, riskScore));

    let r = 0,
      g = 0,
      b = 0;

    if (clamped < 2.0) {
      const t = Math.max(0, Math.min(1, (clamped - 1.0) / 1.0));
      // Yellow (#FACC15) -> Amber (#EAB308)
      r = Math.round(250 + (234 - 250) * t);
      g = Math.round(204 + (179 - 204) * t);
      b = Math.round(21 + (8 - 21) * t);
    } else if (clamped < 4.0) {
      const t = (clamped - 2.0) / 2.0;
      // Orange (#F97316) -> Red (#EF4444)
      r = Math.round(249 + (239 - 249) * t);
      g = Math.round(115 + (68 - 115) * t);
      b = Math.round(22 + (68 - 22) * t);
    } else {
      const t = Math.max(0, Math.min(1, (clamped - 4.0) / 1.0));
      // Red (#EF4444) -> Deep Red (#B91C1C)
      r = Math.round(239 + (185 - 239) * t);
      g = Math.round(68 + (28 - 68) * t);
      b = Math.round(68 + (28 - 68) * t);
    }

    const normalized = clamped / 5.0;
    const opacity = 0.22 + normalized * 0.48;

    return { color: `rgba(${r}, ${g}, ${b}, ${opacity})`, opacity };
  };

  const getCircleRadius = (): number => {
    return gridSize * 0.7;
  };

  if (mapError) {
    // If map fails, show error but don't crash
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Map unavailable. Please use list view.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapType="standard"
        toolbarEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        onError={(error: any) => {
          console.error('Map error:', error);
          setMapError(true);
          if (onError) {
            onError();
          }
        }}
      >
        {/* Show user location marker if we have it */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor={colors.primary}
          />
        )}

        {/* Smooth heatmap using overlapping circles (no green) */}
        {heatmapData?.cells
          ?.filter((cell: HeatmapCell) => cell.risk_score > 1.0)
          .map((cell: HeatmapCell, index: number) => {
            const { color, opacity } = interpolateColor(cell.risk_score);
            const circleRadius = getCircleRadius();
            return (
              <Circle
                key={`heatmap-cell-${cell.lat}-${cell.lng}-${index}`}
                center={{ latitude: cell.lat, longitude: cell.lng }}
                radius={circleRadius}
                fillColor={color}
                strokeColor={color}
                strokeWidth={0}
                opacity={opacity}
              />
            );
          })}

        {/* Cluster markers removed (consistent with Android) */}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading heatmap...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadHeatmap}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {heatmapData && !loading && !error && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Risk Level</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: interpolateColor(4.5).color }]} />
            <Text style={styles.legendText}>High (4.0+)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: interpolateColor(3.0).color }]} />
            <Text style={styles.legendText}>Medium-High (2.0-4.0)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: interpolateColor(1.5).color }]} />
            <Text style={styles.legendText}>Medium (1.0-2.0)</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.black,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendText: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '500',
  },
});

export default HeatmapMap;

