import { body } from 'express-validator';
import { TaskPriority, TaskStatus } from '../models/task.model';

export const createTaskValidation = [
  body('projectId').isUUID(),
  body('title').isString().trim().notEmpty(),
  body('description').optional({ nullable: true }).isString(),
  body('assigneeId').optional({ nullable: true }).isUUID(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('priority').optional().isIn(Object.values(TaskPriority)),
  body('dueDate').optional({ nullable: true }).isISO8601(),
];

export const updateTaskValidation = [
  body('title').optional().isString().trim().notEmpty(),
  body('description').optional({ nullable: true }).isString(),
  body('assigneeId').optional({ nullable: true }).isUUID(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('priority').optional().isIn(Object.values(TaskPriority)),
  body('dueDate').optional({ nullable: true }).isISO8601(),
];
