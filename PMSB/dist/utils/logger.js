"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequestError = exports.logger = void 0;
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const { combine, timestamp, printf, errors, json } = winston_1.format;
const logDirectory = path_1.default.resolve(process.cwd(), 'logs');
exports.logger = (0, winston_1.createLogger)({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [
        new winston_1.transports.Console({
            format: combine(errors({ stack: true }), timestamp(), printf(({ level, message, timestamp: ts, stack }) => {
                return stack ? `${ts} [${level}] ${stack}` : `${ts} [${level}] ${message}`;
            })),
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(logDirectory, 'error.log'),
            level: 'error',
            format: combine(errors({ stack: true }), timestamp(), json()),
        }),
    ],
});
const sanitizeBody = (body) => {
    if (!body || typeof body !== 'object') {
        return body;
    }
    const clone = JSON.parse(JSON.stringify(body));
    if (typeof clone.password === 'string') {
        clone.password = '[REDACTED]';
    }
    if (typeof clone.confirmPassword === 'string') {
        clone.confirmPassword = '[REDACTED]';
    }
    return clone;
};
const logRequestError = (params) => {
    const { error, endpoint, body, userId } = params;
    exports.logger.error('Request error', {
        endpoint,
        userId,
        body: sanitizeBody(body),
        message: error.message,
        stack: error.stack,
    });
};
exports.logRequestError = logRequestError;
