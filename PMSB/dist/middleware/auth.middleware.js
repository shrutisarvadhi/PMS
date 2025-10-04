"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const app_error_1 = require("../utils/app-error");
const parseToken = (req) => {
    const header = req.headers.authorization;
    if (!header) {
        return null;
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return null;
    }
    return token;
};
const authenticateJWT = (req, _res, next) => {
    const token = parseToken(req);
    if (!token) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.appConfig.jwt.secret);
        req.currentUser = {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        throw new app_error_1.AppError(401, 'Invalid or expired token');
    }
};
exports.authenticateJWT = authenticateJWT;
const authorizeRoles = (...roles) => {
    return (req, _res, next) => {
        if (!req.currentUser) {
            throw new app_error_1.AppError(401, 'Authentication required');
        }
        if (!roles.includes(req.currentUser.role)) {
            throw new app_error_1.AppError(403, 'Insufficient permissions');
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
