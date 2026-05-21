import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { DomainErrorGrpcFilter } from '@lib/grpc';

import { AbstractUsersService } from '../interfaces/users-service.interface';
import type { IUser } from '../interfaces/user.interface';

interface GetUserByIdRequest {
  id: string;
}

interface ValidateNotificationRecipientRequest {
  userId: string;
}

@UseFilters(DomainErrorGrpcFilter)
@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: AbstractUsersService) {}

  @GrpcMethod('IamService', 'GetUserById')
  getUserById(request: GetUserByIdRequest): IUser {
    return this.usersService.findUserById(request.id);
  }

  @GrpcMethod('IamService', 'ValidateNotificationRecipient')
  validateNotificationRecipient(request: ValidateNotificationRecipientRequest): IUser {
    return this.usersService.validateNotificationRecipient(request.userId);
  }
}
