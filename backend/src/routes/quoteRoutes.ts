import { Router } from 'express';
import { quoteController, generateQuoteSchema } from '../controllers/quoteController';
import { validate } from '../middleware/validateMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/generate', validate(generateQuoteSchema), quoteController.generate);
router.get('/', quoteController.list);
router.get('/:id', quoteController.getById);

export default router;

