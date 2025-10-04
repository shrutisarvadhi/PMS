import { body } from 'express-validator';

export const createEmployeeValidation = [
  body('userId').isUUID(),
  body('managerId').optional({ nullable: true }).isUUID(),
  body('firstName').isString().trim().notEmpty(),
  body('lastName').isString().trim().notEmpty(),
  body('department').optional({ nullable: true }).isString(),
  body('position').optional({ nullable: true }).isString(),
];

export const updateEmployeeValidation = [
  body('managerId').optional({ nullable: true }).isUUID(),
  body('firstName').optional().isString().trim().notEmpty(),
  body('lastName').optional().isString().trim().notEmpty(),
  body('department').optional({ nullable: true }).isString(),
  body('position').optional({ nullable: true }).isString(),
];
