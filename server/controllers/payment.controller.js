import crypto from 'node:crypto';
import Application from '../models/Application.js';
import Payment from '../models/Payment.js';
import Task from '../models/Task.js';
import Terms from '../models/Terms.js';
import { env } from '../config/env.js';
import { razorpay, razorpayConfigured } from '../config/razorpay.js';
import { notify } from '../utils/notifications.js';

function validId(value) { return /^[a-f\d]{24}$/i.test(value); }

async function paymentContext(applicationId, userId) {
  const application = await Application.findById(applicationId);
  if (!application || application.status !== 'accepted') { const error = new Error('Accepted application not found.'); error.statusCode = 404; throw error; }
  const task = await Task.findById(application.task);
  if (!task || String(task.requester) !== String(userId)) { const error = new Error('Only the requester may make this payment.'); error.statusCode = 403; throw error; }
  const terms = await Terms.findOne({ application: application._id });
  if (!terms || !terms.requesterAcceptedAt || !terms.providerAcceptedAt || task.status !== 'payment_pending') { const error = new Error('Both parties must accept the current terms before payment.'); error.statusCode = 409; throw error; }
  return { application, task, terms };
}

export function paymentConfig(req, res) { return res.json({ success: true, data: { keyId: env.razorpay.keyId || null, configured: razorpayConfigured } }); }

export async function createOrder(req, res, next) {
  try {
    if (!razorpayConfigured) return res.status(503).json({ success: false, message: 'Razorpay is not configured.' });
    if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Accepted application not found.' });
    const { application, task, terms } = await paymentContext(req.params.applicationId, req.user._id);
    const amountInPaise = Math.round(terms.finalPrice * 100);
    const order = await razorpay.orders.create({ amount: amountInPaise, currency: terms.currency, receipt: `task_${task.id}_${Date.now()}`, notes: { taskId: task.id, applicationId: application.id } });
    const payment = await Payment.create({ razorpayOrderId: order.id, amount: terms.finalPrice, currency: terms.currency, status: 'created', task: task._id, application: application._id, requester: task.requester, provider: application.applicant });
    return res.status(201).json({ success: true, data: { order: { id: order.id, amount: order.amount, currency: order.currency }, paymentId: payment.id } });
  } catch (error) { return next(error); }
}

export async function verifyPayment(req, res, next) {
  try {
    if (!razorpayConfigured) return res.status(503).json({ success: false, message: 'Razorpay is not configured.' });
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!orderId || !paymentId || !signature) return res.status(400).json({ success: false, message: 'Incomplete Razorpay payment response.' });
    const payment = await Payment.findOne({ razorpayOrderId: orderId, requester: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment order not found.' });
    const expected = crypto.createHmac('sha256', env.razorpay.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) { payment.status = 'failed'; payment.failureReason = 'Invalid Razorpay signature.'; await payment.save(); return res.status(400).json({ success: false, message: 'Payment verification failed.' }); }
    if (payment.status === 'paid') return res.json({ success: true, data: { payment, alreadyVerified: true } });
    const task = await Task.findById(payment.task);
    if (!task || task.status !== 'payment_pending') return res.status(409).json({ success: false, message: 'This task is no longer ready for payment.' });
    payment.status = 'paid'; payment.razorpayPaymentId = paymentId; payment.razorpaySignature = signature; payment.paidAt = new Date(); await payment.save();
    task.status = 'in_progress'; await task.save();
    await notify({ user: payment.provider, type: 'payment_received', title: 'Payment verified', body: `Payment for “${task.title}” is verified. Work can begin.`, resourceType: 'task', resourceId: task._id });
    return res.json({ success: true, data: { payment } });
  } catch (error) { return next(error); }
}

export async function handleRazorpayWebhook(req, res, next) {
  try {
    if (!env.razorpay.webhookSecret) return res.status(503).json({ success: false, message: 'Razorpay webhook is not configured.' });
    const received = req.headers['x-razorpay-signature'];
    const expected = crypto.createHmac('sha256', env.razorpay.webhookSecret).update(req.body).digest('hex');
    if (!received || received.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    const payload = JSON.parse(req.body.toString('utf8'));
    if (payload.event !== 'payment.captured') return res.status(200).json({ success: true });
    const razorpayPayment = payload.payload?.payment?.entity;
    const payment = await Payment.findOne({ razorpayOrderId: razorpayPayment?.order_id });
    if (!payment || payment.status === 'paid') return res.status(200).json({ success: true });
    payment.status = 'paid'; payment.razorpayPaymentId = razorpayPayment.id; payment.paidAt = new Date(); await payment.save();
    await Task.updateOne({ _id: payment.task, status: 'payment_pending' }, { $set: { status: 'in_progress' } });
    await notify({ user: payment.provider, type: 'payment_received', title: 'Payment verified', body: 'Payment was verified by Razorpay.', resourceType: 'task', resourceId: payment.task });
    return res.status(200).json({ success: true });
  } catch (error) { return next(error); }
}
