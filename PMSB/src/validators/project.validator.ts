import { body } from 'express-validator';
import { ProjectStatus } from '../models/project.model';

export const createProjectValidation = [
  body('name').isString().trim().notEmpty(),
  body('description').optional({ nullable: true }).isString(),
  body('pmId').optional({ nullable: true }).isUUID(),
  body('status').optional().isIn(Object.values(ProjectStatus)),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
];

export const updateProjectValidation = [
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional({ nullable: true }).isString(),
  body('pmId').optional({ nullable: true }).isUUID(),
  body('status').optional().isIn(Object.values(ProjectStatus)),
  body('startDate').optional({ nullable: true }).isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
];
