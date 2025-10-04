"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
const app_error_1 = require("../utils/app-error");
const user_model_1 = require("../models/user.model");
const { User: UserModel, Employee } = database_1.models;
const toDto = (user) => ({
    id: user.id,
    username: user.username,
    // email: user.email,
    role: user.role,
    employee: user.employee
        ? {
            id: user.employee.id,
            userId: user.employee.userId,
            managerId: user.employee.managerId,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            department: user.employee.department,
            position: user.employee.position,
        }
        : null,
});
class UserService {
    static async list() {
        const users = await UserModel.findAll({ include: [{ model: Employee, as: 'employee' }] });
        return users.map((user) => toDto(user));
    }
    static async findById(id) {
        const user = await UserModel.findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
        if (!user) {
            throw new app_error_1.AppError(404, 'User not found');
        }
        return toDto(user);
    }
    static async create(payload) {
        const usernameTrimmed = payload.username.trim();
        // const emailNormalized = payload.email.toLowerCase();
        const { password, role } = payload;
        const existing = await UserModel.findOne({ where: { username: usernameTrimmed } });
        if (existing) {
            throw new app_error_1.AppError(409, 'Username already in use');
        }
        // const existingEmail = await UserModel.findOne({ where: { email: emailNormalized } });
        // if (existingEmail) {
        //   throw new AppError(409, 'Email already in use');
        // }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await UserModel.create({ username: usernameTrimmed, password: hashed, role });
        // Create a placeholder employee record for non-admin roles
        if (role !== user_model_1.UserRole.Admin) {
            await Employee.create({
                userId: user.id,
                managerId: null,
                firstName: usernameTrimmed,
                lastName: 'User',
                department: null,
                position: role,
            });
        }
        const created = await UserModel.findByPk(user.id, { include: [{ model: Employee, as: 'employee' }] });
        if (!created) {
            throw new app_error_1.AppError(500, 'Failed to load created user');
        }
        return toDto(created);
    }
    static async update(id, payload) {
        const user = await UserModel.scope('withPassword').findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
        if (!user) {
            throw new app_error_1.AppError(404, 'User not found');
        }
        // if (payload.email && payload.email !== user.email) {
        //   const normalized = payload.email.toLowerCase();
        //   const existingEmail = await UserModel.findOne({ where: { email: normalized } });
        //   if (existingEmail && existingEmail.id !== id) {
        //     throw new AppError(409, 'Email already in use');
        //   }
        //   user.email = normalized;
        // }
        if (payload.password) {
            user.password = await bcrypt_1.default.hash(payload.password, 10);
        }
        if (payload.role) {
            user.role = payload.role;
        }
        await user.save();
        const updated = await UserModel.findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
        if (!updated) {
            throw new app_error_1.AppError(500, 'Failed to load updated user');
        }
        return toDto(updated);
    }
    static async remove(id) {
        const deleted = await UserModel.destroy({ where: { id } });
        if (!deleted) {
            throw new app_error_1.AppError(404, 'User not found');
        }
    }
}
exports.UserService = UserService;
