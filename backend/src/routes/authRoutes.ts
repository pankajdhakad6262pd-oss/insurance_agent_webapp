import { Router } from 'express';
import { authController, registerSchema, loginSchema, forgotPasswordSchema } from '../controllers/authController';
import { validate } from '../middleware/validateMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.get('/me', authenticate, authController.getMe);

export default router;

