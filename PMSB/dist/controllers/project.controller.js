"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.listProjects = void 0;
const project_service_1 = require("../services/project.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const user_model_1 = require("../models/user.model");
const employee_service_1 = require("../services/employee.service");
const app_error_1 = require("../utils/app-error");
exports.listProjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const projects = await project_service_1.ProjectService.list();
        res.json(projects);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            res.json([]);
            return;
        }
        const projects = await project_service_1.ProjectService.listByProjectManager(employee.id);
        res.json(projects);
        return;
    }
    const projects = await project_service_1.ProjectService.list();
    res.json(projects);
});
exports.getProjectById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const project = await project_service_1.ProjectService.findById(req.params.id);
        res.json(project);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const project = await project_service_1.ProjectService.findById(req.params.id);
        if (project.pmId !== employee.id) {
            throw new app_error_1.AppError(403, 'Insufficient permissions to view this project');
        }
        res.json(project);
        return;
    }
    const project = await project_service_1.ProjectService.findById(req.params.id);
    res.json(project);
});
exports.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    const payload = req.body;
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const project = await project_service_1.ProjectService.create(payload);
        res.status(201).json(project);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const project = await project_service_1.ProjectService.create({ ...payload, pmId: employee.id });
        res.status(201).json(project);
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to create a project');
});
exports.updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        const project = await project_service_1.ProjectService.update(req.params.id, req.body);
        res.json(project);
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        const project = await project_service_1.ProjectService.updateForProjectManager(req.params.id, employee.id, req.body);
        res.json(project);
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to update this project');
});
exports.deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUser = req.currentUser;
    if (!currentUser) {
        throw new app_error_1.AppError(401, 'Authentication required');
    }
    if (currentUser.role === user_model_1.UserRole.Admin) {
        await project_service_1.ProjectService.remove(req.params.id);
        res.status(204).send();
        return;
    }
    if (currentUser.role === user_model_1.UserRole.ProjectManager) {
        const employee = await employee_service_1.EmployeeService.findByUserId(currentUser.id);
        if (!employee) {
            throw new app_error_1.AppError(403, 'Employee profile not found');
        }
        await project_service_1.ProjectService.removeForProjectManager(req.params.id, employee.id);
        res.status(204).send();
        return;
    }
    throw new app_error_1.AppError(403, 'Insufficient permissions to delete this project');
});
