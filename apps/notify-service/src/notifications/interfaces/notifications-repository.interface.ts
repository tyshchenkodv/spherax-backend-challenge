import type { ICreateNotificationInput, INotification } from './notification.interface';

export abstract class AbstractNotificationsRepository {
  abstract create(input: ICreateNotificationInput): INotification;
  abstract findAll(): INotification[];
  abstract findById(id: string): INotification | undefined;
  abstract findByUserId(userId: string): INotification[];
  abstract delete(id: string): boolean;
}
