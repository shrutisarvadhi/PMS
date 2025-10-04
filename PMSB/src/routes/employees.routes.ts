import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { listEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employee.controller';
import { createEmployeeValidation, updateEmployeeValidation } from '../validators/employee.validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', listEmployees);
router.get('/:id', getEmployeeById);

router.post('/', authorizeRoles(UserRole.Admin), createEmployeeValidation, validateRequest, createEmployee);
router.put('/:id', authorizeRoles(UserRole.Admin), updateEmployeeValidation, validateRequest, updateEmployee);
router.delete('/:id', authorizeRoles(UserRole.Admin), deleteEmployee);

export default router;
