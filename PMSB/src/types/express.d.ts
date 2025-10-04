import 'express-serve-static-core';
import type { UserRole } from '../models/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: {
      id: string;
      username: string;
      role: UserRole;
    };
  }
}
