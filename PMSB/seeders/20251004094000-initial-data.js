'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const adminId = uuidv4();
    const pmUserId = uuidv4();
    const employeeUserId = uuidv4();

    const [adminPassword, pmPassword, employeePassword] = await Promise.all([
      bcrypt.hash('AdminPass123!', 10),
      bcrypt.hash('PmPass123!', 10),
      bcrypt.hash('EmployeePass123!', 10),
    ]);

    const adminUser = {
      id: adminId,
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'Admin',
      createdAt: now,
      updatedAt: now,
    };

    const pmUser = {
      id: pmUserId,
      username: 'projectmanager',
      email: 'pm@example.com',
      password: pmPassword,
      role: 'PM',
      createdAt: now,
      updatedAt: now,
    };

    const employeeUser = {
      id: employeeUserId,
      username: 'employee',
      email: 'employee@example.com',
      password: employeePassword,
      role: 'Employee',
      createdAt: now,
      updatedAt: now,
    };

    await queryInterface.bulkInsert('Users', [adminUser, pmUser, employeeUser]);

    const pmEmployeeId = uuidv4();
    const employeeId = uuidv4();

    const employees = [
      {
        id: pmEmployeeId,
        userId: pmUserId,
        managerId: null,
        firstName: 'Pat',
        lastName: 'Manager',
        department: 'Project Management',
        position: 'Project Manager',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: employeeId,
        userId: employeeUserId,
        managerId: pmEmployeeId,
        firstName: 'Evan',
        lastName: 'Employee',
        department: 'Engineering',
        position: 'Developer',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Employees', employees);

    const projectId = uuidv4();

    await queryInterface.bulkInsert('Projects', [
      {
        id: projectId,
        name: 'Initial Project',
        description: 'Sample project managed by default PM user',
        pmId: pmEmployeeId,
        status: 'InProgress',
        startDate: now,
        endDate: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const taskId = uuidv4();

    await queryInterface.bulkInsert('Tasks', [
      {
        id: taskId,
        projectId,
        title: 'Initial Task',
        description: 'Kick-off task for the project',
        assigneeId: employeeId,
        status: 'InProgress',
        priority: 'High',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const timesheetId = uuidv4();

    await queryInterface.bulkInsert('Timesheets', [
      {
        id: timesheetId,
        employeeId,
        periodStart: now,
        periodEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        totalHours: 8,
        status: 'Submitted',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('Timelogs', [
      {
        id: uuidv4(),
        timesheetId,
        taskId,
        employeeId,
        date: now,
        hours: 8,
        notes: 'Initial work logged',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Timelogs', null, {});
    await queryInterface.bulkDelete('Timesheets', null, {});
    await queryInterface.bulkDelete('Tasks', null, {});
    await queryInterface.bulkDelete('Projects', null, {});
    await queryInterface.bulkDelete('Employees', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
