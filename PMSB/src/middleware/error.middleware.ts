import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { logRequestError } from '../utils/logger';

interface ErrorResponse {
  message: string;
  details?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error | AppError, req: Request, res: Response<ErrorResponse>, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const response: ErrorResponse = {
    message: err instanceof AppError ? err.message : 'Internal server error',
  };

  if (err instanceof AppError && err.details) {
    response.details = err.details;
  }

  logRequestError({
    error: err,
    endpoint: req.originalUrl,
    body: req.body,
    userId: req.currentUser?.id,
  });

  res.status(statusCode).json(response);
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
};
