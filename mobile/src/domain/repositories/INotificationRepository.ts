/**
 * Domain Layer - Notification Repository Interface
 * 
 * Seguindo ISP: Interface segregada apenas para operações de notificação
 * Seguindo DIP: Dependência de abstração
 */

import { NotificationPreferences } from '../models/NotificationPreferences';

export interface INotificationRepository {
  /**
   * Registra o dispositivo para receber notificações push
   */
  registerDevice(expoPushToken: string): Promise<void>;

  /**
   * Remove o registro do dispositivo
   */
  unregisterDevice(expoPushToken: string): Promise<void>;

  /**
   * Obtém as preferências de notificação do usuário
   */
  getPreferences(): Promise<NotificationPreferences>;

  /**
   * Salva as preferências de notificação do usuário
   */
  savePreferences(preferences: NotificationPreferences): Promise<void>;
}
