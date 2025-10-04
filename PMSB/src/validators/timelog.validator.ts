import { body } from 'express-validator';

export const createTimelogValidation = [
  body('timesheetId').isUUID(),
  body('taskId').isUUID(),
  body('employeeId').isUUID(),
  body('date').isISO8601(),
  body('hours').isFloat({ min: 0 }),
  body('notes').optional({ nullable: true }).isString(),
];

export const updateTimelogValidation = [
  body('date').optional().isISO8601(),
  body('hours').optional().isFloat({ min: 0 }),
  body('notes').optional({ nullable: true }).isString(),
];
