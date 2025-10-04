"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = (value, key) => {
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
exports.appConfig = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: toNumber(process.env.PORT, 5000),
    database: {
        username: required(process.env.DB_USER, 'DB_USER'),
        password: process.env.DB_PASSWORD ?? null,
        database: required(process.env.DB_DATABASE, 'DB_DATABASE'),
        host: process.env.DB_HOST ?? '127.0.0.1',
        port: toNumber(process.env.DB_PORT, 5432),
        dialect: 'postgres',
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    },
};
