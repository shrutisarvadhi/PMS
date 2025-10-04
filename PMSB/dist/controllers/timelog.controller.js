"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimelog = exports.updateTimelog = exports.createTimelog = exports.getTimelogById = exports.listTimelogs = void 0;
const timelog_service_1 = require("../services/timelog.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const employee_service_1 = require("../services/employee.service");
const app_error_1 = require("../utils/app-error");
exports.listTimelogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const timelogs = await timelog_service_1.TimelogService.list();
        res.json(timelogs);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const manager = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!manager) {
            res.json([]);
            return;
        }
        const timelogs = await timelog_service_1.TimelogService.listByManager(manager.id);
        res.json(timelogs);
        return;
    }
    const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
        res.json([]);
        return;
    }
    const timelogs = await timelog_service_1.TimelogService.listByEmployee(employee.id);
    res.json(timelogs);
});
exports.getTimelogById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const timelog = await timelog_service_1.TimelogService.findById(req.params.id);
        res.json(timelog);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const manager = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!manager) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const timelog = await timelog_service_1.TimelogService.findByIdForManager(req.params.id, manager.id);
        res.json(timelog);
        return;
    }
    const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
        throw new app_error_1.AppError(403, 'Employee profile not found');
    }
    const timelog = await timelog_service_1.TimelogService.findById(req.params.id);
    if (timelog.employeeId !== employee.id) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to view this timelog');
    }
    res.json(timelog);
});
exports.createTimelog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.role !== user_model_1.UserRole.Admin) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to create timelogs');
    }
    const timelog = await timelog_service_1.TimelogService.create(req.body);
    res.status(201).json(timelog);
});
exports.updateTimelog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.role !== user_model_1.UserRole.Admin) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to update timelogs');
    }
    const timelog = await timelog_service_1.TimelogService.update(req.params.id, req.body);
    res.json(timelog);
});
exports.deleteTimelog = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.role !== user_model_1.UserRole.Admin) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to delete timelogs');
    }
    await timelog_service_1.TimelogService.remove(req.params.id);
    res.status(204).send();
});
