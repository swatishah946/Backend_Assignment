import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.js';
import { createTaskSchema, updateTaskSchema, listTasksQuerySchema } from '../validators/tasks.validator.js';

export const tasksRouter = Router();

// Apply auth middleware globally to all task routes
tasksRouter.use(authenticateToken);

tasksRouter.route('/')
  .get(validateRequest(listTasksQuerySchema), taskController.listTasks)
  .post(validateRequest(createTaskSchema), taskController.createTask);

tasksRouter.route('/:id')
  .get(taskController.getTaskById)
  .put(validateRequest(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);
