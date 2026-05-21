import { ApiProperty } from '@nestjs/swagger';

import { SEED_USER_ACTIVE_ID } from '@lib/common';

import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

export class NotificationV1ResponseDto {
  @ApiProperty({
    description: 'Unique notification identifier (UUID v4).',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'UUID of the notification recipient.',
    example: SEED_USER_ACTIVE_ID,
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Delivery channel used for this notification.',
    enum: NotificationChannel,
    example: NotificationChannel.Email,
  })
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Notification subject line.',
    example: 'Welcome to SpheraX',
  })
  subject: string;

  @ApiProperty({
    description: 'Notification body content.',
    example: 'Thank you for joining SpheraX. Your account is now active.',
  })
  body: string;
}

export class NotificationV2ResponseDto extends NotificationV1ResponseDto {
  @ApiProperty({
    description: 'Current notification delivery status.',
    enum: NotificationStatus,
    example: NotificationStatus.Created,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the notification was created.',
    example: '2026-05-21T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the notification was sent. Null if not yet sent.',
    example: null,
    nullable: true,
    type: String,
  })
  sentAt: string | null;
}
