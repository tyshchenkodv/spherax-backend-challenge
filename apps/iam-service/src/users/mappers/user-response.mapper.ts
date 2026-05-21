import type { ApiVersion } from '@lib/api-versioning';

import type { IUser } from '../interfaces/user.interface';
import type { UserResponse, UserV1Response, UserV2Response } from '../types/user-response.types';

export function mapUserToResponse(user: IUser, apiVersion: ApiVersion): UserResponse {
  if (apiVersion === 1) {
    return mapUserToV1Response(user);
  }

  return mapUserToV2Response(user);
}

function mapUserToV1Response(user: IUser): UserV1Response {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function mapUserToV2Response(user: IUser): UserV2Response {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
