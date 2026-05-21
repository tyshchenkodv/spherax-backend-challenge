import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { InvalidRequestError } from '@lib/common';
import { DomainErrorGrpcFilter } from '@lib/grpc';

import { NotificationChannel } from '../enums/notification-channel.enum';
import type { INotification } from '../interfaces/notification.interface';
import { AbstractNotificationsService } from '../interfaces/notifications-service.interface';

interface GetNotificationByIdRequest {
  id: string;
}

interface CreateNotificationRequest {
  userId: string;
  channel: string;
  subject: string;
  body: string;
}

function parseNotificationChannel(value: string): NotificationChannel {
  if (Object.values(NotificationChannel).includes(value as NotificationChannel)) {
    return value as NotificationChannel;
  }
  throw new InvalidRequestError(`Invalid notification channel: ${value}`);
}

@UseFilters(DomainErrorGrpcFilter)
@Controller()
export class NotificationsGrpcController {
  constructor(private readonly notificationsService: AbstractNotificationsService) {}

  @GrpcMethod('NotifyService', 'GetNotificationById')
  getNotificationById(request: GetNotificationByIdRequest): INotification {
    return this.notificationsService.findNotificationById(request.id);
  }

  @GrpcMethod('NotifyService', 'CreateNotification')
  async createNotification(request: CreateNotificationRequest): Promise<INotification> {
    return this.notificationsService.createNotification({
      userId: request.userId,
      channel: parseNotificationChannel(request.channel),
      subject: request.subject,
      body: request.body,
    });
  }
}
