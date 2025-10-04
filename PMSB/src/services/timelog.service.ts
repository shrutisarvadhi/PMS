import { models } from '../config/database';
import type { CreateTimelogDto, TimelogResponseDto, UpdateTimelogDto } from '../dtos/timelog.dto';
import { AppError } from '../utils/app-error';
import type { Timelog as TimelogModel } from '../models/timelog.model';

const { Timelog, Timesheet, Task, Employee } = models;

const toDto = (timelog: TimelogModel): TimelogResponseDto => ({
  id: timelog.id,
  timesheetId: timelog.timesheetId,
  taskId: timelog.taskId,
  employeeId: timelog.employeeId,
  date: timelog.date,
  hours: Number(timelog.hours),
  notes: timelog.notes,
});

const recalculateTimesheetHours = async (timesheetId: string): Promise<void> => {
  const total = await Timelog.sum('hours', { where: { timesheetId } });
  await Timesheet.update({ totalHours: Number(total ?? 0) }, { where: { id: timesheetId } });
};

export class TimelogService {
  static async list(): Promise<TimelogResponseDto[]> {
    const timelogs = await Timelog.findAll();
    return timelogs.map((timelog) => toDto(timelog));
  }

  static async listByManager(managerId: string): Promise<TimelogResponseDto[]> {
    const timelogs = await Timelog.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
          where: { managerId },
          attributes: [],
        },
      ],
    });
    return timelogs.map((timelog) => toDto(timelog));
  }

  static async listByEmployee(employeeId: string): Promise<TimelogResponseDto[]> {
    const timelogs = await Timelog.findAll({ where: { employeeId } });
    return timelogs.map((timelog) => toDto(timelog));
  }

  static async findById(id: string): Promise<TimelogResponseDto> {
    const timelog = await Timelog.findByPk(id);
    if (!timelog) {
      throw new AppError(404, 'Timelog not found');
    }
    return toDto(timelog);
  }

  static async findByIdForManager(id: string, managerId: string): Promise<TimelogResponseDto> {
    const timelog = await Timelog.findOne({
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

    if (!timelog) {
      throw new AppError(403, 'Timelog not accessible for this manager');
    }

    return toDto(timelog);
  }

  static async create(payload: CreateTimelogDto): Promise<TimelogResponseDto> {
    const timesheet = await Timesheet.findByPk(payload.timesheetId);
    if (!timesheet) {
      throw new AppError(404, 'Timesheet not found');
    }

    const task = await Task.findByPk(payload.taskId);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    const employee = await Employee.findByPk(payload.employeeId);
    if (!employee) {
      throw new AppError(404, 'Employee not found');
    }

    if (timesheet.employeeId !== payload.employeeId) {
      throw new AppError(400, 'Employee does not own the provided timesheet');
    }

    const timelog = await Timelog.create({
      timesheetId: payload.timesheetId,
      taskId: payload.taskId,
      employeeId: payload.employeeId,
      date: payload.date,
      hours: payload.hours,
      notes: payload.notes ?? null,
    });

    await recalculateTimesheetHours(payload.timesheetId);

    return toDto(timelog);
  }

  static async update(id: string, payload: UpdateTimelogDto): Promise<TimelogResponseDto> {
    const timelog = await Timelog.findByPk(id);
    if (!timelog) {
      throw new AppError(404, 'Timelog not found');
    }

    if (payload.date !== undefined) {
      timelog.date = payload.date;
    }
    if (payload.hours !== undefined) {
      timelog.hours = payload.hours;
    }
    if (payload.notes !== undefined) {
      timelog.notes = payload.notes;
    }

    await timelog.save();

    await recalculateTimesheetHours(timelog.timesheetId);

    return toDto(timelog);
  }

  static async remove(id: string): Promise<void> {
    const timelog = await Timelog.findByPk(id);
    if (!timelog) {
      throw new AppError(404, 'Timelog not found');
    }

    const timesheetId = timelog.timesheetId;
    await timelog.destroy();
    await recalculateTimesheetHours(timesheetId);
  }
}
