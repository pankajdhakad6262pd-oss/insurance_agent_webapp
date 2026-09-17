import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', productController.listProducts);
router.get('/categories', productController.listCategories);
router.get('/eligible/:customerId', productController.getEligibleProducts);
router.get('/:id', productController.getProductById);

export default router;

