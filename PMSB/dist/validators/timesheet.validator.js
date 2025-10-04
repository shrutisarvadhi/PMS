"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTimesheetValidation = exports.createTimesheetValidation = void 0;
const express_validator_1 = require("express-validator");
const timesheet_model_1 = require("../models/timesheet.model");
exports.createTimesheetValidation = [
    (0, express_validator_1.body)('employeeId').isUUID(),
    (0, express_validator_1.body)('periodStart').isISO8601(),
    (0, express_validator_1.body)('periodEnd').isISO8601(),
    (0, express_validator_1.body)('totalHours').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(timesheet_model_1.TimesheetStatus)),
];
exports.updateTimesheetValidation = [
    (0, express_validator_1.body)('periodStart').optional().isISO8601(),
    (0, express_validator_1.body)('periodEnd').optional().isISO8601(),
    (0, express_validator_1.body)('totalHours').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(timesheet_model_1.TimesheetStatus)),
];
