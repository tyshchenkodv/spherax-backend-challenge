import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

import { SEED_USER_ACTIVE_ID } from '@lib/common';

import { NotificationChannel } from '../enums/notification-channel.enum';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'UUID of the notification recipient. Must be an active user.',
    example: SEED_USER_ACTIVE_ID,
    format: 'uuid',
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Delivery channel for the notification.',
    enum: NotificationChannel,
    example: NotificationChannel.Email,
  })
  @IsNotEmpty()
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Notification subject line. Max 200 characters.',
    example: 'Welcome to SpheraX',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Notification body content. Max 5000 characters.',
    example: 'Thank you for joining SpheraX. Your account is now active.',
    maxLength: 5000,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  body: string;
}
