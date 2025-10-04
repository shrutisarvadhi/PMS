import { models } from '../config/database';
import type { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from '../dtos/project.dto';
import { AppError } from '../utils/app-error';
import { ProjectStatus } from '../models/project.model';
import type { Project as ProjectModel } from '../models/project.model';

const { Project, Task } = models;

const toDto = (project: ProjectModel): ProjectResponseDto => ({
  id: project.id,
  name: project.name,
  description: project.description,
  pmId: project.pmId,
  status: project.status,
  startDate: project.startDate,
  endDate: project.endDate,
});

export class ProjectService {
  static async list(): Promise<ProjectResponseDto[]> {
    const projects = await Project.findAll();
    return projects.map((project) => toDto(project));
  }

  static async listByProjectManager(pmId: string): Promise<ProjectResponseDto[]> {
    const projects = await Project.findAll({ where: { pmId } });
    return projects.map((project) => toDto(project));
  }

  static async findById(id: string): Promise<ProjectResponseDto> {
    const project = await Project.findByPk(id, { include: [{ model: Task, as: 'tasks' }] });
    if (!project) {
      throw new AppError(404, 'Project not found');
    }
    return toDto(project);
  }

  static async create(payload: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await Project.create({
      name: payload.name,
      description: payload.description ?? null,
      pmId: payload.pmId ?? null,
      status: payload.status ?? ProjectStatus.Planning,
      startDate: payload.startDate ?? null,
      endDate: payload.endDate ?? null,
    });

    return toDto(project);
  }

  static async update(id: string, payload: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError(404, 'Project not found');
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

  static async updateForProjectManager(id: string, pmId: string, payload: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await Project.findOne({ where: { id, pmId } });
    if (!project) {
      throw new AppError(403, 'Project not accessible for this manager');
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

  static async remove(id: string): Promise<void> {
    const deleted = await Project.destroy({ where: { id } });
    if (!deleted) {
      throw new AppError(404, 'Project not found');
    }
  }

  static async removeForProjectManager(id: string, pmId: string): Promise<void> {
    const deleted = await Project.destroy({ where: { id, pmId } });
    if (!deleted) {
      throw new AppError(403, 'Project not accessible for this manager');
    }
  }
}
