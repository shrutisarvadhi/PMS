"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const signAuthToken = (user) => {
    const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
    };
    const options = {
        expiresIn: env_1.appConfig.jwt.expiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.appConfig.jwt.secret, options);
};
exports.signAuthToken = signAuthToken;
