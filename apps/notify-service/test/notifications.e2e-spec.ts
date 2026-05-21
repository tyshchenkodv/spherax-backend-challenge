import type { AddressInfo } from 'node:net';

import request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  SEED_USER_ACTIVE_ID,
  SEED_USER_DISABLED_ID,
  UserDisabledError,
  UserNotFoundError,
} from '@lib/common';

import { AppModule } from '../src/app/app.module';
import { AbstractIamClient } from '../src/iam-client/interfaces/iam-client.interface';

const mockIamClient: Pick<AbstractIamClient, 'validateNotificationRecipient'> = {
  validateNotificationRecipient: (userId: string) => {
    if (userId === SEED_USER_DISABLED_ID) return Promise.reject(new UserDisabledError(userId));
    if (userId !== SEED_USER_ACTIVE_ID) return Promise.reject(new UserNotFoundError(userId));
    return Promise.resolve({
      id: userId,
      email: 'john@example.com',
      name: 'John Doe',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    });
  },
};

describe('Notify notifications REST API', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AbstractIamClient)
      .useValue(mockIamClient)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns version 1 notification shape by default', async () => {
    const response = await request(baseUrl)
      .post('/notifications')
      .send({ userId: SEED_USER_ACTIVE_ID, channel: 'email', subject: 'Test', body: 'Test body' })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      userId: SEED_USER_ACTIVE_ID,
      channel: 'email',
      subject: 'Test',
      body: 'Test body',
    });
  });

  it('returns version 2 notification shape with extended fields', async () => {
    const response = await request(baseUrl)
      .post('/notifications')
      .set('X-SpheraX-Api-Version', '2')
      .send({ userId: SEED_USER_ACTIVE_ID, channel: 'email', subject: 'Test', body: 'Test body' })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      userId: SEED_USER_ACTIVE_ID,
      channel: 'email',
      subject: 'Test',
      body: 'Test body',
      status: 'created',
      createdAt: expect.any(String),
      sentAt: null,
    });
  });

  it('rejects unsupported API versions', async () => {
    const response = await request(baseUrl)
      .post('/notifications')
      .set('X-SpheraX-Api-Version', '3')
      .send({ userId: SEED_USER_ACTIVE_ID, channel: 'email', subject: 'Test', body: 'Test body' })
      .expect(400);

    expect(response.body).toMatchObject({ code: 'UNSUPPORTED_API_VERSION', statusCode: 400 });
  });

  it('rejects notification for disabled user with 409', async () => {
    const response = await request(baseUrl)
      .post('/notifications')
      .send({ userId: SEED_USER_DISABLED_ID, channel: 'email', subject: 'Test', body: 'Test body' })
      .expect(409);

    expect(response.body).toMatchObject({ code: 'USER_DISABLED', statusCode: 409 });
  });

  describe('Correlation ID', () => {
    it('generates X-Correlation-Id when not provided', async () => {
      const response = await request(baseUrl)
        .post('/notifications')
        .send({ userId: SEED_USER_ACTIVE_ID, channel: 'email', subject: 'Test', body: 'Test body' })
        .expect(201);

      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('preserves X-Correlation-Id when provided', async () => {
      const correlationId = 'notify-trace-xyz';
      const response = await request(baseUrl)
        .post('/notifications')
        .set('X-Correlation-Id', correlationId)
        .send({ userId: SEED_USER_ACTIVE_ID, channel: 'email', subject: 'Test', body: 'Test body' })
        .expect(201);

      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });

    it('includes correlationId in error responses', async () => {
      const correlationId = 'error-notify-trace';
      const response = await request(baseUrl)
        .post('/notifications')
        .set('X-Correlation-Id', correlationId)
        .send({
          userId: SEED_USER_DISABLED_ID,
          channel: 'email',
          subject: 'Test',
          body: 'Test body',
        })
        .expect(409);

      expect(response.body).toMatchObject({
        code: 'USER_DISABLED',
        correlationId,
      });
    });
  });
});
