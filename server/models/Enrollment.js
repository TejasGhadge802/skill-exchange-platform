import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const enrollmentSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }, student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'enrolled', 'cancelled', 'completed', 'waitlisted'], default: 'pending', index: true }, payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }, cancelledAt: Date,
}, modelOptions());
enrollmentSchema.index({ class: 1, student: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, createdAt: -1 });
export default mongoose.model('Enrollment', enrollmentSchema);
