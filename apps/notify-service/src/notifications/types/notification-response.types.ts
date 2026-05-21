import type { INotification } from '../interfaces/notification.interface';

export type NotificationV1Response = Pick<
  INotification,
  'id' | 'userId' | 'channel' | 'subject' | 'body'
>;

export type NotificationV2Response = INotification;

export type NotificationResponse = NotificationV1Response | NotificationV2Response;
