/**
 * Application Layer - Save Notification Preferences Use Case
 */

import { INotificationRepository } from '@/domain/repositories/INotificationRepository';
import { NotificationPreferences } from '@/domain/models/NotificationPreferences';

export class SaveNotificationPreferencesUseCase {
  constructor(
    private notificationRepository: INotificationRepository
  ) {}

  async execute(preferences: NotificationPreferences): Promise<void> {
    await this.notificationRepository.savePreferences(preferences);
  }
}
