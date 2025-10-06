// src/api/employees.ts
import { apiRequest } from './http'

const EMPLOYEES_ENDPOINT = '/employees'

export type EmployeeStatus = 'Active' | 'On Leave' | 'Contract'

// export interface Employee {
//   id: number
//   name: string
//   role: string
//   department: string
//   email: string
//   status: EmployeeStatus
//   manager?: string
//   hireDate?: string
//   createdAt?: string
//   updatedAt?: string
// }
export interface Employee {
  id: string
  firstName: string
  lastName: string
  department: string | null
  position: string | null
  userId: string
  managerId: string | null
  // Expanded fields from associations
  email: string // From User
  status: 'Active' | 'On Leave' | 'Contract' // Must be added to backend
  managerName: string | null // From manager Employee
  createdAt: string
  updatedAt: string
}

export interface EmployeePayload {
  firstName: string
  lastName: string
  department: string | null
  position: string | null
  userId: string
  managerId: string | null
}

export async function fetchEmployees(): Promise<Employee[]> {
  return apiRequest<Employee[]>(EMPLOYEES_ENDPOINT, { method: 'GET' }, 'Unable to load employees.')
}

export async function fetchEmployeeById(id: string | number): Promise<Employee> {
  return apiRequest<Employee>(`${EMPLOYEES_ENDPOINT}/${id}`, { method: 'GET' }, 'Unable to load employee details.')
}

export async function createEmployee(payload: EmployeePayload): Promise<Employee> {
  return apiRequest<Employee>(EMPLOYEES_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'Unable to create employee.')
}

export async function updateEmployee(id: string | number, payload: EmployeePayload): Promise<Employee> {
  return apiRequest<Employee>(`${EMPLOYEES_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'Unable to update employee.')
}

export async function deleteEmployee(id: string | number): Promise<void> {
  await apiRequest<void>(`${EMPLOYEES_ENDPOINT}/${id}`, { method: 'DELETE' }, 'Unable to delete employee.')
}