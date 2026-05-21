import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { ApiVersionInterceptor } from '@lib/api-versioning';
import {
  HttpExceptionFilter,
  NotificationNotFoundError,
  UserDisabledError,
  UserNotFoundError,
} from '@lib/common';

import { NotificationChannel } from '../enums/notification-channel.enum';
import { AbstractNotificationsService } from '../interfaces/notifications-service.interface';
import {
  CreateNotificationInputFixture,
  NotificationFixture,
} from '../__tests__/__fixtures__/notification.fixtures';
import { NotificationsController } from './notifications.controller';
import { UserNotificationsController } from './user-notifications.controller';

describe('NotificationsController', () => {
  let app: INestApplication;
  let service: {
    createNotification: jest.Mock;
    findNotifications: jest.Mock;
    findNotificationById: jest.Mock;
    findNotificationsByUserId: jest.Mock;
    deleteNotification: jest.Mock;
  };

  beforeAll(async () => {
    service = {
      createNotification: jest.fn(),
      findNotifications: jest.fn(),
      findNotificationById: jest.fn(),
      findNotificationsByUserId: jest.fn(),
      deleteNotification: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController, UserNotificationsController],
      providers: [
        { provide: AbstractNotificationsService, useValue: service },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ApiVersionInterceptor },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /notifications', () => {
    it('should return 201 with v1 shape by default', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create({ channel: NotificationChannel.Email });
      const notification = NotificationFixture.create(input);
      service.createNotification.mockResolvedValue(notification);

      // Act
      const res = await request(app.getHttpServer()).post('/notifications').send({
        userId: input.userId,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
      });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: notification.id,
        userId: notification.userId,
        channel: notification.channel,
        subject: notification.subject,
        body: notification.body,
      });
    });

    it('should return 201 with v2 shape when header is set', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create({ channel: NotificationChannel.Email });
      const notification = NotificationFixture.create(input);
      service.createNotification.mockResolvedValue(notification);

      // Act
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .set('X-SpheraX-Api-Version', '2')
        .send({
          userId: input.userId,
          channel: input.channel,
          subject: input.subject,
          body: input.body,
        });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: notification.status,
        createdAt: notification.createdAt,
      });
    });

    it('should return 400 when required field is missing', async () => {
      // Act
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .send({ channel: NotificationChannel.Email, subject: 'Test', body: 'Body' });

      // Assert
      expect(res.status).toBe(400);
      expect(service.createNotification).not.toHaveBeenCalled();
    });

    it('should return 409 when user is disabled', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create();
      service.createNotification.mockRejectedValue(new UserDisabledError('x'));

      // Act
      const res = await request(app.getHttpServer()).post('/notifications').send({
        userId: input.userId,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
      });

      // Assert
      expect(res.status).toBe(409);
    });

    it('should return 404 when user does not exist', async () => {
      // Arrange
      const input = CreateNotificationInputFixture.create();
      service.createNotification.mockRejectedValue(new UserNotFoundError('x'));

      // Act
      const res = await request(app.getHttpServer()).post('/notifications').send({
        userId: input.userId,
        channel: input.channel,
        subject: input.subject,
        body: input.body,
      });

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe('GET /notifications', () => {
    it('should return 200 with list of notifications', async () => {
      // Arrange
      const notifications = NotificationFixture.createMany(2);
      service.findNotifications.mockReturnValue(notifications);

      // Act
      const res = await request(app.getHttpServer()).get('/notifications');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /notifications/:id', () => {
    it('should return 200 with notification', async () => {
      // Arrange
      const notification = NotificationFixture.create();
      service.findNotificationById.mockReturnValue(notification);

      // Act
      const res = await request(app.getHttpServer()).get(`/notifications/${notification.id}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: notification.id });
    });

    it('should return 404 when notification not found', async () => {
      // Arrange
      service.findNotificationById.mockImplementation(() => {
        throw new NotificationNotFoundError('x');
      });

      // Act
      const res = await request(app.getHttpServer()).get(
        '/notifications/00000000-0000-4000-8000-000000000099',
      );

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should return 204 when deleted successfully', async () => {
      // Arrange
      service.deleteNotification.mockReturnValue(undefined);

      // Act
      const res = await request(app.getHttpServer()).delete(
        '/notifications/00000000-0000-4000-8000-000000000001',
      );

      // Assert
      expect(res.status).toBe(204);
      expect(service.deleteNotification).toHaveBeenCalledWith(
        '00000000-0000-4000-8000-000000000001',
      );
    });

    it('should return 404 when notification not found', async () => {
      // Arrange
      service.deleteNotification.mockImplementation(() => {
        throw new NotificationNotFoundError('x');
      });

      // Act
      const res = await request(app.getHttpServer()).delete(
        '/notifications/00000000-0000-4000-8000-000000000099',
      );

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe('GET /users/:userId/notifications', () => {
    it('should return 200 with notifications for a user', async () => {
      // Arrange
      const userId = '00000000-0000-4000-8000-000000000001';
      const notifications = NotificationFixture.createMany(3, { userId });
      service.findNotificationsByUserId.mockReturnValue(notifications);

      // Act
      const res = await request(app.getHttpServer()).get(`/users/${userId}/notifications`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(service.findNotificationsByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
