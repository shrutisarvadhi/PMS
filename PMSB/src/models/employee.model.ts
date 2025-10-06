// src/models/employee.model.ts
import type { CreationOptional, ForeignKey, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { DataTypes, Model, Sequelize } from 'sequelize';
import type { User } from './user.model';

export class Employee extends Model<InferAttributes<Employee>, InferCreationAttributes<Employee>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare managerId: ForeignKey<Employee['id']> | null;
  declare firstName: string;
  declare lastName: string;
  declare department: string | null;
  declare position: string | null;
  declare status: 'Active' | 'On Leave' | 'Contract'; // Now properly declared
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;
  declare manager?: NonAttribute<Employee | null>;
  declare reports?: NonAttribute<Employee[]>;

  static initModel(sequelize: Sequelize): typeof Employee {
    Employee.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        managerId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        department: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        position: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        // ✅ ADD THIS BLOCK
        status: {
          type: DataTypes.ENUM('Active', 'On Leave', 'Contract'),
          allowNull: false,
          defaultValue: 'Active',
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
        tableName: 'Employees',
        modelName: 'Employee',
      },
    );

    return Employee;
  }
}