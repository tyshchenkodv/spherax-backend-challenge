import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Request-scoped storage for the current correlation ID.
 * Populated by CorrelationIdMiddleware for every incoming HTTP request.
 */
export const correlationIdStorage = new AsyncLocalStorage<string>();

/** Returns the correlation ID for the current request, or undefined outside a request context. */
export function getCorrelationId(): string | undefined {
  return correlationIdStorage.getStore();
}
