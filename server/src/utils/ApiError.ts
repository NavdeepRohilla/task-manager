/**
 * A thrown ApiError carries its own HTTP status code, so the central error
 * middleware can turn any thrown error into the right response without every
 * controller needing to know about res.status(...).json(...).
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized', details?: unknown): ApiError {
    return new ApiError(401, message, details);
  }

  static forbidden(message = 'Forbidden', details?: unknown): ApiError {
    return new ApiError(403, message, details);
  }

  static notFound(message = 'Resource not found', details?: unknown): ApiError {
    return new ApiError(404, message, details);
  }

  static conflict(message = 'Conflict', details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  static internal(message = 'Internal server error', details?: unknown): ApiError {
    return new ApiError(500, message, details, false);
  }
}
