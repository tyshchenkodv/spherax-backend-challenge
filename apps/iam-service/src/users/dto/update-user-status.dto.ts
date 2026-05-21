import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'New status to assign to the user.',
    enum: UserStatus,
    example: UserStatus.Disabled,
  })
  @IsEnum(UserStatus)
  status: UserStatus;
}
