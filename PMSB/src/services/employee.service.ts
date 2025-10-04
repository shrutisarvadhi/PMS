import { models } from '../config/database';
import type { CreateEmployeeDto, UpdateEmployeeDto, EmployeeAttributesDto } from '../dtos/employee.dto';
import { AppError } from '../utils/app-error';
import type { Employee as EmployeeModel } from '../models/employee.model';

const { Employee, User } = models;

const toDto = (employee: EmployeeModel): EmployeeAttributesDto => ({
  id: employee.id,
  userId: employee.userId,
  managerId: employee.managerId,
  firstName: employee.firstName,
  lastName: employee.lastName,
  department: employee.department,
  position: employee.position,
});

export class EmployeeService {
  static async list(): Promise<EmployeeAttributesDto[]> {
    const employees = await Employee.findAll({ include: [{ model: User, as: 'user' }] });
    return employees.map((employee) => toDto(employee));
  }

  static async listByManager(managerId: string): Promise<EmployeeAttributesDto[]> {
    const employees = await Employee.findAll({ where: { managerId } });
    return employees.map((employee) => toDto(employee));
  }

  static async findByUserId(userId: string): Promise<EmployeeAttributesDto | null> {
    const employee = await Employee.findOne({ where: { userId } });
    return employee ? toDto(employee) : null;
  }

  static async findById(id: string): Promise<EmployeeAttributesDto> {
    const employee = await Employee.findByPk(id, { include: [{ model: User, as: 'user' }] });
    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }
    return toDto(employee);
  }

  static async create(payload: CreateEmployeeDto): Promise<EmployeeAttributesDto> {
    const { userId, managerId, firstName, lastName, department = null, position = null } = payload;

    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      throw new AppError(404, 'User not found for employee');
    }

    const existingEmployee = await Employee.findOne({ where: { userId } });
    if (existingEmployee) {
      throw new AppError(409, 'Employee already exists for this user');
    }

    if (managerId) {
      const manager = await Employee.findByPk(managerId);
      if (!manager) {
        throw new AppError(404, 'Manager not found');
      }
    }

    const employee = await Employee.create({
      userId,
      managerId: managerId ?? null,
      firstName,
      lastName,
      department,
      position,
    });

    return toDto(employee);
  }

  static async update(id: string, payload: UpdateEmployeeDto): Promise<EmployeeAttributesDto> {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    if (payload.managerId !== undefined) {
      if (payload.managerId) {
        const manager = await Employee.findByPk(payload.managerId);
        if (!manager) {
          throw new AppError(404, 'Manager not found');
        }
      }
      employee.managerId = payload.managerId ?? null;
    }

    if (payload.firstName) {
      employee.firstName = payload.firstName;
    }

    if (payload.lastName) {
      employee.lastName = payload.lastName;
    }

    if (payload.department !== undefined) {
      employee.department = payload.department;
    }

    if (payload.position !== undefined) {
      employee.position = payload.position;
    }

    await employee.save();

    return toDto(employee);
  }

  static async remove(id: string): Promise<void> {
    const deleted = await Employee.destroy({ where: { id } });
    if (!deleted) {
      throw new AppError(404, 'Employee not found');
    }
  }
}
