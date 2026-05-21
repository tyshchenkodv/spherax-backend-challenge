import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

import { IAM_PROTO_PACKAGE, IAM_PROTO_PATH } from '@lib/proto';

import { IamClient } from './clients/iam.client';
import { IAM_SERVICE_GRPC_TOKEN } from './constants/iam-client.constants';
import { AbstractIamClient } from './interfaces/iam-client.interface';

@Module({
  providers: [
    {
      provide: IAM_SERVICE_GRPC_TOKEN,
      useFactory: (configService: ConfigService) => {
        const iamServiceUrl = configService.getOrThrow<string>('notifyAppConfig.iamGrpcClientUrl');
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            package: IAM_PROTO_PACKAGE,
            protoPath: join(process.cwd(), IAM_PROTO_PATH),
            url: iamServiceUrl,
          },
        });
      },
      inject: [ConfigService],
    },
    IamClient,
    { provide: AbstractIamClient, useExisting: IamClient },
  ],
  exports: [AbstractIamClient],
})
export class IamClientModule {}
