import { status } from '@grpc/grpc-js';
import { firstValueFrom, type Observable } from 'rxjs';

import { INestMicroservice } from '@nestjs/common';
import { ClientProxyFactory, type ClientGrpc, type ClientProxy } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';

import {
  SEED_USER_ACTIVE_ID,
  SEED_USER_DISABLED_ID,
  UserDisabledError,
  UserNotFoundError,
} from '@lib/common';
import { createGrpcClientOptions } from '@lib/grpc';
import {
  IAM_PROTO_PACKAGE,
  IAM_PROTO_PATH,
  NOTIFY_PROTO_PACKAGE,
  NOTIFY_PROTO_PATH,
} from '@lib/proto';

import { AppModule } from '../src/app/app.module';
import { AppModule as IamAppModule } from '../../iam-service/src/app/app.module';
import { AbstractIamClient } from '../src/iam-client/interfaces/iam-client.interface';
import type { INotification } from '../src/notifications/interfaces/notification.interface';

interface NotifyGrpcClient {
  createNotification(request: {
    userId: string;
    channel: string;
    subject: string;
    body: string;
  }): Observable<INotification>;
  getNotificationById(request: { id: string }): Observable<INotification>;
}

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

describe('Notify gRPC API', () => {
  let microservice: INestMicroservice;
  let clientProxy: ClientProxy;
  let notifyClient: NotifyGrpcClient;

  beforeAll(async () => {
    process.env.NOTIFY_GRPC_URL = '0.0.0.0:55052';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AbstractIamClient)
      .useValue(mockIamClient)
      .compile();

    microservice = moduleRef.createNestMicroservice(
      createGrpcClientOptions({
        packageName: NOTIFY_PROTO_PACKAGE,
        protoPath: NOTIFY_PROTO_PATH,
        url: '0.0.0.0:55052',
      }),
    );

    await microservice.listen();

    clientProxy = ClientProxyFactory.create(
      createGrpcClientOptions({
        packageName: NOTIFY_PROTO_PACKAGE,
        protoPath: NOTIFY_PROTO_PATH,
        url: '0.0.0.0:55052',
      }),
    );
    notifyClient = (clientProxy as unknown as ClientGrpc).getService<NotifyGrpcClient>(
      'NotifyService',
    );
  });

  afterAll(async () => {
    await clientProxy.close();
    await microservice.close();
  });

  it('creates a notification via gRPC', async () => {
    const notification = await firstValueFrom(
      notifyClient.createNotification({
        userId: SEED_USER_ACTIVE_ID,
        channel: 'email',
        subject: 'Test',
        body: 'Test body',
      }),
    );

    expect(notification).toMatchObject({
      id: expect.any(String),
      userId: SEED_USER_ACTIVE_ID,
      channel: 'email',
      subject: 'Test',
      body: 'Test body',
      status: 'created',
    });
  });

  it('retrieves a notification by ID via gRPC', async () => {
    const created = await firstValueFrom(
      notifyClient.createNotification({
        userId: SEED_USER_ACTIVE_ID,
        channel: 'sms',
        subject: 'Test',
        body: 'SMS body',
      }),
    );

    const retrieved = await firstValueFrom(notifyClient.getNotificationById({ id: created.id }));

    expect(retrieved).toMatchObject({
      id: created.id,
      userId: SEED_USER_ACTIVE_ID,
      channel: 'sms',
    });
  });

  it('rejects notification creation for disabled users', async () => {
    await expect(
      firstValueFrom(
        notifyClient.createNotification({
          userId: SEED_USER_DISABLED_ID,
          channel: 'email',
          subject: 'Test',
          body: 'Test body',
        }),
      ),
    ).rejects.toMatchObject({
      code: status.FAILED_PRECONDITION,
      details: 'USER_DISABLED',
    });
  });

  it('rejects notification creation for missing users', async () => {
    await expect(
      firstValueFrom(
        notifyClient.createNotification({
          userId: '00000000-0000-4000-8000-000000000099',
          channel: 'email',
          subject: 'Test',
          body: 'Test body',
        }),
      ),
    ).rejects.toMatchObject({
      code: status.NOT_FOUND,
      details: 'USER_NOT_FOUND',
    });
  });
});

describe('Notify to IAM gRPC integration', () => {
  let iamMicroservice: INestMicroservice;
  let notifyMicroservice: INestMicroservice;
  let notifyClientProxy: ClientProxy;
  let notifyClient: NotifyGrpcClient;

  beforeAll(async () => {
    process.env.IAM_GRPC_CLIENT_URL = 'localhost:55061';
    process.env.NOTIFY_GRPC_URL = '0.0.0.0:55062';

    const iamModuleRef = await Test.createTestingModule({
      imports: [IamAppModule],
    }).compile();

    iamMicroservice = iamModuleRef.createNestMicroservice(
      createGrpcClientOptions({
        packageName: IAM_PROTO_PACKAGE,
        protoPath: IAM_PROTO_PATH,
        url: '0.0.0.0:55061',
      }),
    );
    await iamMicroservice.listen();

    const notifyModuleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    notifyMicroservice = notifyModuleRef.createNestMicroservice(
      createGrpcClientOptions({
        packageName: NOTIFY_PROTO_PACKAGE,
        protoPath: NOTIFY_PROTO_PATH,
        url: '0.0.0.0:55062',
      }),
    );
    await notifyMicroservice.listen();

    notifyClientProxy = ClientProxyFactory.create(
      createGrpcClientOptions({
        packageName: NOTIFY_PROTO_PACKAGE,
        protoPath: NOTIFY_PROTO_PATH,
        url: '0.0.0.0:55062',
      }),
    );
    notifyClient = (notifyClientProxy as unknown as ClientGrpc).getService<NotifyGrpcClient>(
      'NotifyService',
    );
  });

  afterAll(async () => {
    await notifyClientProxy.close();
    await notifyMicroservice.close();
    await iamMicroservice.close();
  });

  it('creates notifications only after IAM validates the recipient over gRPC', async () => {
    const notification = await firstValueFrom(
      notifyClient.createNotification({
        userId: SEED_USER_ACTIVE_ID,
        channel: 'email',
        subject: 'Real IAM validation',
        body: 'Created after a real notify to IAM gRPC call',
      }),
    );

    expect(notification).toMatchObject({
      id: expect.any(String),
      userId: SEED_USER_ACTIVE_ID,
      channel: 'email',
      subject: 'Real IAM validation',
      status: 'created',
    });
  });

  it('maps IAM disabled-user gRPC errors through notify gRPC', async () => {
    await expect(
      firstValueFrom(
        notifyClient.createNotification({
          userId: SEED_USER_DISABLED_ID,
          channel: 'email',
          subject: 'Blocked',
          body: 'Disabled users cannot receive notifications',
        }),
      ),
    ).rejects.toMatchObject({
      code: status.FAILED_PRECONDITION,
      details: 'USER_DISABLED',
    });
  });
});
