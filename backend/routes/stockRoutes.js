import express from 'express';
import { 
    addStock,
    editStock,
    getAllStocks
} from '../controllers/stockController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { ROLES } from '../models/role.js';

const router = express.Router();

router.get('/', getAllStocks);
router.post('/', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), addStock);
router.put('/:stock_id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), editStock);

export default router;