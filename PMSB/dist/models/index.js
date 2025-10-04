"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timelog = exports.Timesheet = exports.Task = exports.Project = exports.Employee = exports.User = exports.initModels = void 0;
const employee_model_1 = require("./employee.model");
Object.defineProperty(exports, "Employee", { enumerable: true, get: function () { return employee_model_1.Employee; } });
const project_model_1 = require("./project.model");
Object.defineProperty(exports, "Project", { enumerable: true, get: function () { return project_model_1.Project; } });
const task_model_1 = require("./task.model");
Object.defineProperty(exports, "Task", { enumerable: true, get: function () { return task_model_1.Task; } });
const user_model_1 = require("./user.model");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_model_1.User; } });
const timelog_model_1 = require("./timelog.model");
Object.defineProperty(exports, "Timelog", { enumerable: true, get: function () { return timelog_model_1.Timelog; } });
const timesheet_model_1 = require("./timesheet.model");
Object.defineProperty(exports, "Timesheet", { enumerable: true, get: function () { return timesheet_model_1.Timesheet; } });
const initModels = (sequelize) => {
    user_model_1.User.initModel(sequelize);
    employee_model_1.Employee.initModel(sequelize);
    project_model_1.Project.initModel(sequelize);
    task_model_1.Task.initModel(sequelize);
    timesheet_model_1.Timesheet.initModel(sequelize);
    timelog_model_1.Timelog.initModel(sequelize);
    user_model_1.User.hasOne(employee_model_1.Employee, { as: 'employee', foreignKey: 'userId', onDelete: 'CASCADE' });
    employee_model_1.Employee.belongsTo(user_model_1.User, { as: 'user', foreignKey: 'userId' });
    employee_model_1.Employee.belongsTo(employee_model_1.Employee, { as: 'manager', foreignKey: 'managerId' });
    employee_model_1.Employee.hasMany(employee_model_1.Employee, { as: 'reports', foreignKey: 'managerId' });
    employee_model_1.Employee.hasMany(project_model_1.Project, { as: 'managedProjects', foreignKey: 'pmId' });
    project_model_1.Project.belongsTo(employee_model_1.Employee, { as: 'projectManager', foreignKey: 'pmId' });
    project_model_1.Project.hasMany(task_model_1.Task, { as: 'tasks', foreignKey: 'projectId', onDelete: 'CASCADE' });
    task_model_1.Task.belongsTo(project_model_1.Project, { as: 'project', foreignKey: 'projectId' });
    employee_model_1.Employee.hasMany(task_model_1.Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });
    task_model_1.Task.belongsTo(employee_model_1.Employee, { as: 'assignee', foreignKey: 'assigneeId' });
    employee_model_1.Employee.hasMany(timesheet_model_1.Timesheet, { as: 'timesheets', foreignKey: 'employeeId' });
    timesheet_model_1.Timesheet.belongsTo(employee_model_1.Employee, { as: 'employee', foreignKey: 'employeeId' });
    timesheet_model_1.Timesheet.hasMany(timelog_model_1.Timelog, { as: 'timelogs', foreignKey: 'timesheetId', onDelete: 'CASCADE' });
    timelog_model_1.Timelog.belongsTo(timesheet_model_1.Timesheet, { as: 'timesheet', foreignKey: 'timesheetId' });
    task_model_1.Task.hasMany(timelog_model_1.Timelog, { as: 'timelogs', foreignKey: 'taskId', onDelete: 'SET NULL' });
    timelog_model_1.Timelog.belongsTo(task_model_1.Task, { as: 'task', foreignKey: 'taskId' });
    employee_model_1.Employee.hasMany(timelog_model_1.Timelog, { as: 'timelogs', foreignKey: 'employeeId' });
    timelog_model_1.Timelog.belongsTo(employee_model_1.Employee, { as: 'employee', foreignKey: 'employeeId' });
    return {
        User: user_model_1.User,
        Employee: employee_model_1.Employee,
        Project: project_model_1.Project,
        Task: task_model_1.Task,
        Timesheet: timesheet_model_1.Timesheet,
        Timelog: timelog_model_1.Timelog,
    };
};
exports.initModels = initModels;
