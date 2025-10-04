import { models } from '../config/database';
import type { CreateTimesheetDto, TimesheetResponseDto, UpdateTimesheetDto } from '../dtos/timesheet.dto';
import { AppError } from '../utils/app-error';
import { TimesheetStatus } from '../models/timesheet.model';
import type { Timesheet as TimesheetModel } from '../models/timesheet.model';

const { Timesheet, Employee } = models;

const toDto = (timesheet: TimesheetModel): TimesheetResponseDto => ({
  id: timesheet.id,
  employeeId: timesheet.employeeId,
  periodStart: timesheet.periodStart,
  periodEnd: timesheet.periodEnd,
  totalHours: Number(timesheet.totalHours),
  status: timesheet.status,
});

export class TimesheetService {
  static async list(): Promise<TimesheetResponseDto[]> {
    const timesheets = await Timesheet.findAll();
    return timesheets.map((timesheet) => toDto(timesheet));
  }

  static async listByManager(managerId: string): Promise<TimesheetResponseDto[]> {
    const timesheets = await Timesheet.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
          where: { managerId },
          attributes: [],
        },
      ],
    });
    return timesheets.map((timesheet) => toDto(timesheet));
  }

  static async listByEmployee(employeeId: string): Promise<TimesheetResponseDto[]> {
    const timesheets = await Timesheet.findAll({ where: { employeeId } });
    return timesheets.map((timesheet) => toDto(timesheet));
  }

  static async findById(id: string): Promise<TimesheetResponseDto> {
    const timesheet = await Timesheet.findByPk(id);
    if (!timesheet) {
      throw new AppError(404, 'Timesheet not found');
    }
    return toDto(timesheet);
  }

  static async findByIdForManager(id: string, managerId: string): Promise<TimesheetResponseDto> {
    const timesheet = await Timesheet.findOne({
      where: { id },
      include: [
        {
          model: Employee,
          as: 'employee',
          where: { managerId },
          attributes: [],
        },
      ],
    });

    if (!timesheet) {
      throw new AppError(403, 'Timesheet not accessible for this manager');
    }

    return toDto(timesheet);
  }

  static async create(payload: CreateTimesheetDto): Promise<TimesheetResponseDto> {
    const employee = await Employee.findByPk(payload.employeeId);
    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    const timesheet = await Timesheet.create({
      employeeId: payload.employeeId,
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      totalHours: payload.totalHours ?? 0,
      status: payload.status ?? TimesheetStatus.Draft,
    });

    return toDto(timesheet);
  }

  static async update(id: string, payload: UpdateTimesheetDto): Promise<TimesheetResponseDto> {
    const timesheet = await Timesheet.findByPk(id);
    if (!timesheet) {
      throw new AppError(404, 'Timesheet not found');
    }

    if (payload.periodStart !== undefined) {
      timesheet.periodStart = payload.periodStart;
    }
    if (payload.periodEnd !== undefined) {
      timesheet.periodEnd = payload.periodEnd;
    }
    if (payload.totalHours !== undefined) {
      timesheet.totalHours = payload.totalHours;
    }
    if (payload.status !== undefined) {
      timesheet.status = payload.status;
    }

    await timesheet.save();

    return toDto(timesheet);
  }

  static async remove(id: string): Promise<void> {
    const deleted = await Timesheet.destroy({ where: { id } });
    if (!deleted) {
      throw new AppError(404, 'Timesheet not found');
    }
  }
}
