import { models } from '../config/database';
import type { CreateTaskDto, TaskResponseDto, UpdateTaskDto } from '../dtos/task.dto';
import { AppError } from '../utils/app-error';
import { TaskPriority, TaskStatus } from '../models/task.model';
import type { Task as TaskModel } from '../models/task.model';

const { Task, Project, Employee } = models;

const toDto = (task: TaskModel): TaskResponseDto => ({
  id: task.id,
  projectId: task.projectId,
  title: task.title,
  description: task.description,
  assigneeId: task.assigneeId,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
});

const ensureAssigneeExists = async (assigneeId: string | null | undefined) => {
  if (!assigneeId) {
    return;
  }
  const employee = await Employee.findByPk(assigneeId);
  if (!employee) {
    throw new AppError(404, 'Assignee not found');
  }
};

export class TaskService {
  static async list(): Promise<TaskResponseDto[]> {
    const tasks = await Task.findAll();
    return tasks.map((task) => toDto(task));
  }

  static async listByProjectManager(pmId: string): Promise<TaskResponseDto[]> {
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          as: 'project',
          where: { pmId },
          attributes: [],
        },
      ],
    });
    return tasks.map((task) => toDto(task));
  }

  static async listByEmployee(employeeId: string): Promise<TaskResponseDto[]> {
    const tasks = await Task.findAll({ where: { assigneeId: employeeId } });
    return tasks.map((task) => toDto(task));
  }

  static async findById(id: string): Promise<TaskResponseDto> {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }
    return toDto(task);
  }

  static async findByIdForProjectManager(id: string, pmId: string): Promise<TaskResponseDto> {
    const task = await Task.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: 'project',
          where: { pmId },
          attributes: [],
        },
      ],
    });

    if (!task) {
      throw new AppError(403, 'Task not accessible for this manager');
    }

    return toDto(task);
  }

  static async create(payload: CreateTaskDto): Promise<TaskResponseDto> {
    const project = await Project.findByPk(payload.projectId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    await ensureAssigneeExists(payload.assigneeId);

    const task = await Task.create({
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description ?? null,
      assigneeId: payload.assigneeId ?? null,
      status: payload.status ?? TaskStatus.Todo,
      priority: payload.priority ?? TaskPriority.Medium,
      dueDate: payload.dueDate ?? null,
    });

    return toDto(task);
  }

  static async createForProjectManager(pmId: string, payload: CreateTaskDto): Promise<TaskResponseDto> {
    const project = await Project.findOne({ where: { id: payload.projectId, pmId } });
    if (!project) {
      throw new AppError(403, 'Project not accessible for this manager');
    }

    return this.create(payload);
  }

  private static async applyUpdates(task: TaskModel, payload: UpdateTaskDto): Promise<TaskResponseDto> {
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

  static async update(id: string, payload: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await Task.findByPk(id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    return this.applyUpdates(task, payload);
  }

  static async updateForProjectManager(id: string, pmId: string, payload: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await Task.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: 'project',
          where: { pmId },
          attributes: [],
        },
      ],
    });

    if (!task) {
      throw new AppError(403, 'Task not accessible for this manager');
    }

    return this.applyUpdates(task, payload);
  }

  static async remove(id: string): Promise<void> {
    const deleted = await Task.destroy({ where: { id } });
    if (!deleted) {
      throw new AppError(404, 'Task not found');
    }
  }

  static async removeForProjectManager(id: string, pmId: string): Promise<void> {
    const task = await Task.findOne({
      where: { id },
      include: [
        {
          model: Project,
          as: 'project',
          where: { pmId },
          attributes: [],
        },
      ],
    });

    if (!task) {
      throw new AppError(403, 'Task not accessible for this manager');
    }

    await Task.destroy({ where: { id } });
  }
}
