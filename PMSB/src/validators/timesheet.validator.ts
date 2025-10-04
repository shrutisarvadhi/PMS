import { body } from 'express-validator';
import { TimesheetStatus } from '../models/timesheet.model';

export const createTimesheetValidation = [
  body('employeeId').isUUID(),
  body('periodStart').isISO8601(),
  body('periodEnd').isISO8601(),
  body('totalHours').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(Object.values(TimesheetStatus)),
];

export const updateTimesheetValidation = [
  body('periodStart').optional().isISO8601(),
  body('periodEnd').optional().isISO8601(),
  body('totalHours').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(Object.values(TimesheetStatus)),
];
