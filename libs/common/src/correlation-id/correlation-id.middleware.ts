import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { correlationIdStorage } from './correlation-id.storage';

/** HTTP header name used to carry the correlation ID across service boundaries. */
export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

/**
 * Reads or generates an X-Correlation-Id for every incoming HTTP request.
 *
 * - If X-Correlation-Id is present in the request, it is reused as-is.
 * - Otherwise a new UUID is generated.
 * - The value is echoed back in the response header.
 * - It is stored in AsyncLocalStorage so any code within the request lifecycle
 *   (filters, clients, loggers) can read it without explicit threading.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers[CORRELATION_ID_HEADER.toLowerCase()];
    const correlationId = (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();

    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    correlationIdStorage.run(correlationId, () => {
      next();
    });
  }
}
