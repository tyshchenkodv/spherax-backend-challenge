import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { ApiVersionInterceptor } from '@lib/api-versioning';
import { HttpExceptionFilter, UserNotFoundError } from '@lib/common';

import { UserStatus } from '../enums/user-status.enum';
import { AbstractUsersService } from '../interfaces/users-service.interface';
import { UserFixture } from '../__tests__/__fixtures__/user.fixtures';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let app: INestApplication;
  let service: {
    createUser: jest.Mock;
    findUsers: jest.Mock;
    findUserById: jest.Mock;
    updateUserStatus: jest.Mock;
    validateNotificationRecipient: jest.Mock;
  };

  beforeAll(async () => {
    service = {
      createUser: jest.fn(),
      findUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUserStatus: jest.fn(),
      validateNotificationRecipient: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: AbstractUsersService, useValue: service },
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

  describe('POST /users', () => {
    it('should return 201 with v1 shape by default', async () => {
      // Arrange
      const user = UserFixture.create();
      service.createUser.mockReturnValue(user);

      // Act
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({ email: user.email, name: user.name });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: user.id, email: user.email, name: user.name });
    });

    it('should return 201 with v2 shape when header is set', async () => {
      // Arrange
      const user = UserFixture.create();
      service.createUser.mockReturnValue(user);

      // Act
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('X-SpheraX-Api-Version', '2')
        .send({ email: user.email, name: user.name });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: user.id, email: user.email, status: user.status });
    });

    it('should return 400 when email is missing', async () => {
      // Act
      const res = await request(app.getHttpServer()).post('/users').send({ name: 'No Email' });

      // Assert
      expect(res.status).toBe(400);
      expect(service.createUser).not.toHaveBeenCalled();
    });
  });

  describe('GET /users', () => {
    it('should return 200 with list of users in v1 shape', async () => {
      // Arrange
      const users = UserFixture.createMany(2);
      service.findUsers.mockReturnValue(users);

      // Act
      const res = await request(app.getHttpServer()).get('/users');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toEqual({ id: users[0].id, email: users[0].email, name: users[0].name });
    });

    it('should return 200 with empty list', async () => {
      // Arrange
      service.findUsers.mockReturnValue([]);

      // Act
      const res = await request(app.getHttpServer()).get('/users');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('should return 200 with v1 user shape by default', async () => {
      // Arrange
      const user = UserFixture.create();
      service.findUserById.mockReturnValue(user);

      // Act
      const res = await request(app.getHttpServer()).get(`/users/${user.id}`);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: user.id, email: user.email, name: user.name });
      expect(service.findUserById).toHaveBeenCalledWith(user.id);
    });

    it('should return 200 with v2 user shape when header is set', async () => {
      // Arrange
      const user = UserFixture.create();
      service.findUserById.mockReturnValue(user);

      // Act
      const res = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .set('X-SpheraX-Api-Version', '2');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: user.id,
        status: user.status,
        createdAt: user.createdAt,
      });
    });

    it('should propagate UserNotFoundError from service', async () => {
      // Arrange
      service.findUserById.mockImplementation(() => {
        throw new UserNotFoundError('x');
      });

      // Act
      const res = await request(app.getHttpServer()).get(
        '/users/00000000-0000-4000-8000-000000000099',
      );

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /users/:id/status', () => {
    it('should return 200 with updated user', async () => {
      // Arrange
      const user = UserFixture.createDisabled();
      service.updateUserStatus.mockReturnValue(user);

      // Act
      const res = await request(app.getHttpServer())
        .patch(`/users/${user.id}/status`)
        .send({ status: UserStatus.Disabled });

      // Assert
      expect(res.status).toBe(200);
      expect(service.updateUserStatus).toHaveBeenCalledWith(user.id, UserStatus.Disabled);
    });

    it('should return 400 when status is invalid', async () => {
      // Act
      const res = await request(app.getHttpServer())
        .patch('/users/00000000-0000-4000-8000-000000000099/status')
        .send({ status: 'invalid-status' });

      // Assert
      expect(res.status).toBe(400);
      expect(service.updateUserStatus).not.toHaveBeenCalled();
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      service.updateUserStatus.mockImplementation(() => {
        throw new UserNotFoundError('x');
      });

      // Act
      const res = await request(app.getHttpServer())
        .patch('/users/00000000-0000-4000-8000-000000000099/status')
        .send({ status: UserStatus.Active });

      // Assert
      expect(res.status).toBe(404);
    });
  });
});
