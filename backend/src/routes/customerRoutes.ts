import { Router } from 'express';
import { customerController, createCustomerSchema } from '../controllers/customerController';
import { validate } from '../middleware/validateMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', customerController.listCustomers);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);

export default router;

