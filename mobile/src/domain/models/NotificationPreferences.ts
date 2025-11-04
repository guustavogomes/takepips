/**
 * Domain Layer - Notification Preferences Entity
 * 
 * Define as preferências de notificação do usuário
 */

export interface NotificationPreferences {
  enabled: boolean;
  newSignals: boolean;
  entryHit: boolean;
  take1: boolean;
  take2: boolean;
  take3: boolean;
  stopLoss: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  newSignals: true,
  entryHit: true,
  take1: true,
  take2: true,
  take3: true,
  stopLoss: true,
  soundEnabled: true,
  vibrationEnabled: true,
};
