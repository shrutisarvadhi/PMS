import { body } from 'express-validator';
import { UserRole } from '../models/user.model';

export const registerValidation = [
  body('username').isString().trim().isLength({ min: 3, max: 50 }),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidation = [
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
];
