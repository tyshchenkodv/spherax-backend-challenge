import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiVersionHeader, RequestApiVersion, type ApiVersion } from '@lib/api-versioning';
import { ErrorResponseDto } from '@lib/common';

import { NotificationV2ResponseDto } from '../dto/notification-response.dto';
import type { NotificationResponse } from '../types/notification-response.types';
import { AbstractNotificationsService } from '../interfaces/notifications-service.interface';
import { mapNotificationToResponse } from '../mappers/notification-response.mapper';

@ApiTags('Users')
@ApiVersionHeader()
@ApiBadRequestResponse({
  description: 'Invalid UUID format or unsupported API version.',
  type: ErrorResponseDto,
})
@Controller('users')
export class UserNotificationsController {
  constructor(private readonly notificationsService: AbstractNotificationsService) {}

  @ApiOperation({ summary: 'Get all notifications for a specific user' })
  @ApiOkResponse({
    description:
      'User notifications returned. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: [NotificationV2ResponseDto],
  })
  @Get(':userId/notifications')
  findUserNotifications(
    @Param('userId', ParseUUIDPipe) userId: string,
    @RequestApiVersion() apiVersion: ApiVersion,
  ): NotificationResponse[] {
    return this.notificationsService
      .findNotificationsByUserId(userId)
      .map((notification) => mapNotificationToResponse(notification, apiVersion));
  }
}
