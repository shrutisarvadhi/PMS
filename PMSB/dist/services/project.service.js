"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const database_1 = require("../config/database");
const app_error_1 = require("../utils/app-error");
const project_model_1 = require("../models/project.model");
const { Project, Task } = database_1.models;
const toDto = (project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    pmId: project.pmId,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
});
class ProjectService {
    static async list() {
        const projects = await Project.findAll();
        return projects.map((project) => toDto(project));
    }
    static async listByProjectManager(pmId) {
        const projects = await Project.findAll({ where: { pmId } });
        return projects.map((project) => toDto(project));
    }
    static async findById(id) {
        const project = await Project.findByPk(id, { include: [{ model: Task, as: 'tasks' }] });
        if (!project) {
            throw new app_error_1.AppError(404, 'Project not found');
        }
        return toDto(project);
    }
    static async create(payload) {
        const project = await Project.create({
            name: payload.name,
            description: payload.description ?? null,
            pmId: payload.pmId ?? null,
            status: payload.status ?? project_model_1.ProjectStatus.Planning,
            startDate: payload.startDate ?? null,
            endDate: payload.endDate ?? null,
        });
        return toDto(project);
    }
    static async update(id, payload) {
        const project = await Project.findByPk(id);
        if (!project) {
            throw new app_error_1.AppError(404, 'Project not found');
        }
        if (payload.name !== undefined) {
            project.name = payload.name;
        }
        if (payload.description !== undefined) {
            project.description = payload.description;
        }
        if (payload.pmId !== undefined) {
            project.pmId = payload.pmId;
        }
        if (payload.status !== undefined) {
            project.status = payload.status;
        }
        if (payload.startDate !== undefined) {
            project.startDate = payload.startDate;
        }
        if (payload.endDate !== undefined) {
            project.endDate = payload.endDate;
        }
        await project.save();
        return toDto(project);
    }
    static async updateForProjectManager(id, pmId, payload) {
        const project = await Project.findOne({ where: { id, pmId } });
        if (!project) {
            throw new app_error_1.AppError(403, 'Project not accessible for this manager');
        }
        if (payload.name !== undefined) {
            project.name = payload.name;
        }
        if (payload.description !== undefined) {
            project.description = payload.description;
        }
        if (payload.status !== undefined) {
            project.status = payload.status;
        }
        if (payload.startDate !== undefined) {
            project.startDate = payload.startDate;
        }
        if (payload.endDate !== undefined) {
            project.endDate = payload.endDate;
        }
        await project.save();
        return toDto(project);
    }
    static async remove(id) {
        const deleted = await Project.destroy({ where: { id } });
        if (!deleted) {
            throw new app_error_1.AppError(404, 'Project not found');
        }
    }
    static async removeForProjectManager(id, pmId) {
        const deleted = await Project.destroy({ where: { id, pmId } });
        if (!deleted) {
            throw new app_error_1.AppError(403, 'Project not accessible for this manager');
        }
    }
}
exports.ProjectService = ProjectService;
