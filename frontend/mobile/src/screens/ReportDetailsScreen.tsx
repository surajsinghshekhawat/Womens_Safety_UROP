/**
 * Report Details Screen — Full detail view for a community report.
 * Shown when user taps a report in Community list (modal or stack).
 */
import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AlertIcon, LocationIcon, AppIcon } from '../components/AppIcons';

export interface ReportDetailsReport {
  id: string;
  type: string;
  category: string;
  description: string;
  severity: number;
  location: { latitude: number; longitude: number };
  timestamp: string;
  verified?: boolean;
}

interface ReportDetailsScreenProps {
  report: ReportDetailsReport | null;
  visible: boolean;
  onClose: () => void;
  onViewOnMap?: (lat: number, lng: number) => void;
}

function getSeverityLabel(severity: number): string {
  if (severity >= 5) return 'Critical';
  if (severity >= 4) return 'High';
  if (severity >= 3) return 'Medium';
  if (severity >= 2) return 'Low';
  return 'Very Low';
}

function getSeverityColor(severity: number): string {
  if (severity >= 4) return colors.danger;
  if (severity >= 3) return colors.warning;
  return colors.textSecondary;
}

function formatDateTime(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ReportDetailsScreen({
  report,
  visible,
  onClose,
  onViewOnMap,
}: ReportDetailsScreenProps) {
  if (!report) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <AppIcon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Report Details</Text>
            <Text style={styles.subtitle}>Community incident report</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
          {/* Report summary card */}
          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <View style={styles.alertIconWrap}>
                <AlertIcon size={24} color={colors.primary} />
              </View>
              <View style={styles.summaryMain}>
                <Text style={styles.categoryTitle}>{report.category}</Text>
                <Text style={styles.dateTime}>{formatDateTime(report.timestamp)}</Text>
              </View>
              <View style={[styles.severityTag, { backgroundColor: getSeverityColor(report.severity) }]}>
                <Text style={styles.severityTagText}>{getSeverityLabel(report.severity)}</Text>
              </View>
            </View>
          </View>

          {/* Description card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.descriptionText}>{report.description || 'No description provided.'}</Text>
          </View>

          {/* Location card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <LocationIcon size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            <Text style={styles.locationText}>
              {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
            </Text>
            <View style={styles.mapPlaceholder}>
              <LocationIcon size={32} color={colors.danger} />
            </View>
            {onViewOnMap && (
              <TouchableOpacity
                style={styles.viewOnMapButton}
                onPress={() => onViewOnMap(report.location.latitude, report.location.longitude)}
              >
                <Text style={styles.viewOnMapText}>View on Map</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Reported card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Reported</Text>
            </View>
            <Text style={styles.reportedText}>{formatDateTime(report.timestamp)}</Text>
          </View>

          {/* Safety advisory card */}
          <View style={[styles.card, styles.advisoryCard]}>
            <View style={styles.cardTitleRow}>
              <AlertIcon size={20} color={colors.warning} />
              <Text style={styles.cardTitle}>Safety Advisory</Text>
            </View>
            <Text style={styles.advisoryText}>
              Exercise caution in this area. Consider using well-lit paths and avoid isolated spots when possible.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconWrap: {
    marginRight: spacing.sm,
  },
  summaryMain: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dateTime: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  severityTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  viewOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewOnMapText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  reportedText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  advisoryCard: {
    backgroundColor: '#FFF8E7',
    borderColor: colors.warning + '60',
  },
  advisoryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
