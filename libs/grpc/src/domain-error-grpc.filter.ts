import { type ArgumentsHost, Catch, type RpcExceptionFilter } from '@nestjs/common';
import { throwError, type Observable } from 'rxjs';

import { status } from '@grpc/grpc-js';

import { DomainError, ErrorCode } from '@lib/common';

/**
 * gRPC exception filter that converts DomainError to the correct gRPC status code
 * and a machine-readable details string that can be parsed by gRPC clients.
 *
 * Registered with @UseFilters(DomainErrorGrpcFilter) on gRPC controllers to ensure
 * NestJS's exception filter pipeline (not RpcException instanceof checks) converts
 * domain errors to the correct gRPC wire format.
 */
@Catch(DomainError)
export class DomainErrorGrpcFilter implements RpcExceptionFilter<DomainError> {
  catch(exception: DomainError, _host: ArgumentsHost): Observable<never> {
    return throwError(() => ({
      code: domainErrorToGrpcStatus(exception),
      details: exception.code,
      message: exception.message,
    }));
  }
}

function domainErrorToGrpcStatus(error: DomainError): number {
  switch (error.code) {
    case ErrorCode.USER_NOT_FOUND:
    case ErrorCode.NOTIFICATION_NOT_FOUND:
      return status.NOT_FOUND;
    case ErrorCode.USER_DISABLED:
      return status.FAILED_PRECONDITION;
    case ErrorCode.INVALID_REQUEST:
    case ErrorCode.UNSUPPORTED_API_VERSION:
      return status.INVALID_ARGUMENT;
    default:
      return status.UNKNOWN;
  }
}
