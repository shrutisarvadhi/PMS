import { UserRole } from '../models/user.model';

export interface RegisterRequestDto {
  username: string;
  // email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
}
