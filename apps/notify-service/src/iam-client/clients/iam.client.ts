import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout, type Observable } from 'rxjs';

import { Metadata } from '@grpc/grpc-js';

import { CORRELATION_ID_HEADER, getCorrelationId } from '@lib/common';
import { toDomainError } from '@lib/grpc';

import { AbstractIamClient, type IValidatedUser } from '../interfaces/iam-client.interface';
import { IAM_SERVICE_GRPC_TOKEN } from '../constants/iam-client.constants';

const GRPC_TIMEOUT_MS = 5_000;

interface IamGrpcClient {
  validateNotificationRecipient(
    request: { userId: string },
    metadata?: Metadata,
  ): Observable<IValidatedUser>;
}

interface GrpcError {
  code?: number;
  details?: string;
  message?: string;
}

function isGrpcError(error: unknown): error is GrpcError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'details' in error || 'message' in error)
  );
}

@Injectable()
export class IamClient extends AbstractIamClient implements OnModuleInit {
  private client: IamGrpcClient;

  constructor(@Inject(IAM_SERVICE_GRPC_TOKEN) private readonly iamGrpcClient: ClientGrpc) {
    super();
  }

  onModuleInit(): void {
    this.client = this.iamGrpcClient.getService<IamGrpcClient>('IamService');
  }

  async validateNotificationRecipient(userId: string): Promise<IValidatedUser> {
    const metadata = new Metadata();
    const correlationId = getCorrelationId();

    if (correlationId) {
      metadata.set(CORRELATION_ID_HEADER.toLowerCase(), correlationId);
    }

    try {
      return await firstValueFrom(
        this.client
          .validateNotificationRecipient({ userId }, metadata)
          .pipe(timeout(GRPC_TIMEOUT_MS)),
      );
    } catch (error) {
      if (isGrpcError(error)) {
        throw toDomainError(error);
      }
      throw toDomainError({ message: 'Unknown gRPC error' });
    }
  }
}
