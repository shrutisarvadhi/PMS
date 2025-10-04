import { UserRole } from '../models/user.model';
import type { EmployeeAttributesDto } from './employee.dto';

export interface CreateUserDto {
  username: string;
  // email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  // email?: string;
  password?: string;
  role?: UserRole;
}

export interface UserResponseDto {
  id: string;
  username: string;
  // email: string;
  role: UserRole;
  employee?: EmployeeAttributesDto | null;
}
