import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { ROLES } from '../models/role.js';
import { 
    addLink,
    addRestockRequest, 
    editLink, 
    editRestockRequest, 
    getAllLinks, 
    getAllRestockRequests, 
    getLinkById, 
    getRestockRequestById
} from '../controllers/restockController.js';

const router = express.Router();

router.get('/', authenticateToken, getAllRestockRequests);
router.post('/', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), addRestockRequest);
router.get('/:request_id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER, ROLES.IMPORTSTAFF), getRestockRequestById);
router.put('/:request_id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), editRestockRequest);

router.get('/links/', authenticateToken, getAllLinks);
router.post('/links/', authenticateToken, authorizeRoles(ROLES.IMPORTSTAFF), addLink);
router.get('/links/:link_id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER, ROLES.IMPORTSTAFF), getLinkById);
router.put('/links/:link_id', authenticateToken, authorizeRoles(ROLES.STOREKEEPER), editLink);

export default router;