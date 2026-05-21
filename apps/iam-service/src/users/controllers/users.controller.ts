import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiVersionHeader, RequestApiVersion, type ApiVersion } from '@lib/api-versioning';
import { ErrorResponseDto } from '@lib/common';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UserV2ResponseDto } from '../dto/user-response.dto';
import { AbstractUsersService } from '../interfaces/users-service.interface';
import type { UserResponse } from '../types/user-response.types';
import { mapUserToResponse } from '../mappers/user-response.mapper';

@ApiTags('Users')
@ApiVersionHeader()
@ApiBadRequestResponse({
  description: 'Invalid request body, UUID format, or unsupported API version.',
  type: ErrorResponseDto,
})
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: AbstractUsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User created. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: UserV2ResponseDto,
  })
  @Post()
  createUser(
    @Body() dto: CreateUserDto,
    @RequestApiVersion() apiVersion: ApiVersion,
  ): UserResponse {
    return mapUserToResponse(this.usersService.createUser(dto), apiVersion);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'Users returned. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: [UserV2ResponseDto],
  })
  @Get()
  findUsers(@RequestApiVersion() apiVersion: ApiVersion): UserResponse[] {
    return this.usersService.findUsers().map((user) => mapUserToResponse(user, apiVersion));
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiOkResponse({
    description: 'User returned. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: UserV2ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.', type: ErrorResponseDto })
  @Get(':id')
  findUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @RequestApiVersion() apiVersion: ApiVersion,
  ): UserResponse {
    return mapUserToResponse(this.usersService.findUserById(id), apiVersion);
  }

  @ApiOperation({ summary: 'Update the status of a user' })
  @ApiOkResponse({
    description:
      'User status updated. Response shape depends on X-SpheraX-Api-Version (default: v1).',
    type: UserV2ResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found.', type: ErrorResponseDto })
  @Patch(':id/status')
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @RequestApiVersion() apiVersion: ApiVersion,
  ): UserResponse {
    return mapUserToResponse(this.usersService.updateUserStatus(id, dto.status), apiVersion);
  }
}
