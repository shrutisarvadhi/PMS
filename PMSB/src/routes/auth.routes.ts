import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../validators/auth.validator';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

export default router;
