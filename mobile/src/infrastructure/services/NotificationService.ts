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
   * NOTA: Em desenvolvimento com Expo Go, push notifications remotas não funcionam.
   * Requer EAS Build ou development build para funcionar completamente.
   */
  async getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('[NotificationService] Simulador/emulador detectado - push notifications desabilitadas');
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    try {
      // Verificar se estamos em um ambiente que suporta push tokens
      // No Expo Go, isso vai falhar sem projectId do EAS
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: undefined, // Usar undefined explicitamente para desenvolvimento
      });

      console.log('[NotificationService] Push token obtido com sucesso');
      return tokenData.data;
    } catch (error: any) {
      // Erros esperados em desenvolvimento
      const errorMessage = error?.message || '';

      if (errorMessage.includes('projectId') || errorMessage.includes('experienceId')) {
        // Isso é normal no Expo Go - não é um erro crítico
        console.log('[NotificationService] Modo desenvolvimento: Push notifications remotas não disponíveis.');
        console.log('[NotificationService] Para habilitar: configure EAS Build ou use notificações locais.');
        return null;
      }

      // Outros erros são inesperados
      console.error('[NotificationService] Erro ao obter push token:', error);
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
