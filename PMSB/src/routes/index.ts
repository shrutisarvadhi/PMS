import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import employeeRoutes from './employees.routes';
import projectRoutes from './projects.routes';
import taskRoutes from './tasks.routes';
import timesheetRoutes from './timesheets.routes';
import timelogRoutes from './timelogs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/timelogs', timelogRoutes);

export default router;
