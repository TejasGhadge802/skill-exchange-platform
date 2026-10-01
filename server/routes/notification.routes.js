import { Router } from 'express';
import { listNotifications, markAllRead, markRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
const router = Router(); const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/', ...signedIn, listNotifications); router.patch('/:notificationId/read', ...signedIn, markRead); router.post('/read-all', ...signedIn, markAllRead);
export default router;
