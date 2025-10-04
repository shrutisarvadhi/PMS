import type { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/env';
import { AppError } from '../utils/app-error';
import { UserRole } from '../models/user.model';

export interface AuthTokenPayload {
  sub: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const parseToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token;
};

export const authenticateJWT = (req: Request, _res: Response, next: NextFunction): void => {
  const token = parseToken(req);
  if (!token) {
    throw new AppError(401, 'Authentication required');
  }

  try {
    const payload = jwt.verify(token, appConfig.jwt.secret) as AuthTokenPayload;
    req.currentUser = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch (error) {
    throw new AppError(401, 'Invalid or expired token');
  }
};

export const authorizeRoles = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.currentUser) {
      throw new AppError(401, 'Authentication required');
    }

    if (!roles.includes(req.currentUser.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }

    next();
  };
};
