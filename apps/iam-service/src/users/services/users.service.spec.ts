import { Test, type TestingModule } from '@nestjs/testing';

import { UserDisabledError, UserNotFoundError } from '@lib/common';

import { UserStatus } from '../enums/user-status.enum';
import { AbstractUsersRepository } from '../interfaces/users-repository.interface';
import { CreateUserInputFixture, UserFixture } from '../__tests__/__fixtures__/user.fixtures';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: AbstractUsersRepository, useValue: repository }],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#createUser', () => {
    it('should create and return a user', () => {
      // Arrange
      const input = CreateUserInputFixture.create();
      const expected = UserFixture.create(input);
      repository.create.mockReturnValue(expected);

      // Act
      const result = service.createUser(input);

      // Assert
      expect(result).toEqual(expected);
      expect(repository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('#findUsers', () => {
    it('should return all users', () => {
      // Arrange
      const users = UserFixture.createMany(3);
      repository.findAll.mockReturnValue(users);

      // Act
      const result = service.findUsers();

      // Assert
      expect(result).toEqual(users);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no users exist', () => {
      // Arrange
      repository.findAll.mockReturnValue([]);

      // Act
      const result = service.findUsers();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('#findUserById', () => {
    it('should return the user when found', () => {
      // Arrange
      const user = UserFixture.create();
      repository.findById.mockReturnValue(user);

      // Act
      const result = service.findUserById(user.id);

      // Assert
      expect(result).toEqual(user);
      expect(repository.findById).toHaveBeenCalledWith(user.id);
    });

    it('should throw UserNotFoundError when user does not exist', () => {
      // Arrange
      repository.findById.mockReturnValue(undefined);

      // Act & Assert
      expect(() => service.findUserById('missing-id')).toThrow(UserNotFoundError);
    });
  });

  describe('#updateUserStatus', () => {
    it('should update and return the user', () => {
      // Arrange
      const user = UserFixture.create();
      const updated = UserFixture.create({ ...user, status: UserStatus.Disabled });
      repository.updateStatus.mockReturnValue(updated);

      // Act
      const result = service.updateUserStatus(user.id, UserStatus.Disabled);

      // Assert
      expect(result).toEqual(updated);
      expect(repository.updateStatus).toHaveBeenCalledWith(user.id, UserStatus.Disabled);
    });

    it('should throw UserNotFoundError when user does not exist', () => {
      // Arrange
      repository.updateStatus.mockReturnValue(undefined);

      // Act & Assert
      expect(() => service.updateUserStatus('missing-id', UserStatus.Active)).toThrow(
        UserNotFoundError,
      );
    });
  });

  describe('#validateNotificationRecipient', () => {
    it('should return user when active', () => {
      // Arrange
      const activeUser = UserFixture.create({ status: UserStatus.Active });
      repository.findById.mockReturnValue(activeUser);

      // Act
      const result = service.validateNotificationRecipient(activeUser.id);

      // Assert
      expect(result).toEqual(activeUser);
    });

    it('should throw UserDisabledError when user is disabled', () => {
      // Arrange
      const disabledUser = UserFixture.createDisabled();
      repository.findById.mockReturnValue(disabledUser);

      // Act & Assert
      expect(() => service.validateNotificationRecipient(disabledUser.id)).toThrow(
        UserDisabledError,
      );
    });

    it('should throw UserNotFoundError when user does not exist', () => {
      // Arrange
      repository.findById.mockReturnValue(undefined);

      // Act & Assert
      expect(() => service.validateNotificationRecipient('missing-id')).toThrow(UserNotFoundError);
    });
  });
});
