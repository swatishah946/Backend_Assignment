import { userRepository } from '../repositories/user.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { NotFoundError } from '../utils/customErrors.js';
import { Role } from '@prisma/client';

export class AdminService {
  async listUsers() {
    return userRepository.listAll();
  }

  async updateUserRole(targetUserId: string, role: Role) {
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return userRepository.updateRole(targetUserId, role);
  }

  async getStats() {
    const totalUsers = await userRepository.count();
    const totalTasks = await taskRepository.count();

    const statusCountsRaw = await taskRepository.countGroupByStatus();
    const priorityCountsRaw = await taskRepository.countGroupByPriority();

    // Map aggregates to clean key-value structures
    const tasksByStatus = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };
    statusCountsRaw.forEach((item) => {
      tasksByStatus[item.status] = item._count.status;
    });

    const tasksByPriority = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };
    priorityCountsRaw.forEach((item) => {
      tasksByPriority[item.priority] = item._count.priority;
    });

    return {
      totalUsers,
      totalTasks,
      tasksByStatus,
      tasksByPriority,
    };
  }
}

export const adminService = new AdminService();
