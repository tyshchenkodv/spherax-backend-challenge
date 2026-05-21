import { faker } from '@faker-js/faker';

import { UserStatus } from '../../enums/user-status.enum';
import type { ICreateUserInput, IUser } from '../../interfaces/user.interface';

export class UserFixture {
  static create(overrides?: Partial<IUser>): IUser {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      status: UserStatus.Active,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides,
    };
  }

  static createDisabled(overrides?: Partial<IUser>): IUser {
    return UserFixture.create({ status: UserStatus.Disabled, ...overrides });
  }

  static createMany(count: number, overrides?: Partial<IUser>): IUser[] {
    return Array.from({ length: count }, () => UserFixture.create(overrides));
  }
}

export class CreateUserInputFixture {
  static create(overrides?: Partial<ICreateUserInput>): ICreateUserInput {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      status: UserStatus.Active,
      ...overrides,
    };
  }
}
