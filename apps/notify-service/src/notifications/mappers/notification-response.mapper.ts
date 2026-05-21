import type { ApiVersion } from '@lib/api-versioning';

import type { INotification } from '../interfaces/notification.interface';
import type {
  NotificationResponse,
  NotificationV1Response,
  NotificationV2Response,
} from '../types/notification-response.types';

export function mapNotificationToResponse(
  notification: INotification,
  apiVersion: ApiVersion,
): NotificationResponse {
  if (apiVersion === 1) {
    return mapNotificationToV1Response(notification);
  }

  return mapNotificationToV2Response(notification);
}

function mapNotificationToV1Response(notification: INotification): NotificationV1Response {
  return {
    id: notification.id,
    userId: notification.userId,
    channel: notification.channel,
    subject: notification.subject,
    body: notification.body,
  };
}

function mapNotificationToV2Response(notification: INotification): NotificationV2Response {
  return {
    id: notification.id,
    userId: notification.userId,
    channel: notification.channel,
    subject: notification.subject,
    body: notification.body,
    status: notification.status,
    createdAt: notification.createdAt,
    sentAt: notification.sentAt,
  };
}
