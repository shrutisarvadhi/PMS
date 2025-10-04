"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timesheet = exports.TimesheetStatus = void 0;
const sequelize_1 = require("sequelize");
var TimesheetStatus;
(function (TimesheetStatus) {
    TimesheetStatus["Draft"] = "Draft";
    TimesheetStatus["Submitted"] = "Submitted";
    TimesheetStatus["Approved"] = "Approved";
    TimesheetStatus["Rejected"] = "Rejected";
})(TimesheetStatus || (exports.TimesheetStatus = TimesheetStatus = {}));
class Timesheet extends sequelize_1.Model {
    static initModel(sequelize) {
        Timesheet.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            employeeId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            periodStart: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
            },
            periodEnd: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
            },
            totalHours: {
                type: sequelize_1.DataTypes.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(TimesheetStatus)),
                allowNull: false,
                defaultValue: TimesheetStatus.Draft,
            },
            createdAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: sequelize_1.DataTypes.DATE,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'Timesheets',
            modelName: 'Timesheet',
        });
        return Timesheet;
    }
}
exports.Timesheet = Timesheet;
