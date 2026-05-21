import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address. Must be unique. Max 254 characters.',
    example: 'john@example.com',
    format: 'email',
    maxLength: 254,
  })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Full display name of the user. Min 1, max 100 characters.',
    example: 'John Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Initial user status. Defaults to "active" when omitted.',
    enum: UserStatus,
    example: UserStatus.Active,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
