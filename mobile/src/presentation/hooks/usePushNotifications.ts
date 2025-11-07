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
      console.log('[usePushNotifications] ========================================');
      console.log('[usePushNotifications] 🚀 Iniciando registro de push notifications...');
      console.log('[usePushNotifications] Platform:', Platform.OS);
      console.log('[usePushNotifications] ========================================');

      // 1. Obter token Expo Push
      console.log('[usePushNotifications] Passo 1: Obtendo token Expo Push...');
      const token = await notificationService.getExpoPushToken();

      if (!token) {
        console.log('[usePushNotifications] ❌ Não foi possível obter token');
        console.log('[usePushNotifications] Possíveis causas:');
        console.log('[usePushNotifications] - App rodando no Expo Go (não suportado)');
        console.log('[usePushNotifications] - App rodando em simulador/emulador');
        console.log('[usePushNotifications] - Permissões de notificação negadas');
        return;
      }

      console.log('[usePushNotifications] ✅ Token obtido com sucesso!');
      console.log('[usePushNotifications] Token (primeiros 50 chars):', token.substring(0, 50) + '...');
      setPushToken(token);

      // 2. Registrar no backend
      console.log('[usePushNotifications] Passo 2: Registrando dispositivo no backend...');
      console.log('[usePushNotifications] Fazendo POST para /api/push/subscribe...');
      await notificationService.registerDevice(token);
      console.log('[usePushNotifications] ✅ Dispositivo registrado com sucesso no backend!');
      setIsRegistered(true);

      // 3. Configurar listeners
      console.log('[usePushNotifications] Passo 3: Configurando listeners de notificação...');
      const listeners = notificationService.setupNotificationListeners(
        (notification) => {
          console.log('[usePushNotifications] 📬 Notificação recebida:', notification);
        },
        (response) => {
          console.log('[usePushNotifications] 👆 Notificação tocada:', response);
          // Aqui você pode navegar para uma tela específica
        }
      );
      console.log('[usePushNotifications] ✅ Listeners configurados!');
      console.log('[usePushNotifications] ========================================');
      console.log('[usePushNotifications] 🎉 Registro completo!');

      // Cleanup listeners quando o componente desmontar
      return () => {
        listeners.remove();
      };
    } catch (error) {
      console.error('[usePushNotifications] ❌❌❌ ERRO CRÍTICO ao registrar:', error);
      if (error instanceof Error) {
        console.error('[usePushNotifications] Mensagem:', error.message);
        console.error('[usePushNotifications] Stack:', error.stack);
      }
    }
  };

  return {
    isRegistered,
    pushToken,
  };
}
