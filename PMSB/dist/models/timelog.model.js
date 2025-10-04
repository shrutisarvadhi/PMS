"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timelog = void 0;
const sequelize_1 = require("sequelize");
class Timelog extends sequelize_1.Model {
    static initModel(sequelize) {
        Timelog.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            timesheetId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            taskId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            employeeId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            date: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
            },
            hours: {
                type: sequelize_1.DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
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
            tableName: 'Timelogs',
            modelName: 'Timelog',
        });
        return Timelog;
    }
}
exports.Timelog = Timelog;
