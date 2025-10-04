'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Timesheets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
      },
      employeeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      periodStart: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      periodEnd: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      totalHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Submitted', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Draft',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Timesheets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Timesheets_status";');
  },
};
