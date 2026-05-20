import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: 'Registration successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Login successful.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // req.user is guaranteed to be populated by authenticateToken middleware
      const userId = req.user!.id;
      const userProfile = await authService.getMe(userId);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'User profile retrieved successfully.',
        data: userProfile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
