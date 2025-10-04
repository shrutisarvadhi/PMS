"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskPriority = exports.TaskStatus = void 0;
const sequelize_1 = require("sequelize");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Todo"] = "Todo";
    TaskStatus["InProgress"] = "InProgress";
    TaskStatus["Completed"] = "Completed";
    TaskStatus["Blocked"] = "Blocked";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["Low"] = "Low";
    TaskPriority["Medium"] = "Medium";
    TaskPriority["High"] = "High";
    TaskPriority["Critical"] = "Critical";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
class Task extends sequelize_1.Model {
    static initModel(sequelize) {
        Task.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                primaryKey: true,
            },
            projectId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            title: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            assigneeId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: true,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(TaskStatus)),
                allowNull: false,
                defaultValue: TaskStatus.Todo,
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(TaskPriority)),
                allowNull: false,
                defaultValue: TaskPriority.Medium,
            },
            dueDate: {
                type: sequelize_1.DataTypes.DATE,
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
            tableName: 'Tasks',
            modelName: 'Task',
        });
        return Task;
    }
}
exports.Task = Task;
