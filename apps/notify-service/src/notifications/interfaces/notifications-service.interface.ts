import type { ICreateNotificationInput, INotification } from './notification.interface';

export abstract class AbstractNotificationsService {
  abstract createNotification(input: ICreateNotificationInput): Promise<INotification>;
  abstract findNotifications(): INotification[];
  abstract findNotificationById(id: string): INotification;
  abstract findNotificationsByUserId(userId: string): INotification[];
  abstract deleteNotification(id: string): void;
}
