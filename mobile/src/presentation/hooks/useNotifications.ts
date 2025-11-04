/**
 * Presentation Layer - useNotifications Hook
 * 
 * Hook para gerenciar notificações push
 */

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/infrastructure/services/NotificationService';
import {
  registerNotificationUseCase,
  getNotificationPreferencesUseCase,
  saveNotificationPreferencesUseCase,
} from '@/shared/config/dependencies';
import { NotificationPreferences } from '@/domain/models/NotificationPreferences';

export const notificationKeys = {
  all: ['notifications'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
  token: () => [...notificationKeys.all, 'token'] as const,
};

/**
 * Hook para gerenciar registro de notificações
 */
export function useNotificationRegistration() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        const token = await notificationService.getExpoPushToken();
        if (isMounted) {
          setExpoPushToken(token);
          
          if (token) {
            // Registrar automaticamente no backend
            try {
              await registerNotificationUseCase.execute(token);
            } catch (error) {
              console.error('[useNotificationRegistration] Error registering:', error);
            }
          }
        }
      } catch (error) {
        console.error('[useNotificationRegistration] Error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  return { expoPushToken, isLoading };
}

/**
 * Hook para buscar preferências de notificação
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferences, Error>({
    queryKey: notificationKeys.preferences(),
    queryFn: () => getNotificationPreferencesUseCase.execute(),
    staleTime: Infinity, // Preferências raramente mudam
  });
}

/**
 * Hook para salvar preferências de notificação
 */
export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, NotificationPreferences>({
    mutationFn: (preferences) => saveNotificationPreferencesUseCase.execute(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
  });
}

/**
 * Hook para gerenciar listeners de notificações
 */
export function useNotificationListeners() {
  useEffect(() => {
    const subscription = notificationService.setupNotificationListeners(
      (notification) => {
        console.log('[useNotificationListeners] Notification received:', notification);
      },
      (response) => {
        console.log('[useNotificationListeners] Notification tapped:', response);
        // Navegar para tela específica baseada na notificação
        // Navigation aqui se necessário
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
