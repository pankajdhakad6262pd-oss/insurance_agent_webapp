import { Router } from 'express';
import { paymentController, createPaymentLinkSchema } from '../controllers/paymentController';
import { validate } from '../middleware/validateMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Webhook endpoint does not use JWT authenticate (receives Stripe events with raw body or signature)
router.post('/webhook', paymentController.webhook);

// Protected routes
router.use(authenticate);

router.get('/', paymentController.list);
router.post('/create-link', validate(createPaymentLinkSchema), paymentController.createLink);
router.get('/:id', paymentController.getDetails);
router.post('/simulate-success/:id', paymentController.simulateSuccess);

export default router;

