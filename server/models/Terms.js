import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const termsSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true }, task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  finalPrice: { type: Number, required: true, min: 0 }, currency: { type: String, default: 'INR', uppercase: true, trim: true }, expectedDuration: { value: { type: Number, min: 1 }, unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'], default: 'days' } }, startDate: Date, deadline: Date, additionalNotes: { type: String, trim: true, maxlength: 5000 },
  version: { type: Number, default: 1, min: 1 }, proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, requesterAcceptedAt: Date, providerAcceptedAt: Date,
}, modelOptions());
termsSchema.index({ task: 1, updatedAt: -1 });
export default mongoose.model('Terms', termsSchema);
