import express from 'express';
import { register } from '../controllers/registerController.js';
import { login } from '../controllers/authController.js';
import { getUserByUsername } from '../models/userModel.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/prisma/:username', getUserByUsername);

export default router;