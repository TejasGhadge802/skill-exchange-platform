import mongoose from 'mongoose';
import { modelOptions } from './shared.js';

const classSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 160 }, description: { type: String, required: true, trim: true, maxlength: 10000 }, category: { type: String, required: true, trim: true, index: true }, skills: [{ type: String, trim: true, maxlength: 80 }],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, price: { type: Number, default: 0, min: 0 }, currency: { type: String, default: 'INR', uppercase: true, trim: true },
  date: { type: Date, required: true, index: true }, startTime: { type: String, required: true }, endTime: { type: String, required: true }, duration: { type: Number, min: 1 }, capacity: { type: Number, required: true, min: 1 }, enrolledCount: { type: Number, default: 0, min: 0 },
  locationType: { type: String, enum: ['online', 'offline', 'hybrid'], required: true, index: true }, location: { type: String, trim: true, maxlength: 500 }, meetingUrl: { type: String, trim: true }, image: { type: String, trim: true }, requirements: { type: String, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'published', 'rejected', 'cancelled', 'completed'], default: 'draft', index: true }, moderation: { reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reviewedAt: Date, note: { type: String, trim: true, maxlength: 1000 } },
}, modelOptions());
classSchema.index({ title: 'text', description: 'text', skills: 'text' });
classSchema.index({ status: 1, date: 1 });
export default mongoose.model('Class', classSchema);
