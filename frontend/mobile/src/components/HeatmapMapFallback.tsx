/**
 * Heatmap Map Fallback Component
 * 
 * Shows heatmap data without native map (avoids react-native-maps errors)
 * Displays data in a grid/list format
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { fetchHeatmap, HeatmapCell, HeatmapData } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface HeatmapMapFallbackProps {
  initialLatitude?: number;
  initialLongitude?: number;
  radius?: number;
  gridSize?: number;
}

const HeatmapMapFallback: React.FC<HeatmapMapFallbackProps> = ({
  initialLatitude = 13.0827,
  initialLongitude = 80.2707,
  radius = 1000,
  gridSize = 100,
}) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      } catch (err) {
        console.error('Error getting location:', err);
      }
    })();
  }, []);

  const loadHeatmap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass current timestamp for time-based risk calculation
      // This ensures heatmap updates based on time of day (9PM risky, 10AM safe)
      const currentTimestamp = new Date().toISOString();

      const response = await fetchHeatmap(
        location.latitude,
        location.longitude,
        radius,
        gridSize,
        currentTimestamp // Pass current time for real-time risk calculation
      );

      if (response.success && response.heatmap) {
        setHeatmapData(response.heatmap);
        console.log('✅ Heatmap loaded (time-based risk calculated at:', currentTimestamp, ')');
      } else {
        setError('Failed to load heatmap data. Make sure ML service is running on port 8000.');
      }
    } catch (err: any) {
      console.error('Error loading heatmap:', err);
      const errorMessage = err.message || 'Failed to load heatmap.';
      let detailedError = errorMessage;
      
      if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
        detailedError = 'Cannot connect to backend API. Make sure:\n1. Backend API is running on port 3001\n2. ML Service is running on port 8000\n3. Phone and computer are on same WiFi';
      } else if (errorMessage.includes('503')) {
        detailedError = 'ML Service unavailable. Make sure ML service is running:\ncd backend/ml\nuvicorn app.main:app --reload --host 0.0.0.0 --port 8000';
      }
      
      setError(detailedError);
    } finally {
      setLoading(false);
    }
  }, [location.latitude, location.longitude, radius, gridSize]);

  // Load heatmap on mount and when location/radius changes
  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  // AUTO-REFRESH: Update heatmap every 30 seconds for real-time risk changes
  useEffect(() => {
    console.log('🔄 Setting up auto-refresh (30 seconds interval)...');
    const refreshInterval = setInterval(() => {
      const now = new Date().toISOString();
      console.log('🔄 Auto-refreshing heatmap at:', now);
      loadHeatmap();
    }, 30000); // Refresh every 30 seconds

    return () => {
      console.log('🔄 Cleaning up auto-refresh interval');
      clearInterval(refreshInterval);
    };
  }, [loadHeatmap]);

  const getRiskColor = (riskScore: number): string => {
    if (riskScore >= 4.0) return colors.riskHigh;
    if (riskScore >= 2.5) return colors.riskMediumHigh;
    if (riskScore >= 1.5) return colors.riskMedium;
    return colors.riskLow;
  };

  const getRiskLabel = (riskScore: number): string => {
    if (riskScore >= 4.0) return 'High';
    if (riskScore >= 2.5) return 'Medium-High';
    if (riskScore >= 1.5) return 'Medium';
    return 'Low';
  };

  const renderCell = ({ item }: { item: HeatmapCell }) => (
    <View style={[styles.cell, { backgroundColor: getRiskColor(item.risk_score) }]}>
      <Text style={styles.cellText}>
        {item.risk_score.toFixed(1)} - {getRiskLabel(item.risk_score)}
      </Text>
      <Text style={styles.cellCoords}>
        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading heatmap...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHeatmap}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const highRiskCells = heatmapData?.cells.filter(c => c.risk_score >= 4.0) || [];
  const mediumRiskCells = heatmapData?.cells.filter(c => c.risk_score >= 2.5 && c.risk_score < 4.0) || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Safety Heatmap Data</Text>
          <Text style={styles.headerSubtitle}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          <Text style={styles.headerSubtitle}>
            Total Cells: {heatmapData?.cells.length || 0} | Clusters: {heatmapData?.clusters.length || 0}
          </Text>
        </View>

        {highRiskCells.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔴 High Risk Areas ({highRiskCells.length})</Text>
            <FlatList
              data={highRiskCells.slice(0, 20)}
              renderItem={renderCell}
              keyExtractor={(item, index) => `high-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}

        {mediumRiskCells.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🟠 Medium Risk Areas ({mediumRiskCells.length})</Text>
            <FlatList
              data={mediumRiskCells.slice(0, 20)}
              renderItem={renderCell}
              keyExtractor={(item, index) => `medium-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}

        {heatmapData?.clusters && heatmapData.clusters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Unsafe Zones ({heatmapData.clusters.length})</Text>
            {heatmapData.clusters.map((cluster, index) => (
              <View key={cluster.id} style={styles.clusterItem}>
                <Text style={styles.clusterText}>
                  Zone {index + 1}: Risk {cluster.risk_score.toFixed(1)}
                </Text>
                <Text style={styles.clusterCoords}>
                  {cluster.center.lat.toFixed(4)}, {cluster.center.lng.toFixed(4)}
                </Text>
                <Text style={styles.clusterRadius}>Radius: {cluster.radius}m</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Map view temporarily unavailable. Heatmap data is displayed above.
            {'\n\n'}
            Red = High Risk (4.0+){'\n'}
            Orange = Medium-High (2.5-4.0){'\n'}
            Yellow = Medium (1.5-2.5){'\n'}
            Green = Low (0-1.5)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text,
    marginTop: spacing.md,
    fontSize: 16,
  },
  errorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cell: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cellText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cellCoords: {
    color: colors.white,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  clusterItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  clusterText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  clusterCoords: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  clusterRadius: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HeatmapMapFallback;


