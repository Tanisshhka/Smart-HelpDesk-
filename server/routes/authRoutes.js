import express from 'express';
const router = express.Router();
import { authUser, registerUser, getUserProfile, getAllUsers } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getAllUsers);

export default router;
