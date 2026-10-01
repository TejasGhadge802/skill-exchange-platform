import { Router } from 'express';
import { moderateClass, moderateTask, moderationQueue, resolveReport } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
const router = Router(); const adminOnly = [authenticate, requireRole('admin')];
router.get('/moderation', ...adminOnly, moderationQueue); router.patch('/tasks/:taskId/moderate', ...adminOnly, moderateTask); router.patch('/classes/:classId/moderate', ...adminOnly, moderateClass); router.patch('/reports/:reportId', ...adminOnly, resolveReport);
export default router;
