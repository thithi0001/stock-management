import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { ROLES } from '../models/role.js';
import { getUserByUsername, getUsersByRole } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticateToken, getUserByUsername);
router.get(
    '/roles/:role_name', 
    authenticateToken, 
    authorizeRoles(ROLES.MANAGER, ROLES.STOREKEEPER), 
    getUsersByRole
);

export default router;