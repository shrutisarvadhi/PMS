export interface CreateEmployeeDto {
  userId: string;
  managerId?: string | null;
  firstName: string;
  lastName: string;
  department?: string | null;
  position?: string | null;
}

export interface UpdateEmployeeDto {
  managerId?: string | null;
  firstName?: string;
  lastName?: string;
  department?: string | null;
  position?: string | null;
}

export interface EmployeeAttributesDto {
  id: string;
  userId: string;
  managerId: string | null;
  firstName: string;
  lastName: string;
  department: string | null;
  position: string | null;
}
