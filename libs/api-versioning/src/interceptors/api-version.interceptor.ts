import {
  Injectable,
  NestInterceptor,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

import { API_VERSION_HEADER } from '../constants/api-version.constants';
import { parseApiVersion } from '../parsers/api-version.parser';

@Injectable()
export class ApiVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, unknown> }>();
    const versionHeader = request.headers[API_VERSION_HEADER.toLowerCase()];

    parseApiVersion(this.normalizeHeader(versionHeader));

    return next.handle();
  }

  private normalizeHeader(value: unknown): string | string[] | undefined {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      return value;
    }

    if (typeof value === 'string') {
      return value;
    }

    return undefined;
  }
}
