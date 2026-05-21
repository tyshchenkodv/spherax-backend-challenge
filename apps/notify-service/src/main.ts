import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { createGrpcClientOptions } from '@lib/grpc';
import { NOTIFY_PROTO_PACKAGE, NOTIFY_PROTO_PATH } from '@lib/proto';

import { AppModule } from './app/app.module';
import { NOTIFY_APP_CONFIG_NAME } from './app/constants/app.constants';
import type { NotifyAppConfig } from './app/types/app.types';

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
  const appConfig = configService.getOrThrow<NotifyAppConfig>(NOTIFY_APP_CONFIG_NAME);

  app.connectMicroservice(
    createGrpcClientOptions({
      packageName: NOTIFY_PROTO_PACKAGE,
      protoPath: NOTIFY_PROTO_PATH,
      url: appConfig.grpcUrl,
    }),
  );

  // Swagger — available in all environments for this challenge.
  // Restrict or disable this in production deployments.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SpheraX Notify Service')
    .setDescription('Notification management REST API')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.startAllMicroservices();
  await app.listen(appConfig.httpPort);

  Logger.log(
    `Notify service is running on http://localhost:${appConfig.httpPort}; gRPC ${appConfig.grpcUrl}`,
    'NotifyBootstrap',
  );
}

void bootstrap();
