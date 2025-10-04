"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTimelogValidation = exports.createTimelogValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createTimelogValidation = [
    (0, express_validator_1.body)('timesheetId').isUUID(),
    (0, express_validator_1.body)('taskId').isUUID(),
    (0, express_validator_1.body)('employeeId').isUUID(),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('hours').isFloat({ min: 0 }),
    (0, express_validator_1.body)('notes').optional({ nullable: true }).isString(),
];
exports.updateTimelogValidation = [
    (0, express_validator_1.body)('date').optional().isISO8601(),
    (0, express_validator_1.body)('hours').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('notes').optional({ nullable: true }).isString(),
];
