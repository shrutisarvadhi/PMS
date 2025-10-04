"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserValidation = exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
const user_model_1 = require("../models/user.model");
exports.createUserValidation = [
    (0, express_validator_1.body)('username').isString().trim().isLength({ min: 3, max: 50 }),
    // body('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isString().isLength({ min: 8 }),
    (0, express_validator_1.body)('role').isIn(Object.values(user_model_1.UserRole)),
];
exports.updateUserValidation = [
    // body('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').optional().isString().isLength({ min: 8 }),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(user_model_1.UserRole)),
];
