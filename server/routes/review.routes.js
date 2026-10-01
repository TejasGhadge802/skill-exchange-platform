import { Router } from 'express';
import { createReview, listTaskReviews } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
const router = Router(); const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/tasks/:taskId', listTaskReviews);
router.post('/tasks/:taskId', ...signedIn, createReview);
export default router;
