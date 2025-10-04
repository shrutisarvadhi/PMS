"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const app_error_1 = require("../utils/app-error");
const logger_1 = require("../utils/logger");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, req, res, _next) => {
    const statusCode = err instanceof app_error_1.AppError ? err.statusCode : 500;
    const response = {
        message: err instanceof app_error_1.AppError ? err.message : 'Internal server error',
    };
    if (err instanceof app_error_1.AppError && err.details) {
        response.details = err.details;
    }
    (0, logger_1.logRequestError)({
        error: err,
        endpoint: req.originalUrl,
        body: req.body,
        userId: req.currentUser?.id,
    });
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (_req, res) => {
    res.status(404).json({ message: 'Resource not found' });
};
exports.notFoundHandler = notFoundHandler;
