import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await taskService.createTask(userId, req.body);
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: 'Task created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await taskService.getTaskById(id, userId, userRole);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Task retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { status, priority, search, all } = req.query as any;

      const filters = { status, priority, search };
      const result = await taskService.listTasks(userId, userRole, filters, all);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Tasks list retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await taskService.updateTask(id, userId, userRole, req.body);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Task updated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      await taskService.deleteTask(id, userId, userRole);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Task deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
