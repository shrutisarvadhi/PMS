import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { listTimesheets, getTimesheetById, createTimesheet, updateTimesheet, deleteTimesheet } from '../controllers/timesheet.controller';
import { createTimesheetValidation, updateTimesheetValidation } from '../validators/timesheet.validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listTimesheets);
router.get('/:id', getTimesheetById);

router.post('/', authorizeRoles(UserRole.Admin), createTimesheetValidation, validateRequest, createTimesheet);
router.put('/:id', authorizeRoles(UserRole.Admin), updateTimesheetValidation, validateRequest, updateTimesheet);
router.delete('/:id', authorizeRoles(UserRole.Admin), deleteTimesheet);

export default router;
