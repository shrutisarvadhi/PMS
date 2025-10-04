import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/app-error';

export const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => {
      // Use optional chaining and fallback for type safety
      const field = (e as any).path || (e as any).param || 'unknown';
      return `${field}: ${e.msg}`;
    });

    throw new AppError(400, `Validation failed: ${messages.join('; ')}`);
  }

  next();
};
