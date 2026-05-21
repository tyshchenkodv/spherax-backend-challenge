import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { getEnv, registerAsValidated } from '@lib/config';

import { IAM_APP_CONFIG_NAME, IAM_SERVICE_NAME } from '../constants/app.constants';
import type { IamAppConfig } from '../types/app.types';

class IamAppConfigDto implements IamAppConfig {
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
}

export default registerAsValidated<IamAppConfig, IamAppConfigDto>(
  IAM_APP_CONFIG_NAME,
  IamAppConfigDto,
  () => ({
    httpPort: Number(getEnv('IAM_HTTP_PORT', '3001')),
    grpcUrl: getEnv('IAM_GRPC_URL', '0.0.0.0:50051'),
    environment: getEnv('NODE_ENV', 'development'),
    serviceName: getEnv('SERVICE_NAME', IAM_SERVICE_NAME),
  }),
);
