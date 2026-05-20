import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { tasksRouter } from './tasks.routes.js';
import { adminRouter } from './admin.routes.js';

export const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/tasks', tasksRouter);
v1Router.use('/admin', adminRouter);
