import { Router } from 'express';
import { getConversationMessages, listMyConversations } from '../controllers/conversation.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/', ...signedIn, listMyConversations);
router.get('/:conversationId/messages', ...signedIn, getConversationMessages);
export default router;
