/** All machine-readable error codes that can appear in any API error response. */
export enum ErrorCode {
  // Domain errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNSUPPORTED_API_VERSION = 'UNSUPPORTED_API_VERSION',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_DISABLED = 'USER_DISABLED',
  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  // HTTP infrastructure fallbacks
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  HTTP_ERROR = 'HTTP_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
