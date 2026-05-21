import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { getEnv, registerAsValidated } from '@lib/config';

import { NOTIFY_APP_CONFIG_NAME, NOTIFY_SERVICE_NAME } from '../constants/app.constants';
import type { NotifyAppConfig } from '../types/app.types';

class NotifyAppConfigDto implements NotifyAppConfig {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  httpPort: number;

  @IsNotEmpty()
  @IsString()
  grpcUrl: string;

  @IsNotEmpty()
  @IsString()
  environment: string;

  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsNotEmpty()
  @IsString()
  iamGrpcClientUrl: string;
}

export default registerAsValidated<NotifyAppConfig, NotifyAppConfigDto>(
  NOTIFY_APP_CONFIG_NAME,
  NotifyAppConfigDto,
  () => ({
    httpPort: Number(getEnv('NOTIFY_HTTP_PORT', '3002')),
    grpcUrl: getEnv('NOTIFY_GRPC_URL', '0.0.0.0:50052'),
    environment: getEnv('NODE_ENV', 'development'),
    serviceName: getEnv('SERVICE_NAME', NOTIFY_SERVICE_NAME),
    iamGrpcClientUrl: getEnv('IAM_GRPC_CLIENT_URL', 'localhost:50051'),
  }),
);
