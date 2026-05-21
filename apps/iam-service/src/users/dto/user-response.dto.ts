import { ApiProperty } from '@nestjs/swagger';

import { SEED_USER_ACTIVE_ID } from '@lib/common';

import { UserStatus } from '../enums/user-status.enum';

export class UserV1ResponseDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID v4).',
    example: SEED_USER_ACTIVE_ID,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'john@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Full display name of the user.',
    example: 'John Doe',
  })
  name: string;
}

export class UserV2ResponseDto extends UserV1ResponseDto {
  @ApiProperty({
    description: 'Current user status.',
    enum: UserStatus,
    example: UserStatus.Active,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the user was created.',
    example: '2026-05-21T10:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp of the last status update.',
    example: '2026-05-21T10:00:00.000Z',
  })
  updatedAt: string;
}
