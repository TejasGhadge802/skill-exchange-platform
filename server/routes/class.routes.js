import { Router } from 'express';
import { createClass, enroll, getClass, listClasses, listMyClasses, listMyEnrollments, submitClass, updateClass } from '../controllers/class.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
const router = Router(); const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/', listClasses); router.get('/mine', ...signedIn, listMyClasses); router.get('/enrollments/mine', ...signedIn, listMyEnrollments); router.post('/', ...signedIn, createClass); router.post('/:classId/enroll', ...signedIn, enroll); router.patch('/:classId', ...signedIn, updateClass); router.post('/:classId/submit', ...signedIn, submitClass); router.get('/:classId', getClass);
export default router;
