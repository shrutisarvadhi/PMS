"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const app_error_1 = require("../utils/app-error");
const validateRequest = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map(e => {
            // Use optional chaining and fallback for type safety
            const field = e.path || e.param || 'unknown';
            return `${field}: ${e.msg}`;
        });
        throw new app_error_1.AppError(400, `Validation failed: ${messages.join('; ')}`);
    }
    next();
};
exports.validateRequest = validateRequest;
