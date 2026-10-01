import admin, { firebaseAdminConfigured } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

// Routes in later phases can use this to verify Firebase ID tokens server-side.
export async function authenticate(req, res, next) {
  if (!firebaseAdminConfigured) {
    return res.status(503).json({ success: false, message: 'Firebase Admin is not configured.' });
  }
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

// Public endpoints can use this to grant owners/admins access to their non-public records.
export async function authenticateOptional(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return next();
  if (!firebaseAdminConfigured) return res.status(503).json({ success: false, message: 'Firebase Admin is not configured.' });
  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    req.user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}
