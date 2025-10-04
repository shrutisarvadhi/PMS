"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('username').isString().trim().isLength({ min: 3, max: 50 }),
    (0, express_validator_1.body)('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('username').isString().trim().notEmpty(),
    (0, express_validator_1.body)('password').isString().notEmpty(),
];
