/**
 * Application Layer - Get Notification Preferences Use Case
 */

import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { NotificationPreferences } from '@/domain/models/NotificationPreferences';

export class GetNotificationPreferencesUseCase {
  constructor(
    private notificationRepository: INotificationRepository
  ) {}

  async execute(): Promise<NotificationPreferences> {
    return this.notificationRepository.getPreferences();
  }
}
