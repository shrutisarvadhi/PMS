"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.listEmployees = void 0;
const employee_service_1 = require("../services/employee.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const app_error_1 = require("../utils/app-error");
const user_model_1 = require("../models/user.model");
exports.listEmployees = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const employees = await employee_service_1.EmployeeService.list();
        res.json(employees);
        return;
    }
    const currentEmployee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!currentEmployee) {
        res.json([]);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employees = await employee_service_1.EmployeeService.listByManager(currentEmployee.id);
        res.json(employees);
        return;
    }
    res.json([currentEmployee]);
});
exports.getEmployeeById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    const target = await employee_service_1.EmployeeService.findById(req.params.id);
    if (currentUser.role === user_model_1.UserRole.Admin) {
        res.json(target);
        return;
    }
    const requester = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!requester) {
        throw new app_error_1.AppError(403, 'Employee profile not found for current user');
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        if (target.managerId === requester.id || target.id === requester.id) {
            res.json(target);
            return;
        }
        throw new app_error_1.AppError(403, 'Insufficient permissions to view this employee');
    }
    if (target.userId === currentUser.id) {
        res.json(target);
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to view this employee');
});
exports.createEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const employee = await employee_service_1.EmployeeService.create(req.body);
    res.status(201).json(employee);
});
exports.updateEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const employee = await employee_service_1.EmployeeService.update(req.params.id, req.body);
    res.json(employee);
});
exports.deleteEmployee = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await employee_service_1.EmployeeService.remove(req.params.id);
    res.status(204).send();
});
