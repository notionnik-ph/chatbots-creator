import { failure } from './api-response';

export class ApiError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) return failure(error.message, error.status);
  console.error('[API]', error);
  return failure('Internal server error', 500);
}
