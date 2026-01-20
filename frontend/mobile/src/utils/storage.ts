/**
 * Storage Utility
 * 
 * Provides a storage interface that works with or without AsyncStorage
 * Falls back to in-memory storage if AsyncStorage is unavailable
 */

// In-memory storage fallback
const memoryStorage: { [key: string]: string } = {};

let AsyncStorage: any = null;

// Try to import AsyncStorage, but don't fail if it's not available
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  console.warn('AsyncStorage not available, using in-memory storage');
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return memoryStorage[key] || null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
        return;
      }
      memoryStorage[key] = value;
    } catch (error) {
      console.error('Storage setItem error:', error);
      memoryStorage[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
        return;
      }
      delete memoryStorage[key];
    } catch (error) {
      console.error('Storage removeItem error:', error);
      delete memoryStorage[key];
    }
  },
};


