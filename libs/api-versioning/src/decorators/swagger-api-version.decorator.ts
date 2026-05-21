import { ApiHeader } from '@nestjs/swagger';

import { API_VERSION_HEADER, DEFAULT_API_VERSION } from '../constants/api-version.constants';

export function ApiVersionHeader(): MethodDecorator & ClassDecorator {
  return ApiHeader({
    name: API_VERSION_HEADER,
    required: false,
    description: `REST API version. Defaults to ${DEFAULT_API_VERSION}.`,
    schema: {
      type: 'string',
      enum: ['1', '2'],
      default: String(DEFAULT_API_VERSION),
    },
  });
}
