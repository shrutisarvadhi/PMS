"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const database_1 = require("../config/database");
const app_error_1 = require("../utils/app-error");
const task_model_1 = require("../models/task.model");
const { Task, Project, Employee } = database_1.models;
const toDto = (task) => ({
  id: task.id,
  projectId: task.projectId,
  title: task.title,
  description: task.description,
  assigneeId: task.assigneeId,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
});
const ensureAssigneeExists = async (assigneeId) => {
  if (!assigneeId) {
    return;
  }
  // const employee = await Employee.findByPk(assigneeId);
  const user = await User.findByPk(assigneeId);
  console.log('Creating task with payload:', payload);
  console.log(user);

  if (!user) {
      throw new app_error_1.AppError(404, 'Assignee not found');
  }

//   if (!employee) {
//     throw new app_error_1.AppError(404, "Assignee not found");
//   }
};
class TaskService {
  static async list() {
    const tasks = await Task.findAll();
    return tasks.map((task) => toDto(task));
  }
  static async listByProjectManager(pmId) {
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          as: "project",
          where: { pmId },
          attributes: [],
        },
      ],
    });
    return tasks.map((task) => toDto(task));
  }
  static async listByEmployee(employeeId) {
    const tasks = await Task.findAll({ where: { assigneeId: employeeId } });
    return tasks.map((task) => toDto(task));
  }
  static async findById(id) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new app_error_1.AppError(404, "Task not found");
    }
    return toDto(task);
  }
  static async findByIdForProjectManager(id, pmId) {
    const task = await Task.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: "project",
          where: { pmId },
          attributes: [],
        },
      ],
    });
    if (!task) {
      throw new app_error_1.AppError(
        403,
        "Task not accessible for this manager"
      );
    }
    return toDto(task);
  }
  static async create(payload) {
    const project = await Project.findByPk(payload.projectId);
    if (!project) {
      throw new app_error_1.AppError(404, "Project not found");
    }
    console.log('Creating task with payload:', payload);
    
    await ensureAssigneeExists(payload.assigneeId);
    const task = await Task.create({
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description ?? null,
      assigneeId: payload.assigneeId ?? null,
      status: payload.status ?? task_model_1.TaskStatus.Todo,
      priority: payload.priority ?? task_model_1.TaskPriority.Medium,
      dueDate: payload.dueDate ?? null,
    });
    return toDto(task);
  }
  static async createForProjectManager(pmId, payload) {
    const project = await Project.findOne({
      where: { id: payload.projectId, pmId },
    });
    if (!project) {
      throw new app_error_1.AppError(
        403,
        "Project not accessible for this manager"
      );
    }
    return this.create(payload);
  }
  static async applyUpdates(task, payload) {
    await ensureAssigneeExists(payload.assigneeId);
    if (payload.title !== undefined) {
      task.title = payload.title;
    }
    if (payload.description !== undefined) {
      task.description = payload.description;
    }
    if (payload.assigneeId !== undefined) {
      task.assigneeId = payload.assigneeId;
    }
    if (payload.status !== undefined) {
      task.status = payload.status;
    }
    if (payload.priority !== undefined) {
      task.priority = payload.priority;
    }
    if (payload.dueDate !== undefined) {
      task.dueDate = payload.dueDate;
    }
    await task.save();
    return toDto(task);
  }
  static async update(id, payload) {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new app_error_1.AppError(404, "Task not found");
    }
    return this.applyUpdates(task, payload);
  }
  static async updateForProjectManager(id, pmId, payload) {
    const task = await Task.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: "project",
          where: { pmId },
          attributes: [],
        },
      ],
    });
    if (!task) {
      throw new app_error_1.AppError(
        403,
        "Task not accessible for this manager"
      );
    }
    return this.applyUpdates(task, payload);
  }
  static async remove(id) {
    const deleted = await Task.destroy({ where: { id } });
    if (!deleted) {
      throw new app_error_1.AppError(404, "Task not found");
    }
  }
  static async removeForProjectManager(id, pmId) {
    const task = await Task.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: "project",
          where: { pmId },
          attributes: [],
        },
      ],
    });
    if (!task) {
      throw new app_error_1.AppError(
        403,
        "Task not accessible for this manager"
      );
    }
    await Task.destroy({ where: { id } });
  }
}
exports.TaskService = TaskService;
