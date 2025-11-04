/**
 * Infrastructure Layer - Notification Repository Implementation
 * 
 * Implementação concreta de INotificationRepository
 */

import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { NotificationPreferences, defaultNotificationPreferences } from '@/domain/models/NotificationPreferences';
import { notificationService } from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@takepips:notification_preferences';

export class NotificationRepository implements INotificationRepository {
  async registerDevice(expoPushToken: string): Promise<void> {
    await notificationService.registerDevice(expoPushToken);
  }

  async unregisterDevice(expoPushToken: string): Promise<void> {
    await notificationService.unregisterDevice(expoPushToken);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return defaultNotificationPreferences;
    } catch (error) {
      console.error('[NotificationRepository] Error getting preferences:', error);
      return defaultNotificationPreferences;
    }
  }

  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('[NotificationRepository] Error saving preferences:', error);
      throw error;
    }
  }
}
