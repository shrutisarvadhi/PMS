import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Employee } from './employee.model';
import type { Project } from './project.model';
import type { Timelog } from './timelog.model';

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Blocked = 'Blocked',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<string>;
  declare projectId: ForeignKey<Project['id']>;
  declare title: string;
  declare description: string | null;
  declare assigneeId: ForeignKey<Employee['id']> | null;
  declare status: TaskStatus;
  declare priority: TaskPriority;
  declare dueDate: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare project?: NonAttribute<Project>;
  declare assignee?: NonAttribute<Employee | null>;
  declare timelogs?: NonAttribute<Timelog[]>;

  static initModel(sequelize: Sequelize): typeof Task {
    Task.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        projectId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        assigneeId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TaskStatus)),
          allowNull: false,
          defaultValue: TaskStatus.Todo,
        },
        priority: {
          type: DataTypes.ENUM(...Object.values(TaskPriority)),
          allowNull: false,
          defaultValue: TaskPriority.Medium,
        },
        dueDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'Tasks',
        modelName: 'Task',
      },
    );

    return Task;
  }
}
