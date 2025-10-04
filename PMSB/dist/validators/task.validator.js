"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskValidation = exports.createTaskValidation = void 0;
const express_validator_1 = require("express-validator");
const task_model_1 = require("../models/task.model");
exports.createTaskValidation = [
    (0, express_validator_1.body)('projectId').isUUID(),
    (0, express_validator_1.body)('title').isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('assigneeId').optional({ nullable: true }).isUUID(),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(task_model_1.TaskStatus)),
    (0, express_validator_1.body)('priority').optional().isIn(Object.values(task_model_1.TaskPriority)),
    (0, express_validator_1.body)('dueDate').optional({ nullable: true }).isISO8601(),
];
exports.updateTaskValidation = [
    (0, express_validator_1.body)('title').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('assigneeId').optional({ nullable: true }).isUUID(),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(task_model_1.TaskStatus)),
    (0, express_validator_1.body)('priority').optional().isIn(Object.values(task_model_1.TaskPriority)),
    (0, express_validator_1.body)('dueDate').optional({ nullable: true }).isISO8601(),
];
