import { prisma } from '../config/db.js';
import { Prisma, Task, TaskStatus, TaskPriority } from '@prisma/client';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export class TaskRepository {
  async create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    return prisma.task.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async list(userId: string, filters: TaskFilters): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = { userId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.task.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listAll(filters: TaskFilters): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.task.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async count(where: Prisma.TaskWhereInput = {}): Promise<number> {
    return prisma.task.count({ where });
  }

  async countGroupByStatus(): Promise<{ status: TaskStatus; _count: { status: number } }[]> {
    return prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }) as unknown as { status: TaskStatus; _count: { status: number } }[];
  }

  async countGroupByPriority(): Promise<{ priority: TaskPriority; _count: { priority: number } }[]> {
    return prisma.task.groupBy({
      by: ['priority'],
      _count: {
        priority: true,
      },
    }) as unknown as { priority: TaskPriority; _count: { priority: number } }[];
  }
}

export const taskRepository = new TaskRepository();
