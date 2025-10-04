"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectValidation = exports.createProjectValidation = void 0;
const express_validator_1 = require("express-validator");
const project_model_1 = require("../models/project.model");
exports.createProjectValidation = [
    (0, express_validator_1.body)('name').isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('pmId').optional({ nullable: true }).isUUID(),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(project_model_1.ProjectStatus)),
    (0, express_validator_1.body)('startDate').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('endDate').optional({ nullable: true }).isISO8601(),
];
exports.updateProjectValidation = [
    (0, express_validator_1.body)('name').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('pmId').optional({ nullable: true }).isUUID(),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(project_model_1.ProjectStatus)),
    (0, express_validator_1.body)('startDate').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('endDate').optional({ nullable: true }).isISO8601(),
];
