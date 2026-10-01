import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: { type: String, trim: true, sparse: true, unique: true }, razorpayPaymentId: { type: String, trim: true, sparse: true, unique: true }, razorpaySignature: { type: String, select: false },
  amount: { type: Number, required: true, min: 0 }, currency: { type: String, default: 'INR', uppercase: true, trim: true }, status: { type: String, enum: ['created', 'pending', 'paid', 'failed', 'refunded', 'cancelled'], default: 'created', index: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }, enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' }, requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, paidAt: Date, failureReason: { type: String, trim: true, maxlength: 1000 },
}, modelOptions());
paymentSchema.index({ task: 1, application: 1 });
paymentSchema.index({ requester: 1, createdAt: -1 });
export default mongoose.model('Payment', paymentSchema);
