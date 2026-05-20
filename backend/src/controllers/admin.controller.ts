import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.listUsers();
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Users list retrieved successfully.',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updatedUser = await adminService.updateUserRole(id, role);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'User role updated successfully.',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getStats();
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'System statistics retrieved successfully.',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
