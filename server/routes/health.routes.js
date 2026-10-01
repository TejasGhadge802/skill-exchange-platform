import { Router } from 'express';
import mongoose from 'mongoose';
import { firebaseAdminConfigured } from '../config/firebaseAdmin.js';

const router = Router();
router.get('/', (req, res) => res.json({
  success: true,
  data: { status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', firebaseAdminConfigured },
}));
export default router;
