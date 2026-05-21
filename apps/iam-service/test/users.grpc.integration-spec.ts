import { status } from '@grpc/grpc-js';
import { firstValueFrom, type Observable } from 'rxjs';

import { INestMicroservice } from '@nestjs/common';
import { ClientProxyFactory, type ClientGrpc, type ClientProxy } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';

import { createGrpcClientOptions } from '@lib/grpc';
import { IAM_PROTO_PACKAGE, IAM_PROTO_PATH } from '@lib/proto';
import { SEED_USER_ACTIVE_ID, SEED_USER_DISABLED_ID } from '@lib/common';

import { AppModule } from '../src/app/app.module';
import type { IUser } from '../src/users/interfaces/user.interface';

interface IamGrpcClient {
  validateNotificationRecipient(request: { userId: string }): Observable<IUser>;
}

describe('IAM gRPC API', () => {
  let microservice: INestMicroservice;
  let clientProxy: ClientProxy;
  let iamClient: IamGrpcClient;

  beforeAll(async () => {
    process.env.IAM_GRPC_URL = '0.0.0.0:55051';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    microservice = moduleRef.createNestMicroservice(
      createGrpcClientOptions({
        packageName: IAM_PROTO_PACKAGE,
        protoPath: IAM_PROTO_PATH,
        url: '0.0.0.0:55051',
      }),
    );

    await microservice.listen();

    clientProxy = ClientProxyFactory.create(
      createGrpcClientOptions({
        packageName: IAM_PROTO_PACKAGE,
        protoPath: IAM_PROTO_PATH,
        url: '0.0.0.0:55051',
      }),
    );
    iamClient = (clientProxy as unknown as ClientGrpc).getService<IamGrpcClient>('IamService');
  });

  afterAll(async () => {
    await clientProxy.close();
    await microservice.close();
  });

  it('validates active notification recipients', async () => {
    const user = await firstValueFrom(
      iamClient.validateNotificationRecipient({ userId: SEED_USER_ACTIVE_ID }),
    );

    expect(user).toMatchObject({
      id: SEED_USER_ACTIVE_ID,
      status: 'active',
    });
  });

  it('rejects disabled notification recipients', async () => {
    await expect(
      firstValueFrom(iamClient.validateNotificationRecipient({ userId: SEED_USER_DISABLED_ID })),
    ).rejects.toMatchObject({
      code: status.FAILED_PRECONDITION,
      details: 'USER_DISABLED',
    });
  });

  it('rejects missing notification recipients', async () => {
    await expect(
      firstValueFrom(
        iamClient.validateNotificationRecipient({ userId: '00000000-0000-4000-8000-000000000099' }),
      ),
    ).rejects.toMatchObject({
      code: status.NOT_FOUND,
      details: 'USER_NOT_FOUND',
    });
  });
});
