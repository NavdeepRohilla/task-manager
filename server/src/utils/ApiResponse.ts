import { Response } from 'express';

/**
 * Every successful response uses the same envelope shape, so the frontend
 * can write one response interceptor instead of guessing per-endpoint.
 */
export class ApiResponse {
  static success<T>(res: Response, statusCode: number, message: string, data?: T): void {
    res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
    });
  }
}
