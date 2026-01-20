/**
 * Panic Screen
 * 
 * Emergency SOS button and panic management
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../utils/storage';
import PanicButton from '../components/PanicButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { triggerPanicAlert, updateLocation } from '../services/api';
import * as Location from 'expo-location';

const EMERGENCY_CONTACTS_KEY = '@emergency_contacts';

export default function PanicScreen() {
  const [isActive, setIsActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Reload contacts when screen is focused AND on mount
  useFocusEffect(
    React.useCallback(() => {
      loadEmergencyContacts();
    }, [])
  );

  useEffect(() => {
    // Load emergency contacts from storage immediately on mount
    // This ensures contacts are available even if user hasn't visited ContactsScreen
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const stored = await storage.getItem(EMERGENCY_CONTACTS_KEY);
      if (stored) {
        const contacts = JSON.parse(stored);
        // Extract phone numbers for panic alert
        const phoneNumbers = contacts.map((c: any) => c.phone);
        setEmergencyContacts(phoneNumbers);
        console.log('Loaded emergency contacts:', phoneNumbers.length);
      } else {
        console.log('No emergency contacts found in storage');
        setEmergencyContacts([]);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      setEmergencyContacts([]);
    }
  };

  /**
   * Handle panic button trigger
   */
  const handlePanicTrigger = async () => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for emergency alerts.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Trigger panic alert with emergency contacts
      await triggerPanicAlert('user123', latitude, longitude, emergencyContacts);
      
      // Set active state
      setIsActive(true);
      
      // Start location tracking
      startLocationTracking(latitude, longitude);
      
      Alert.alert(
        '🚨 Emergency Alert Sent',
        'Your location has been shared with emergency contacts and authorities.',
        [
          {
            text: 'Cancel Alert',
            style: 'destructive',
            onPress: handleCancelPanic,
          },
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    } catch (error) {
      console.error('Panic trigger error:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
    }
  };

  /**
   * Start continuous location tracking
   */
  const startLocationTracking = async (lat: number, lng: number) => {
    // Update location every 30 seconds
    const interval = setInterval(async () => {
      if (!isActive) {
        clearInterval(interval);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        await updateLocation('user123', location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Location update error:', error);
      }
    }, 30000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  /**
   * Cancel panic alert
   */
  const handleCancelPanic = () => {
    Alert.alert(
      'Cancel Emergency Alert',
      'Are you sure you want to cancel the emergency alert?',
      [
        {
          text: 'No, Keep Active',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setIsActive(false);
            setCountdown(null);
            Alert.alert('Alert Cancelled', 'Emergency alert has been cancelled.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>
            Press and hold to trigger emergency alert
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <PanicButton
            onPanicTrigger={handlePanicTrigger}
            emergencyContacts={emergencyContacts}
            isActive={isActive}
          />
        </View>

        {emergencyContacts.length === 0 && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ No emergency contacts configured
            </Text>
            <Text style={styles.warningSubtext}>
              Add contacts in the Contacts tab to receive emergency alerts
            </Text>
          </View>
        )}

        {emergencyContacts.length > 0 && (
          <View style={styles.contactsInfo}>
            <Text style={styles.contactsInfoText}>
              {emergencyContacts.length} emergency contact{emergencyContacts.length !== 1 ? 's' : ''} will be notified
            </Text>
          </View>
        )}

        {isActive && (
          <View style={styles.emergencyStatus}>
            <Text style={styles.emergencyText}>🚨 EMERGENCY MODE ACTIVE</Text>
            <Text style={styles.emergencySubtext}>
              Your location is being shared with emergency contacts
            </Text>
            <Text style={styles.emergencySubtext}>
              {emergencyContacts.length} contacts notified
            </Text>
            
            <View style={styles.cancelButton}>
              <Text
                style={styles.cancelButtonText}
                onPress={handleCancelPanic}
              >
                Cancel Alert
              </Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: spacing.xl,
  },
  emergencyStatus: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.danger,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  emergencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  emergencySubtext: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cancelButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoSubtext: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  warningContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: 'center',
    width: '100%',
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  warningSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contactsInfo: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    width: '100%',
  },
  contactsInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


