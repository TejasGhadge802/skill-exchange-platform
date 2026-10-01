import { Router } from 'express';
import { createApplication, decideApplication, listMyApplications, listTaskApplications, withdrawApplication } from '../controllers/application.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/mine', ...signedIn, listMyApplications);
router.post('/tasks/:taskId', ...signedIn, createApplication);
router.get('/tasks/:taskId', ...signedIn, listTaskApplications);
router.patch('/:applicationId/decision', ...signedIn, decideApplication);
router.patch('/:applicationId/withdraw', ...signedIn, withdrawApplication);
export default router;
