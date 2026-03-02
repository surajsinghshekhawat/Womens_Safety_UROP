/**
 * Panic Screen
 * 
 * Emergency SOS button and panic management
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, StatusBar, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../utils/storage';
import PanicButton from '../components/PanicButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { triggerPanicAlert, updateLocation } from '../services/api';
import * as Location from 'expo-location';

const EMERGENCY_CONTACTS_KEY = '@emergency_contacts';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export default function PanicScreen() {
  const [isActive, setIsActive] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
  const [contactsList, setContactsList] = useState<EmergencyContact[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

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
        setContactsList(contacts);
        // Extract phone numbers for panic alert
        const phoneNumbers = contacts.map((c: any) => c.phone);
        setEmergencyContacts(phoneNumbers);
        console.log('Loaded emergency contacts:', phoneNumbers.length);
      } else {
        console.log('No emergency contacts found in storage');
        setContactsList([]);
        setEmergencyContacts([]);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      setContactsList([]);
      setEmergencyContacts([]);
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    try {
      await storage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(updatedContacts));
      setContactsList(updatedContacts);
      const phoneNumbers = updatedContacts.map((c) => c.phone);
      setEmergencyContacts(phoneNumbers);
    } catch (error) {
      console.error('Error saving contacts:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship.trim() || undefined,
    };

    const updatedContacts = [...contactsList, contact];
    saveContacts(updatedContacts);
    
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Emergency contact added');
  };

  const handleDeleteContact = (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contactsList.filter((c) => c.id !== id);
            saveContacts(updatedContacts);
            Alert.alert('Deleted', 'Contact removed');
          },
        },
      ]
    );
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
      
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Emergency Contacts Section - Below Panic Button */}
        <View style={styles.contactsSection}>
          <View style={styles.contactsHeader}>
            <Text style={styles.contactsTitle}>Emergency Contacts</Text>
            {contactsList.length > 0 && (
              <Text style={styles.contactsCount}>
                {contactsList.length} contact{contactsList.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {showAddForm ? (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Add Emergency Contact</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={colors.textTertiary}
                value={newContact.name}
                onChangeText={(text) => setNewContact({ ...newContact, name: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.textTertiary}
                value={newContact.phone}
                onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Relationship (optional)"
                placeholderTextColor={colors.textTertiary}
                value={newContact.relationship}
                onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
              />
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowAddForm(false);
                    setNewContact({ name: '', phone: '', relationship: '' });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={handleAddContact}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {contactsList.length === 0 ? (
                <View style={styles.emptyContacts}>
                  <Text style={styles.emptyText}>No emergency contacts</Text>
                  <Text style={styles.emptySubtext}>
                    Add contacts to notify them during emergencies
                  </Text>
                </View>
              ) : (
                <View style={styles.contactsList}>
                  {contactsList.map((item) => (
                    <View key={item.id} style={styles.contactItem}>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        <Text style={styles.contactPhone}>{item.phone}</Text>
                        {item.relationship && (
                          <Text style={styles.contactRelationship}>{item.relationship}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteContact(item.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              <TouchableOpacity
                style={styles.addContactButton}
                onPress={() => setShowAddForm(true)}
              >
                <Text style={styles.addContactButtonText}>+ Add Emergency Contact</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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
  contactsSection: {
    width: '100%',
    maxHeight: 400,
    marginTop: spacing.lg,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  contactsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contactsList: {
    marginBottom: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contactPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  contactRelationship: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.danger,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContacts: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addContactButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addContactButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
});


