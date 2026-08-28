/**
 * Thrown by services when an identity exceeds a rate limit. Mapped to a
 * 429 response with Retry-After by the app-level error handler.
 */
export class RateLimitedError extends Error {
  constructor(
    readonly retryAfterSeconds: number,
    message: string,
  ) {
    super(message);
  }
}