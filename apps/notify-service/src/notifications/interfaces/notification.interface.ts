import type { NotificationChannel } from '../enums/notification-channel.enum';
import type { NotificationStatus } from '../enums/notification-status.enum';

export interface INotification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  status: NotificationStatus;
  createdAt: string;
  sentAt: string | null;
}

export interface ICreateNotificationInput {
  userId: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
}
