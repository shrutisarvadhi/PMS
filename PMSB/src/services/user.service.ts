import bcrypt from 'bcrypt';
import { models } from '../config/database';
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import { AppError } from '../utils/app-error';
import type { User } from '../models/user.model';
import { UserRole } from '../models/user.model';

const { User: UserModel, Employee } = models;

const toDto = (user: User): UserResponseDto => ({
  id: user.id,
  username: user.username,
  // email: user.email,
  role: user.role,
  employee: user.employee
    ? {
        id: user.employee.id,
        userId: user.employee.userId,
        managerId: user.employee.managerId,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        department: user.employee.department,
        position: user.employee.position,
      }
    : null,
});

export class UserService {
  static async list(): Promise<UserResponseDto[]> {
    const users = await UserModel.findAll({ include: [{ model: Employee, as: 'employee' }] });
    return users.map((user) => toDto(user));
  }

  static async findById(id: string): Promise<UserResponseDto> {
    const user = await UserModel.findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return toDto(user);
  }

  static async create(payload: CreateUserDto): Promise<UserResponseDto> {
    const usernameTrimmed = payload.username.trim();
    // const emailNormalized = payload.email.toLowerCase();
    const { password, role } = payload;

    const existing = await UserModel.findOne({ where: { username: usernameTrimmed } });
    if (existing) {
      throw new AppError(409, 'Username already in use');
    }

    // const existingEmail = await UserModel.findOne({ where: { email: emailNormalized } });
    // if (existingEmail) {
    //   throw new AppError(409, 'Email already in use');
    // }

    const hashed = await bcrypt.hash(password, 10);

    const user = await UserModel.create({ username: usernameTrimmed, password: hashed, role });

    // Create a placeholder employee record for non-admin roles
    if (role !== UserRole.Admin) {
      await Employee.create({
        userId: user.id,
        managerId: null,
        firstName: usernameTrimmed,
        lastName: 'User',
        department: null,
        position: role,
      });
    }

    const created = await UserModel.findByPk(user.id, { include: [{ model: Employee, as: 'employee' }] });
    if (!created) {
      throw new AppError(500, 'Failed to load created user');
    }
    return toDto(created);
  }

  static async update(id: string, payload: UpdateUserDto): Promise<UserResponseDto> {
    const user = await UserModel.scope('withPassword').findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // if (payload.email && payload.email !== user.email) {
    //   const normalized = payload.email.toLowerCase();
    //   const existingEmail = await UserModel.findOne({ where: { email: normalized } });
    //   if (existingEmail && existingEmail.id !== id) {
    //     throw new AppError(409, 'Email already in use');
    //   }
    //   user.email = normalized;
    // }

    if (payload.password) {
      user.password = await bcrypt.hash(payload.password, 10);
    }

    if (payload.role) {
      user.role = payload.role;
    }

    await user.save();

    const updated = await UserModel.findByPk(id, { include: [{ model: Employee, as: 'employee' }] });
    if (!updated) {
      throw new AppError(500, 'Failed to load updated user');
    }
    return toDto(updated);
  }

  static async remove(id: string): Promise<void> {
    const deleted = await UserModel.destroy({ where: { id } });
    if (!deleted) {
      throw new AppError(404, 'User not found');
    }
  }
}
