import { Router } from 'express';
import { confirmCompletion, requestCompletion } from '../controllers/completion.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
const router = Router(); const signedIn = [authenticate, requireRole('user', 'admin')];
router.post('/tasks/:taskId/request', ...signedIn, requestCompletion);
router.post('/tasks/:taskId/confirm', ...signedIn, confirmCompletion);
export default router;
