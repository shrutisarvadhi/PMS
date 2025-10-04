import type { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import type { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from '../dtos/project.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../models/user.model';
import { EmployeeService } from '../services/employee.service';
import { AppError } from '../utils/app-error';

export const listProjects = asyncHandler(async (req: Request, res: Response<ProjectResponseDto[]>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const projects = await ProjectService.list();
    res.json(projects);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      res.json([]);
      return;
    }
    const projects = await ProjectService.listByProjectManager(employee.id);
    res.json(projects);
    return;
  }

  const projects = await ProjectService.list();
  res.json(projects);
});

export const getProjectById = asyncHandler(async (req: Request<{ id: string }>, res: Response<ProjectResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const project = await ProjectService.findById(req.params.id);
    res.json(project);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    const project = await ProjectService.findById(req.params.id);
    if (project.pmId !== employee.id) {
      throw new AppError(403, 'Insufficient permissions to view this project');
    }
    res.json(project);
    return;
  }

  const project = await ProjectService.findById(req.params.id);
  res.json(project);
});

export const createProject = asyncHandler(async (req: Request<unknown, ProjectResponseDto, CreateProjectDto>, res: Response<ProjectResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  const payload = req.body;

  if (currentUser.role === UserRole.Admin) {
    const project = await ProjectService.create(payload);
    res.status(201).json(project);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    const project = await ProjectService.create({ ...payload, pmId: employee.id });
    res.status(201).json(project);
    return;
  }

  throw new AppError(403, 'Insufficient permissions to create a project');
});

export const updateProject = asyncHandler(async (
  req: Request<{ id: string }, ProjectResponseDto, UpdateProjectDto>,
  res: Response<ProjectResponseDto>,
) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const project = await ProjectService.update(req.params.id, req.body);
    res.json(project);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    const project = await ProjectService.updateForProjectManager(req.params.id, employee.id, req.body);
    res.json(project);
    return;
  }

  throw new AppError(403, 'Insufficient permissions to update this project');
});

export const deleteProject = asyncHandler(async (req: Request<{ id: string }>, res: Response<void>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    await ProjectService.remove(req.params.id);
    res.status(204).send();
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    await ProjectService.removeForProjectManager(req.params.id, employee.id);
    res.status(204).send();
    return;
  }

  throw new AppError(403, 'Insufficient permissions to delete this project');
});
