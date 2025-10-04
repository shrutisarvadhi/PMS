import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type { Employee } from './employee.model';
import type { Timelog } from './timelog.model';

export enum TimesheetStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export class Timesheet extends Model<InferAttributes<Timesheet>, InferCreationAttributes<Timesheet>> {
  declare id: CreationOptional<string>;
  declare employeeId: ForeignKey<Employee['id']>;
  declare periodStart: Date;
  declare periodEnd: Date;
  declare totalHours: number;
  declare status: TimesheetStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare employee?: NonAttribute<Employee>;
  declare timelogs?: NonAttribute<Timelog[]>;

  static initModel(sequelize: Sequelize): typeof Timesheet {
    Timesheet.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        employeeId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        periodStart: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        periodEnd: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        totalHours: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(TimesheetStatus)),
          allowNull: false,
          defaultValue: TimesheetStatus.Draft,
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
        tableName: 'Timesheets',
        modelName: 'Timesheet',
      },
    );

    return Timesheet;
  }
}
