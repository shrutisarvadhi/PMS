"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.listTasks = void 0;
const task_service_1 = require("../services/task.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const employee_service_1 = require("../services/employee.service");
const app_error_1 = require("../utils/app-error");
exports.listTasks = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const tasks = await task_service_1.TaskService.list();
        res.json(tasks);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            res.json([]);
            return;
        }
        const tasks = await task_service_1.TaskService.listByProjectManager(employee.id);
        res.json(tasks);
        return;
    }
    const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
        res.json([]);
        return;
    }
    const tasks = await task_service_1.TaskService.listByEmployee(employee.id);
    res.json(tasks);
});
exports.getTaskById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const task = await task_service_1.TaskService.findById(req.params.id);
        res.json(task);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const task = await task_service_1.TaskService.findByIdForProjectManager(req.params.id, employee.id);
        res.json(task);
        return;
    }
    const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
        throw new app_error_1.AppError(403, 'Employee profile not found');
    }
    const task = await task_service_1.TaskService.findById(req.params.id);
    if (task.assigneeId !== employee.id) {
        throw new app_error_1.AppError(403, 'Insufficient permissions to view this task');
    }
    res.json(task);
});
exports.createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const task = await task_service_1.TaskService.create(req.body);
        res.status(201).json(task);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const task = await task_service_1.TaskService.createForProjectManager(employee.id, req.body);
        res.status(201).json(task);
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to create tasks');
});
exports.updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const task = await task_service_1.TaskService.update(req.params.id, req.body);
        res.json(task);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const task = await task_service_1.TaskService.updateForProjectManager(req.params.id, employee.id, req.body);
        res.json(task);
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to update this task');
});
exports.deleteTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        await task_service_1.TaskService.remove(req.params.id);
        res.status(204).send();
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        await task_service_1.TaskService.removeForProjectManager(req.params.id, employee.id);
        res.status(204).send();
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to delete this task');
});
