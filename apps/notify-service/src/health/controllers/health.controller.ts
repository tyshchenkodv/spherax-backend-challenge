import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { NOTIFY_SERVICE_NAME } from '../../app/constants/app.constants';
import { HealthResponseDto } from '../dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Service health check' })
  @ApiOkResponse({ type: HealthResponseDto, description: 'Service is healthy.' })
  @Get()
  getHealth(): HealthResponseDto {
    return { status: 'ok', service: NOTIFY_SERVICE_NAME };
  }
}
