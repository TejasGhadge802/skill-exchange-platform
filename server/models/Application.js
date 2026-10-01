import mongoose from 'mongoose';
import { applicationStatuses, modelOptions } from './shared.js';

const applicationSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pitch: { type: String, required: true, trim: true, minlength: 20, maxlength: 5000 }, proposedPrice: { type: Number, min: 0 }, currency: { type: String, default: 'INR', uppercase: true, trim: true },
  proposedDuration: { value: { type: Number, min: 1 }, unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'], default: 'days' } }, status: { type: String, enum: applicationStatuses, default: 'pending', index: true },
  withdrawnAt: Date, decisionAt: Date,
}, modelOptions());
applicationSchema.index({ task: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ task: 1, status: 1 });
applicationSchema.index({ applicant: 1, createdAt: -1 });
export default mongoose.model('Application', applicationSchema);
