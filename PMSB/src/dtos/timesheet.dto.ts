import { TimesheetStatus } from '../models/timesheet.model';

export interface CreateTimesheetDto {
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  totalHours?: number;
  status?: TimesheetStatus;
}

export interface UpdateTimesheetDto {
  periodStart?: Date;
  periodEnd?: Date;
  totalHours?: number;
  status?: TimesheetStatus;
}

export interface TimesheetResponseDto {
  id: string;
  employeeId: string;
  periodStart: Date;
  periodEnd: Date;
  totalHours: number;
  status: TimesheetStatus;
}
