import { Sequelize } from 'sequelize';
import { Employee } from './employee.model';
import { Project } from './project.model';
import { Task } from './task.model';
import { User } from './user.model';
import { Timelog } from './timelog.model';
import { Timesheet } from './timesheet.model';

export const initModels = (sequelize: Sequelize) => {
  User.initModel(sequelize);
  Employee.initModel(sequelize);
  Project.initModel(sequelize);
  Task.initModel(sequelize);
  Timesheet.initModel(sequelize);
  Timelog.initModel(sequelize);

  User.hasOne(Employee, { as: 'employee', foreignKey: 'userId', onDelete: 'CASCADE' });
  Employee.belongsTo(User, { as: 'user', foreignKey: 'userId' });

  Employee.belongsTo(Employee, { as: 'manager', foreignKey: 'managerId' });
  Employee.hasMany(Employee, { as: 'reports', foreignKey: 'managerId' });

  Employee.hasMany(Project, { as: 'managedProjects', foreignKey: 'pmId' });
  Project.belongsTo(Employee, { as: 'projectManager', foreignKey: 'pmId' });

  Project.hasMany(Task, { as: 'tasks', foreignKey: 'projectId', onDelete: 'CASCADE' });
  Task.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

  Employee.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });
  Task.belongsTo(Employee, { as: 'assignee', foreignKey: 'assigneeId' });

  Employee.hasMany(Timesheet, { as: 'timesheets', foreignKey: 'employeeId' });
  Timesheet.belongsTo(Employee, { as: 'employee', foreignKey: 'employeeId' });

  Timesheet.hasMany(Timelog, { as: 'timelogs', foreignKey: 'timesheetId', onDelete: 'CASCADE' });
  Timelog.belongsTo(Timesheet, { as: 'timesheet', foreignKey: 'timesheetId' });

  Task.hasMany(Timelog, { as: 'timelogs', foreignKey: 'taskId', onDelete: 'SET NULL' });
  Timelog.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

  Employee.hasMany(Timelog, { as: 'timelogs', foreignKey: 'employeeId' });
  Timelog.belongsTo(Employee, { as: 'employee', foreignKey: 'employeeId' });

  return {
    User,
    Employee,
    Project,
    Task,
    Timesheet,
    Timelog,
  };
};

export { User, Employee, Project, Task, Timesheet, Timelog };
