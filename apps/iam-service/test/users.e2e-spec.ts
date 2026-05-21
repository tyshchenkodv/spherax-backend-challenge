import type { AddressInfo } from 'node:net';

import request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { SEED_USER_ACTIVE_ID } from '@lib/common';

import { AppModule } from '../src/app/app.module';

describe('IAM users REST API', () => {
  let app: INestApplication;
  let baseUrl: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as AddressInfo;

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns version 1 user shape by default', async () => {
    const response = await request(baseUrl).get(`/users/${SEED_USER_ACTIVE_ID}`).expect(200);

    expect(response.body).toEqual({
      id: SEED_USER_ACTIVE_ID,
      email: 'john@example.com',
      name: 'John Doe',
    });
  });

  it('returns version 2 user shape with extended fields', async () => {
    const response = await request(baseUrl)
      .get(`/users/${SEED_USER_ACTIVE_ID}`)
      .set('X-SpheraX-Api-Version', '2')
      .expect(200);

    expect(response.body).toMatchObject({
      id: SEED_USER_ACTIVE_ID,
      email: 'john@example.com',
      name: 'John Doe',
      status: 'active',
      createdAt: '2026-05-21T10:00:00.000Z',
      updatedAt: '2026-05-21T10:00:00.000Z',
    });
  });

  it('rejects unsupported API versions', async () => {
    const response = await request(baseUrl)
      .get(`/users/${SEED_USER_ACTIVE_ID}`)
      .set('X-SpheraX-Api-Version', '3')
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'UNSUPPORTED_API_VERSION',
      statusCode: 400,
    });
  });

  describe('Correlation ID', () => {
    it('generates X-Correlation-Id when not provided', async () => {
      const response = await request(baseUrl).get(`/users/${SEED_USER_ACTIVE_ID}`).expect(200);

      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('preserves X-Correlation-Id when provided', async () => {
      const correlationId = 'test-correlation-id-123';
      const response = await request(baseUrl)
        .get(`/users/${SEED_USER_ACTIVE_ID}`)
        .set('X-Correlation-Id', correlationId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });

    it('includes correlationId in error responses', async () => {
      const correlationId = 'error-trace-abc';
      const response = await request(baseUrl)
        .get(`/users/${SEED_USER_ACTIVE_ID}`)
        .set('X-SpheraX-Api-Version', '99')
        .set('X-Correlation-Id', correlationId)
        .expect(400);

      expect(response.body).toMatchObject({
        code: 'UNSUPPORTED_API_VERSION',
        correlationId,
      });
    });
  });
});
