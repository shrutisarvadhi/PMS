import type { Request, Response } from 'express';
import { TimelogService } from '../services/timelog.service';
import type { CreateTimelogDto, TimelogResponseDto, UpdateTimelogDto } from '../dtos/timelog.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../models/user.model';
import { EmployeeService } from '../services/employee.service';
import { AppError } from '../utils/app-error';

export const listTimelogs = asyncHandler(async (req: Request, res: Response<TimelogResponseDto[]>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const timelogs = await TimelogService.list();
    res.json(timelogs);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const manager = await EmployeeService.findByUserId(currentUser.id);
    if (!manager) {
      res.json([]);
      return;
    }
    const timelogs = await TimelogService.listByManager(manager.id);
    res.json(timelogs);
    return;
  }

  const employee = await EmployeeService.findByUserId(currentUser.id);
  if (!employee) {
    res.json([]);
    return;
  }
  const timelogs = await TimelogService.listByEmployee(employee.id);
  res.json(timelogs);
});

export const getTimelogById = asyncHandler(async (req: Request<{ id: string }>, res: Response<TimelogResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const timelog = await TimelogService.findById(req.params.id);
    res.json(timelog);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const manager = await EmployeeService.findByUserId(currentUser.id);
    if (!manager) {
      throw new AppError(403, 'Employee profile not found');
    }
    const timelog = await TimelogService.findByIdForManager(req.params.id, manager.id);
    res.json(timelog);
    return;
  }

  const employee = await EmployeeService.findByUserId(currentUser.id);
  if (!employee) {
    throw new AppError(403, 'Employee profile not found');
  }
  const timelog = await TimelogService.findById(req.params.id);
  if (timelog.employeeId !== employee.id) {
    throw new AppError(403, 'Insufficient permissions to view this timelog');
  }
  res.json(timelog);
});

export const createTimelog = asyncHandler(async (req: Request<unknown, TimelogResponseDto, CreateTimelogDto>, res: Response<TimelogResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw new AppError(403, 'Insufficient permissions to create timelogs');
  }

  const timelog = await TimelogService.create(req.body);
  res.status(201).json(timelog);
});

export const updateTimelog = asyncHandler(async (
  req: Request<{ id: string }, TimelogResponseDto, UpdateTimelogDto>,
  res: Response<TimelogResponseDto>,
) => {
  const currentUser = req.currentUser;
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw new AppError(403, 'Insufficient permissions to update timelogs');
  }

  const timelog = await TimelogService.update(req.params.id, req.body);
  res.json(timelog);
});

export const deleteTimelog = asyncHandler(async (req: Request<{ id: string }>, res: Response<void>) => {
  const currentUser = req.currentUser;
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw new AppError(403, 'Insufficient permissions to delete timelogs');
  }

  await TimelogService.remove(req.params.id);
  res.status(204).send();
});
