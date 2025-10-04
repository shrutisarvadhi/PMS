import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { listTimelogs, getTimelogById, createTimelog, updateTimelog, deleteTimelog } from '../controllers/timelog.controller';
import { createTimelogValidation, updateTimelogValidation } from '../validators/timelog.validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listTimelogs);
router.get('/:id', getTimelogById);

router.post('/', authorizeRoles(UserRole.Admin), createTimelogValidation, validateRequest, createTimelog);
router.put('/:id', authorizeRoles(UserRole.Admin), updateTimelogValidation, validateRequest, updateTimelog);
router.delete('/:id', authorizeRoles(UserRole.Admin), deleteTimelog);

export default router;
