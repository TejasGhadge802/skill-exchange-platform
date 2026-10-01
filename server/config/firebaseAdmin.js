import admin from 'firebase-admin';
import { env } from './env.js';

const { projectId, clientEmail, privateKey } = env.firebase;
export const firebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey);
if (firebaseAdminConfigured && !admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}
export default admin;
