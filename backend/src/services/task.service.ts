import { taskRepository, TaskFilters } from '../repositories/task.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/customErrors.js';
import { Task, Prisma } from '@prisma/client';

export class TaskService {
  async createTask(userId: string, data: Omit<Prisma.TaskUncheckedCreateInput, 'userId'>): Promise<Task> {
    return taskRepository.create({
      ...data,
      userId,
    });
  }

  async getTaskById(taskId: string, userId: string, userRole: string): Promise<Task> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // IDOR Prevention: Users can only see their own tasks, Admins can view any task
    if (task.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied: You are not authorized to view this task.');
    }

    return task;
  }

  async listTasks(userId: string, userRole: string, filters: TaskFilters, listAllForAdmin?: boolean): Promise<Task[]> {
    // If user is Admin and explicitly requests all tasks
    if (userRole === 'ADMIN' && listAllForAdmin) {
      return taskRepository.listAll(filters);
    }
    // Default: List only the authenticated user's tasks
    return taskRepository.list(userId, filters);
  }

  async updateTask(
    taskId: string,
    userId: string,
    userRole: string,
    data: Prisma.TaskUpdateInput
  ): Promise<Task> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // IDOR Prevention: Users can only update their own tasks, Admins can update any task
    if (task.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied: You are not authorized to modify this task.');
    }

    return taskRepository.update(taskId, data);
  }

  async deleteTask(taskId: string, userId: string, userRole: string): Promise<Task> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // IDOR Prevention: Users can only delete their own tasks, Admins can delete any task
    if (task.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied: You are not authorized to delete this task.');
    }

    return taskRepository.delete(taskId);
  }
}

export const taskService = new TaskService();
