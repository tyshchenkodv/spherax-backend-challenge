import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ErrorCode } from '../constants/error-codes.constants';

/**
 * Standard error response shape returned by HttpExceptionFilter.
 * Used to document error responses in Swagger across both services.
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code.',
    enum: HttpStatus,
    example: HttpStatus.BAD_REQUEST,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Stable machine-readable error code.',
    enum: ErrorCode,
    example: ErrorCode.INVALID_REQUEST,
  })
  code: ErrorCode;

  @ApiProperty({
    description: 'Human-readable error description.',
    example: 'User not found: 00000000-0000-4000-8000-000000000099',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Correlation ID of the request. Omitted when no request context is available.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  correlationId?: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp of the error.',
    example: '2026-05-21T10:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path that produced the error.',
    example: '/users/00000000-0000-4000-8000-000000000099',
  })
  path: string;
}
