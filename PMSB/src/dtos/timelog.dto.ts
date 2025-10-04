export interface CreateTimelogDto {
  timesheetId: string;
  taskId: string;
  employeeId: string;
  date: Date;
  hours: number;
  notes?: string | null;
}

export interface UpdateTimelogDto {
  date?: Date;
  hours?: number;
  notes?: string | null;
}

export interface TimelogResponseDto {
  id: string;
  timesheetId: string;
  taskId: string;
  employeeId: string;
  date: Date;
  hours: number;
  notes: string | null;
}
