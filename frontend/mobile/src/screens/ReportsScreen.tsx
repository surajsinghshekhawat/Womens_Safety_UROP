/**
 * Reports Screen
 *
 * Community incident reporting
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import LocationPicker from "../components/LocationPicker";

// Conditionally import ImagePicker - handle gracefully if not available
let ImagePicker: any = null;
try {
  ImagePicker = require("expo-image-picker");
} catch (error) {
  console.warn("expo-image-picker not available - image upload disabled");
}

import { API_BASE_URL } from "../services/api"; // Import API_BASE_URL

interface ReportForm {
  type: "community_report";
  category: string;
  description: string;
  severity: number;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  media: {
    uri: string;
    type: "image" | "video";
  } | null;
}

export default function ReportsScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState<ReportForm>({
    type: "community_report",
    category: "",
    description: "",
    severity: 3,
    location: null,
    media: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [imagePickerAvailable, setImagePickerAvailable] = useState(false);

  useEffect(() => {
    // Check if ImagePicker is available
    setImagePickerAvailable(ImagePicker !== null);
  }, []);

  const categories = [
    "Harassment",
    "Suspicious Activity",
    "Poor Lighting",
    "Unsafe Area",
    "Other",
  ];

  const handleSetLocation = () => {
    setShowLocationPicker(true);
  };

  const handleLocationSelected = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setForm({
      ...form,
      location,
    });
  };

  const handlePickImage = async () => {
    if (!ImagePicker) {
      Alert.alert(
        "Not Available",
        "Image picker requires a development build. Rebuild the app with 'npx expo run:android' to enable this feature."
      );
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Media library permission is required to attach images/videos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30, // 30 seconds max for videos
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setForm({
          ...form,
          media: {
            uri: asset.uri,
            type: asset.type === "video" ? "video" : "image",
          },
        });
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image/video. Please try again.");
    }
  };

  const handleTakePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert(
        "Not Available",
        "Camera requires a development build. Rebuild the app with 'npx expo run:android' to enable this feature."
      );
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos/videos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setForm({
          ...form,
          media: {
            uri: asset.uri,
            type: asset.type === "video" ? "video" : "image",
          },
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo/video. Please try again.");
    }
  };

  const handleRemoveMedia = () => {
    setForm({
      ...form,
      media: null,
    });
  };

  const showMediaOptions = () => {
    Alert.alert("Add Media", "Choose an option", [
      { text: "Take Photo/Video", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (!form.category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!form.description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    if (!form.location) {
      Alert.alert("Error", "Please capture your location");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(
        "📝 Submitting report to:",
        `${API_BASE_URL}/api/reports/submit`
      );
      // Submit report to backend
      const response = await fetch(`${API_BASE_URL}/api/reports/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "user123", // TODO: Get from auth
          type: form.type,
          category: form.category,
          description: form.description,
          severity: form.severity,
          location: {
            latitude: form.location!.latitude,
            longitude: form.location!.longitude,
          },
          timestamp: new Date().toISOString(),
          // Minutes east of UTC (e.g., IST => +330). Used to compute incident local hour-of-day.
          timezone_offset_minutes: -new Date().getTimezoneOffset(),
        }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: Submission failed`
        );
      }

      const result = await response.json();
      console.log("✅ Report submission result:", result);

      if (result.success) {
        // Store location before resetting form (needed for "View on Map")
        const reportedLocation = form.location;

        Alert.alert(
          "Success",
          "Your report has been submitted. Thank you for helping keep the community safe.",
          [
            {
              text: "View on Map",
              onPress: () => {
                // Navigate to Home tab and pan to reported location
                if (reportedLocation) {
                  (navigation as any).navigate("Home", {
                    panToLocation: {
                      latitude: reportedLocation.latitude,
                      longitude: reportedLocation.longitude,
                    },
                  });
                } else {
                  // Fallback: just navigate to Home
                  (navigation as any).navigate("Home");
                }
              },
            },
            {
              text: "View Reports",
              onPress: () => {
                // Navigate to Community tab to see the new report
                (navigation as any).navigate("Community");
              },
            },
            { text: "OK" },
          ]
        );
        // Reset form
        setForm({
          type: "community_report",
          category: "",
          description: "",
          severity: 3,
          location: null,
          media: null,
        });
      } else {
        throw new Error(result.error || "Submission failed");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      const errorMessage = error.message || "Failed to submit report";

      if (
        errorMessage.includes("Network request failed") ||
        errorMessage.includes("fetch")
      ) {
        Alert.alert(
          "Connection Error",
          "Cannot connect to server. Make sure:\n1. Backend API is running on port 3001\n2. ML Service is running on port 8000\n3. Phone and computer are on same WiFi"
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Report Incident</Text>
        <Text style={styles.subtitle}>
          Help keep the community safe by reporting incidents
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  form.category === category && styles.categoryButtonActive,
                ]}
                onPress={() => setForm({ ...form, category })}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    form.category === category &&
                      styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Severity</Text>
          <View style={styles.severityContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  form.severity === level && styles.severityButtonActive,
                ]}
                onPress={() => setForm({ ...form, severity: level })}
              >
                <Text
                  style={[
                    styles.severityButtonText,
                    form.severity === level && styles.severityButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.severityLabel}>
            {form.severity === 1 && "Very Low"}
            {form.severity === 2 && "Low"}
            {form.severity === 3 && "Medium"}
            {form.severity === 4 && "High"}
            {form.severity === 5 && "Very High"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what happened..."
            placeholderTextColor={colors.textTertiary}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {imagePickerAvailable && (
          <View style={styles.section}>
            <Text style={styles.label}>Media (Optional)</Text>
            {form.media ? (
              <View style={styles.mediaContainer}>
                {form.media.type === "image" ? (
                  <Image
                    source={{ uri: form.media.uri }}
                    style={styles.mediaPreview}
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoPlaceholderText}>
                      📹 Video Selected
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={handleRemoveMedia}
                >
                  <Text style={styles.removeMediaButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={showMediaOptions}
              >
                <Text style={styles.mediaButtonText}>📷 Add Photo/Video</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          {form.location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>✓ Location set</Text>
              <Text style={styles.locationCoords}>
                {form.location.latitude.toFixed(6)},{" "}
                {form.location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.changeLocationButton}
                onPress={handleSetLocation}
              >
                <Text style={styles.changeLocationButtonText}>
                  Change Location
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleSetLocation}
            >
              <Text style={styles.locationButtonText}>
                📍 Set Location on Map
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}></Text>
        </View>
      </ScrollView>

      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelected={handleLocationSelected}
        initialLocation={form.location}
      />
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
  severityContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  severityButton: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  severityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  severityButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  severityButtonTextActive: {
    color: colors.white,
  },
  severityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  textArea: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
  },
  locationButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  locationButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  locationInfo: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 12,
    padding: spacing.md,
  },
  locationText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  locationCoords: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  changeLocationButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: "flex-start",
  },
  changeLocationButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  mediaButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
  },
  mediaButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  mediaContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.sm,
    resizeMode: "cover",
  },
  videoPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  videoPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  removeMediaButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.danger,
    borderRadius: 8,
  },
  removeMediaButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
