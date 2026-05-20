import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.js';
import { updateRoleSchema } from '../validators/admin.validator.js';

export const adminRouter = Router();

// Apply auth and admin role check globally to all admin routes
adminRouter.use(authenticateToken);
adminRouter.use(requireRole('ADMIN'));

adminRouter.get('/users', adminController.listUsers);
adminRouter.put('/users/:id/role', validateRequest(updateRoleSchema), adminController.updateUserRole);
adminRouter.get('/stats', adminController.getStats);
