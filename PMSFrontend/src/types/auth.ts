export type UserRole = 'Admin' | 'PM' | 'ProjectManager' | 'Employee'

export interface JwtPayload {
  username: string
  role: UserRole
  exp?: number
  iat?: number
  [key: string]: unknown
}

export interface AuthUser {
  username: string
  role: UserRole
}

export interface AuthRequest {
  username: string
  password: string
}

export interface AuthSuccessResponse {
  token: string
  message?: string
  role?: UserRole
}

export interface AuthErrorResponse {
  error?: string
  message?: string
}
