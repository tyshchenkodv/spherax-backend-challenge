import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { API_VERSION_HEADER } from '../constants/api-version.constants';
import { parseApiVersion } from '../parsers/api-version.parser';

export const RequestApiVersion = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const versionHeader = request.headers[API_VERSION_HEADER.toLowerCase()];

    return parseApiVersion(versionHeader);
  },
);
