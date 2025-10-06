// src/types/employees.ts
export type EmployeeStatus = 'Active' | 'On Leave' | 'Contract' // Keep for UI, but note it's not in DB

export interface Employee {
  id: string; // UUID string
  firstName: string;
  lastName: string;
  department: string | null;
  position: string | null; // This is "role" in UI
  userId: string; // To get email from User
  managerId: string | null;
  // Virtual fields (computed)
  name: string; // firstName + lastName
  email: string; // From associated User
  status: EmployeeStatus; // Virtual field (you'll need to add this to backend or compute in frontend)
  managerName?: string; // From associated manager
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeePayload {
  firstName: string;
  lastName: string;
  department: string | null;
  position: string | null;
  userId: string; // Required to link to User
  managerId: string | null;
}