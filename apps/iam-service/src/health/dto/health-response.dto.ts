import { ApiProperty } from '@nestjs/swagger';

import { IAM_SERVICE_NAME } from '../../app/constants/app.constants';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Service status' })
  status: 'ok';

  @ApiProperty({ example: IAM_SERVICE_NAME, description: 'Service name' })
  service: 'iam-service';
}
