import { Router } from 'express';
import { createOrder, paymentConfig, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
const signedIn = [authenticate, requireRole('user', 'admin')];
router.get('/config', paymentConfig);
router.post('/applications/:applicationId/order', ...signedIn, createOrder);
router.post('/verify', ...signedIn, verifyPayment);
export default router;
