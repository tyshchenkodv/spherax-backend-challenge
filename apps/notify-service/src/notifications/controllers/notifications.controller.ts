import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiVersionHeader, RequestApiVersion, type ApiVersion } from '@lib/api-versioning';
import { ErrorResponseDto } from '@lib/common';

import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationV2ResponseDto } from '../dto/notification-response.dto';
import type { NotificationResponse } from '../types/notification-response.types';
import { AbstractNotificationsService } from '../interfaces/notifications-service.interface';
import { mapNotificationToResponse } from '../mappers/notification-response.mapper';

@ApiTags('Notifications')
@ApiVersionHeader()
@ApiBadRequestResponse({
  description: 'Invalid request body, UUID format, or unsupported API version.',
  type: ErrorResponseDto,
})
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: AbstractNotificationsService) {}

  @ApiOperation({ summary: 'Create a notification for an active user' })
  @ApiCreatedResponse({
    description:
      'Notification created. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: NotificationV2ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Recipient user not found.', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Recipient user is disabled.', type: ErrorResponseDto })
  @Post()
  async createNotification(
    @Body() dto: CreateNotificationDto,
    @RequestApiVersion() apiVersion: ApiVersion,
  ): Promise<NotificationResponse> {
    const notification = await this.notificationsService.createNotification(dto);
    return mapNotificationToResponse(notification, apiVersion);
  }

  @ApiOperation({ summary: 'Get all notifications' })
  @ApiOkResponse({
    description:
      'Notifications returned. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: [NotificationV2ResponseDto],
  })
  @Get()
  findNotifications(@RequestApiVersion() apiVersion: ApiVersion): NotificationResponse[] {
    return this.notificationsService
      .findNotifications()
      .map((notification) => mapNotificationToResponse(notification, apiVersion));
  }

  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiOkResponse({
    description:
      'Notification returned. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: NotificationV2ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Notification not found.', type: ErrorResponseDto })
  @Get(':id')
  findNotificationById(
    @Param('id', ParseUUIDPipe) id: string,
    @RequestApiVersion() apiVersion: ApiVersion,
  ): NotificationResponse {
    return mapNotificationToResponse(
      this.notificationsService.findNotificationById(id),
      apiVersion,
    );
  }

  @ApiOperation({ summary: 'Delete a notification by ID' })
  @ApiNoContentResponse({ description: 'Notification deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Notification not found.', type: ErrorResponseDto })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNotification(@Param('id', ParseUUIDPipe) id: string): void {
    this.notificationsService.deleteNotification(id);
  }
}
