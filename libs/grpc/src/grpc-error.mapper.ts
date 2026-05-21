import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { DomainError, ErrorCode, InvalidRequestError } from '@lib/common';

/**
 * Converts a domain error (or unknown error) to an RpcException for NestJS gRPC handlers.
 * NestJS RpcExceptionsHandler only forwards gRPC status codes from RpcException instances,
 * not from plain Error objects with custom properties.
 */
export function toRpcException(error: unknown): RpcException {
  if (error instanceof DomainError) {
    return new RpcException({
      code: toGrpcStatus(error),
      details: error.code,
      message: error.message,
    });
  }

  return new RpcException({
    code: status.UNKNOWN,
    details: 'UNKNOWN',
    message: 'Unknown error',
  });
}

/**
 * Converts a gRPC client error back to a DomainError.
 * `error.details` contains the domain error code string (e.g. 'USER_DISABLED').
 * `error.message` is a gRPC-formatted string ("9 FAILED_PRECONDITION: USER_DISABLED")
 * and is intentionally not forwarded to keep error messages clean.
 */
export function toDomainError(error: {
  code?: number;
  details?: string;
  message?: string;
}): DomainError {
  switch (error.details) {
    case ErrorCode.USER_NOT_FOUND:
      return new DomainError(ErrorCode.USER_NOT_FOUND, 'User not found');
    case ErrorCode.USER_DISABLED:
      return new DomainError(ErrorCode.USER_DISABLED, 'User is disabled');
    case ErrorCode.NOTIFICATION_NOT_FOUND:
      return new DomainError(ErrorCode.NOTIFICATION_NOT_FOUND, 'Notification not found');
    case ErrorCode.INVALID_REQUEST:
      return new InvalidRequestError('Invalid request');
    default:
      return new InvalidRequestError(error.message ?? 'gRPC request failed');
  }
}
function toGrpcStatus(error: DomainError): number {
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
