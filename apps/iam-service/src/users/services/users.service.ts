import { Injectable, Logger } from '@nestjs/common';

import { UserDisabledError, UserNotFoundError } from '@lib/common';

import { UserStatus } from '../enums/user-status.enum';
import type { ICreateUserInput, IUser } from '../interfaces/user.interface';
import { AbstractUsersRepository } from '../interfaces/users-repository.interface';
import { AbstractUsersService } from '../interfaces/users-service.interface';

@Injectable()
export class UsersService extends AbstractUsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly repository: AbstractUsersRepository) {
    super();
  }

  createUser(input: ICreateUserInput): IUser {
    const user = this.repository.create(input);
    this.logger.log(`User created: ${user.id}`);
    return user;
  }

  findUsers(): IUser[] {
    return this.repository.findAll();
  }

  findUserById(id: string): IUser {
    const user = this.repository.findById(id);

    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new UserNotFoundError(id);
    }

    return user;
  }

  updateUserStatus(id: string, status: UserStatus): IUser {
    const user = this.repository.updateStatus(id, status);

    if (!user) {
      this.logger.warn(`User not found for status update: ${id}`);
      throw new UserNotFoundError(id);
    }

    this.logger.log(`User ${id} status updated to: ${status}`);
    return user;
  }

  validateNotificationRecipient(userId: string): IUser {
    const user = this.findUserById(userId);

    if (user.status !== UserStatus.Active) {
      this.logger.warn(`Notification recipient is disabled: ${userId}`);
      throw new UserDisabledError(userId);
    }

    return user;
  }
}
