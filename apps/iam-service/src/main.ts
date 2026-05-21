import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { createGrpcClientOptions } from '@lib/grpc';
import { IAM_PROTO_PACKAGE, IAM_PROTO_PATH } from '@lib/proto';

import { AppModule } from './app/app.module';
import { IAM_APP_CONFIG_NAME } from './app/constants/app.constants';
import type { IamAppConfig } from './app/types/app.types';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Security headers — safe defaults for a REST API
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<IamAppConfig>(IAM_APP_CONFIG_NAME);

  app.connectMicroservice(
    createGrpcClientOptions({
      packageName: IAM_PROTO_PACKAGE,
      protoPath: IAM_PROTO_PATH,
      url: appConfig.grpcUrl,
    }),
  );

  // Swagger — available in all environments for this challenge.
  // Restrict or disable this in production deployments.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SpheraX IAM Service')
    .setDescription('User management REST API')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.startAllMicroservices();
  await app.listen(appConfig.httpPort);

  Logger.log(
    `IAM service is running on http://localhost:${appConfig.httpPort}; gRPC ${appConfig.grpcUrl}`,
    'IamBootstrap',
  );
}

void bootstrap();
