/**
 * Infrastructure Layer - Notification Service
 * 
 * Serviço para gerenciar notificações push nativas do dispositivo
 * Seguindo SRP: Apenas gerencia notificações
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '../api/apiClient';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  /**
   * Solicita permissão para notificações
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('[NotificationService] Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[NotificationService] Failed to get push token for push notification!');
      return false;
    }

    return true;
  }

  /**
   * Obtém o token Expo Push
   */
  async getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      // No Expo Go, notificações push não funcionam completamente
      // Tentar obter token, mas silenciosamente ignorar erros de projectId
      const tokenData = await Notifications.getExpoPushTokenAsync();

      return tokenData.data;
    } catch (error: any) {
      // Ignorar erros de projectId no Expo Go (esperado)
      if (error?.message?.includes('projectId')) {
        console.warn('[NotificationService] Expo Go não suporta push notifications completamente. Use development build para notificações.');
        return null;
      }
      console.error('[NotificationService] Error getting push token:', error);
      return null;
    }
  }

  /**
   * Registra o dispositivo no backend
   */
  async registerDevice(expoPushToken: string): Promise<void> {
    try {
      await apiClient.post('/api/push/subscribe', {
        token: expoPushToken,
        platform: Platform.OS,
        deviceId: Device.modelName || 'unknown',
      });
      console.log('[NotificationService] Device registered successfully');
    } catch (error) {
      console.error('[NotificationService] Error registering device:', error);
      throw error;
    }
  }

  /**
   * Remove o registro do dispositivo
   */
  async unregisterDevice(expoPushToken: string): Promise<void> {
    try {
      await apiClient.post('/api/push/unsubscribe', {
        token: expoPushToken,
      });
      console.log('[NotificationService] Device unregistered successfully');
    } catch (error) {
      console.error('[NotificationService] Error unregistering device:', error);
      // Não lançar erro, apenas logar
    }
  }

  /**
   * Configura listeners para notificações recebidas
   */
  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (notification: Notifications.NotificationResponse) => void
  ): { remove: () => void } {
    // Listener para quando a notificação é recebida
    const receivedListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Listener para quando o usuário toca na notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationTapped
    );

    return {
      remove: () => {
        Notifications.removeNotificationSubscription(receivedListener);
        Notifications.removeNotificationSubscription(responseListener);
      },
    };
  }

  /**
   * Cancela todas as notificações agendadas
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Obtém número de notificações não lidas (badge)
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Define o número de notificações não lidas (badge)
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

// Instância singleton do serviço
export const notificationService = new NotificationService();
