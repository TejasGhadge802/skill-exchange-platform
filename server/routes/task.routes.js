import { Router } from 'express';
import { createTask, deleteTask, getTask, listMyTasks, listTasks, submitTask, updateTask } from '../controllers/task.controller.js';
import { authenticate, authenticateOptional } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/', listTasks);
router.get('/mine', ...signedIn, listMyTasks);
router.post('/', ...signedIn, createTask);
router.patch('/:taskId', ...signedIn, updateTask);
router.delete('/:taskId', ...signedIn, deleteTask);
router.post('/:taskId/submit', ...signedIn, submitTask);
router.get('/:taskId', authenticateOptional, getTask);
export default router;
