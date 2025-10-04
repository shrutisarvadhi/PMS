import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { listTasks, getTaskById, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { createTaskValidation, updateTaskValidation } from '../validators/task.validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listTasks);
router.get('/:id', getTaskById);

router.post('/', authorizeRoles(UserRole.Admin, UserRole.ProjectManager), createTaskValidation, validateRequest, createTask);
router.put('/:id', authorizeRoles(UserRole.Admin, UserRole.ProjectManager), updateTaskValidation, validateRequest, updateTask);
router.delete('/:id', authorizeRoles(UserRole.Admin, UserRole.ProjectManager), deleteTask);

export default router;
