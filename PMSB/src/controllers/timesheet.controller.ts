import type { Request, Response } from 'express';
import { TimesheetService } from '../services/timesheet.service';
import type { CreateTimesheetDto, TimesheetResponseDto, UpdateTimesheetDto } from '../dtos/timesheet.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { UserRole } from '../models/user.model';
import { EmployeeService } from '../services/employee.service';
import { AppError } from '../utils/app-error';

export const listTimesheets = asyncHandler(async (req: Request, res: Response<TimesheetResponseDto[]>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const timesheets = await TimesheetService.list();
    res.json(timesheets);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const manager = await EmployeeService.findByUserId(currentUser.id);
    if (!manager) {
      res.json([]);
      return;
    }
    const timesheets = await TimesheetService.listByManager(manager.id);
    res.json(timesheets);
    return;
  }

  const employee = await EmployeeService.findByUserId(currentUser.id);
  if (!employee) {
    res.json([]);
    return;
  }
  const timesheets = await TimesheetService.listByEmployee(employee.id);
  res.json(timesheets);
});

export const getTimesheetById = asyncHandler(async (req: Request<{ id: string }>, res: Response<TimesheetResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const timesheet = await TimesheetService.findById(req.params.id);
    res.json(timesheet);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const manager = await EmployeeService.findByUserId(currentUser.id);
    if (!manager) {
      throw new AppError(403, 'Employee profile not found');
    }
    const timesheet = await TimesheetService.findByIdForManager(req.params.id, manager.id);
    res.json(timesheet);
    return;
  }

  const employee = await EmployeeService.findByUserId(currentUser.id);
  if (!employee) {
    throw new AppError(403, 'Employee profile not found');
  }
  const timesheet = await TimesheetService.findById(req.params.id);
  if (timesheet.employeeId !== employee.id) {
    throw new AppError(403, 'Insufficient permissions to view this timesheet');
  }
  res.json(timesheet);
});

export const createTimesheet = asyncHandler(async (req: Request<unknown, TimesheetResponseDto, CreateTimesheetDto>, res: Response<TimesheetResponseDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw new AppError(403, 'Insufficient permissions to create timesheets');
  }

  const timesheet = await TimesheetService.create(req.body);
  res.status(201).json(timesheet);
});

export const updateTimesheet = asyncHandler(async (
  req: Request<{ id: string }, TimesheetResponseDto, UpdateTimesheetDto>,
  res: Response<TimesheetResponseDto>,
) => {
  const currentUser = req.currentUser;
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw new AppError(403, 'Insufficient permissions to update timesheets');
  }

  const timesheet = await TimesheetService.update(req.params.id, req.body);
  res.json(timesheet);
});

export const deleteTimesheet = asyncHandler(async (req: Request<{ id: string }>, res: Response<void>) => {
  const currentUser = req.currentUser;
  if (!currentUser || currentUser.role !== UserRole.Admin) {
    throw new AppError(403, 'Insufficient permissions to delete timesheets');
  }

  await TimesheetService.remove(req.params.id);
  res.status(204).send();
});
