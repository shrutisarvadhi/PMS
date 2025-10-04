import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/app-error';

export const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
       const messages = errors.array().map(e => `${e.param}: ${e.msg}`);
    throw new AppError(400, `Validation failed: ${messages.join('; ')}`);
  }
  next();
};
