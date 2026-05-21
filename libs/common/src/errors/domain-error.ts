import { ErrorCode } from '../constants/error-codes.constants';

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidRequestError extends DomainError {
  constructor(message: string) {
    super(ErrorCode.INVALID_REQUEST, message);
  }
}

export class UnsupportedApiVersionError extends DomainError {
  constructor(version: string) {
    super(ErrorCode.UNSUPPORTED_API_VERSION, `Unsupported API version: ${version}`);
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(ErrorCode.USER_NOT_FOUND, `User not found: ${userId}`);
  }
}

export class UserDisabledError extends DomainError {
  constructor(userId: string) {
    super(ErrorCode.USER_DISABLED, `User is disabled: ${userId}`);
  }
}

export class NotificationNotFoundError extends DomainError {
  constructor(notificationId: string) {
    super(ErrorCode.NOTIFICATION_NOT_FOUND, `Notification not found: ${notificationId}`);
  }
}
