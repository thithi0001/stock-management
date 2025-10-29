import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { ROLES } from '../models/role.js';
import { 
    addProduct, 
    editProduct, 
    getAllProducts 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', authenticateToken, getAllProducts);
router.post('/', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), addProduct);
router.put('/:product_id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), editProduct);

export default router;