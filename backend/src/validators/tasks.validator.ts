import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(3, 'Title must be at least 3 characters long')
      .max(100, 'Title must be under 100 characters')
      .trim(),
    description: z.string().max(1000, 'Description must be under 1000 characters').optional(),
    status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.PENDING),
    priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.LOW),
    dueDate: z
      .string()
      .datetime({ message: 'dueDate must be a valid ISO DateTime string' })
      .optional()
      .nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').max(100).trim().optional(),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const listTasksQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    search: z.string().optional(),
    all: z
      .string()
      .transform((val) => val === 'true')
      .optional(), // Admin flag to list all users' tasks
  }),
});
