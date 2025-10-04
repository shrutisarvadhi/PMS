import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { listProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { createProjectValidation, updateProjectValidation } from '../validators/project.validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listProjects);
router.get('/:id', getProjectById);

router.post('/', authorizeRoles(UserRole.Admin, UserRole.ProjectManager), createProjectValidation, validateRequest, createProject);
router.put('/:id', authorizeRoles(UserRole.Admin, UserRole.ProjectManager), updateProjectValidation, validateRequest, updateProject);
router.delete('/:id', authorizeRoles(UserRole.Admin, UserRole.ProjectManager), deleteProject);

export default router;
