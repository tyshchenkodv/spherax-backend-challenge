import { Injectable, Logger } from '@nestjs/common';

import { NotificationNotFoundError } from '@lib/common';

import { AbstractIamClient } from '../../iam-client/interfaces/iam-client.interface';
import type { ICreateNotificationInput, INotification } from '../interfaces/notification.interface';
import { AbstractNotificationsRepository } from '../interfaces/notifications-repository.interface';
import { AbstractNotificationsService } from '../interfaces/notifications-service.interface';

@Injectable()
export class NotificationsService extends AbstractNotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: AbstractNotificationsRepository,
    private readonly iamClient: AbstractIamClient,
  ) {
    super();
  }

  async createNotification(input: ICreateNotificationInput): Promise<INotification> {
    this.logger.log(`Validating notification recipient: ${input.userId}`);
    await this.iamClient.validateNotificationRecipient(input.userId);

    const notification = this.notificationsRepository.create(input);
    this.logger.log(`Notification created: ${notification.id}`);
    return notification;
  }

  findNotifications(): INotification[] {
    return this.notificationsRepository.findAll();
  }

  findNotificationById(id: string): INotification {
    const notification = this.notificationsRepository.findById(id);

    if (!notification) {
      this.logger.warn(`Notification not found: ${id}`);
      throw new NotificationNotFoundError(id);
    }

    return notification;
  }

  findNotificationsByUserId(userId: string): INotification[] {
    this.logger.log(`Finding notifications for user: ${userId}`);
    return this.notificationsRepository.findByUserId(userId);
  }

  deleteNotification(id: string): void {
    const deleted = this.notificationsRepository.delete(id);

    if (!deleted) {
      this.logger.warn(`Notification not found for deletion: ${id}`);
      throw new NotificationNotFoundError(id);
    }

    this.logger.log(`Notification deleted: ${id}`);
  }
}
