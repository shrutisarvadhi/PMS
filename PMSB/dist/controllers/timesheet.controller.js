"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimesheet = exports.updateTimesheet = exports.createTimesheet = exports.getTimesheetById = exports.listTimesheets = void 0;
const timesheet_service_1 = require("../services/timesheet.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const employee_service_1 = require("../services/employee.service");
const app_error_1 = require("../utils/app-error");
exports.listTimesheets = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const timesheets = await timesheet_service_1.TimesheetService.list();
        res.json(timesheets);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const manager = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!manager) {
            res.json([]);
            return;
        }
        const timesheets = await timesheet_service_1.TimesheetService.listByManager(manager.id);
        res.json(timesheets);
        return;
    }
    const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
        res.json([]);
        return;
    }
    const timesheets = await timesheet_service_1.TimesheetService.listByEmployee(employee.id);
    res.json(timesheets);
});
exports.getTimesheetById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const timesheet = await timesheet_service_1.TimesheetService.findById(req.params.id);
        res.json(timesheet);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const manager = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!manager) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const timesheet = await timesheet_service_1.TimesheetService.findByIdForManager(req.params.id, manager.id);
        res.json(timesheet);
        return;
    }
    const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
        throw new app_error_1.AppError(403, 'Employee profile not found');
    }
    const timesheet = await timesheet_service_1.TimesheetService.findById(req.params.id);
    if (timesheet.employeeId !== employee.id) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to view this timesheet');
    }
    res.json(timesheet);
});
exports.createTimesheet = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.role !== user_model_1.UserRole.Admin) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to create timesheets');
    }
    const timesheet = await timesheet_service_1.TimesheetService.create(req.body);
    res.status(201).json(timesheet);
});
exports.updateTimesheet = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.role !== user_model_1.UserRole.Admin) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to update timesheets');
    }
    const timesheet = await timesheet_service_1.TimesheetService.update(req.params.id, req.body);
    res.json(timesheet);
});
exports.deleteTimesheet = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser || currentUser.role !== user_model_1.UserRole.Admin) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to delete timesheets');
    }
    await timesheet_service_1.TimesheetService.remove(req.params.id);
    res.status(204).send();
});
