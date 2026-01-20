/**
 * Community Reports Screen
 *
 * View all community incident reports
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fetchCommunityReports } from "../services/api";
import {
  subscribeToIncidents,
  initWebSocket,
  disconnectWebSocket,
} from "../services/websocket";

interface CommunityReport {
  id: string;
  type: string;
  category: string;
  description: string;
  severity: number;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  verified: boolean;
}

interface Filters {
  category: string | null;
  severity: number | null;
  dateRange: "all" | "today" | "week" | "month";
}

export default function CommunityReportsScreen() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: null,
    severity: null,
    dateRange: "all",
  });

  useEffect(() => {
    loadReports();

    // Initialize WebSocket and listen for new incidents
    const socket = initWebSocket();

    // Subscribe to new incident notifications
    subscribeToIncidents((newIncident) => {
      console.log(
        "📢 New incident reported, refreshing community reports:",
        newIncident.incidentId
      );
      // Refresh reports when new incident is received
      setTimeout(() => {
        loadReports();
      }, 1500); // Small delay to let backend process the incident
    });

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Reload when screen is focused (e.g., after submitting a report)
  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetchCommunityReports();
      if (response.success && response.reports) {
        setReports(response.reports);
      } else {
        console.warn("Failed to load reports:", response);
      }
    } catch (error: any) {
      console.error("Error loading reports:", error);
      const errorMessage = error.message || "Failed to load reports";
      if (errorMessage.includes("Network request failed")) {
        // Don't show alert on initial load, just log
        console.warn("Network error - backend may not be running");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const getSeverityColor = (severity: number): string => {
    if (severity >= 4) return colors.danger;
    if (severity >= 3) return colors.warning;
    return colors.success;
  };

  const getSeverityLabel = (severity: number): string => {
    if (severity >= 4) return "High";
    if (severity >= 3) return "Medium";
    return "Low";
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Get unique categories from reports
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    reports.forEach((report) => uniqueCategories.add(report.category));
    return Array.from(uniqueCategories).sort();
  }, [reports]);

  // Filter reports based on selected filters
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((r) => r.category === filters.category);
    }

    // Filter by severity
    if (filters.severity !== null) {
      filtered = filtered.filter((r) => r.severity === filters.severity);
    }

    // Filter by date range
    const now = new Date();
    if (filters.dateRange === "today") {
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      filtered = filtered.filter((r) => new Date(r.timestamp) >= todayStart);
    } else if (filters.dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((r) => new Date(r.timestamp) >= weekAgo);
    } else if (filters.dateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((r) => new Date(r.timestamp) >= monthAgo);
    }

    // Sort by most recent first (already sorted from API, but ensure it)
    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [reports, filters]);

  const handleClearFilters = () => {
    setFilters({
      category: null,
      severity: null,
      dateRange: "all",
    });
  };

  const hasActiveFilters =
    filters.category !== null ||
    filters.severity !== null ||
    filters.dateRange !== "all";

  const renderReport = ({ item }: { item: CommunityReport }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleRow}>
          <Text style={styles.reportCategory}>{item.category}</Text>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(item.severity) },
            ]}
          >
            <Text style={styles.severityText}>
              {getSeverityLabel(item.severity)}
            </Text>
          </View>
        </View>
        <Text style={styles.reportType}>{item.type.replace("_", " ")}</Text>
      </View>

      <Text style={styles.reportDescription}>{item.description}</Text>

      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>{formatDate(item.timestamp)}</Text>
        <Text style={styles.reportLocation}>
          📍 {item.location.latitude.toFixed(4)},{" "}
          {item.location.longitude.toFixed(4)}
        </Text>
      </View>

      {item.verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Community Reports</Text>
            <Text style={styles.subtitle}>
              {filteredReports.length} of {reports.length} incident
              {reports.length !== 1 ? "s" : ""} shown
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔍 Filters</Text>
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
      </View>

      {loading && reports.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No reports yet</Text>
          <Text style={styles.emptySubtext}>
            Community reports will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                No reports match your filters
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={handleClearFilters}
                >
                  <Text style={styles.clearFiltersButtonText}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Reports</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filters.category === null && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilters({ ...filters, category: null })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.category === null &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    All Categories
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      filters.category === category &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, category })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.category === category &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Severity Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Severity</Text>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    filters.severity === null && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilters({ ...filters, severity: null })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.severity === null &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    All Severities
                  </Text>
                </TouchableOpacity>
                {[1, 2, 3, 4, 5].map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.filterOption,
                      filters.severity === severity &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, severity })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.severity === severity &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {severity} - {getSeverityLabel(severity)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Date Range</Text>
                {(["all", "today", "week", "month"] as const).map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.filterOption,
                      filters.dateRange === range && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilters({ ...filters, dateRange: range })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.dateRange === range &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {range === "all" && "All Time"}
                      {range === "today" && "Today"}
                      {range === "week" && "Last 7 Days"}
                      {range === "month" && "Last 30 Days"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: spacing.md,
  },
  reportItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportHeader: {
    marginBottom: spacing.sm,
  },
  reportTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  reportCategory: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  severityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  reportType: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: "capitalize",
  },
  reportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reportDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  reportLocation: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  verifiedBadge: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.success,
    borderRadius: 8,
  },
  verifiedText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "20",
  },
  filterButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  clearFiltersButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  modalCloseButton: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: "bold",
  },
  modalBody: {
    padding: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterOption: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
  modalFooter: {
    flexDirection: "row",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  clearAllButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    alignItems: "center",
  },
  clearAllButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
