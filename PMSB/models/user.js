'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        if (typeof value === 'string') {
          this.setDataValue('username', value.trim());
        }
      },
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM('Admin', 'PM', 'Employee'), // ✅ Match DB ENUM
      allowNull: true,
      // defaultValue: 'Employee', // ✅ Capital 'E', matches ENUM
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
    hooks: {
      beforeCreate(user) {
        console.log('🚀 BEFORE CREATE HOOK TRIGGERED');
    console.log('Username raw:', user.getDataValue('username'));
    console.log('Current role:', user.getDataValue('role'));

        const rawUsername = user.getDataValue('username'); // ✅ Safe way
        console.log('Normalized username:', rawUsername ? rawUsername.toLowerCase().trim() : 'N/A');
        if (rawUsername) {
          const normalized = rawUsername.toLowerCase().trim();
          if (normalized === 'admin') {
            user.setDataValue('role', 'Admin');
          } else if (normalized === 'pm') {
            user.setDataValue('role', 'PM');
          } else {
            user.setDataValue('role', 'Employee');
          }
        }
      },
      beforeUpdate(user) {
        const rawUsername = user.getDataValue('username');
        if (rawUsername) {
          const normalized = rawUsername.toLowerCase().trim();
          if (normalized === 'admin') {
            user.setDataValue('role', 'Admin');
          } else if (normalized === 'pm') {
            user.setDataValue('role', 'PM');
          } else {
            user.setDataValue('role', 'Employee');
          }
        }
      }
    }
  });

  return User;
};