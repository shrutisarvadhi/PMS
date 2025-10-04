"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
const app_error_1 = require("../utils/app-error");
const jwt_1 = require("../utils/jwt");
const user_model_1 = require("../models/user.model");
const { User, Employee } = database_1.models;
class AuthService {
    static async register(payload) {
        const usernameTrimmed = payload.username.trim();
        const { password } = payload;
        // Check if username already exists
        const existingUser = await User.findOne({
            where: { username: usernameTrimmed },
        });
        if (existingUser) {
            throw new app_error_1.AppError(409, 'Username already in use');
        }
        // Use managed transaction: auto-commits on success, auto-rolls back on error
        return await database_1.sequelize.transaction(async (transaction) => {
            // Hash the password
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Create user
            const user = await User.create({
                username: usernameTrimmed,
                password: hashedPassword,
                role: user_model_1.UserRole.Employee,
            }, { transaction });
            // Create associated Employee record
            await Employee.create({
                userId: user.id,
                managerId: null,
                firstName: usernameTrimmed,
                lastName: 'User',
                department: null,
                position: null,
            }, { transaction });
            // Generate JWT token
            const token = (0, jwt_1.signAuthToken)({
                id: user.id,
                username: user.username,
                role: user.role,
            });
            return { token };
        });
    }
    static async login(payload) {
        const usernameTrimmed = payload.username.trim();
        const { password } = payload;
        const user = await User.scope('withPassword').findOne({ where: { username: usernameTrimmed } });
        if (!user || !user.password) {
            throw new app_error_1.AppError(401, 'Invalid credentials');
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new app_error_1.AppError(401, 'Invalid credentials');
        }
        const token = (0, jwt_1.signAuthToken)({
            id: user.id,
            username: user.username,
            role: user.role,
        });
        return { token };
    }
}
exports.AuthService = AuthService;
