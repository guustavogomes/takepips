/**
 * Infrastructure Layer - Notification Service
 *
 * Serviço para gerenciar notificações push nativas do dispositivo
 * Seguindo SRP: Apenas gerencia notificações
 *
 * NOTA: Push notifications remotas não funcionam no Expo Go a partir do SDK 53.
 * Use notificações locais durante desenvolvimento ou crie um development build.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from '../api/apiClient';

// Detectar se está rodando no Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as Notifications.NotificationBehavior),
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
   *
   * NOTA: Em desenvolvimento com Expo Go (SDK 53+), push notifications remotas não funcionam.
   * Retorna null no Expo Go para evitar erros.
   */
  async getExpoPushToken(): Promise<string | null> {
    // Bloquear completamente no Expo Go para evitar erros
    if (isExpoGo) {
      console.log('[NotificationService] Expo Go detectado - push notifications remotas não disponíveis');
      console.log('[NotificationService] Use notificações locais ou crie um development build');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[NotificationService] Simulador/emulador detectado - push notifications desabilitadas');
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      // Apenas tenta obter token em development builds ou standalone apps
      const tokenData = await Notifications.getExpoPushTokenAsync();

      console.log('[NotificationService] Push token obtido com sucesso');
      return tokenData.data;
    } catch (error: any) {
      // Erros inesperados
      console.error('[NotificationService] Erro ao obter push token:', error);
      return null;
    }
  }

  /**
   * Registra o dispositivo no backend
   */
  async registerDevice(expoPushToken: string): Promise<void> {
    try {
      console.log('[NotificationService] Registrando dispositivo no backend...');
      console.log('[NotificationService] Token:', expoPushToken.substring(0, 30) + '...');
      console.log('[NotificationService] Platform:', Platform.OS);
      console.log('[NotificationService] Device ID:', Device.modelName || 'unknown');
      
      const response = await apiClient.post('/api/push/subscribe', {
        token: expoPushToken,
        platform: Platform.OS,
        deviceId: Device.modelName || 'unknown',
      });
      
      console.log('[NotificationService] ✅ Resposta do backend:', response.data);
      console.log('[NotificationService] ✅ Device registered successfully');
    } catch (error: any) {
      console.error('[NotificationService] ❌ Error registering device:', error);
      if (error.response) {
        console.error('[NotificationService] Response status:', error.response.status);
        console.error('[NotificationService] Response data:', error.response.data);
      }
      if (error.request) {
        console.error('[NotificationService] Request made but no response received');
      }
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
        receivedListener.remove();
        responseListener.remove();
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
