import type { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import type { CreateEmployeeDto, EmployeeAttributesDto, UpdateEmployeeDto } from '../dtos/employee.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/app-error';
import { UserRole } from '../models/user.model';

export const listEmployees = asyncHandler(async (req: Request, res: Response<EmployeeAttributesDto[]>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  if (currentUser.role === UserRole.Admin) {
    const employees = await EmployeeService.list();
    res.json(employees);
    return;
  }

  const currentEmployee = await EmployeeService.findByUserId(currentUser.id);
  if (!currentEmployee) {
    res.json([]);
    return;
  }

  if (currentUser.role === UserRole.ProjectManager) {
    const employees = await EmployeeService.listByManager(currentEmployee.id);
    res.json(employees);
    return;
  }

  res.json([currentEmployee]);
});

export const getEmployeeById = asyncHandler(async (req: Request<{ id: string }>, res: Response<EmployeeAttributesDto>) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    throw new AppError(401, 'Authentication required');
  }

  const target = await EmployeeService.findById(req.params.id);

  if (currentUser.role === UserRole.Admin) {
    res.json(target);
    return;
  }

  const requester = await EmployeeService.findByUserId(currentUser.id);
  if (!requester) {
    throw new AppError(403, 'Employee profile not found for current user');
  }

  if (currentUser.role === UserRole.ProjectManager) {
    if (target.managerId === requester.id || target.id === requester.id) {
      res.json(target);
      return;
    }
    throw new AppError(403, 'Insufficient permissions to view this employee');
  }

  if (target.userId === currentUser.id) {
    res.json(target);
    return;
  }

  throw new AppError(403, 'Insufficient permissions to view this employee');
});

export const createEmployee = asyncHandler(async (req: Request<unknown, EmployeeAttributesDto, CreateEmployeeDto>, res: Response<EmployeeAttributesDto>) => {
  const employee = await EmployeeService.create(req.body);
  res.status(201).json(employee);
});

export const updateEmployee = asyncHandler(async (
  req: Request<{ id: string }, EmployeeAttributesDto, UpdateEmployeeDto>,
  res: Response<EmployeeAttributesDto>,
) => {
  const employee = await EmployeeService.update(req.params.id, req.body);
  res.json(employee);
});

export const deleteEmployee = asyncHandler(async (req: Request<{ id: string }>, res: Response<void>) => {
  await EmployeeService.remove(req.params.id);
  res.status(204).send();
});
