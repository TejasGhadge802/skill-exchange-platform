import { Router } from 'express';
import { acceptTerms, getTerms, proposeTerms } from '../controllers/terms.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/applications/:applicationId', ...signedIn, getTerms);
router.put('/applications/:applicationId', ...signedIn, proposeTerms);
router.post('/applications/:applicationId/accept', ...signedIn, acceptTerms);
export default router;
