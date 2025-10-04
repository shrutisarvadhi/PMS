import { Router } from 'express';
import { UserRole } from '../models/user.model';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createUserValidation, updateUserValidation } from '../validators/user.validator';
import { listUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(UserRole.Admin));

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, validateRequest, createUser);
router.put('/:id', updateUserValidation, validateRequest, updateUser);
router.delete('/:id', deleteUser);

export default router;
