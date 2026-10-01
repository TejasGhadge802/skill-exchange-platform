import Razorpay from 'razorpay';
import { env } from './env.js';

export const razorpayConfigured = Boolean(env.razorpay.keyId && env.razorpay.keySecret);
export const razorpay = razorpayConfigured ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret }) : null;
