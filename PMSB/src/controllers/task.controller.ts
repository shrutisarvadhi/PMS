import type { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import type { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from '../dtos/task.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../models/user.model';
import { EmployeeService } from '../services/employee.service';
import { AppError } from '../utils/app-error';

export const listTasks = asyncHandler(async (req: Request, res: Response<TaskResponseDto[]>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const tasks = await TaskService.list();
    res.json(tasks);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      res.json([]);
      return;
    }
    const tasks = await TaskService.listByProjectManager(employee.id);
    res.json(tasks);
    return;
  }

  const employee = await EmployeeService.findByUserId(currentUser.id);
  if (!employee) {
    res.json([]);
    return;
  }
  const tasks = await TaskService.listByEmployee(employee.id);
  res.json(tasks);
});

export const getTaskById = asyncHandler(async (req: Request<{ id: string }>, res: Response<TaskResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const task = await TaskService.findById(req.params.id);
    res.json(task);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    const task = await TaskService.findByIdForProjectManager(req.params.id, employee.id);
    res.json(task);
    return;
  }

  const employee = await EmployeeService.findByUserId(currentUser.id);
  if (!employee) {
    throw new AppError(403, 'Employee profile not found');
  }
  const task = await TaskService.findById(req.params.id);
  if (task.assigneeId !== employee.id) {
    throw new AppError(403, 'Insufficient permissions to view this task');
  }
  res.json(task);
});

export const createTask = asyncHandler(async (req: Request<unknown, TaskResponseDto, CreateTaskDto>, res: Response<TaskResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const task = await TaskService.create(req.body);
    res.status(201).json(task);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    const task = await TaskService.createForProjectManager(employee.id, req.body);
    res.status(201).json(task);
    return;
  }

  throw new AppError(403, 'Insufficient permissions to create tasks');
});

export const updateTask = asyncHandler(async (
  req: Request<{ id: string }, TaskResponseDto, UpdateTaskDto>,
  res: Response<TaskResponseDto>,
) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const task = await TaskService.update(req.params.id, req.body);
    res.json(task);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    const task = await TaskService.updateForProjectManager(req.params.id, employee.id, req.body);
    res.json(task);
    return;
  }

  throw new AppError(403, 'Insufficient permissions to update this task');
});

export const deleteTask = asyncHandler(async (req: Request<{ id: string }>, res: Response<void>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    await TaskService.remove(req.params.id);
    res.status(204).send();
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employee = await EmployeeService.findByUserId(currentUser.id);
    if (!employee) {
      throw new AppError(403, 'Employee profile not found');
    }
    await TaskService.removeForProjectManager(req.params.id, employee.id);
    res.status(204).send();
    return;
  }

  throw new AppError(403, 'Insufficient permissions to delete this task');
});
