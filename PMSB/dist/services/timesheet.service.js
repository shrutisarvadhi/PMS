"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesheetService = void 0;
const database_1 = require("../config/database");
const app_error_1 = require("../utils/app-error");
const timesheet_model_1 = require("../models/timesheet.model");
const { Timesheet, Employee } = database_1.models;
const toDto = (timesheet) => ({
    id: timesheet.id,
    employeeId: timesheet.employeeId,
    periodStart: timesheet.periodStart,
    periodEnd: timesheet.periodEnd,
    totalHours: Number(timesheet.totalHours),
    status: timesheet.status,
});
class TimesheetService {
    static async list() {
        const timesheets = await Timesheet.findAll();
        return timesheets.map((timesheet) => toDto(timesheet));
    }
    static async listByManager(managerId) {
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
    static async listByEmployee(employeeId) {
        const timesheets = await Timesheet.findAll({ where: { employeeId } });
        return timesheets.map((timesheet) => toDto(timesheet));
    }
    static async findById(id) {
        const timesheet = await Timesheet.findByPk(id);
        if (!timesheet) {
            throw new app_error_1.AppError(404, 'Timesheet not found');
        }
        return toDto(timesheet);
    }
    static async findByIdForManager(id, managerId) {
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
            throw new app_error_1.AppError(403, 'Timesheet not accessible for this manager');
        }
        return toDto(timesheet);
    }
    static async create(payload) {
        const employee = await Employee.findByPk(payload.employeeId);
        if (!employee) {
            throw new app_error_1.AppError(404, 'Employee not found');
        }
        const timesheet = await Timesheet.create({
            employeeId: payload.employeeId,
            periodStart: payload.periodStart,
            periodEnd: payload.periodEnd,
            totalHours: payload.totalHours ?? 0,
            status: payload.status ?? timesheet_model_1.TimesheetStatus.Draft,
        });
        return toDto(timesheet);
    }
    static async update(id, payload) {
        const timesheet = await Timesheet.findByPk(id);
        if (!timesheet) {
            throw new app_error_1.AppError(404, 'Timesheet not found');
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
    static async remove(id) {
        const deleted = await Timesheet.destroy({ where: { id } });
        if (!deleted) {
            throw new app_error_1.AppError(404, 'Timesheet not found');
        }
    }
}
exports.TimesheetService = TimesheetService;
