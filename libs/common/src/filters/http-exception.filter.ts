import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ErrorCode } from '../constants/error-codes.constants';
import { getCorrelationId } from '../correlation-id/correlation-id.storage';
import { DomainError } from '../errors/domain-error';

interface ErrorResponse {
  statusCode: number;
  code: ErrorCode;
  message: string;
  correlationId: string | undefined;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const errorResponse = this.toErrorResponse(exception, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private toErrorResponse(exception: unknown, request: Request): ErrorResponse {
    const correlationId = getCorrelationId();

    if (exception instanceof DomainError) {
      return {
        statusCode: this.getDomainStatusCode(exception),
        code: exception.code,
        message: exception.message,
        correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        code: this.getHttpErrorCode(exception),
        message: this.getHttpErrorMessage(exception),
        correlationId,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private getDomainStatusCode(error: DomainError): number {
    switch (error.code) {
      case ErrorCode.USER_NOT_FOUND:
      case ErrorCode.NOTIFICATION_NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case ErrorCode.USER_DISABLED:
        return HttpStatus.CONFLICT;
      case ErrorCode.INVALID_REQUEST:
      case ErrorCode.UNSUPPORTED_API_VERSION:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getHttpErrorCode(exception: HttpException): ErrorCode {
    if (exception instanceof BadRequestException) {
      return ErrorCode.INVALID_REQUEST;
    }

    if (exception instanceof NotFoundException) {
      return ErrorCode.NOT_FOUND;
    }

    if (exception instanceof ConflictException) {
      return ErrorCode.CONFLICT;
    }

    return ErrorCode.HTTP_ERROR;
  }

  private getHttpErrorMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && 'message' in response) {
      if (typeof response.message === 'string') {
        return response.message;
      }

      if (Array.isArray(response.message)) {
        return response.message.join(', ');
      }
    }

    return exception.message;
  }
}
