import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { NotificationStatus } from '../enums/notification-status.enum';
import type { ICreateNotificationInput, INotification } from '../interfaces/notification.interface';
import { AbstractNotificationsRepository } from '../interfaces/notifications-repository.interface';

@Injectable()
export class InMemoryNotificationsRepository extends AbstractNotificationsRepository {
  private readonly notifications = new Map<string, INotification>();

  create(input: ICreateNotificationInput): INotification {
    const now = new Date().toISOString();
    const notification: INotification = {
      id: randomUUID(),
      userId: input.userId,
      channel: input.channel,
      subject: input.subject,
      body: input.body,
      status: NotificationStatus.Created,
      createdAt: now,
      sentAt: null,
    };

    this.notifications.set(notification.id, notification);

    return notification;
  }

  findAll(): INotification[] {
    return [...this.notifications.values()];
  }

  findById(id: string): INotification | undefined {
    return this.notifications.get(id);
  }

  findByUserId(userId: string): INotification[] {
    return [...this.notifications.values()].filter((n) => n.userId === userId);
  }

  delete(id: string): boolean {
    return this.notifications.delete(id);
  }
}
