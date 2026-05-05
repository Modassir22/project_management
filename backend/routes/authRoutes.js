import express from 'express';
import { registerUser, authUser, getUsers, logoutUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/me', getMe);
router.get('/users', protect, getUsers);

export default router;
