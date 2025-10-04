"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEmployeeValidation = exports.createEmployeeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createEmployeeValidation = [
    (0, express_validator_1.body)('userId').isUUID(),
    (0, express_validator_1.body)('managerId').optional({ nullable: true }).isUUID(),
    (0, express_validator_1.body)('firstName').isString().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').isString().trim().notEmpty(),
    (0, express_validator_1.body)('department').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('position').optional({ nullable: true }).isString(),
];
exports.updateEmployeeValidation = [
    (0, express_validator_1.body)('managerId').optional({ nullable: true }).isUUID(),
    (0, express_validator_1.body)('firstName').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('department').optional({ nullable: true }).isString(),
    (0, express_validator_1.body)('position').optional({ nullable: true }).isString(),
];
