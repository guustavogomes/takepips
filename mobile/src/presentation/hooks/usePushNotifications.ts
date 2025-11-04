/**
 * Hook para gerenciar push notifications
 *
 * Registra automaticamente o dispositivo no backend quando o app abre
 */

import { useEffect, useState } from 'react';
import { notificationService } from '@/infrastructure/services/NotificationService';
import { Platform } from 'react-native';

export function usePushNotifications() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    try {
      console.log('[usePushNotifications] Iniciando registro...');

      // 1. Obter token Expo Push
      const token = await notificationService.getExpoPushToken();

      if (!token) {
        console.log('[usePushNotifications] Não foi possível obter token (Expo Go ou simulador)');
        return;
      }

      console.log('[usePushNotifications] Token obtido:', token);
      setPushToken(token);

      // 2. Registrar no backend
      await notificationService.registerDevice(token);
      console.log('[usePushNotifications] ✅ Dispositivo registrado com sucesso!');
      setIsRegistered(true);

      // 3. Configurar listeners
      const listeners = notificationService.setupNotificationListeners(
        (notification) => {
          console.log('[usePushNotifications] Notificação recebida:', notification);
        },
        (response) => {
          console.log('[usePushNotifications] Notificação tocada:', response);
          // Aqui você pode navegar para uma tela específica
        }
      );

      // Cleanup listeners quando o componente desmontar
      return () => {
        listeners.remove();
      };
    } catch (error) {
      console.error('[usePushNotifications] Erro ao registrar:', error);
    }
  };

  return {
    isRegistered,
    pushToken,
  };
}
