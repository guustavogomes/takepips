/**
 * Application Layer - Register Notification Use Case
 * 
 * Seguindo SRP: Apenas registra dispositivo para notificações
 */

import { INotificationRepository } from '@/domain/repositories/INotificationRepository';

export class RegisterNotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository
  ) {}

  async execute(expoPushToken: string): Promise<void> {
    if (!expoPushToken) {
      throw new Error('Expo push token is required');
    }

    await this.notificationRepository.registerDevice(expoPushToken);
  }
}
