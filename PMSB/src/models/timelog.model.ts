import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Employee } from './employee.model';
import type { Task } from './task.model';
import type { Timesheet } from './timesheet.model';

export class Timelog extends Model<InferAttributes<Timelog>, InferCreationAttributes<Timelog>> {
  declare id: CreationOptional<string>;
  declare timesheetId: ForeignKey<Timesheet['id']>;
  declare taskId: ForeignKey<Task['id']>;
  declare employeeId: ForeignKey<Employee['id']>;
  declare date: Date;
  declare hours: number;
  declare notes: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare timesheet?: NonAttribute<Timesheet>;
  declare task?: NonAttribute<Task>;
  declare employee?: NonAttribute<Employee>;

  static initModel(sequelize: Sequelize): typeof Timelog {
    Timelog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        timesheetId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        taskId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        employeeId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        hours: {
          type: DataTypes.DECIMAL(4, 2),
          allowNull: false,
        },
        notes: {
          type: DataTypes.TEXT,
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
        tableName: 'Timelogs',
        modelName: 'Timelog',
      },
    );

    return Timelog;
  }
}
