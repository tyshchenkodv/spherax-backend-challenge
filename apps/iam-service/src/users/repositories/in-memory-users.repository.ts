import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { SEED_USER_ACTIVE_ID, SEED_USER_DISABLED_ID } from '@lib/common';

import { UserStatus } from '../enums/user-status.enum';
import type { ICreateUserInput, IUser } from '../interfaces/user.interface';
import { AbstractUsersRepository } from '../interfaces/users-repository.interface';

@Injectable()
export class InMemoryUsersRepository extends AbstractUsersRepository {
  private readonly users = new Map<string, IUser>();

  constructor() {
    super();
    this.seed();
  }

  create(input: ICreateUserInput): IUser {
    const now = new Date().toISOString();
    const user: IUser = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      status: input.status ?? UserStatus.Active,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);

    return user;
  }

  findAll(): IUser[] {
    return [...this.users.values()];
  }

  findById(id: string): IUser | undefined {
    return this.users.get(id);
  }

  updateStatus(id: string, status: UserStatus): IUser | undefined {
    const user = this.users.get(id);

    if (!user) {
      return undefined;
    }

    const updatedUser: IUser = {
      ...user,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);

    return updatedUser;
  }

  private seed(): void {
    const createdAt = '2026-05-21T10:00:00.000Z';

    this.users.set(SEED_USER_ACTIVE_ID, {
      id: SEED_USER_ACTIVE_ID,
      email: 'john@example.com',
      name: 'John Doe',
      status: UserStatus.Active,
      createdAt,
      updatedAt: createdAt,
    });

    this.users.set(SEED_USER_DISABLED_ID, {
      id: SEED_USER_DISABLED_ID,
      email: 'disabled@example.com',
      name: 'Disabled User',
      status: UserStatus.Disabled,
      createdAt,
      updatedAt: createdAt,
    });
  }
}
