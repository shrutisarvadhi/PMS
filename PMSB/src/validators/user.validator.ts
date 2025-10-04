import { body } from 'express-validator';
import { UserRole } from '../models/user.model';

export const createUserValidation = [
  body('username').isString().trim().isLength({ min: 3, max: 50 }),
  // body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('role').isIn(Object.values(UserRole)),
];

export const updateUserValidation = [
  // body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isString().isLength({ min: 8 }),
  body('role').optional().isIn(Object.values(UserRole)),
];
