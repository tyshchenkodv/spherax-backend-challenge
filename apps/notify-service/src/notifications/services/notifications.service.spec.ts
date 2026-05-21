import { Test, type TestingModule } from '@nestjs/testing';

import { NotificationNotFoundError, UserDisabledError, UserNotFoundError } from '@lib/common';

import { AbstractIamClient } from '../../iam-client/interfaces/iam-client.interface';
import { AbstractNotificationsRepository } from '../interfaces/notifications-repository.interface';
import {
  CreateNotificationInputFixture,
  NotificationFixture,
} from '../__tests__/__fixtures__/notification.fixtures';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findById: jest.Mock;
    findByUserId: jest.Mock;
    delete: jest.Mock;
  };
  let iamClient: { validateNotificationRecipient: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
    };

    iamClient = {
      validateNotificationRecipient: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: AbstractNotificationsRepository, useValue: repository },
        { provide: AbstractIamClient, useValue: iamClient },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#createNotification', () => {
    it('should create and return a notification for a valid user', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create();
      const expected = NotificationFixture.create(input);
      iamClient.validateNotificationRecipient.mockResolvedValue({ id: input.userId });
      repository.create.mockReturnValue(expected);

      // Act
      const result = await service.createNotification(input);

      // Assert
      expect(result).toEqual(expected);
      expect(iamClient.validateNotificationRecipient).toHaveBeenCalledWith(input.userId);
      expect(repository.create).toHaveBeenCalledWith(input);
    });

    it('should propagate UserNotFoundError when IAM rejects with not found', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create();
      iamClient.validateNotificationRecipient.mockRejectedValue(new UserNotFoundError('x'));

      // Act & Assert
      await expect(service.createNotification(input)).rejects.toBeInstanceOf(UserNotFoundError);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should propagate UserDisabledError when IAM rejects with user disabled', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create();
      iamClient.validateNotificationRecipient.mockRejectedValue(new UserDisabledError('x'));

      // Act & Assert
      await expect(service.createNotification(input)).rejects.toBeInstanceOf(UserDisabledError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('#findNotifications', () => {
    it('should return all notifications', () => {
      // Arrange
      const notifications = NotificationFixture.createMany(3);
      repository.findAll.mockReturnValue(notifications);

      // Act
      const result = service.findNotifications();

      // Assert
      expect(result).toEqual(notifications);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no notifications exist', () => {
      // Arrange
      repository.findAll.mockReturnValue([]);

      // Act
      const result = service.findNotifications();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('#findNotificationById', () => {
    it('should return the notification when found', () => {
      // Arrange
      const notification = NotificationFixture.create();
      repository.findById.mockReturnValue(notification);

      // Act
      const result = service.findNotificationById(notification.id);

      // Assert
      expect(result).toEqual(notification);
      expect(repository.findById).toHaveBeenCalledWith(notification.id);
    });

    it('should throw NotificationNotFoundError when not found', () => {
      // Arrange
      repository.findById.mockReturnValue(undefined);

      // Act & Assert
      expect(() => service.findNotificationById('missing-id')).toThrow(NotificationNotFoundError);
    });
  });

  describe('#findNotificationsByUserId', () => {
    it('should return notifications for a given user', () => {
      // Arrange
      const userId = 'user-1';
      const notifications = NotificationFixture.createMany(2, { userId });
      repository.findByUserId.mockReturnValue(notifications);

      // Act
      const result = service.findNotificationsByUserId(userId);

      // Assert
      expect(result).toEqual(notifications);
      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when user has no notifications', () => {
      // Arrange
      repository.findByUserId.mockReturnValue([]);

      // Act
      const result = service.findNotificationsByUserId('user-without-notifications');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('#deleteNotification', () => {
    it('should delete the notification when it exists', () => {
      // Arrange
      repository.delete.mockReturnValue(true);

      // Act & Assert
      expect(() => {
        service.deleteNotification('notif-1');
      }).not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith('notif-1');
    });

    it('should throw NotificationNotFoundError when notification does not exist', () => {
      // Arrange
      repository.delete.mockReturnValue(false);

      // Act & Assert
      expect(() => {
        service.deleteNotification('missing-id');
      }).toThrow(NotificationNotFoundError);
    });
  });
});
