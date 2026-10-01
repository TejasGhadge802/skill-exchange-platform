import { Router } from 'express';
import { getCurrentUser, syncAuthenticatedUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.post('/sync', authenticate, syncAuthenticatedUser);
router.get('/me', authenticate, getCurrentUser);
export default router;
