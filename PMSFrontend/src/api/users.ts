// src/api/users.ts
import { apiRequest } from './http'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export const fetchUsers = async (): Promise<User[]> => {
  return await apiRequest<User[]>('/users')
}